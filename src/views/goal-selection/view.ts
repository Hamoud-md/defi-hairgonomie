import type { JourneyCatalog, ObjectiveView } from "../../domain/models"
import { copy, errorMessage } from "../../ui/copy"
import { button, element, emptyState, idFor, localError } from "../../ui/components/common"

export function goalSelectionView(options: {
  objectives: readonly ObjectiveView[]; selectedId: string | null; error?: string;
  catalog?: JourneyCatalog;
  onSelect: (id: string) => void; onStart: () => void;
}): HTMLElement {
  const content = element("div", "")
  content.append(element("p", "intro muted", copy.goalIntro))
  if (options.objectives.length === 0) {
    content.append(emptyState(copy.emptyTitle, copy.emptyBody))
    const caption = element("div", "empty-caption")
    caption.append(element("span", "tag", copy.emptyTag), element("span", "", copy.emptyHint))
    content.append(caption)
    return content
  }
  const form = element("form", "panel")
  form.noValidate = true
  const group = element("fieldset", "objective-list")
  group.id = "objective-group"
  group.tabIndex = -1
  group.append(element("legend", "", copy.objectiveLegend))
  for (const { objective } of options.objectives) {
    const card = element("label", "objective-card")
    const input = element("input", "")
    input.type = "radio"; input.name = "objective"; input.value = objective.id
    input.id = idFor("objective", objective.id)
    input.checked = objective.id === options.selectedId
    if (options.error !== undefined) { input.setAttribute("aria-invalid", "true"); input.setAttribute("aria-describedby", "objective-error") }
    const text = element("span", "objective-body")
    const description = element("p", "muted", objective.description)
    description.id = idFor("objective-description", objective.id)
    input.setAttribute("aria-describedby", `${description.id}${options.error === undefined ? "" : " objective-error"}`)
    text.append(element("strong", "", objective.titre), description)

    const plannedSteps = options.catalog
      ? [...options.catalog.getSteps(objective.id)].sort((a, b) => a.ordre - b.ordre)
      : []
    if (plannedSteps.length > 0) {
      const preview = element("span", "objective-preview")
      preview.setAttribute("aria-hidden", "true")
      const requiredSteps = plannedSteps.filter((step) => step.requis)
      const optionalSteps = plannedSteps.filter((step) => !step.requis)
      const meta = element("span", "objective-preview-meta",
        copy.formatPreviewMeta(requiredSteps.length, optionalSteps.length))
      const track = element("span", "objective-preview-track")
      requiredSteps.forEach((step, idx) => {
        const chip = element("span", "objective-preview-node is-required", `${idx + 1}. ${step.titre || step.id}`)
        track.append(chip)
      })
      for (const optStep of optionalSteps) {
        const branch = element("span", "objective-preview-node is-optional", `+ ${optStep.titre || optStep.id}`)
        track.append(branch)
      }
      preview.append(meta, track)
      text.append(preview)
    }

    input.addEventListener("change", () => options.onSelect(objective.id))
    card.append(input, text)
    group.append(card)
  }
  form.append(group)
  if (options.error !== undefined) form.append(localError(errorMessage(options.error), "objective-error"))
  const start = button(copy.start, undefined, true)
  start.type = "submit"
  start.dataset.testid = "start"
  form.append(element("div", "actions"))
  form.lastElementChild!.append(start)
  form.addEventListener("submit", (event) => { event.preventDefault(); options.onStart() })
  content.append(form)
  return content
}
