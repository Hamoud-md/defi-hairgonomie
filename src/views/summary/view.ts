import type { Summary } from "../../domain/models"
import { copy, errorMessage, rawLabels } from "../../ui/copy"
import type { Labels } from "../../ui/copy"
import { button, element } from "../../ui/components/common"
import { historyPanel } from "../../ui/components/feedback"

export function summaryView(summary: Summary, onModify: () => void, onRestart: () => void, labels: Labels = rawLabels): HTMLElement {
  const panel = element("section", "panel summary-panel")
  const completion = element("div", "completion is-reveal")
  completion.append(element("strong", "", summary.completion.completed ? copy.complete : errorMessage("JOURNEY_INCOMPLETE")), element("p", "", copy.formatSummaryCompletion(summary.completion.requiredCompleted, summary.completion.requiredTotal)))
  panel.append(completion, element("h2", "", copy.decisions))
  const list = element("ul", "plain-list")
  summary.decisions.forEach((decision, index) => {
    const row = element("li", "answer-row")
    row.style.setProperty("--i", String(index))
    row.append(element("h3", "", decision.step.titre), element("p", "answer-value", labels.answer(decision.step.id, decision.answer)))
    list.append(row)
  })
  panel.append(list)
  if (summary.decisions.length === 0) panel.append(element("p", "muted", copy.noDecisions))
  if (summary.preferences.length > 0) {
    const preferences = element("dl", "history")
    for (const { preference, selectedValue } of summary.preferences) {
      preferences.append(element("dt", "", preference.description || copy.preference), element("dd", "", labels.preference(preference.id, selectedValue)))
    }
    panel.append(preferences)
  }
  if (summary.explanations.length > 0) panel.append(historyPanel(summary.explanations))
  panel.append(element("p", "muted demo-note", copy.demoNote))
  const actions = element("div", "actions")
  const restart = button(copy.restart, onRestart)
  restart.id = "restart-action"
  actions.append(button(copy.modify, onModify, true), restart)
  panel.append(actions)
  return panel
}
