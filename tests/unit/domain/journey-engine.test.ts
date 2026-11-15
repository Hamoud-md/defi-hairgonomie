import { describe, expect, it } from "vitest"

import {
  buildBasePlan,
  buildPlan,
  recalculatePlan,
} from "../../../src/domain/journey-engine"
import type {
  ContractResult,
  Id,
  JourneyCatalog,
  JourneyPlan,
  RuleEffect,
  TransitionRule,
} from "../../../src/domain/models"
import {
  createAlternatePreferences,
  createDefaultPreferences,
  createPlanCatalog,
  createPlanCatalogWithRules,
} from "../fixtures/plan-fixtures"

function getBasePlan(
  catalog: JourneyCatalog = createPlanCatalog(),
  objectiveId = "objective-1",
): JourneyPlan {
  const result = buildBasePlan(objectiveId, catalog, "QRY-01")

  if (!result.ok) {
    throw new Error(result.error.message)
  }

  return result.data
}

function createAlwaysRule(
  id: string,
  stepIds: string[],
  effect: RuleEffect,
): TransitionRule {
  return {
    id,
    condition: { kind: "always" },
    stepIds,
    effect,
    explication: `technical-${id}`,
  }
}

function expectErrorCode<T>(
  result: ContractResult<T>,
  code:
    | "OBJECTIVE_NOT_FOUND"
    | "CATALOG_INVALID"
    | "RULE_CONFLICT"
    | "REQUIRED_STEP_REMOVED",
): void {
  expect(result.ok).toBe(false)

  if (!result.ok) {
    expect(result.error.code).toBe(code)
  }
}

describe("buildBasePlan", () => {
  it("orders steps by ordre then id", () => {
    const plan = getBasePlan()

    expect(plan.steps.map((step) => step.stepId)).toEqual([
      "step-required-a",
      "step-required-b",
      "step-optional-a",
      "step-optional-b",
      "step-optional-c",
      "step-tie-a",
      "step-tie-b",
    ])
  })

  it("isolates the active objective", () => {
    const plan = getBasePlan()

    expect(plan.objectiveId).toBe("objective-1")
    expect(plan.steps.some((step) => step.stepId === "step-other")).toBe(false)
  })

  it("keeps required steps present and visible", () => {
    const plan = getBasePlan()
    const required = plan.steps.filter((step) => step.required)

    expect(required.map((step) => step.stepId)).toEqual([
      "step-required-a",
      "step-required-b",
    ])
    expect(required.every((step) => step.visible)).toBe(true)
  })

  it("initializes optional steps as visible", () => {
    const plan = getBasePlan()
    const optional = plan.steps.filter((step) => !step.required)

    expect(optional.every((step) => step.visible)).toBe(true)
  })

  it("is deterministic", () => {
    const catalog = createPlanCatalog()

    expect(getBasePlan(catalog)).toEqual(getBasePlan(catalog))
  })

  it("rejects an unknown objective", () => {
    const catalog = createPlanCatalog()

    expectErrorCode(
      buildBasePlan("objective-unknown", catalog, "CMD-01"),
      "OBJECTIVE_NOT_FOUND",
    )
  })

  it("rejects an invalid catalog", () => {
    const catalog = createPlanCatalog()
    const invalidCatalog: JourneyCatalog = {
      ...catalog,
      getRules: () => [
        {
          id: "rule-invalid",
          condition: {
            kind: "preference_equals",
            preferenceId: "preference-unknown",
            value: "value",
          },
          stepIds: ["step-optional-a"],
          effect: { kind: "step_order", order: 0 },
          explication: "technical-invalid",
        },
      ],
    }

    expectErrorCode(
      buildBasePlan("objective-1", invalidCatalog, "CMD-01"),
      "CATALOG_INVALID",
    )
  })
})

