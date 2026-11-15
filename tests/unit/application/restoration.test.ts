import { describe, expect, it } from "vitest"
import { restoreSession } from "../../../src/application/session-restoration"
import { createSessionController } from "../../../src/application/session-controller"
import { adaptationCatalog } from "../fixtures/adaptation-fixtures"
import { freezeInputs, sessionState, unwrap } from "../fixtures/session-fixtures"

describe("restored session domain validation", () => {
  it("restores a partial journey by value without inventing history", () => {
    const state = freezeInputs(sessionState({ activeStepId: "step-2", answers: { "step-1": ["value-1"] } }))
    const result = unwrap(restoreSession(state, adaptationCatalog()))
    expect(result).toEqual({ state, invalidatedAnswers: [] })
    ;(result.state.answers["step-1"] as string[]).push("external")
    expect(state.answers["step-1"]).toEqual(["value-1"])
    const controller = createSessionController(adaptationCatalog())
    unwrap(controller.restore(state))
    expect(unwrap(controller.getSessionView())).toMatchObject({ status: "in_progress", explanations: [], activeStep: { id: "step-2" } })
  })

  it.each([
    { objectiveId: "unknown" }, { objectiveId: null }, { activeStepId: null }, { activeStepId: "unknown" },
    { activeStepId: "step-hidden" }, { activeStepId: "step-other" }, { preferences: {} },
    { preferences: { "preference-1": "invalid", "preference-2": "value-2" } },
    { preferences: { "preference-1": "value-1", "preference-2": "value-2", unknown: "value" } },
    { answers: { unknown: "value" } }, { answers: { "step-other": "value" } },
    { answers: { "step-1": "" } }, { answers: { "step-1": [] } }, { answers: { "step-1": 42 } },
    { preferences: { "preference-1": "value-conflict", "preference-2": "value-2" } },
    { preferences: { "preference-1": "value-required", "preference-2": "value-2" } },
  ])("rejects incompatible saved state: %j", (overrides) => {
    const state = { ...sessionState(), ...overrides }
    expect(restoreSession(state, adaptationCatalog())).toMatchObject({ ok: false, data: null,
      error: { code: "STORED_SESSION_INVALID", operation: "PERSIST-LOAD" } })
  })

  it("rejects unknown structure and accepts only a genuinely empty virgin session", () => {
    for (const state of [null, [], {}, { ...sessionState(), extra: "unknown" }]) {
      expect(restoreSession(state, adaptationCatalog()).ok).toBe(false)
    }
    expect(unwrap(restoreSession({ objectiveId: null, activeStepId: null, preferences: {}, answers: {} }, adaptationCatalog()))
      .state.objectiveId).toBeNull()
    const empty = sessionState({ objectiveId: "objective-empty", activeStepId: null })
    expect(unwrap(restoreSession(empty, adaptationCatalog())).state).toEqual(empty)
  })

  it("keeps hidden answer values and derives the actual invalidation rather than silently validating it", () => {
    const state = sessionState({ answers: { "step-hidden": ["retained"] } })
    const restored = unwrap(restoreSession(state, adaptationCatalog()))
    expect(restored.state.answers).toEqual(state.answers)
    expect(restored.invalidatedAnswers).toEqual([{ stepId: "step-hidden", reason: "technical-step-hidden" }])
  })

  it("rejects an invalid restore atomically and clears feedback only after a valid restore", () => {
    const controller = createSessionController(adaptationCatalog())
    unwrap(controller.selectObjective({ objectiveId: "objective-1" }))
    unwrap(controller.updatePreference({ preferenceId: "preference-1", value: "value-reorder" }))
    const before = unwrap(controller.getSessionView())
    expect(controller.restore({ ...sessionState(), objectiveId: "unknown" }).ok).toBe(false)
    expect(unwrap(controller.getSessionView())).toEqual(before)
    const restored = unwrap(controller.restore(sessionState({ activeStepId: "step-2", answers: { "step-1": "value-1" } })))
    restored.state.answers["step-1"] = "external"
    expect(unwrap(controller.getSessionView())).toMatchObject({ explanations: [], answers: { "step-1": "value-1" } })
  })
})
