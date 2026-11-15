import { describe, expect, it } from "vitest"
import { buildInvalidationExplanations } from "../../../src/domain/explanation"
import { buildPlan } from "../../../src/domain/journey-engine"
import { findInvalidatedAnswers, reconcileSession, resetSession } from "../../../src/domain/session"
import { validateAnswer, validatePreference, validateRevisionStep } from "../../../src/domain/validation"
import type { AnswerValue } from "../../../src/domain/models"
import { adaptationCatalog } from "../fixtures/adaptation-fixtures"
import { freezeInputs, sessionState, unwrap } from "../fixtures/session-fixtures"

describe("adaptation domain", () => {
  it("derives invalidated answers in stable order without discarding values", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState({ answers: { "step-tail": ["value-tail"], "step-2": "", "step-1": "value-1" } }))
    const plan = unwrap(buildPlan("objective-1", { "preference-1": "value-alt" }, catalog, "CMD-02"))
    expect(findInvalidatedAnswers(state, plan, { "step-tail": "technical-tail", "step-2": "technical-step-2" }))
      .toEqual([{ stepId: "step-2", reason: "technical-step-2" }, { stepId: "step-tail", reason: "technical-tail" }])
    expect(state.answers["step-tail"]).toEqual(["value-tail"])
  })

  it("ignores inherited answers and does not invalidate a mere reorder", () => {
    const catalog = adaptationCatalog()
    const state = sessionState({ answers: Object.create({ "step-tail": "value" }) as Record<string, AnswerValue> })
    const hidden = unwrap(buildPlan("objective-1", { "preference-1": "value-alt" }, catalog, "CMD-02"))
    expect(findInvalidatedAnswers(state, hidden, {})).toEqual([])
    const reordered = unwrap(buildPlan("objective-1", { "preference-1": "value-reorder" }, catalog, "CMD-02"))
    expect(findInvalidatedAnswers(sessionState({ answers: { "step-tail": "value" } }), reordered, {})).toEqual([])
  })

  it("reconciles a hidden cursor to an unanswered required step and copies answers", () => {
    const catalog = adaptationCatalog()
    const plan = unwrap(buildPlan("objective-1", { "preference-1": "value-alt" }, catalog, "CMD-02"))
    const state = freezeInputs(sessionState({ activeStepId: "step-tail", answers: { "step-1": ["value-1"], "step-tail": "value-tail" } }))
    const reconciled = reconcileSession(state, plan)
    expect(reconciled.activeStepId).toBe("step-2")
    expect(reconciled.answers).toEqual(state.answers)
    ;(reconciled.answers["step-1"] as string[]).push("changed")
    expect(state.answers["step-1"]).toEqual(["value-1"])
    expect(state.activeStepId).toBe("step-tail")
    expect(reconcileSession(sessionState(), { objectiveId: "objective-1", steps: [] }).activeStepId).toBeNull()
  })

  it("explains only new invalidations, using the actual rule reason", () => {
    const explanation = buildInvalidationExplanations([], [{ stepId: "step-tail", reason: "technical-tail" }], [
      { id: "adaptation", ruleId: "rule-hide", reason: "technical-rule-reason", event: "preference_changed",
        changes: [{ kind: "step_visibility", targetId: "step-tail", before: true, after: false }] },
    ])
    expect(explanation).toEqual([{ id: "explanation-answer_invalidated-step-tail", ruleId: "rule-hide",
      reason: "technical-rule-reason", event: "answer_invalidated", changes: [{ kind: "answer_invalidated", targetId: "step-tail" }] }])
    expect(buildInvalidationExplanations([{ stepId: "step-tail", reason: "technical-tail" }],
      [{ stepId: "step-tail", reason: "technical-tail" }], [])).toEqual([])
  })

  it("provides fresh empty containers for every reset", () => {
    const first = resetSession()
    first.answers["step-1"] = "value"
    first.preferences["preference-1"] = "value-1"
    expect(resetSession()).toEqual({ objectiveId: null, activeStepId: null, preferences: {}, answers: {} })
  })

  it("validates preferences against declared values only", () => {
    const catalog = adaptationCatalog()
    expect(validatePreference("unknown", "value", null)).toMatchObject({ ok: false, error: { code: "PREFERENCE_NOT_FOUND" } })
    expect(validatePreference("preference-1", "unknown", catalog.getPreference("preference-1")))
      .toMatchObject({ ok: false, error: { code: "PREFERENCE_VALUE_INVALID" } })
    expect(unwrap(validatePreference("preference-2", "value-2", catalog.getPreference("preference-2")))).toBe("value-2")
  })

  it("allows revision of a non-active step but preserves errors and operation ids", () => {
    const catalog = adaptationCatalog()
    expect(unwrap(validateRevisionStep(sessionState(), "step-2", catalog.getStep("step-2")))).toBe(true)
    expect(validateRevisionStep(sessionState(), "step-other", catalog.getStep("step-other")))
      .toMatchObject({ ok: false, error: { code: "STEP_NOT_IN_OBJECTIVE", operation: "CMD-05" } })
    expect(validateRevisionStep(sessionState(), "unknown", null))
      .toMatchObject({ ok: false, error: { code: "STEP_NOT_FOUND", operation: "CMD-05" } })
    expect(validateAnswer("step-1", "", "CMD-05"))
      .toMatchObject({ ok: false, error: { code: "ANSWER_REQUIRED", operation: "CMD-05", fields: { stepId: "step-1" } } })
  })
})