describe("buildPlan", () => {
  it("applies rules and sorts the final plan by order then id", () => {
    const result = buildPlan(
      "objective-1",
      createAlternatePreferences(),
      createPlanCatalog(),
      "CMD-02",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data.steps.map((step) => step.stepId)).toEqual([
        "step-optional-a",
        "step-required-a",
        "step-optional-c",
        "step-required-b",
        "step-optional-b",
        "step-tie-a",
        "step-tie-b",
      ])

      const optionalB = result.data.steps.find(
        (step) => step.stepId === "step-optional-b",
      )
      expect(optionalB?.visible).toBe(false)

      const requiredSteps = result.data.steps.filter((step) => step.required)
      expect(requiredSteps.every((step) => step.visible)).toBe(true)
    }
  })

  it("applies only rules whose preference condition matches", () => {
    const result = buildPlan(
      "objective-1",
      createDefaultPreferences(),
      createPlanCatalog(),
      "CMD-02",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      const optionalA = result.data.steps.find(
        (step) => step.stepId === "step-optional-a",
      )
      const optionalB = result.data.steps.find(
        (step) => step.stepId === "step-optional-b",
      )

      expect(optionalA?.order).toBe(0)
      expect(optionalB?.visible).toBe(true)
    }
  })

  it("is independent from preference key order", () => {
    const catalog = createPlanCatalog()
    const preferencesA: Record<Id, string> = {
      "preference-1": "alternate-1",
      "preference-2": "default-2",
    }
    const preferencesB: Record<Id, string> = {
      "preference-2": "default-2",
      "preference-1": "alternate-1",
    }

    expect(
      buildPlan("objective-1", preferencesA, catalog, "CMD-02"),
    ).toEqual(buildPlan("objective-1", preferencesB, catalog, "CMD-02"))
  })

  it("rejects conflicting rules", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-01", ["step-optional-a"], {
        kind: "step_order",
        order: 0,
      }),
      createAlwaysRule("rule-02", ["step-optional-a"], {
        kind: "step_order",
        order: 9,
      }),
    ])

    expectErrorCode(
      buildPlan("objective-1", createDefaultPreferences(), catalog, "CMD-02"),
      "RULE_CONFLICT",
    )
  })

  it("rejects hiding a required step", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-hide-required", ["step-required-a"], {
        kind: "step_visibility",
        visible: false,
      }),
    ])

    expectErrorCode(
      buildPlan("objective-1", createDefaultPreferences(), catalog, "CMD-02"),
      "REQUIRED_STEP_REMOVED",
    )
  })

  it("rejects an invalid condition", () => {
    const catalog = createPlanCatalog()
    const invalidCatalog: JourneyCatalog = {
      ...catalog,
      getRules: () => [
        {
          id: "rule-invalid",
          condition: {
            kind: "preference_equals",
            preferenceId: "preference-unknown",
            value: "value",
          },
          stepIds: ["step-optional-a"],
          effect: { kind: "step_order", order: 0 },
          explication: "technical-invalid",
        },
      ],
    }

    expectErrorCode(
      buildPlan(
        "objective-1",
        createDefaultPreferences(),
        invalidCatalog,
        "CMD-02",
      ),
      "CATALOG_INVALID",
    )
  })
})

