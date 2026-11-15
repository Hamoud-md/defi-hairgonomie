import { describe, expect, it } from "vitest"

import type { ContractResult, JourneyPlan } from "../../../src/domain/models"
import { buildBasePlan } from "../../../src/domain/journey-engine"
import { validatePlan } from "../../../src/domain/invariants"
import {
  createPlanCatalog,
} from "../fixtures/plan-fixtures"

function getBasePlan(): JourneyPlan {
  const result = buildBasePlan("objective-1", createPlanCatalog(), "QRY-01")

  if (!result.ok) {
    throw new Error(result.error.message)
  }

  return result.data
}

function expectCode(
  result: ContractResult<true>,
  code: "CATALOG_INVALID" | "REQUIRED_STEP_REMOVED",
): void {
  expect(result.ok).toBe(false)

  if (!result.ok) {
    expect(result.error.code).toBe(code)
    expect(result.error.operation).toBe("QRY-01")
  }
}

describe("validatePlan", () => {
  it.each([undefined, null, "true", 1])("rejects non-boolean visibility: %j", (visible) => {
    const plan = getBasePlan()
    plan.steps[0].visible = visible as unknown as boolean
    expectCode(validatePlan(plan, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("accepts a coherent base plan", () => {
    const result = validatePlan(getBasePlan(), createPlanCatalog(), "QRY-01")

    expect(result).toEqual({ ok: true, data: true, error: null })
  })

  it("accepts a hidden optional step", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: plan.steps.map((step) =>
        step.stepId === "step-optional-a" ? { ...step, visible: false } : step,
      ),
    }

    const result = validatePlan(updated, createPlanCatalog(), "QRY-01")

    expect(result.ok).toBe(true)
  })

  it("rejects an unknown objective", () => {
    const plan = { ...getBasePlan(), objectiveId: "objective-unknown" }

    expectCode(validatePlan(plan, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects an unknown step", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: plan.steps.map((step) =>
        step.stepId === "step-optional-a"
          ? { ...step, stepId: "step-unknown" }
          : step,
      ),
    }

    expectCode(validatePlan(updated, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects a step from another objective", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: [
        ...plan.steps,
        { stepId: "step-other", order: 1, required: true, visible: true },
      ],
    }

    expectCode(validatePlan(updated, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects a duplicated step", () => {
    const plan = getBasePlan()
    const requiredStep = plan.steps.find((step) => step.stepId === "step-required-a")

    if (requiredStep === undefined) {
      throw new Error("Missing fixture step")
    }

    const updated: JourneyPlan = {
      ...plan,
      steps: [...plan.steps, { ...requiredStep }],
    }

    expectCode(validatePlan(updated, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects an inconsistent required flag", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: plan.steps.map((step) =>
        step.stepId === "step-required-a" ? { ...step, required: false } : step,
      ),
    }

    expectCode(validatePlan(updated, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects a non-finite order", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: plan.steps.map((step) =>
        step.stepId === "step-optional-a"
          ? { ...step, order: Number.POSITIVE_INFINITY }
          : step,
      ),
    }

    expectCode(validatePlan(updated, createPlanCatalog(), "QRY-01"), "CATALOG_INVALID")
  })

  it("rejects a missing required step", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: plan.steps.filter((step) => step.stepId !== "step-required-a"),
    }

    expectCode(
      validatePlan(updated, createPlanCatalog(), "QRY-01"),
      "REQUIRED_STEP_REMOVED",
    )
  })

  it("rejects a hidden required step", () => {
    const plan = getBasePlan()
    const updated: JourneyPlan = {
      ...plan,
      steps: plan.steps.map((step) =>
        step.stepId === "step-required-a" ? { ...step, visible: false } : step,
      ),
    }

    expectCode(
      validatePlan(updated, createPlanCatalog(), "QRY-01"),
      "REQUIRED_STEP_REMOVED",
    )
  })
})
