import type { AnswerValue, Explanation, InvalidatedAnswer, SessionView, Step } from "../../domain/models"
import type { AnswerRenderer } from "../../ui/components/answer-form"
import { answerForm } from "../../ui/components/answer-form"
import { button, element, idFor, localError } from "../../ui/components/common"
import { pathLine } from "../../ui/components/path-line"
import { explanationPanel, historyPanel, invalidatedAnswerNotice } from "../../ui/components/feedback"
import { copy, errorMessage, rawLabels } from "../../ui/copy"
import type { Labels } from "../../ui/copy"

export function journeyView(options: {
  view: SessionView; renderer?: AnswerRenderer; drafts: ReadonlyMap<string, AnswerValue>; labels?: Labels;
  editingStep: Step | null; invalidated: readonly InvalidatedAnswer[]; latest: readonly Explanation[];
  error?: { code: string; preferenceId?: string }; onChange: (id: string, answer: AnswerValue) => void;
  onSubmit: (id: string, answer: AnswerValue, revision: boolean) => void;
  onBack: () => void; onPreference: (id: string, value: string) => void;
  onRevise: (id: string) => void; onCancelRevision: () => void; onSummary: () => void;
  onException: () => void;
}): HTMLElement {
  const { view } = options
  const labels = options.labels ?? rawLabels
  const layout = element("div", "journey-layout")
  const primary = element("div", "")
  const selectStepFromPath = (stepId: string) => {
    if (view.answers[stepId] !== undefined) {
      options.onRevise(stepId)
      return
    }
    const visibleSteps = view.plan === null
      ? []
      : view.plan.steps.filter((planned) => planned.visible).sort((a, b) => a.order - b.order)
    const activeIdx = visibleSteps.findIndex((planned) => planned.stepId === view.activeStep?.id)
    const targetIdx = visibleSteps.findIndex((planned) => planned.stepId === stepId)
    if (targetIdx >= 0 && activeIdx > targetIdx) {
      for (let i = 0; i < activeIdx - targetIdx; i++) options.onBack()
    }
  }
  const path = pathLine({
    view, latest: options.latest, labels, editingId: options.editingStep?.id ?? null,
    onUndo: options.onPreference, onSelectStep: selectStepFromPath,
  })
  if (path !== null) primary.append(path)
  const panel = element("section", "panel")
  if (view.progress !== null) panel.append(element("p", "progress-label", copy.formatStepProgress(view.progress.current, view.progress.total)))
  const step = options.editingStep ?? view.activeStep
  if (step !== null) {
    if (options.editingStep !== null) panel.append(element("p", "eyebrow", copy.revision))
    if (step.requis) panel.append(element("span", "required-label", copy.required))
    panel.append(element("h2", "", step.titre || copy.step), element("p", "", step.contenu))
    const issue = view.issues.find((item) => item.stepId === step.id)
    panel.append(answerForm({ step, renderer: options.renderer, draft: options.drafts.get(step.id) ?? view.answers[step.id],
      issue, revision: options.editingStep !== null,
      onChange: (answer) => options.onChange(step.id, answer),
      onSubmit: (answer) => options.onSubmit(step.id, answer, options.editingStep !== null),
      onException: options.onException,
      ...(options.editingStep === null ? {} : { onCancel: options.onCancelRevision }),
    }))
  }
  if (options.error !== undefined && options.error.preferenceId === undefined
    && options.error.code !== "ANSWER_REQUIRED" && options.error.code !== "ANSWER_INVALID") {
    panel.append(localError(errorMessage(options.error.code), "journey-error"))
  }
  const actions = element("div", "actions")
  const back = button(copy.back, options.onBack)
  back.id = "back-action"
  back.disabled = (view.progress?.current ?? 0) <= 1
  if (back.disabled) { back.setAttribute("aria-describedby", "first-step-hint"); panel.append(element("p", "hint", copy.firstStep)); panel.lastElementChild!.id = "first-step-hint" }
  actions.append(back)
  if (view.status === "completed") actions.append(button(copy.viewSummary, options.onSummary))
  panel.append(actions)
  primary.append(panel)
  const saved = Object.entries(view.answers)
  if (saved.length > 0) {
    const answers = element("section", "panel history")
    answers.append(element("h2", "", copy.savedAnswers))
    const list = element("ul", "plain-list")
    for (const [id, answer] of saved) {
      const row = element("li", "answer-row")
      row.dataset.stepId = id
      const title = labels.step(id)
      if (title) row.append(element("h3", "answer-step", title))
      row.append(element("p", "answer-value", labels.answer(id, answer)), button(copy.revise, () => options.onRevise(id)))
      list.append(row)
    }
    answers.append(list)
    primary.append(answers)
  }
  if (view.explanations.length > 0) primary.append(historyPanel(view.explanations))
  const aside = element("aside", "sidebar")
  if (view.preferences.length > 0) {
    const preferences = element("section", "panel")
    preferences.append(element("h2", "", copy.preferences))
    for (const { preference, selectedValue } of view.preferences) {
      const field = element("div", "field preference-field")
      const label = element("label", "", preference.description || copy.preference)
      const select = element("select", "")
      select.id = idFor("preference", preference.id)
      label.htmlFor = select.id
      const declaredValues = preference.valeurs ?? [preference.valeur]
      for (const value of declaredValues) {
        const option = element("option", "", labels.preference(preference.id, value))
        option.value = value
        select.append(option)
      }
      select.value = selectedValue
      select.addEventListener("change", () => {
        const value = select.value
        select.value = selectedValue
        options.onPreference(preference.id, value)
      })
      field.append(label, select)
      if (declaredValues.length > 1) {
        const toggle = element("div", "preference-toggle")
        for (const value of declaredValues) {
          const fullLabel = labels.preference(preference.id, value)
          const [shortTitle, detail] = fullLabel.includes(" — ") ? fullLabel.split(" — ", 2) : [fullLabel, ""]
          const active = value === selectedValue
          const pill = element("button", `preference-pill${active ? " is-active" : ""}`)
          pill.type = "button"
          pill.tabIndex = -1
          pill.setAttribute("aria-pressed", String(active))
          pill.append(element("span", "preference-pill-title", shortTitle))
          if (detail) pill.append(element("span", "preference-pill-detail", detail))
          pill.addEventListener("click", () => {
            if (!active) options.onPreference(preference.id, value)
          })
          toggle.append(pill)
        }
        field.append(toggle)
      }
      if (options.error?.preferenceId === preference.id) {
        select.setAttribute("aria-invalid", "true")
        select.setAttribute("aria-describedby", `${select.id}-error`)
        field.append(localError(errorMessage(options.error.code), `${select.id}-error`))
      }
      preferences.append(field)
    }
    aside.append(preferences)
  }
  const hasVisibilityCallout = path !== null && options.latest.some((explanation) =>
    explanation.changes.some((change) => change.kind === "step_visibility"),
  )
  if (options.latest.length > 0) {
    const adaptPanel = explanationPanel(options.latest)
    if (hasVisibilityCallout) adaptPanel.classList.add("is-compact-adaptation")
    aside.append(adaptPanel)
  }
  if (options.invalidated.length > 0) aside.append(invalidatedAnswerNotice(options.invalidated, view, options.onRevise, labels))
  layout.append(primary)
  if (aside.childElementCount > 0) layout.append(aside)
  return layout
}