describe("recalculatePlan", () => {
  it("attributes a return to base values to an active rule even if it is a base no-op", () => {
    const catalog = createPlanCatalogWithRules([
      { id: "rule-default", condition: {
        kind: "preference_equals", preferenceId: "preference-1", value: "default-1",
      }, stepIds: ["step-optional-a"], effect: { kind: "step_order", order: 3 }, explication: "technical-default" },
      { id: "rule-alternate", condition: {
        kind: "preference_equals", preferenceId: "preference-1", value: "alternate-1",
      }, stepIds: ["step-optional-a"], effect: { kind: "step_order", order: 0 }, explication: "technical-alternate" },
    ])
    const adapted = buildPlan("objective-1", createAlternatePreferences(), catalog, "CMD-02")
    if (!adapted.ok) throw new Error(adapted.error.message)
    const restored = recalculatePlan(adapted.data, "objective-1", {}, catalog, "CMD-02")
    expect(restored.ok && restored.data.explanations).toEqual([
      { id: "explanation-preference_changed-rule-default", ruleId: "rule-default",
        event: "preference_changed", reason: "technical-default", changes: [
          { kind: "step_order", targetId: "step-optional-a", before: 0, after: 3 },
        ] },
    ])
  })

  it("returns no partial result or input mutation after a late conflict", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-01", ["step-optional-a"], { kind: "step_order", order: 0 }),
      createAlwaysRule("rule-02", ["step-optional-b"], { kind: "step_visibility", visible: false }),
      createAlwaysRule("rule-03", ["step-optional-b"], { kind: "step_visibility", visible: true }),
    ])
    const previous = getBasePlan(catalog)
    const preferences = createDefaultPreferences()
    const snapshot = structuredClone({ previous, preferences })
    const result = recalculatePlan(previous, "objective-1", preferences, catalog, "CMD-02")
    expect(result).toMatchObject({ ok: false, data: null, error: { code: "RULE_CONFLICT", operation: "CMD-02" } })
    expect({ previous, preferences }).toEqual(snapshot)
  })

  it("explains restoration of base order and visibility when rules become inactive", () => {
    const original = createPlanCatalog()
    const catalog: JourneyCatalog = {
      ...original,
      getStep: (id) => {
        const step = original.getStep(id)
        return step === null ? null : { ...step, titre: `technical-${id}` }
      },
    }
    const adapted = buildPlan("objective-1", createAlternatePreferences(), catalog, "CMD-02")
    if (!adapted.ok) throw new Error(adapted.error.message)
    const restored = recalculatePlan(adapted.data, "objective-1", createDefaultPreferences(), catalog, "CMD-02")
    expect(restored.ok).toBe(true)
    if (!restored.ok) return
    expect(restored.data.explanations.map((explanation) => ({
      ruleId: explanation.ruleId, reason: explanation.reason, changes: explanation.changes,
    }))).toEqual([
      { ruleId: undefined, reason: "technical-step-optional-b", changes: [
        { kind: "step_visibility", targetId: "step-optional-b", before: false, after: true },
      ] },
      { ruleId: undefined, reason: "technical-step-optional-c", changes: [
        { kind: "step_order", targetId: "step-optional-c", before: 2, after: 5 },
      ] },
    ])
  })

  it("preserves A08 and all inputs across repeated recalculations", () => {
    const catalog = createPlanCatalog()
    const previous = getBasePlan(catalog)
    Object.freeze(previous.steps)
    previous.steps.forEach(Object.freeze)
    Object.freeze(previous)
    const preferences = Object.freeze(createAlternatePreferences())
    const catalogSnapshot = structuredClone({
      steps: catalog.getSteps("objective-1"), rules: catalog.getRules(), preferences: catalog.getPreferences(),
    })
    const first = recalculatePlan(previous, "objective-1", preferences, catalog, "CMD-02")
    expect(first.ok).toBe(true)
    if (!first.ok) return
    for (let index = 0; index < 10; index += 1) {
      expect(recalculatePlan(previous, "objective-1", preferences, catalog, "CMD-02")).toEqual(first)
    }
    for (const step of catalog.getSteps("objective-1").filter((step) => step.requis)) {
      expect(first.data.plan.steps.find((planned) => planned.stepId === step.id))
        .toMatchObject({ required: true, visible: true })
    }
    expect({ steps: catalog.getSteps("objective-1"), rules: catalog.getRules(), preferences: catalog.getPreferences() })
      .toEqual(catalogSnapshot)
  })

  it("returns explanations only for real changes", () => {
    const catalog = createPlanCatalog()
    const previous = getBasePlan(catalog)
    const result = recalculatePlan(
      previous,
      "objective-1",
      createAlternatePreferences(),
      catalog,
      "CMD-02",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data.explanations.map((explanation) => explanation.ruleId)).toEqual([
        "rule-01",
        "rule-02",
        "rule-03",
      ])
      expect(
        result.data.explanations.flatMap((explanation) =>
          explanation.changes.map((change) => change.kind),
        ),
      ).toEqual(["step_order", "step_visibility", "step_order"])
    }
  })

  it("returns no explanation for the initial plan", () => {
    const result = recalculatePlan(
      null,
      "objective-1",
      createAlternatePreferences(),
      createPlanCatalog(),
      "CMD-01",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data.explanations).toEqual([])
    }
  })

  it("returns no explanation when the plan does not change", () => {
    const catalog = createPlanCatalog()
    const first = recalculatePlan(
      null,
      "objective-1",
      createAlternatePreferences(),
      catalog,
      "CMD-01",
    )

    if (!first.ok) {
      throw new Error(first.error.message)
    }

    const second = recalculatePlan(
      first.data.plan,
      "objective-1",
      createAlternatePreferences(),
      catalog,
      "CMD-02",
    )

    expect(second.ok).toBe(true)

    if (second.ok) {
      expect(second.data.explanations).toEqual([])
    }
  })

  it("does not mutate the previous plan", () => {
    const catalog = createPlanCatalog()
    const previous = getBasePlan(catalog)
    const snapshot = structuredClone(previous)

    recalculatePlan(
      previous,
      "objective-1",
      createAlternatePreferences(),
      catalog,
      "CMD-02",
    )

    expect(previous).toEqual(snapshot)
  })
})
