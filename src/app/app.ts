import { createSessionController } from "../application/session-controller"
import type { AnswerValue, ContractError, ContractResult, Explanation, InvalidatedAnswer, JourneyCatalog, SessionPersistence, SessionState } from "../domain/models"
import { createNavigation, focusHeading } from "../platform/navigation"
import { SESSION_SCHEMA_VERSION } from "../platform/persistence"
import type { AnswerRenderer } from "../ui/components/answer-form"
import { createChoiceRenderer } from "../ui/components/choice-renderer"
import { emptyState, errorState, idFor } from "../ui/components/common"
import { confirmDialog } from "../ui/components/confirm-dialog"
import { copy, errorMessage, isKnownErrorCode } from "../ui/copy"
import type { Labels } from "../ui/copy"
import { getLanguage, getLocalizedCatalog, getLocalizedFields, getLocalizedLabels, initLanguage } from "../ui/i18n"
import { goalSelectionView } from "../views/goal-selection/view"
import { journeyView } from "../views/journey/view"
import { summaryView } from "../views/summary/view"
import { createShell } from "./shell"

export function mountApplication(root: HTMLElement, options: {
  catalog?: JourneyCatalog; answerRenderer?: AnswerRenderer; labels?: Labels;
  controller?: ReturnType<typeof createSessionController>; bootError?: string; retryBoot?: () => void;
  persistence?: SessionPersistence;
}) {
  initLanguage()
  const baseCatalog = options.catalog
  const dynamicCatalog: JourneyCatalog | undefined = baseCatalog ? {
    getObjectives: () => getLocalizedCatalog(baseCatalog, getLanguage()).getObjectives(),
    getObjective: (id) => getLocalizedCatalog(baseCatalog, getLanguage()).getObjective(id),
    getSteps: (id) => getLocalizedCatalog(baseCatalog, getLanguage()).getSteps(id),
    getStep: (id) => getLocalizedCatalog(baseCatalog, getLanguage()).getStep(id),
    getPreferences: () => getLocalizedCatalog(baseCatalog, getLanguage()).getPreferences(),
    getPreference: (id) => getLocalizedCatalog(baseCatalog, getLanguage()).getPreference(id),
    getRules: () => getLocalizedCatalog(baseCatalog, getLanguage()).getRules(),
  } : undefined

  const dynamicLabels: Labels = {
    step: (id) => baseCatalog ? getLocalizedLabels(baseCatalog, getLanguage()).step(id) : (options.labels?.step(id) ?? ""),
    answer: (id, ans) => baseCatalog ? getLocalizedLabels(baseCatalog, getLanguage()).answer(id, ans) : (options.labels?.answer(id, ans) ?? ""),
    preference: (id, val) => baseCatalog ? getLocalizedLabels(baseCatalog, getLanguage()).preference(id, val) : (options.labels?.preference(id, val) ?? val),
  }

  const dynamicRenderer: AnswerRenderer | undefined = options.answerRenderer !== undefined
    ? (rendererOptions) => {
        const fields = getLocalizedFields(getLanguage())
        if (Object.hasOwn(fields, rendererOptions.step.id)) {
          return createChoiceRenderer(fields)(rendererOptions)
        }
        return options.answerRenderer!(rendererOptions)
      }
    : undefined

  const shell = createShell(root, {
    onLanguageChange: () => {
      render({ heading: true })
    },
  })
  const navigation = createNavigation()
  const controller = options.controller ?? (dynamicCatalog === undefined ? undefined : createSessionController(dynamicCatalog))
  const drafts = new Map<string, AnswerValue>()
  let selectedId: string | null = null
  let editingId: string | null = null
  let invalidated: InvalidatedAnswer[] = []
  let latest: Explanation[] = []
  let local: { code: string; preferenceId?: string } | undefined
  let fatal: string | undefined = options.bootError
  let busy = false
  let destroyed = false
  let closeDialog: (() => void) | undefined
  let restoring = options.persistence !== undefined && controller !== undefined
  let persistenceQueue = Promise.resolve()
  let persistenceGeneration = 0

  function persistState(state: SessionState) {
    if (options.persistence === undefined) return
    const persistence = options.persistence
    const snapshot = structuredClone(state)
    const pending = invalidated.length > 0
    const generation = ++persistenceGeneration
    // Invalidation marks are not part of PersistedSession. Never save a snapshot
    // that could silently rehabilitate a pending answer after reload.
    persistenceQueue = persistenceQueue.then(async () => {
      let failed: boolean
      try {
        const result = pending || snapshot.objectiveId === null
          ? await persistence.clear()
          : await persistence.save({ schemaVersion: SESSION_SCHEMA_VERSION, state: snapshot })
        failed = !result.ok
      } catch { failed = true }
      if (!destroyed && generation === persistenceGeneration) {
        shell.setStatus([pending ? copy.pendingSave : "", failed ? copy.storageUnavailable : ""].filter(Boolean).join(" "))
      }
    })
  }

  function discardSaved(message: string) {
    shell.setStatus(message)
    const persistence = options.persistence
    if (persistence === undefined) return
    const generation = ++persistenceGeneration
    persistenceQueue = persistenceQueue.then(async () => {
      let failed: boolean
      try { failed = !(await persistence.clear()).ok } catch { failed = true }
      if (!destroyed && failed && generation === persistenceGeneration) shell.setStatus(`${message} ${copy.storageUnavailable}`)
    })
  }

  async function hydrate() {
    render()
    const persistence = options.persistence
    if (persistence === undefined || controller === undefined) { restoring = false; render(); return }
    try {
      const saved = await persistence.load()
      if (destroyed) return
      if (!saved.ok) {
        if (saved.error.code === "STORED_SESSION_INVALID") discardSaved(copy.invalidSaved)
        else shell.setStatus(copy.storageUnavailable)
      } else if (saved.data !== null) {
        const result = saved.data.schemaVersion === SESSION_SCHEMA_VERSION ? controller.restore(saved.data.state) : null
        if (result === null || !result.ok) discardSaved(copy.invalidSaved)
        else {
          invalidated = result.data.invalidatedAnswers
          if (result.data.state.objectiveId !== null) {
            selectedId = result.data.state.objectiveId
            const view = controller.getSessionView()
            if (view.ok) navigation.set(view.data.status === "completed" && invalidated.length === 0 ? "summary" : "journey")
          }
          if (invalidated.length > 0) discardSaved(copy.pendingSave)
          else shell.setStatus(copy.restored)
        }
      }
    } catch { if (!destroyed) shell.setStatus(copy.storageUnavailable) }
    finally {
      restoring = false
      if (!destroyed) render({ heading: navigation.current !== "goal-selection" })
    }
  }

  function render(focus: { heading?: boolean; id?: string } = {}) {
    if (destroyed) return
    const previousFocus = document.activeElement instanceof HTMLElement ? document.activeElement.id : ""
    try {
      if (restoring) {
        shell.main.setAttribute("aria-busy", "true")
        shell.render("goal-selection", copy.restoring, emptyState(copy.restoring, copy.restoringBody))
        return
      }
      shell.main.removeAttribute("aria-busy")
      if (fatal !== undefined || controller === undefined) {
        shell.render(navigation.current, copy.errorTitle, errorState(fatal ?? "CATALOG_INVALID", safe(() => {
          if (controller === undefined) { options.retryBoot?.(); return }
          fatal = undefined; local = undefined; render({ heading: true })
        })))
      } else if (navigation.current === "goal-selection") {
        const result = controller.getObjectives()
        if (!result.ok) { fatal = result.error.code; render(focus); return }
        shell.render(navigation.current, copy.goal, goalSelectionView({
          objectives: result.data, selectedId, error: local?.code, catalog: dynamicCatalog ?? options.catalog,
          onSelect: (id) => {
            selectedId = id; local = undefined
            // Selection is local until Commencer; refresh error associations only.
            render({ id: idFor("objective", id) })
          },
          onStart: () => execute(() => controller.selectObjective({ objectiveId: selectedId ?? "" }), () => {
            drafts.clear(); invalidated = []; latest = []; editingId = null
            navigation.set("journey")
            const view = controller.getSessionView()
            if (view.ok && view.data.activeStep === null && view.data.status === "completed") navigation.set("summary")
            render({ heading: true })
          }),
        }))
      } else if (navigation.current === "journey") {
        const result = controller.getSessionView()
        if (!result.ok) { readFailure(result.error); return }
        const view = result.data
        const editingStep = editingId === null ? null : (dynamicCatalog ?? options.catalog)?.getStep(editingId) ?? null
        shell.render(navigation.current, view.objective?.titre || copy.journey, journeyView({
          view, renderer: dynamicRenderer ?? options.answerRenderer, labels: dynamicLabels, drafts, editingStep, invalidated, latest, error: local,
          onException: () => { fatal = "UNEXPECTED_ERROR"; render({ heading: true }) },
          onChange: (id, answer) => drafts.set(id, Array.isArray(answer) ? [...answer] : answer),
          onSubmit: (id, answer, revision) => {
            if (revision) {
              execute(() => controller.reviseAnswer({ stepId: id, answer }), (data) => {
                drafts.delete(id); invalidated = data.invalidatedAnswers; editingId = null
                latest = data.explanations
                shell.announce(latest.length > 0 ? latest.map((item) => item.reason).join(". ") : copy.updated)
                render({ heading: true })
              })
            } else {
              execute(() => controller.validateStep({ stepId: id, answer }), (data) => {
                drafts.delete(id); invalidated = invalidated.filter((item) => item.stepId !== id)
                editingId = null
                if (data.completed) {
                  const summary = controller.getSummary()
                  if (summary.ok) navigation.set("summary")
                  else local = { code: summary.error.code }
                }
                render({ heading: true })
              })
            }
          },
          onBack: () => execute(() => controller.goBack(), () => { editingId = null; render({ heading: true }) }),
          onPreference: (id, value) => execute(() => controller.updatePreference({ preferenceId: id, value }), (data) => {
            invalidated = data.invalidatedAnswers; latest = data.explanations
            shell.announce(latest.map((item) => item.reason).join(". "))
            render({ id: idFor("preference", id) })
          }, id),
          onRevise: safe((id) => {
            if (!(dynamicCatalog ?? options.catalog)?.getStep(id)) { local = { code: "STEP_NOT_FOUND" }; render(); return }
            editingId = id; latest = []; local = undefined
            render({ id: idFor("revision-answer", id) })
          }),
          onCancelRevision: safe(() => { editingId = null; local = undefined; render({ heading: true }) }),
          onSummary: safe(() => {
            const summary = controller.getSummary()
            if (!summary.ok) { readFailure(summary.error); return }
            navigation.set("summary"); editingId = null; render({ heading: true })
          }),
        }))
      } else {
        const result = controller.getSummary()
        if (!result.ok) { readFailure(result.error); return }
        shell.render(navigation.current, result.data.objective.titre || copy.summary, summaryView(result.data,
          safe(() => { navigation.set("journey"); latest = []; local = undefined; render({ heading: true }) }),
          safe(() => {
            closeDialog = confirmDialog(root, () => execute(() => controller.restart({ confirm: true }), () => {
              selectedId = null; editingId = null; drafts.clear(); invalidated = []; latest = []
              shell.announce(""); navigation.set("goal-selection"); render({ heading: true })
            }))
          }),
          dynamicLabels,
        ))
      }
      document.title = `${copy.views[navigation.current]} · ${copy.brand}`
      const target = focus.id ?? (focus.heading ? undefined : previousFocus)
      const focusTarget = target ? document.getElementById(target) : null
      if (focusTarget !== null) focusTarget.focus()
      else if (focus.heading) focusHeading(shell.main)
    } catch {
      fatal = "UNEXPECTED_ERROR"
      shell.render(navigation.current, copy.errorTitle, errorState(fatal, safe(() => { fatal = undefined; render({ heading: true }) })))
      focusHeading(shell.main)
    }
  }

  function readFailure(error: ContractError) {
    if (error.code === "SESSION_REQUIRED" || error.code === "OBJECTIVE_REQUIRED") {
      navigation.set("goal-selection"); local = { code: error.code }
    } else if (error.code === "JOURNEY_INCOMPLETE" && navigation.current === "summary") {
      navigation.set("journey"); local = { code: error.code }
    } else { fatal = error.code }
    shell.announce(errorMessage(error.code)); render({ heading: true })
  }

  function safe<T extends unknown[]>(callback: (...args: T) => void): (...args: T) => void {
    return (...args) => {
      if (destroyed) return
      try { callback(...args) }
      catch { fatal = "UNEXPECTED_ERROR"; render({ heading: true }) }
    }
  }

  function execute<T extends { state: SessionState }>(command: () => ContractResult<T>, onSuccess: (data: T) => void, preferenceId?: string) {
    if (busy || destroyed) return
    busy = true
    try {
      const result = command()
      if (!result.ok) {
        const code = isKnownErrorCode(result.error.code) ? result.error.code : "UNEXPECTED_ERROR"
        if (code === "CATALOG_INVALID" || code === "RULE_CONFLICT" || code === "REQUIRED_STEP_REMOVED" || code === "UNEXPECTED_ERROR") fatal = code
        else if (code === "SESSION_REQUIRED") navigation.set("goal-selection")
        local = { code, preferenceId }
        shell.announce(errorMessage(code))
        const stepId = result.error.fields?.stepId
        const focusId = preferenceId !== undefined ? idFor("preference", preferenceId)
          : stepId !== undefined ? idFor(editingId === null ? "answer" : "revision-answer", stepId)
          : navigation.current === "goal-selection" ? "objective-group" : undefined
        render({ id: focusId, heading: fatal !== undefined })
        return
      }
      local = undefined; fatal = undefined; latest = []; shell.announce("")
      onSuccess(result.data)
      persistState(result.data.state)
    } catch { fatal = "UNEXPECTED_ERROR"; render({ heading: true }) }
    finally { queueMicrotask(() => { busy = false }) }
  }

  const stopRepeat = (event: KeyboardEvent) => {
    if (event.repeat && (event.key === "Enter" || event.key === " ")) event.preventDefault()
  }
  root.addEventListener("keydown", stopRepeat)
  const ready = restoring ? hydrate() : (render(), Promise.resolve())
  return {
    ready,
    whenIdle: () => persistenceQueue,
    refresh: () => render(),
    destroy: () => { destroyed = true; closeDialog?.(); root.removeEventListener("keydown", stopRepeat); root.replaceChildren() },
  }
}
