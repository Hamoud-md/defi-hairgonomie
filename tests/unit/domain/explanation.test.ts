import { describe, expect, it } from "vitest"

import { buildExplanations } from "../../../src/domain/explanation"
import type { AppliedRuleEffect } from "../../../src/domain/rule-evaluator"
import type { JourneyPlan, PlannedStep } from "../../../src/domain/models"

function createStep(
  stepId: string,
  order: number,
  visible = true,
  required = false,
): PlannedStep {
  return { stepId, order, required, visible }
}

function createPlan(steps: PlannedStep[]): JourneyPlan {
  return { objectiveId: "objective-1", steps }
}

describe("buildExplanations", () => {
  it("explains a real order change", () => {
    const previous = createPlan([createStep("step-a", 2)])
    const next = createPlan([createStep("step-a", 1)])
    const applied: AppliedRuleEffect[] = [
      {
        ruleId: "rule-01",
        reason: "technical-reason",
        effect: { kind: "step_order", order: 1 },
        stepIds: ["step-a"],
      },
    ]

    const explanations = buildExplanations(
      previous,
      next,
      applied,
      "preference_changed",
    )

    expect(explanations).toEqual([
      {
        id: "explanation-preference_changed-rule-01",
        ruleId: "rule-01",
        event: "preference_changed",
        reason: "technical-reason",
        changes: [
          {
            kind: "step_order",
            targetId: "step-a",
            before: 2,
            after: 1,
          },
        ],
      },
    ])
  })

  it("explains a real visibility change with boolean values", () => {
    const previous = createPlan([createStep("step-a", 1, true)])
    const next = createPlan([createStep("step-a", 1, false)])
    const applied: AppliedRuleEffect[] = [
      {
        ruleId: "rule-02",
        reason: "technical-reason",
        effect: { kind: "step_visibility", visible: false },
        stepIds: ["step-a"],
      },
    ]

    const explanations = buildExplanations(
      previous,
      next,
      applied,
      "preference_changed",
    )

    expect(explanations).toEqual([
      {
        id: "explanation-preference_changed-rule-02",
        ruleId: "rule-02",
        event: "preference_changed",
        reason: "technical-reason",
        changes: [
          {
            kind: "step_visibility",
            targetId: "step-a",
            before: true,
            after: false,
          },
        ],
      },
    ])
  })

  it("produces no explanation when plans are identical", () => {
    const plan = createPlan([createStep("step-a", 1)])
    const applied: AppliedRuleEffect[] = [
      {
        ruleId: "rule-01",
        reason: "technical-reason",
        effect: { kind: "step_order", order: 1 },
        stepIds: ["step-a"],
      },
    ]

    expect(
      buildExplanations(plan, plan, applied, "preference_changed"),
    ).toEqual([])
  })

  it("produces no explanation when no rule was applied", () => {
    const previous = createPlan([createStep("step-a", 1)])
    const next = createPlan([createStep("step-a", 2)])

    expect(
      buildExplanations(previous, next, [], "preference_changed"),
    ).toEqual([])
  })

  it("produces no explanation when there is no previous plan", () => {
    const next = createPlan([createStep("step-a", 1)])
    const applied: AppliedRuleEffect[] = [
      {
        ruleId: "rule-01",
        reason: "technical-reason",
        effect: { kind: "step_order", order: 1 },
        stepIds: ["step-a"],
      },
    ]

    expect(
      buildExplanations(null, next, applied, "preference_changed"),
    ).toEqual([])
  })

  it("groups multiple changes from one rule in step id order", () => {
    const previous = createPlan([
      createStep("step-a", 1, true),
      createStep("step-b", 2, true),
    ])
    const next = createPlan([
      createStep("step-a", 1, false),
      createStep("step-b", 2, false),
    ])
    const applied: AppliedRuleEffect[] = [
      {
        ruleId: "rule-01",
        reason: "technical-reason",
        effect: { kind: "step_visibility", visible: false },
        stepIds: ["step-a", "step-b"],
      },
    ]

    const explanations = buildExplanations(
      previous,
      next,
      applied,
      "preference_changed",
    )

    expect(explanations).toHaveLength(1)
    expect(explanations[0].changes).toEqual([
      {
        kind: "step_visibility",
        targetId: "step-a",
        before: true,
        after: false,
      },
      {
        kind: "step_visibility",
        targetId: "step-b",
        before: true,
        after: false,
      },
    ])
  })

  it("keeps explanations in applied rule order", () => {
    const previous = createPlan([
      createStep("step-a", 1),
      createStep("step-b", 2),
    ])
    const next = createPlan([
      createStep("step-a", 10),
      createStep("step-b", 20),
    ])
    const applied: AppliedRuleEffect[] = [
      {
        ruleId: "rule-02",
        reason: "technical-reason-02",
        effect: { kind: "step_order", order: 10 },
        stepIds: ["step-a"],
      },
      {
        ruleId: "rule-01",
        reason: "technical-reason-01",
        effect: { kind: "step_order", order: 20 },
        stepIds: ["step-b"],
      },
    ]

    const explanations = buildExplanations(
      previous,
      next,
      applied,
      "preference_changed",
    )

    expect(explanations.map((explanation) => explanation.ruleId)).toEqual([
      "rule-02",
      "rule-01",
    ])
  })
})
