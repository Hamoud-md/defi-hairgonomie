import { describe, expect, it } from "vitest"
import {
  createSessionController, restart, reviseAnswer, updatePreference,
} from "../../../src/application/session-controller"
import { getSummary } from "../../../src/application/selectors"
import type { AnswerValue, Id, JourneyCatalog } from "../../../src/domain/models"
import { adaptationCatalog, adaptationContents } from "../fixtures/adaptation-fixtures"
import { freezeInputs, sessionCatalog, sessionState, unwrap } from "../fixtures/session-fixtures"

describe("CMD-02 updatePreference", () => {
  it("hides an answered step, preserves its value, explains invalidation and repairs the cursor", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState({ activeStepId: "step-tail", answers: { "step-tail": ["value-tail"], "step-1": "value-1" } }))
    const result = unwrap(updatePreference(state, { preferenceId: "preference-1", value: "value-alt" }, catalog))
    expect(Object.keys(result).sort()).toEqual(["explanations", "invalidatedAnswers", "plan", "state"])
    expect(result.state).toMatchObject({ activeStepId: "step-2", answers: { "step-tail": ["value-tail"], "step-1": "value-1" } })
    expect(result.invalidatedAnswers).toEqual([{ stepId: "step-tail", reason: "technical-hide-tail" }])
    expect(result.explanations.map((item) => item.event)).toEqual(["preference_changed", "answer_invalidated"])
    expect(result.explanations[1]).toMatchObject({ ruleId: "rule-alt-hide", reason: "technical-hide-tail" })
    expect(state.preferences["preference-1"]).toBe("value-1")
    expect(state.activeStepId).toBe("step-tail")
    expect(result.plan.steps.filter((step) => step.required).every((step) => step.visible)).toBe(true)
  })

  it("does not explain unchanged plans or repeat old invalidations", () => {
    const catalog = adaptationCatalog()
    const unchanged = unwrap(updatePreference(sessionState(), { preferenceId: "preference-2", value: "value-2" }, catalog))
    expect(unchanged.explanations).toEqual([])
    const first = unwrap(updatePreference(sessionState({ answers: { "step-tail": "value-tail" } }),
      { preferenceId: "preference-1", value: "value-alt" }, catalog))
    const same = unwrap(updatePreference(first.state, { preferenceId: "preference-1", value: "value-alt" }, catalog))
    expect(same.invalidatedAnswers.map((item) => item.stepId)).toEqual(["step-tail"])
    expect(same.explanations).toEqual([])
  })

  it("restores visibility while preserving the invalidation until explicit correction", () => {
    const catalog = adaptationCatalog()
    const hidden = unwrap(updatePreference(sessionState({ answers: { "step-tail": ["value-tail"] } }),
      { preferenceId: "preference-1", value: "value-alt" }, catalog))
    const shown = unwrap(updatePreference(hidden.state, { preferenceId: "preference-1", value: "value-1" }, catalog))
    expect(shown.invalidatedAnswers.map((answer) => answer.stepId)).toEqual(["step-tail"])
    expect(shown.state.answers["step-tail"]).toEqual(["value-tail"])
    expect(shown.explanations.flatMap((item) => item.changes)).toEqual([
      { kind: "step_visibility", targetId: "step-tail", before: false, after: true },
    ])
    const corrected = unwrap(reviseAnswer(shown.state, { stepId: "step-tail", answer: ["value-tail"] }, catalog, shown.invalidatedAnswers))
    expect(corrected.invalidatedAnswers).toEqual([])
  })

  it("reorders without invalidating answers", () => {
    const result = unwrap(updatePreference(sessionState({ answers: { "step-tail": "value-tail" } }),
      { preferenceId: "preference-1", value: "value-reorder" }, adaptationCatalog()))
    expect(result.plan.steps[0].stepId).toBe("step-tail")
    expect(result.invalidatedAnswers).toEqual([])
    expect(result.explanations[0].changes).toEqual([{ kind: "step_order", targetId: "step-tail", before: 3, after: 0 }])
  })

  it.each([
    ["unknown", "value-1", "PREFERENCE_NOT_FOUND"],
    ["preference-1", "unknown", "PREFERENCE_VALUE_INVALID"],
    ["preference-2", "value-alt", "PREFERENCE_VALUE_INVALID"],
    ["preference-1", "value-conflict", "RULE_CONFLICT"],
    ["preference-1", "value-required", "REQUIRED_STEP_REMOVED"],
  ])("fails atomically for %s/%s", (preferenceId, value, code) => {
    const state = freezeInputs(sessionState({ answers: { "step-1": ["value-1"] } }))
    const before = structuredClone(state)
    expect(updatePreference(state, { preferenceId, value }, adaptationCatalog()))
      .toMatchObject({ ok: false, data: null, error: { code, operation: "CMD-02" } })
    expect(state).toEqual(before)
  })

  it("requires an active session", () => {
    expect(updatePreference(null, { preferenceId: "unknown", value: "unknown" }, adaptationCatalog()))
      .toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation: "CMD-02" } })
  })
})

