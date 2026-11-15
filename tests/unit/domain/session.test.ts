import { describe, expect, it } from "vitest"
import { buildPlan } from "../../../src/domain/journey-engine"
import { advanceSession, createSession, getProgress, isCompleted, returnToPreviousStep } from "../../../src/domain/session"
import type { AnswerValue, JourneyPlan } from "../../../src/domain/models"
import { freezeInputs, sessionCatalog, sessionState, unwrap } from "../fixtures/session-fixtures"

function plan(): JourneyPlan {
  return unwrap(buildPlan("objective-1", {}, sessionCatalog(), "CMD-01"))
}

describe("session transitions", () => {
  it("initializes only declared data and owns its preference copy", () => {
    const preferences = { "preference-1": "value-1" }
    const state = createSession(plan(), preferences)
    preferences["preference-1"] = "changed"
    expect(state).toEqual({ objectiveId: "objective-1", activeStepId: "step-1",
      preferences: { "preference-1": "value-1" }, answers: {} })
  })

  it("advances and returns through visible steps, preserving all answers and inputs", () => {
    const currentPlan = freezeInputs(plan())
    const state = freezeInputs(sessionState())
    const advanced = unwrap(advanceSession(state, currentPlan, ["value-1"]))
    expect(advanced).toMatchObject({ state: { activeStepId: "step-2", answers: { "step-1": ["value-1"] } },
      progress: { current: 2, total: 3 }, completed: false, nextStepId: "step-2", issues: [] })
    const previous = freezeInputs(advanced.state)
    const returned = unwrap(returnToPreviousStep(previous, currentPlan))
    expect(returned).toMatchObject({ activeStepId: "step-1", progress: { current: 1, total: 3 } })
    expect(returned.state.answers).toEqual(previous.answers)
    ;(returned.state.answers["step-1"] as string[]).push("changed")
    expect(previous.answers["step-1"]).toEqual(["value-1"])
    expect(state.answers).toEqual({})
  })

  it("completes at the last required step and retains a real cursor for return", () => {
    const currentPlan = plan()
    const state = sessionState({ activeStepId: "step-2", answers: { "step-1": "value-1" } })
    const result = unwrap(advanceSession(state, currentPlan, "value-2"))
    expect(result).toMatchObject({ completed: true, nextStepId: null,
      state: { activeStepId: "step-2" }, progress: { current: 2, total: 3 } })
    const back = unwrap(returnToPreviousStep(result.state, currentPlan))
    expect(isCompleted(back.state, currentPlan)).toBe(true)
    expect(back.state.answers).toEqual({ "step-1": "value-1", "step-2": "value-2" })
  })

  it("redirects a late cursor to a missing required answer instead of claiming completion", () => {
    const result = unwrap(advanceSession(sessionState({ activeStepId: "step-tail" }), plan(), "value-1"))
    expect(result).toMatchObject({ completed: false, nextStepId: "step-1", progress: { current: 1, total: 3 } })
  })

  it.each([undefined, "", [], 42])("does not complete for an invalid required answer: %j", (answer) => {
    const state = sessionState({ answers: { "step-1": answer as AnswerValue, "step-2": "value-2", "step-other": "value-other", "step-tail": "value-tail" } })
    expect(isCompleted(state, plan())).toBe(false)
  })

  it("does not count inherited answers or a different objective", () => {
    const answers = Object.create({ "step-1": "value-1", "step-2": "value-2" }) as Record<string, AnswerValue>
    expect(isCompleted(sessionState({ answers }), plan())).toBe(false)
    expect(isCompleted(sessionState({ objectiveId: "objective-2" }), plan())).toBe(false)
  })

  it("returns errors without mutation for invalid answers and the first step", () => {
    const state = freezeInputs(sessionState())
    expect(advanceSession(state, plan(), "")).toMatchObject({ ok: false, data: null, error: { code: "ANSWER_REQUIRED" } })
    expect(returnToPreviousStep(state, plan())).toMatchObject({ ok: false, data: null, error: { code: "FIRST_STEP" } })
    expect(state.answers).toEqual({})
  })
})

describe("progress edge cases", () => {
  it("uses a zero cursor only for an empty applicable plan", () => {
    const empty: JourneyPlan = { objectiveId: "objective-1", steps: [] }
    const state = createSession(empty, {})
    expect(unwrap(getProgress(state, empty, "CMD-03"))).toEqual({ current: 0, total: 0 })
    expect(isCompleted(state, empty)).toBe(true)
    expect(advanceSession(state, empty, "value")).toMatchObject({ ok: false, error: { code: "STEP_NOT_ACTIVE" } })
    expect(returnToPreviousStep(state, empty)).toMatchObject({ ok: false, error: { code: "FIRST_STEP" } })
  })

  it.each([null, "unknown", "step-hidden", "step-other"])("rejects an invalid cursor: %j", (activeStepId) => {
    expect(getProgress(sessionState({ activeStepId }), plan(), "CMD-04"))
      .toMatchObject({ ok: false, data: null, error: { code: "STEP_NOT_FOUND" } })
  })

  it("rejects mismatched objectives", () => {
    expect(getProgress(sessionState({ objectiveId: "objective-2" }), plan(), "CMD-04"))
      .toMatchObject({ ok: false, error: { code: "CATALOG_INVALID" } })
  })

  it("sorts equal order values by id without mutating the supplied plan", () => {
    const currentPlan = plan()
    currentPlan.steps = currentPlan.steps.map((step) => ({ ...step, order: 1 })).reverse()
    freezeInputs(currentPlan)
    const initial = createSession(currentPlan, {})
    expect(initial.activeStepId).toBe("step-1")
    expect(unwrap(advanceSession(initial, currentPlan, "value")).nextStepId).toBe("step-2")
  })
})
