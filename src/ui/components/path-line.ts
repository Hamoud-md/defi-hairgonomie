import type { Explanation, SessionView } from "../../domain/models"
import { copy, rawLabels } from "../copy"
import type { Labels } from "../copy"
import { button, element } from "./common"

interface NodeSnap { id: string; order: number; required: boolean; title: string }
interface Snapshot { objectiveId: string; nodes: NodeSnap[]; answers: Map<string, string>; prefs: Map<string, string> }

// Previous render, used only to animate what really changed (DOM is rebuilt on every render).
let last: Snapshot | null = null
let lastUndo: { preferenceId: string; value: string } | null = null

const reducedMotion = () => typeof window !== "undefined" && typeof window.matchMedia === "function"
  && window.matchMedia("(prefers-reduced-motion: reduce)").matches

export interface PathLineOptions {
  view: SessionView
  latest: readonly Explanation[]
  labels?: Labels
  editingId?: string | null
  onUndo?: (preferenceId: string, value: string) => void
  onSelectStep?: (stepId: string) => void
}

/** "Chemin vivant" (CDR-01; M01 entrée, M02/M04 adaptation, M03 révision, M05 validation). */
export function pathLine(options: PathLineOptions): HTMLElement | null {
  const { view, latest } = options
  const labels = options.labels ?? rawLabels
  if (view.plan === null) return null
  const steps = view.plan.steps.filter((planned) => planned.visible).sort((a, b) => a.order - b.order)
  if (steps.length === 0) return null
  const objectiveId = view.plan.objectiveId
  const answers = new Map(Object.entries(view.answers).map(([id, value]) => [id, JSON.stringify(value)]))
  const prefs = new Map(view.preferences.map((item) => [item.preference.id, item.selectedValue]))
  const nodes: NodeSnap[] = steps.map((planned) => ({
    id: planned.stepId, order: planned.order, required: planned.required, title: labels.step(planned.stepId) || planned.stepId,
  }))

  const previous = last !== null && last.objectiveId === objectiveId && !(last.answers.size > 0 && answers.size === 0) ? last : null
  const entering = previous === null
  const currentIds = new Set(nodes.map((node) => node.id))
  const added = new Set<string>()
  const removedNodes: NodeSnap[] = []
  const justDone = new Set<string>()
  const updated = new Set<string>()
  if (previous !== null) {
    const before = new Set(previous.nodes.map((node) => node.id))
    for (const node of nodes) if (!before.has(node.id)) added.add(node.id)
    for (const node of previous.nodes) if (!currentIds.has(node.id)) removedNodes.push(node)
    for (const [id, value] of answers) {
      const prior = previous.answers.get(id)
      if (prior === undefined) justDone.add(id)
      else if (prior !== value) updated.add(id)
    }
    if (added.size > 0 || removedNodes.length > 0) {
      for (const [id, value] of prefs) {
        const prior = previous.prefs.get(id)
        if (prior !== undefined && prior !== value) lastUndo = { preferenceId: id, value: prior }
      }
    }
  }
  last = { objectiveId, nodes, answers, prefs }

  const appeared = new Set<string>()
  const removed = new Set<string>()
  for (const explanation of latest) {
    for (const change of explanation.changes) {
      if (change.kind !== "step_visibility") continue
      if (change.after === true) appeared.add(change.targetId)
      else if (change.after === false) removed.add(change.targetId)
    }
  }

  const nav = element("nav", "path-line")
  nav.setAttribute("aria-label", copy.pathAriaLabel)
  nav.dataset.testid = "path-line"
  if (entering && !reducedMotion()) nav.classList.add("is-entering")
  const list = element("ol", "path-list")
  const required = nodes.filter((node) => node.required)
  const done = required.filter((node) => view.answers[node.id] !== undefined).length
  const activeStepIndex = nodes.findIndex((node) => node.id === view.activeStep?.id)
  const activeStepNumber = new Map(nodes.map((node, idx) => [node.id, idx + 1]))
  const ghosts = reducedMotion() ? [] : removedNodes
  const items = [...nodes.map((node) => ({ node, ghost: false })), ...ghosts.map((node) => ({ node, ghost: true }))]
    .sort((a, b) => a.node.order - b.node.order)
  let affectedIndex = -1
  items.forEach(({ node, ghost }, index) => {
    const answered = !ghost && view.answers[node.id] !== undefined
    const current = !ghost && view.activeStep?.id === node.id
    const revising = !ghost && options.editingId === node.id
    const nodeIndex = nodes.findIndex((item) => item.id === node.id)
    const reachablePreceding = !ghost && !current && nodeIndex >= 0 && activeStepIndex >= 0 && nodeIndex < activeStepIndex
    const clickable = !ghost && options.onSelectStep !== undefined && (answered || reachablePreceding) && (!current || options.editingId !== null)

    const li = element("li", "path-node")
    li.style.setProperty("--i", String(index))
    li.dataset.pathStep = node.id
    li.classList.add(node.required ? "is-required" : "is-optional")
    if (ghost) {
      li.classList.add("is-leaving")
      li.setAttribute("aria-hidden", "true")
      li.addEventListener("animationend", () => li.remove(), { once: true })
    }
    if (answered) li.classList.add("is-done")
    if (current) { li.classList.add("is-current"); li.setAttribute("aria-current", "step") }
    if (!ghost && appeared.has(node.id)) li.classList.add("is-new")
    if (added.has(node.id)) li.classList.add("is-entering-node")
    if (justDone.has(node.id)) li.classList.add("is-just-done")
    if (updated.has(node.id) || revising) li.classList.add(revising ? "is-revising" : "is-updated")
    if (clickable) {
      li.classList.add("is-interactive")
      li.addEventListener("click", (event) => {
        if (event.target instanceof HTMLElement && event.target.closest("button")) return
        options.onSelectStep?.(node.id)
      })
    }
    if ((appeared.has(node.id) && !ghost) || removed.has(node.id) || (ghost && removed.has(node.id))) affectedIndex = index
    if (ghost && affectedIndex < 0) affectedIndex = index
    const stepNum = activeStepNumber.get(node.id)
    const dot = element("span", "path-dot", answered ? "✓" : stepNum !== undefined ? String(stepNum) : "–")
    dot.setAttribute("aria-hidden", "true")
    const status = [
      answered ? copy.statusDone : current ? copy.statusCurrent : copy.statusTodo,
      node.required ? copy.statusRequired : copy.statusOptional,
      !ghost && appeared.has(node.id) ? copy.statusAdded : "",
      revising ? copy.statusRevising : "",
    ].filter(Boolean).join(", ")
    const titleNode = clickable
      ? (() => {
        const trigger = element("button", "path-node-trigger", node.title)
        trigger.type = "button"
        trigger.tabIndex = -1
        trigger.setAttribute("aria-label", `${answered ? copy.revise : copy.openStep} : ${node.title}`)
        trigger.addEventListener("click", () => options.onSelectStep?.(node.id))
        return trigger
      })()
      : element("span", "path-title", node.title)
    li.append(dot, titleNode, element("span", "path-status", status))
    if (revising && view.answers[node.id] !== undefined) {
      li.append(element("span", "path-previous", `${copy.currentAnswer} : ${labels.answer(node.id, view.answers[node.id]!)}`))
    }
    list.append(li)
  })
  nav.append(list)

  const hasChange = appeared.size > 0 || removed.size > 0
  if (hasChange && latest.length > 0) {
    const callout = element("div", `path-callout ${appeared.size > 0 ? "is-added" : "is-removed"}`)
    callout.setAttribute("role", "group")
    callout.setAttribute("aria-label", copy.pathCalloutAriaLabel)
    callout.dataset.testid = "path-callout"
    if (affectedIndex >= 0) callout.style.setProperty("--at", `${((affectedIndex + 0.5) / Math.max(1, nodes.length)) * 100}%`)
    const targetId = [...appeared, ...removed][0]!
    const title = nodes.find((node) => node.id === targetId)?.title ?? removedNodes.find((node) => node.id === targetId)?.title
      ?? (labels.step(targetId) || targetId)
    const header = element("div", "path-callout-header")
    header.append(element("strong", "path-callout-title", `${appeared.size > 0 ? copy.stepAdded : copy.stepRemoved} : ${title}`))
    for (const explanation of latest) {
      for (const change of explanation.changes) {
        if (change.before !== undefined && change.after !== undefined) {
          const display = (value: string | number | boolean) => typeof value === "boolean"
            ? value ? copy.visible : copy.hidden : String(value)
          header.append(element("span", "path-callout-diff", `${copy.changes[change.kind]} · ${copy.from} : ${display(change.before)} → ${copy.to} : ${display(change.after)}`))
        }
      }
    }
    callout.append(header, element("p", "path-callout-reason", latest.map((item) => item.reason).join(" ")))
    const calloutActions = element("div", "path-callout-actions")
    if (appeared.has(targetId) && options.onSelectStep !== undefined && view.activeStep?.id !== targetId) {
      const targetIdx = nodes.findIndex((node) => node.id === targetId)
      if (targetIdx >= 0 && activeStepIndex >= 0 && targetIdx < activeStepIndex) {
        const openBtn = button(`${copy.viewStep} « ${title} »`, () => options.onSelectStep?.(targetId), true)
        openBtn.classList.add("path-open-step")
        calloutActions.append(openBtn)
      }
    }
    if (lastUndo !== null && options.onUndo !== undefined) {
      const undo = lastUndo
      const preference = view.preferences.find((item) => item.preference.id === undo.preferenceId)
      const label = labels.preference(undo.preferenceId, undo.value)
      const action = button(`${copy.undoReturnTo} « ${label} »`, () => options.onUndo?.(undo.preferenceId, undo.value))
      action.id = "path-undo"
      action.classList.add("path-undo")
      if (preference === undefined) action.disabled = true
      calloutActions.append(action)
    }
    if (calloutActions.childElementCount > 0) callout.append(calloutActions)
    nav.append(callout)
  } else if (latest.length === 0) lastUndo = null

  nav.append(element("p", "path-count", copy.formatPathCount(done, required.length, nodes.length)))
  return nav
}