describe("CMD-05 reviseAnswer", () => {
  it("revises a non-active answer, copies arrays and preserves unrelated answers", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState({ activeStepId: "step-2", answers: { "step-1": "old", "step-tail": ["unrelated"] } }))
    const answer = ["new"]
    const result = unwrap(reviseAnswer(state, { stepId: "step-1", answer }, catalog))
    expect(Object.keys(result).sort()).toEqual(["explanations", "invalidatedAnswers", "issues", "plan", "state"])
    answer.push("external")
    expect(result.state.answers).toEqual({ "step-1": ["new"], "step-tail": ["unrelated"] })
    expect(result.state.activeStepId).toBe("step-2")
    expect(result.explanations).toEqual([])
    expect(result.invalidatedAnswers).toEqual([])
    expect(result.issues).toEqual([])
    expect(state.answers["step-1"]).toBe("old")
  })

  it("corrects a structurally invalid required answer and restores summary eligibility", () => {
    const catalog = adaptationCatalog()
    const state = sessionState({ answers: { "step-1": "", "step-2": "value-2" } })
    expect(getSummary(state, catalog)).toMatchObject({ ok: false, error: { code: "JOURNEY_INCOMPLETE" } })
    const corrected = unwrap(reviseAnswer(state, { stepId: "step-1", answer: "value-1" }, catalog))
    expect(corrected.invalidatedAnswers).toEqual([])
    expect(unwrap(getSummary(corrected.state, catalog)).completion).toEqual({ completed: true, requiredTotal: 2, requiredCompleted: 2 })
  })

  it("retains a hidden revised answer and continues to mark it incompatible", () => {
    const state = sessionState({ preferences: { "preference-1": "value-alt", "preference-2": "value-2" }, answers: { "step-tail": "old" } })
    const result = unwrap(reviseAnswer(state, { stepId: "step-tail", answer: "new" }, adaptationCatalog()))
    expect(result.state.answers["step-tail"]).toBe("new")
    expect(result.invalidatedAnswers).toEqual([{ stepId: "step-tail", reason: "technical-step-tail" }])
    expect(result.explanations).toEqual([])
  })

  it.each([
    ["unknown", "value", "STEP_NOT_FOUND"],
    ["step-other", "value", "STEP_NOT_IN_OBJECTIVE"],
    ["step-1", "", "ANSWER_REQUIRED"],
    ["step-1", [], "ANSWER_REQUIRED"],
    ["step-1", 1, "ANSWER_INVALID"],
  ])("fails atomically for %s", (stepId, answer, code) => {
    const state = freezeInputs(sessionState({ answers: { "step-1": ["old"] } }))
    expect(reviseAnswer(state, { stepId: stepId as Id, answer: answer as AnswerValue }, adaptationCatalog()))
      .toMatchObject({ ok: false, data: null, error: { code, operation: "CMD-05" } })
    expect(state.answers["step-1"]).toEqual(["old"])
  })

  it("requires a session and propagates configuration errors without changing answers", () => {
    const catalog = adaptationCatalog()
    expect(reviseAnswer(null, { stepId: "step-1", answer: "value" }, catalog))
      .toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation: "CMD-05" } })
    for (const [value, code] of [["value-required", "REQUIRED_STEP_REMOVED"], ["value-conflict", "RULE_CONFLICT"]]) {
      const state = freezeInputs(sessionState({ preferences: { "preference-1": value }, answers: { "step-1": "old" } }))
      expect(reviseAnswer(state, { stepId: "step-1", answer: "new" }, catalog))
        .toMatchObject({ ok: false, data: null, error: { code, operation: "CMD-05" } })
      expect(state.answers["step-1"]).toBe("old")
    }
  })
})

