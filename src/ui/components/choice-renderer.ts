import type { AnswerFields } from "../../data/demo-fields"
import type { AnswerValue } from "../../domain/models"
import type { AnswerRenderer } from "./answer-form"
import { element } from "./common"

// Production AnswerRenderer built from an explicit field contract. A step without
// a declared field is a configuration error, never an invented control.
export function createChoiceRenderer(fields: AnswerFields): AnswerRenderer {
  return ({ step, draft, id, onChange }) => {
    const field = Object.hasOwn(fields, step.id) ? fields[step.id] : undefined
    if (field === undefined || field.options.length === 0) throw new Error(`No answer field declared for step ${step.id}`)
    const allowed = field.options.map((option) => option.value)
    const current = typeof draft === "string" ? draft : undefined

    if (field.kind === "confirm") {
      const wrapper = element("div", "field")
      const card = element("label", "objective-card choice-card")
      const input = element("input", "")
      input.type = "checkbox"; input.value = field.options[0].value
      input.checked = current === field.options[0].value
      input.addEventListener("change", () => onChange(input.checked ? input.value : ""))
      card.append(input, element("span", "", field.options[0].label))
      wrapper.append(card)
      return { element: wrapper, control: input, read: (): AnswerValue => input.checked && allowed.includes(input.value) ? input.value : "" }
    }

    const group = element("fieldset", "objective-list choice-group")
    group.setAttribute("role", "radiogroup")
    group.tabIndex = -1
    group.append(element("legend", "", field.legend))
    const inputs: HTMLInputElement[] = []
    for (const option of field.options) {
      const card = element("label", "objective-card choice-card")
      const input = element("input", "")
      input.type = "radio"; input.name = `${id}-choice`; input.value = option.value
      input.id = `${id}-option-${encodeURIComponent(option.value)}`
      input.checked = current === option.value
      input.addEventListener("change", () => { if (input.checked) onChange(option.value) })
      card.append(input, element("span", "", option.label))
      group.append(card)
      inputs.push(input)
    }
    return { element: group, control: group, read: (): AnswerValue => {
      const value = inputs.find((input) => input.checked)?.value ?? ""
      // A value outside the declared options (e.g. altered DOM) is refused.
      return allowed.includes(value) ? value : ""
    } }
  }
}
