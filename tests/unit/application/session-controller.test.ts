import { describe, expect, it } from "vitest"
import { goBack, selectObjective, validateStep } from "../../../src/application/session-controller"
import { getProgress, isCompleted } from "../../../src/domain/session"
import { getValidationIssues } from "../../../src/domain/validation"
import type { AnswerValue, Id, JourneyCatalog, SessionState, TransitionRule } from "../../../src/domain/models"
import { freezeInputs, sessionCatalog, sessionContents, sessionState, unwrap } from "../fixtures/session-fixtures"

describe("CMD-01 selectObjective", () => {
  it("creates the exact contract result with sorted default preferences and a real first step", () => {
    const result = selectObjective({ objectiveId: "objective-1" }, sessionCatalog())
    const data = unwrap(result)
    expect(Object.keys(result).sort()).toEqual(["data", "error", "ok"])
    expect(Object.keys(data).sort()).toEqual(["explanations", "plan", "state"])
    expect(data.state).toEqual(sessionState())
    expect(Object.keys(data.state.preferences)).toEqual(["preference-1", "preference-2"])
    expect(data.explanations).toEqual([])
    expect(data.plan.steps.filter((step) => step.required).every((step) => step.visible)).toBe(true)
    expect(data.plan.steps.find((step) => step.stepId === "step-hidden")?.visible).toBe(false)
  })

  it.each([undefined, null, ""]) ("requires an objective: %j", (objectiveId) => {
    expect(selectObjective({ objectiveId: objectiveId as unknown as Id }, sessionCatalog()))
      .toMatchObject({ ok: false, data: null, error: { code: "OBJECTIVE_REQUIRED", operation: "CMD-01" } })
  })

  it("rejects an unknown objective", () => {
    expect(selectObjective({ objectiveId: "unknown" }, sessionCatalog()))
      .toMatchObject({ ok: false, data: null, error: { code: "OBJECTIVE_NOT_FOUND", operation: "CMD-01" } })
  })

  it("always starts fresh even when choosing the same objective again", () => {
    const catalog = sessionCatalog()
    const first = unwrap(selectObjective({ objectiveId: "objective-1" }, catalog))
    const advanced = unwrap(validateStep(first.state, { stepId: "step-1", answer: "value-1" }, catalog))
    const before = structuredClone(advanced.state)
    const second = unwrap(selectObjective({ objectiveId: "objective-1" }, catalog))
    expect(second.state.answers).toEqual({})
    expect(second.state.activeStepId).toBe("step-1")
    expect(advanced.state).toEqual(before)
    const other = unwrap(selectObjective({ objectiveId: "objective-2" }, catalog))
    expect(other.state).toMatchObject({ objectiveId: "objective-2", activeStepId: "step-other", answers: {} })
  })

  it("uses the adapted first step and ignores a hidden step even if ordered first", () => {
    const contents = sessionContents()
    const rules: TransitionRule[] = [...contents.rules,
      { id: "rule-order", condition: { kind: "always" }, stepIds: ["step-tail"],
        effect: { kind: "step_order", order: 0 }, explication: "technical-order" },
      { id: "rule-hidden-first", condition: { kind: "always" }, stepIds: ["step-hidden"],
        effect: { kind: "step_order", order: -1 }, explication: "technical-hidden" },
    ]
    expect(unwrap(selectObjective({ objectiveId: "objective-1" }, sessionCatalog({ ...contents, rules }))).state.activeStepId)
      .toBe("step-tail")
  })

  it("supports an empty objective without inventing an active step", () => {
    const data = unwrap(selectObjective({ objectiveId: "objective-empty" }, sessionCatalog()))
    expect(data.plan.steps).toEqual([])
    expect(data.state.activeStepId).toBeNull()
    expect(isCompleted(data.state, data.plan)).toBe(true)
    expect(unwrap(getProgress(data.state, data.plan, "CMD-03"))).toEqual({ current: 0, total: 0 })
  })
})

