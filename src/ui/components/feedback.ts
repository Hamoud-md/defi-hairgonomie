import type { Explanation, InvalidatedAnswer, SessionView } from "../../domain/models"
import { copy, rawLabels } from "../copy"
import type { Labels } from "../copy"
import { button, element } from "./common"

export function explanationPanel(explanations: readonly Explanation[], historical = false): HTMLElement {
  const panel = element(historical ? "div" : "section", historical ? "history-content" : "panel")
  panel.dataset.testid = historical ? "history-content" : "current-adaptation"
  if (!historical) panel.append(element("h2", "", copy.adaptations))
  const list = element("ul", "plain-list")
  for (const explanation of explanations) {
    const item = element("li", "")
    item.append(element("p", "", explanation.reason))
    for (const change of explanation.changes) {
      const line = element("p", "change", copy.changes[change.kind])
      if (change.before !== undefined && change.after !== undefined) {
        const display = (value: string | number | boolean) => typeof value === "boolean"
          ? value ? copy.visible : copy.hidden : String(value)
        line.append(document.createTextNode(` · ${copy.from} : ${display(change.before)} → ${copy.to} : ${display(change.after)}`))
      }
      item.append(line)
    }
    list.append(item)
  }
  panel.append(list)
  return panel
}

export function historyPanel(explanations: readonly Explanation[]): HTMLElement {
  const details = element("details", "history")
  details.append(element("summary", "", copy.history), explanationPanel(explanations, true))
  return details
}

export function invalidatedAnswerNotice(
  invalidations: readonly InvalidatedAnswer[], view: SessionView, onRevise: (stepId: string) => void,
  labels: Labels = rawLabels,
): HTMLElement {
  const panel = element("section", "panel")
  panel.dataset.testid = "invalidated-answers"
  panel.append(element("h2", "", copy.invalidated))
  const list = element("ul", "plain-list")
  for (const answer of invalidations) {
    const item = element("li", "notice")
    item.dataset.stepId = answer.stepId
    const value = view.answers[answer.stepId]
    if (value !== undefined) item.append(element("p", "answer-value", labels.answer(answer.stepId, value)))
    item.append(element("p", "", answer.reason), button(copy.revise, () => onRevise(answer.stepId)))
    list.append(item)
  }
  panel.append(list)
  return panel
}
