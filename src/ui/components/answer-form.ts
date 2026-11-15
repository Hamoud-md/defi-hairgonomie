import type { AnswerValue, Step, ValidationIssue } from "../../domain/models"
import { copy, errorMessage } from "../copy"
import { button, element, emptyState, idFor, localError } from "./common"

// Presentation adapter only. The catalogue has no field schema yet; callers
// provide a renderer from declared content. Production never invents a field.
export type AnswerRenderer = (context: {
  step: Step; draft: AnswerValue | undefined; id: string;
  onChange: (answer: AnswerValue) => void;
}) => { element: HTMLElement; control: HTMLElement; read: () => AnswerValue }

export function answerForm(options: {
  step: Step; draft: AnswerValue | undefined; renderer?: AnswerRenderer;
  issue?: ValidationIssue; revision?: boolean;
  onChange: (answer: AnswerValue) => void; onSubmit: (answer: AnswerValue) => void;
  onCancel?: () => void;
  onException: () => void;
}): HTMLElement {
  const form = element("form", "answer-form")
  form.noValidate = true
  if (options.renderer === undefined) {
    form.append(emptyState(copy.missingFields, copy.missingFieldsBody))
    const unavailable = button(copy.continue, undefined, true)
    unavailable.disabled = true
    form.append(unavailable)
    if (options.onCancel !== undefined) form.append(button(copy.cancel, options.onCancel))
    return form
  }
  const id = idFor(options.revision ? "revision-answer" : "answer", options.step.id)
  const field = options.renderer({ step: options.step, draft: options.draft, id, onChange: options.onChange })
  field.control.id = id
  if (options.issue !== undefined) {
    field.control.setAttribute("aria-invalid", "true")
    field.control.setAttribute("aria-describedby", `${id}-error`)
  }
  form.append(field.element)
  if (options.issue !== undefined) form.append(localError(errorMessage(options.issue.code), `${id}-error`))
  const actions = element("div", "actions")
  const submit = button(options.revision ? copy.save : copy.continue, undefined, true)
  submit.type = "submit"
  submit.dataset.testid = options.revision ? "save-revision" : "validate-step"
  actions.append(submit)
  if (options.onCancel !== undefined) actions.append(button(copy.cancel, options.onCancel))
  form.append(actions)
  form.addEventListener("submit", (event) => {
    event.preventDefault()
    try { options.onSubmit(field.read()) } catch { options.onException() }
  })
  return form
}
