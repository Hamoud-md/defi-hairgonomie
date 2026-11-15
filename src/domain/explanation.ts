import type {
  Explanation,
  ExplanationChange,
  JourneyCatalog,
  JourneyPlan,
  InvalidatedAnswer,
} from "./models"
import type { AppliedRuleEffect } from "./rule-evaluator"

export type ExplanationEvent = Explanation["event"]

export function buildExplanations(
  previousPlan: JourneyPlan | null,
  nextPlan: JourneyPlan,
  appliedRules: readonly AppliedRuleEffect[],
  event: ExplanationEvent,
  catalog?: JourneyCatalog,
): Explanation[] {
  if (previousPlan === null || previousPlan.objectiveId !== nextPlan.objectiveId) {
    return []
  }

  const previousStepsById = new Map(
    previousPlan.steps.map((step) => [step.stepId, step]),
  )
  const nextStepsById = new Map(nextPlan.steps.map((step) => [step.stepId, step]))
  const explanations: Explanation[] = []

  for (const appliedRule of appliedRules) {
    const changes: ExplanationChange[] = []

    for (const stepId of appliedRule.stepIds) {
      const before = previousStepsById.get(stepId)
      const after = nextStepsById.get(stepId)

      if (before === undefined || after === undefined) {
        continue
      }

      if (appliedRule.effect.kind === "step_order") {
        if (before.order !== after.order) {
          changes.push({
            kind: "step_order",
            targetId: stepId,
            before: before.order,
            after: after.order,
          })
        }
      } else if (before.visible !== after.visible) {
        changes.push({
          kind: "step_visibility",
          targetId: stepId,
          before: before.visible,
          after: after.visible,
        })
      }
    }

    if (changes.length > 0) {
      explanations.push({
        id: `explanation-${event}-${appliedRule.ruleId}`,
        ruleId: appliedRule.ruleId,
        event,
        reason: appliedRule.reason,
        changes,
      })
    }
  }

  // A rule becoming inactive restores the base value. Explain those changes
  // with the catalogue label rather than attributing them to an active rule.
  if (catalog !== undefined) {
    const explained = new Set(explanations.flatMap((explanation) =>
      explanation.changes.map((change) => JSON.stringify([change.targetId, change.kind])),
    ))
    const steps = [...nextPlan.steps].sort((left, right) =>
      left.stepId < right.stepId ? -1 : left.stepId > right.stepId ? 1 : 0,
    )
    for (const after of steps) {
      const before = previousStepsById.get(after.stepId)
      const step = catalog.getStep(after.stepId)
      if (before === undefined || step === null) {
        continue
      }
      const changes: ExplanationChange[] = []
      if (before.order !== after.order && !explained.has(JSON.stringify([after.stepId, "step_order"]))) {
        changes.push({ kind: "step_order", targetId: after.stepId, before: before.order, after: after.order })
      }
      if (before.visible !== after.visible && !explained.has(JSON.stringify([after.stepId, "step_visibility"]))) {
        changes.push({ kind: "step_visibility", targetId: after.stepId, before: before.visible, after: after.visible })
      }
      if (changes.length > 0) {
        explanations.push({
          id: `explanation-${event}-base-${after.stepId}`,
          event,
          reason: step.titre,
          changes,
        })
      }
    }
  }

  return explanations
}

export function buildInvalidationExplanations(
  before: readonly InvalidatedAnswer[],
  after: readonly InvalidatedAnswer[],
  adaptations: readonly Explanation[],
): Explanation[] {
  const previous = new Set(before.map((answer) => answer.stepId))
  return after.filter((answer) => !previous.has(answer.stepId)).map((answer) => {
    const cause = adaptations.find((explanation) => explanation.changes.some((change) =>
      change.targetId === answer.stepId && change.kind === "step_visibility" && change.after === false,
    ))
    return {
      id: `explanation-answer_invalidated-${answer.stepId}`,
      ...(cause?.ruleId === undefined ? {} : { ruleId: cause.ruleId }),
      event: "answer_invalidated",
      reason: cause?.reason ?? answer.reason,
      changes: [{ kind: "answer_invalidated", targetId: answer.stepId }],
    }
  })
}
