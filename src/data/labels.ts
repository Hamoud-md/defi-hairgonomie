import type { JourneyCatalog } from "../domain/models"
import { answerText } from "../ui/copy"
import type { Labels } from "../ui/copy"
import type { AnswerFields } from "./demo-fields"

// Maps declared values to readable labels; unknown values fall back to the raw value.
export function createLabels(
  catalog: JourneyCatalog, fields: AnswerFields,
  preferenceLabels: Readonly<Record<string, Readonly<Record<string, string>>>>,
): Labels {
  const optionLabel = (stepId: string, value: string) =>
    (Object.hasOwn(fields, stepId) ? fields[stepId].options.find((option) => option.value === value)?.label : undefined) ?? value
  return {
    step: (stepId) => catalog.getStep(stepId)?.titre ?? "",
    answer: (stepId, answer) => Array.isArray(answer)
      ? answerText(answer.map((value) => optionLabel(stepId, value)))
      : optionLabel(stepId, answer),
    preference: (preferenceId, value) =>
      (Object.hasOwn(preferenceLabels, preferenceId) ? preferenceLabels[preferenceId][value] : undefined) ?? value,
  }
}
