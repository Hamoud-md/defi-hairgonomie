import { describe, expect, it } from "vitest"

import { validateCatalog } from "../../../src/domain/invariants"
import type { CatalogContents } from "../../../src/domain/invariants"
import type { RuleCondition } from "../../../src/domain/models"
import {
  createCatalogWithDuplicateObjective,
  createCatalogWithEmptyPreferenceValue,
  createCatalogWithOrphanStep,
  createCatalogWithUnknownRuleStep,
  createValidCatalog,
} from "../fixtures/catalog-fixtures"

function expectCatalogInvalid(contents: CatalogContents): void {
  const result = validateCatalog(contents, "QRY-01")

  expect(result.ok).toBe(false)

  if (result.ok) {
    return
  }

  expect(result.error.code).toBe("CATALOG_INVALID")
  expect(result.error.operation).toBe("QRY-01")
}

describe("validateCatalog", () => {
  it("rejects a default preference value outside its declared options before a session can start", () => {
    const contents = createValidCatalog()
    expectCatalogInvalid({ ...contents, preferences: [{ ...contents.preferences[0], valeurs: ["technical-value-2"] }] })
  })

  it("accepts a coherent catalog", () => {
    const result = validateCatalog(createValidCatalog(), "QRY-01")

    expect(result).toEqual({ ok: true, data: true, error: null })
  })

  it("rejects duplicate objective ids", () => {
    expectCatalogInvalid(createCatalogWithDuplicateObjective())
  })

  it("rejects duplicate step ids", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      steps: [...contents.steps, { ...contents.steps[0] }],
    })
  })

  it("rejects duplicate preference ids", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      preferences: [...contents.preferences, { ...contents.preferences[0] }],
    })
  })

  it("rejects duplicate transition rule ids", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [...contents.rules, { ...contents.rules[0] }],
    })
  })

  it("rejects a step referencing an unknown objective", () => {
    expectCatalogInvalid(createCatalogWithOrphanStep())
  })

  it("rejects a rule referencing an unknown step", () => {
    expectCatalogInvalid(createCatalogWithUnknownRuleStep())
  })

  it("rejects a preference without a declared value", () => {
    expectCatalogInvalid(createCatalogWithEmptyPreferenceValue())
  })

  it("rejects a step with a non-finite order", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      steps: [{ ...contents.steps[0], ordre: Number.POSITIVE_INFINITY }],
    })
  })

  it("rejects a step with a non-numeric order", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      steps: [{ ...contents.steps[0], ordre: "1" as unknown as number }],
    })
  })

  it("rejects a non-object condition", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          condition: null as unknown as RuleCondition,
        },
      ],
    })
  })

  it("rejects an unknown condition kind", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          condition: {
            kind: "unknown",
          } as unknown as RuleCondition,
        },
      ],
    })
  })

  it("rejects a condition referencing an unknown preference", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          condition: {
            kind: "preference_equals",
            preferenceId: "preference-unknown",
            value: "technical-value-1",
          },
        },
      ],
    })
  })

  it("rejects a condition referencing an undeclared preference value", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          condition: {
            kind: "preference_equals",
            preferenceId: "preference-1",
            value: "technical-value-unknown",
          },
        },
      ],
    })
  })

  it("rejects an invalid effect order", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          effect: {
            kind: "step_order",
            order: Number.NaN,
          },
        },
      ],
    })
  })

  it("rejects an unknown effect kind", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          effect: {
            kind: "unknown",
          } as unknown as (typeof contents.rules)[number]["effect"],
        },
      ],
    })
  })

  it("rejects a preference with an empty values list", () => {
    const contents = createValidCatalog()

    expectCatalogInvalid({
      ...contents,
      preferences: [{ ...contents.preferences[0], valeurs: [] }],
    })
  })

  it("rejects a cyclic condition", () => {
    const contents = createValidCatalog()
    const condition: Record<string, unknown> = { kind: "not" }
    condition.condition = condition

    expectCatalogInvalid({
      ...contents,
      rules: [
        {
          ...contents.rules[0],
          condition: condition as unknown as RuleCondition,
        },
      ],
    })
  })

  it("accepts a condition with a repeated shared reference", () => {
    const contents = createValidCatalog()
    const shared: RuleCondition = { kind: "always" }
    const result = validateCatalog(
      {
        ...contents,
        rules: [
          {
            ...contents.rules[0],
            condition: {
              kind: "all",
              conditions: [shared, shared],
            },
          },
        ],
      },
      "QRY-01",
    )

    expect(result.ok).toBe(true)
  })
})