describe("CMD-06 restart and in-memory controller", () => {
  it("keeps invalidations across reappearance and no-op commands until the answer is explicitly corrected", () => {
    const controller = createSessionController(adaptationCatalog())
    unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
    unwrap(controller.reviseAnswer({ stepId: "step-tail", answer: "retained-tail" }))
    unwrap(controller.validateStep({ stepId: "step-1", answer: "value-1" }))
    unwrap(controller.validateStep({ stepId: "step-2", answer: "value-2" }))
    unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-alt" }))
    unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-1" }))
    const same = unwrap(controller.updatePreference({ preferenceId: "preference-2", value: "value-2" }))
    expect(same.explanations).toEqual([])
    expect(same.invalidatedAnswers.map((answer) => answer.stepId)).toEqual(["step-tail"])
    expect(unwrap(controller.getSessionView()).issues).toContainEqual(expect.objectContaining({ stepId: "step-tail", code: "ANSWER_INVALID" }))
    expect(unwrap(controller.getSummary()).decisions.map((decision) => decision.step.id)).toEqual(["step-1", "step-2"])
    same.invalidatedAnswers.length = 0
    expect(unwrap(controller.getSummary()).decisions).toHaveLength(2)
    const correction = unwrap(controller.reviseAnswer({ stepId: "step-tail", answer: "corrected-tail" }))
    expect(correction.invalidatedAnswers).toEqual([])
    expect(unwrap(controller.getSummary()).decisions[2].answer).toBe("corrected-tail")
    expect(unwrap(controller.getSessionView()).issues).toEqual([])
  })

  it("preserves relevant local feedback through unrelated rejected commands", () => {
    const controller = createSessionController(adaptationCatalog())
    unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
    controller.validateStep({ stepId: "step-1", answer: "" })
    const before = unwrap(controller.getSessionView())
    controller.updatePreference({ preferenceId: "unknown", value: "unknown" })
    expect(unwrap(controller.getSessionView()).issues).toEqual(before.issues)
    expect(unwrap(controller.getSessionView()).answers).toEqual(before.answers)
  })

  it.each([false, undefined, 1, "true"])("requires literal true confirmation: %j", (confirm) => {
    const state = freezeInputs(sessionState({ answers: { "step-1": "value" } }))
    expect(restart(state, { confirm: confirm as true }))
      .toMatchObject({ ok: false, data: null, error: { code: "CONFIRMATION_REQUIRED", operation: "CMD-06" } })
    expect(state.answers["step-1"]).toBe("value")
  })

  it("requires an existing session and resets without depending on a valid catalogue", () => {
    expect(restart(null, { confirm: true })).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED" } })
    const state = freezeInputs(sessionState({ answers: { "step-1": "value" } }))
    expect(unwrap(restart(state, { confirm: true }))).toEqual({ state: { objectiveId: null, activeStepId: null, preferences: {}, answers: {} } })
  })

  it("keeps only actual feedback, commits successes, and clears every session residue on restart", () => {
    const controller = createSessionController(adaptationCatalog())
    unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
    unwrap(controller.reviseAnswer({ stepId: "step-tail", answer: ["tail"] }))
    unwrap(controller.validateStep({ stepId: "step-1", answer: "value-1" }))
    unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-alt" }))
    const before = unwrap(controller.getSessionView())
    expect(before.explanations.map((item) => item.event)).toEqual(["preference_changed", "answer_invalidated"])
    expect(before.answers["step-tail"]).toEqual(["tail"])
    const rejected = controller.updatePreference({ preferenceId: "preference-1", value: "value-conflict" })
    expect(rejected.ok).toBe(false)
    expect(unwrap(controller.getSessionView()).answers).toEqual(before.answers)
    expect(unwrap(controller.getSessionView()).explanations).toEqual(before.explanations)
    controller.validateStep({ stepId: "step-2", answer: "" })
    expect(unwrap(controller.getSessionView()).issues[0]).toMatchObject({ stepId: "step-2", code: "ANSWER_REQUIRED" })
    unwrap(controller.validateStep({ stepId: "step-2", answer: "value-2" }))
    const summary = unwrap(controller.getSummary())
    expect(summary.decisions.map((decision) => decision.step.id)).toEqual(["step-1", "step-2"])
    expect(summary.explanations).toHaveLength(2)
    expect(unwrap(controller.getSessionView()).issues).toEqual([])
    expect(controller.restart({ confirm: false as true }).ok).toBe(false)
    expect(unwrap(controller.getSummary())).toEqual(summary)
    unwrap(controller.restart({ confirm: true }))
    expect(controller.getSummary()).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED" } })
    expect(unwrap(controller.getObjectives()).every((objective) => !objective.selected)).toBe(true)
    unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
    expect(unwrap(controller.getSessionView())).toMatchObject({ answers: {}, explanations: [], issues: [], status: "in_progress" })
  })

  it("isolates returned objects from its internal state and independent controllers", () => {
    const first = createSessionController(adaptationCatalog())
    const second = createSessionController(adaptationCatalog())
    const initial = unwrap(first.selectObjective({ objectiveId: "objective-1" }))
    initial.state.answers["step-1"] = "external"
    expect(unwrap(first.getSessionView()).answers).toEqual({})
    expect(second.getSessionView().ok).toBe(false)
    unwrap(first.reviseAnswer({ stepId: "step-1", answer: ["value"] }))
    const view = unwrap(first.getSessionView())
    ;(view.answers["step-1"] as string[]).push("external")
    expect(unwrap(first.getSessionView()).answers["step-1"]).toEqual(["value"])
    unwrap(first.updatePreference({ preferenceId: "preference-1", value: "value-reorder" }))
    const feedback = unwrap(first.getSessionView())
    feedback.explanations[0].changes[0].after = 100
    expect(unwrap(first.getSessionView()).explanations[0].changes[0].after).toBe(0)
  })

  it("returns local revision feedback for a non-active step, then clears it after correction", () => {
    const controller = createSessionController(adaptationCatalog())
    unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
    controller.reviseAnswer({ stepId: "step-2", answer: "" })
    expect(unwrap(controller.getSessionView()).issues[0]).toMatchObject({ stepId: "step-2", code: "ANSWER_REQUIRED" })
    unwrap(controller.reviseAnswer({ stepId: "step-2", answer: "value" }))
    expect(unwrap(controller.getSessionView()).issues).toEqual([])
  })

  it("is deterministic across an identical sequence of commands and reads", () => {
    const run = () => {
      const controller = createSessionController(adaptationCatalog())
      unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
      unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-reorder" }))
      unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-1" }))
      unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-reorder" }))
      return unwrap(controller.getSessionView())
    }
    const view = run()
    expect(run()).toEqual(view)
    expect(new Set(view.explanations.map((item) => item.id)).size).toBe(view.explanations.length)
  })

  it("propagates malformed catalogues and stale objectives atomically", () => {
    const contents = adaptationContents()
    const original = sessionCatalog(contents)
    const catalog: JourneyCatalog = { ...original, getRules: () => [{ id: "unknown-rule", condition: { kind: "always" },
      stepIds: ["unknown-step"], effect: { kind: "step_order", order: 0 }, explication: "technical" }] }
    for (const source of [catalog, original]) {
      const state = freezeInputs(sessionState({ ...(source === original ? { objectiveId: "unknown" } : {}), answers: { "step-1": "old" } }))
      expect(updatePreference(state, { preferenceId: "preference-1", value: "value-alt" }, source))
        .toMatchObject({ ok: false, data: null, error: { code: "CATALOG_INVALID" } })
    }
  })
})