describe("CMD-03 validateStep and CMD-04 goBack", () => {
  it("executes a full journey, rejects an answer atomically, returns, and reaches completion", () => {
    const catalog = sessionCatalog()
    const initial = unwrap(selectObjective({ objectiveId: "objective-1" }, catalog))
    freezeInputs(initial.state)
    const invalid = validateStep(initial.state, { stepId: "step-1", answer: "" }, catalog)
    expect(invalid).toMatchObject({ ok: false, data: null, error: { code: "ANSWER_REQUIRED", operation: "CMD-03" } })
    if (!invalid.ok) expect(getValidationIssues(invalid.error)).toEqual([
      { stepId: "step-1", code: "ANSWER_REQUIRED", message: invalid.error.message },
    ])
    const first = unwrap(validateStep(initial.state, { stepId: "step-1", answer: ["value-1"] }, catalog))
    expect(Object.keys(first).sort()).toEqual(["completed", "issues", "nextStepId", "progress", "state"])
    expect(first).toMatchObject({ completed: false, issues: [], nextStepId: "step-2", progress: { current: 2, total: 3 } })
    const back = unwrap(goBack(freezeInputs(first.state), catalog))
    expect(Object.keys(back).sort()).toEqual(["activeStepId", "progress", "state"])
    expect(back.activeStepId).toBe("step-1")
    expect(back.state.answers).toEqual({ "step-1": ["value-1"] })
    const again = unwrap(validateStep(back.state, { stepId: "step-1", answer: ["value-1"] }, catalog))
    const complete = unwrap(validateStep(again.state, { stepId: "step-2", answer: "value-2" }, catalog))
    expect(complete).toMatchObject({ completed: true, nextStepId: null, state: { activeStepId: "step-2",
      answers: { "step-1": ["value-1"], "step-2": "value-2" } } })
    expect(initial.state.answers).toEqual({})
    expect(unwrap(goBack(complete.state, catalog)).state.answers).toEqual(complete.state.answers)
  })

  it.each([
    ["unknown", "", "STEP_NOT_FOUND"],
    ["step-other", "", "STEP_NOT_IN_OBJECTIVE"],
    ["step-2", "", "STEP_NOT_ACTIVE"],
    ["step-hidden", "", "STEP_NOT_ACTIVE"],
    ["step-1", "", "ANSWER_REQUIRED"],
    ["step-1", [], "ANSWER_REQUIRED"],
    ["step-1", undefined, "ANSWER_REQUIRED"],
    ["step-1", 123, "ANSWER_INVALID"],
    ["step-1", ["value", 123], "ANSWER_INVALID"],
  ])("returns %s validation errors without changing state", (stepId, answer, code) => {
    const state = freezeInputs(sessionState({ answers: { "step-tail": ["existing"] } }))
    const before = structuredClone(state)
    expect(validateStep(state, { stepId: stepId as Id, answer: answer as AnswerValue }, sessionCatalog()))
      .toMatchObject({ ok: false, data: null, error: { code, operation: "CMD-03" } })
    expect(state).toEqual(before)
  })

  it("does not treat a masked active cursor as eligible", () => {
    expect(validateStep(sessionState({ activeStepId: "step-hidden" }), { stepId: "step-hidden", answer: "value" }, sessionCatalog()))
      .toMatchObject({ ok: false, error: { code: "STEP_NOT_ACTIVE" } })
  })

  it("requires an active session before inspecting input", () => {
    const catalog = sessionCatalog()
    expect(validateStep(null, { stepId: "unknown", answer: "" }, catalog))
      .toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation: "CMD-03" } })
    expect(goBack(null, catalog)).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation: "CMD-04" } })
    expect(goBack(sessionState({ objectiveId: null }), catalog))
      .toMatchObject({ ok: false, error: { code: "OBJECTIVE_REQUIRED", operation: "CMD-04" } })
  })

  it.each([null, "unknown", "step-hidden", "step-other"])("refuses an invalid return cursor: %j", (activeStepId) => {
    const state = freezeInputs(sessionState({ activeStepId }))
    expect(goBack(state, sessionCatalog())).toMatchObject({ ok: false, data: null, error: { code: "STEP_NOT_FOUND", operation: "CMD-04" } })
  })

  it("refuses repeated return at the first step without losing answers", () => {
    const state = freezeInputs(sessionState({ answers: { "step-1": ["value-1"], "step-2": "value-2" } }))
    const before = structuredClone(state)
    for (let index = 0; index < 3; index += 1) {
      expect(goBack(state, sessionCatalog())).toMatchObject({ ok: false, data: null, error: { code: "FIRST_STEP" } })
    }
    expect(state).toEqual(before)
  })

  it("owns response arrays and nested arrays preserved from earlier answers", () => {
    const catalog = sessionCatalog()
    const state = sessionState({ answers: { "step-tail": ["existing"] } })
    const answer = ["value-1"]
    const next = unwrap(validateStep(state, { stepId: "step-1", answer }, catalog))
    answer.push("external-change")
    ;(state.answers["step-tail"] as string[]).push("old-state-change")
    expect(next.state.answers).toEqual({ "step-1": ["value-1"], "step-tail": ["existing"] })
    next.state.preferences["preference-1"] = "next-state-change"
    expect(state.preferences["preference-1"]).toBe("value-1")
  })

  it("supports an optional-only objective with finite progress and immediate completion", () => {
    const contents = sessionContents()
    const catalog = sessionCatalog({ ...contents,
      steps: contents.steps.map((step) => ({ ...step, requis: false })),
    })
    const initial = unwrap(selectObjective({ objectiveId: "objective-1" }, catalog))
    expect(isCompleted(initial.state, initial.plan)).toBe(true)
    const result = unwrap(validateStep(initial.state, { stepId: "step-1", answer: "value" }, catalog))
    expect(result).toMatchObject({ completed: true, nextStepId: null, progress: { current: 1, total: 3 } })
  })
})

