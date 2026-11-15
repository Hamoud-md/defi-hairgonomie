import { describe, expect, it } from "vitest"

import { buildBasePlan } from "../../../src/domain/journey-engine"
import type {
  ContractResult,
  JourneyCatalog,
  JourneyPlan,
  RuleEffect,
  TransitionRule,
} from "../../../src/domain/models"
import { evaluateRules } from "../../../src/domain/rule-evaluator"
import type { AppliedRuleEffect } from "../../../src/domain/rule-evaluator"
import {
  createAlternatePreferences,
  createDefaultPreferences,
  createPlanCatalog,
  createPlanCatalogWithRules,
} from "../fixtures/plan-fixtures"

function getBasePlan(catalog: JourneyCatalog = createPlanCatalog()): JourneyPlan {
  const result = buildBasePlan("objective-1", catalog, "QRY-01")

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

function expectErrorCode(
  result: ContractResult<readonly AppliedRuleEffect[]>,
  code:
    | "CATALOG_INVALID"
    | "RULE_CONFLICT"
    | "REQUIRED_STEP_REMOVED",
): void {
  expect(result.ok).toBe(false)

  if (!result.ok) {
    expect(result.error.code).toBe(code)
    expect(result.error.operation).toBe("QRY-01")
  }
}

function createCatalogWithRuleOverride(rule: TransitionRule): JourneyCatalog {
  const catalog = createPlanCatalog()

  return {
    ...catalog,
    getRules: () => [rule],
  }
}

describe("evaluateRules", () => {
  it("validates effects even when the condition is false", () => {
    const rule = createAlwaysRule("rule-invalid", ["step-optional-a"], {
      kind: "step_order", order: Number.NaN,
    })
    rule.condition = { kind: "any", conditions: [] }
    const catalog = createCatalogWithRuleOverride(rule)
    expectErrorCode(evaluateRules(getBasePlan(), {}, catalog, "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects cyclic conditions without recursing forever", () => {
    const rule = createAlwaysRule("rule-cycle", ["step-optional-a"], {
      kind: "step_order", order: 0,
    })
    const condition: { kind: "not"; condition: TransitionRule["condition"] } = {
      kind: "not", condition: { kind: "always" },
    }
    condition.condition = condition
    rule.condition = condition
    expectErrorCode(evaluateRules(getBasePlan(), {}, createCatalogWithRuleOverride(rule), "QRY-01"), "CATALOG_INVALID")
  })

  it.each<RuleEffect>([
    { kind: "step_order", order: 3 },
    { kind: "step_visibility", visible: true },
  ])("omits effects that do not change the plan: %j", (effect) => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-noop", ["step-optional-a"], effect),
    ])
    expect(evaluateRules(getBasePlan(catalog), {}, catalog, "QRY-01"))
      .toEqual({ ok: true, data: [], error: null })
  })

  it.each<RuleEffect>([
    { kind: "step_order", order: 0 },
    { kind: "step_visibility", visible: false },
  ])("detects conflicts even when the first request is a no-op: %j", (effect) => {
    const noOp: RuleEffect = effect.kind === "step_order"
      ? { kind: "step_order", order: 3 }
      : { kind: "step_visibility", visible: true }
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-01", ["step-optional-a"], noOp),
      createAlwaysRule("rule-02", ["step-optional-a"], effect),
    ])
    const result = evaluateRules(getBasePlan(catalog), {}, catalog, "QRY-01")
    expectErrorCode(result, "RULE_CONFLICT")
    expect(result.data).toBeNull()
  })

  it("applies a shared rule only to steps of the active objective", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-shared", ["step-other", "step-optional-b", "step-optional-a"], {
        kind: "step_visibility", visible: false,
      }),
    ])
    const result = evaluateRules(getBasePlan(catalog), {}, catalog, "QRY-01")
    expect(result.ok && result.data[0].stepIds).toEqual(["step-optional-a", "step-optional-b"])
  })

  it("rejects unknown step references instead of treating them as another objective", () => {
    const catalog = createCatalogWithRuleOverride(createAlwaysRule("rule-unknown", ["step-unknown"], {
      kind: "step_visibility", visible: false,
    }))
    expectErrorCode(evaluateRules(getBasePlan(), {}, catalog, "QRY-01"), "CATALOG_INVALID")
  })

  it("evaluates nested all, any and not conditions with declared defaults", () => {
    const rule = createAlwaysRule("rule-nested", ["step-optional-a"], {
      kind: "step_visibility", visible: false,
    })
    rule.condition = {
      kind: "all", conditions: [
        { kind: "any", conditions: [
          { kind: "preference_equals", preferenceId: "preference-1", value: "default-1" },
        ] },
        { kind: "not", condition: {
          kind: "preference_equals", preferenceId: "preference-1", value: "alternate-1",
        } },
      ],
    }
    const catalog = createPlanCatalogWithRules([rule])
    const plan = getBasePlan(catalog)
    const defaults = evaluateRules(plan, {}, catalog, "QRY-01")
    expect(defaults.ok && defaults.data.map((effect) => effect.ruleId)).toEqual(["rule-nested"])
    expect(evaluateRules(plan, createAlternatePreferences(), catalog, "QRY-01"))
      .toEqual({ ok: true, data: [], error: null })
    const inherited = Object.create({ "preference-1": "alternate-1" }) as Record<string, string>
    expect(evaluateRules(plan, inherited, catalog, "QRY-01")).toEqual(defaults)
  })

  it("applies an order effect to an optional step", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-order", ["step-optional-a"], {
        kind: "step_order",
        order: 0,
      }),
    ])

    const result = evaluateRules(
      getBasePlan(catalog),
      createDefaultPreferences(),
      catalog,
      "QRY-01",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data).toEqual([
        {
          ruleId: "rule-order",
          reason: "technical-rule-order",
          effect: { kind: "step_order", order: 0 },
          stepIds: ["step-optional-a"],
        },
      ])
    }
  })

  it("applies a visibility effect when its preference matches", () => {
    const catalog = createPlanCatalogWithRules([
      {
        id: "rule-visibility",
        condition: {
          kind: "preference_equals",
          preferenceId: "preference-1",
          value: "alternate-1",
        },
        stepIds: ["step-optional-b"],
        effect: { kind: "step_visibility", visible: false },
        explication: "technical-rule-visibility",
      },
    ])

    const result = evaluateRules(
      getBasePlan(catalog),
      createAlternatePreferences(),
      catalog,
      "QRY-01",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data).toEqual([
        {
          ruleId: "rule-visibility",
          reason: "technical-rule-visibility",
          effect: { kind: "step_visibility", visible: false },
          stepIds: ["step-optional-b"],
        },
      ])
    }
  })

  it("does not apply a rule when its condition is false", () => {
    const catalog = createPlanCatalogWithRules([
      {
        id: "rule-false",
        condition: {
          kind: "preference_equals",
          preferenceId: "preference-1",
          value: "alternate-1",
        },
        stepIds: ["step-optional-c"],
        effect: { kind: "step_visibility", visible: false },
        explication: "technical-rule-false",
      },
    ])

    const result = evaluateRules(
      getBasePlan(catalog),
      createDefaultPreferences(),
      catalog,
      "QRY-01",
    )

    expect(result).toEqual({ ok: true, data: [], error: null })
  })

  it("ignores rules targeting another objective", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-other", ["step-other"], {
        kind: "step_order",
        order: 0,
      }),
    ])

    const result = evaluateRules(
      getBasePlan(catalog),
      createDefaultPreferences(),
      catalog,
      "QRY-01",
    )

    expect(result).toEqual({ ok: true, data: [], error: null })
  })

  it("evaluates rules by ascending id", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-20", ["step-optional-b"], {
        kind: "step_order",
        order: 20,
      }),
      createAlwaysRule("rule-10", ["step-optional-a"], {
        kind: "step_order",
        order: 10,
      }),
    ])

    const result = evaluateRules(
      getBasePlan(catalog),
      createDefaultPreferences(),
      catalog,
      "QRY-01",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data.map((effect) => effect.ruleId)).toEqual([
        "rule-10",
        "rule-20",
      ])
    }
  })

  it("allows equal effect values from multiple rules", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-01", ["step-optional-a"], {
        kind: "step_order",
        order: 0,
      }),
      createAlwaysRule("rule-02", ["step-optional-a"], {
        kind: "step_order",
        order: 0,
      }),
    ])

    const result = evaluateRules(
      getBasePlan(catalog),
      createDefaultPreferences(),
      catalog,
      "QRY-01",
    )

    expect(result.ok).toBe(true)

    if (result.ok) {
      expect(result.data.map((effect) => effect.ruleId)).toEqual(["rule-01"])
    }
  })

  it("rejects conflicting order effects", () => {
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
      evaluateRules(
        getBasePlan(catalog),
        createDefaultPreferences(),
        catalog,
        "QRY-01",
      ),
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
      evaluateRules(
        getBasePlan(catalog),
        createDefaultPreferences(),
        catalog,
        "QRY-01",
      ),
      "REQUIRED_STEP_REMOVED",
    )
  })

  it("rejects reordering a required step", () => {
    const catalog = createPlanCatalogWithRules([
      createAlwaysRule("rule-order-required", ["step-required-a"], {
        kind: "step_order",
        order: 0,
      }),
    ])

    expectErrorCode(
      evaluateRules(
        getBasePlan(catalog),
        createDefaultPreferences(),
        catalog,
        "QRY-01",
      ),
      "CATALOG_INVALID",
    )
  })

  it("rejects an invalid condition", () => {
    const catalog = createCatalogWithRuleOverride({
      id: "rule-invalid-condition",
      condition: {
        kind: "preference_equals",
        preferenceId: "preference-unknown",
        value: "value",
      },
      stepIds: ["step-optional-a"],
      effect: { kind: "step_order", order: 0 },
      explication: "technical-rule-invalid-condition",
    })

    expectErrorCode(
      evaluateRules(
        getBasePlan(),
        createDefaultPreferences(),
        catalog,
        "QRY-01",
      ),
      "CATALOG_INVALID",
    )
  })

  it("rejects an undeclared preference value", () => {
    const catalog = createCatalogWithRuleOverride({
      id: "rule-invalid-value",
      condition: {
        kind: "preference_equals",
        preferenceId: "preference-1",
        value: "undeclared-value",
      },
      stepIds: ["step-optional-a"],
      effect: { kind: "step_order", order: 0 },
      explication: "technical-rule-invalid-value",
    })

    expectErrorCode(
      evaluateRules(
        getBasePlan(),
        createDefaultPreferences(),
        catalog,
        "QRY-01",
      ),
      "CATALOG_INVALID",
    )
  })

  it("rejects an invalid effect", () => {
    const catalog = createCatalogWithRuleOverride({
      id: "rule-invalid-effect",
      condition: { kind: "always" },
      stepIds: ["step-optional-a"],
      effect: { kind: "unknown" } as unknown as RuleEffect,
      explication: "technical-rule-invalid-effect",
    })

    expectErrorCode(
      evaluateRules(
        getBasePlan(),
        createDefaultPreferences(),
        catalog,
        "QRY-01",
      ),
      "CATALOG_INVALID",
    )
  })

  it("does not mutate the plan", () => {
    const catalog = createPlanCatalog()
    const plan = getBasePlan(catalog)
    const snapshot = structuredClone(plan)

    evaluateRules(plan, createAlternatePreferences(), catalog, "QRY-01")

    expect(plan).toEqual(snapshot)
  })
})