describe("configuration errors and determinism", () => {
  it("maps an initial required-step violation to CATALOG_INVALID without hiding its detail", () => {
    const contents = sessionContents()
    const catalog = sessionCatalog({ ...contents, rules: [{ id: "rule-invalid", condition: { kind: "always" },
      stepIds: ["step-1"], effect: { kind: "step_visibility", visible: false }, explication: "technical" }] })
    const result = selectObjective({ objectiveId: "objective-1" }, catalog)
    expect(result).toMatchObject({ ok: false, data: null, error: { code: "CATALOG_INVALID", operation: "CMD-01" } })
    if (!result.ok) expect(result.error.message).toContain("hides required step step-1")
  })

  it("propagates conflicting rules atomically", () => {
    const contents = sessionContents()
    const catalog = sessionCatalog({ ...contents, rules: [true, false].map((visible, index) => ({
      id: `rule-${index}`, condition: { kind: "always" }, stepIds: ["step-tail"],
      effect: { kind: "step_visibility", visible }, explication: "technical",
    })) })
    expect(selectObjective({ objectiveId: "objective-1" }, catalog))
      .toMatchObject({ ok: false, data: null, error: { code: "RULE_CONFLICT", operation: "CMD-01" } })
    const state = freezeInputs(sessionState())
    expect(validateStep(state, { stepId: "step-1", answer: "value" }, catalog))
      .toMatchObject({ ok: false, data: null, error: { code: "RULE_CONFLICT", operation: "CMD-03" } })
    expect(state.answers).toEqual({})
  })

  it("rejects malformed catalogs for all commands without partial results", () => {
    const original = sessionCatalog()
    const catalog: JourneyCatalog = { ...original, getRules: () => [{
      id: "rule-unknown", condition: { kind: "always" }, stepIds: ["unknown"],
      effect: { kind: "step_order", order: 0 }, explication: "technical",
    }] }
    const state = freezeInputs(sessionState({ activeStepId: "step-2", answers: { "step-1": "value-1" } }))
    const before = structuredClone(state)
    const results = [selectObjective({ objectiveId: "objective-1" }, catalog),
      validateStep(state, { stepId: "step-2", answer: "value-2" }, catalog), goBack(state, catalog)]
    for (const result of results) expect(result).toMatchObject({ ok: false, data: null, error: { code: "CATALOG_INVALID" } })
    expect(state).toEqual(before)
  })

  it("rejects a stale session objective as configuration instead of creating a partial session", () => {
    const state = sessionState({ objectiveId: "unknown" })
    expect(goBack(state, sessionCatalog())).toMatchObject({ ok: false, data: null, error: { code: "CATALOG_INVALID" } })
  })

  it("is repeatable and independent of key order, without changing the catalog", () => {
    const catalog = sessionCatalog()
    const snapshot = structuredClone({ objectives: catalog.getObjectives(), steps: catalog.getSteps("objective-1"),
      preferences: catalog.getPreferences(), rules: catalog.getRules() })
    const state = freezeInputs(sessionState())
    const reordered: SessionState = { ...state, preferences: Object.fromEntries(Object.entries(state.preferences).reverse()) }
    const expected = validateStep(state, { stepId: "step-1", answer: "value-1" }, catalog)
    for (let index = 0; index < 10; index += 1) {
      expect(validateStep(reordered, { stepId: "step-1", answer: "value-1" }, catalog)).toEqual(expected)
      expect(selectObjective({ objectiveId: "objective-1" }, catalog))
        .toEqual(selectObjective({ objectiveId: "objective-1" }, catalog))
    }
    expect({ objectives: catalog.getObjectives(), steps: catalog.getSteps("objective-1"),
      preferences: catalog.getPreferences(), rules: catalog.getRules() }).toEqual(snapshot)
  })
})
