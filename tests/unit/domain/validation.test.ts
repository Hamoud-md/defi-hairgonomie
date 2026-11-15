import { describe, expect, it } from "vitest"
import {
  getAnswerIssue, getValidationIssues, isAnswerValue, requireSession,
  validateActiveStep, validateAnswer, validateObjective,
} from "../../../src/domain/validation"
import { buildPlan } from "../../../src/domain/journey-engine"
import { sessionCatalog, sessionState, unwrap } from "../fixtures/session-fixtures"

describe("answer validation", () => {
  it.each([undefined, null, "", []])("rejects absent answers: %j", (answer) => {
    const result = validateAnswer("step-1", answer)
    expect(result).toMatchObject({ ok: false, data: null,
      error: { code: "ANSWER_REQUIRED", operation: "CMD-03", fields: { stepId: "step-1" } } })
    if (!result.ok) expect(getValidationIssues(result.error)).toEqual([getAnswerIssue("step-1", answer)])
  })

  it.each([42, true, {}, [42], ["value", null], new Array(2)])("rejects invalid shapes: %j", (answer) => {
    const result = validateAnswer("step-1", answer)
    expect(result).toMatchObject({ ok: false, data: null, error: { code: "ANSWER_INVALID" } })
    expect(isAnswerValue(answer)).toBe(false)
    if (!result.ok) expect(getValidationIssues(result.error)[0]).toMatchObject({ stepId: "step-1", code: "ANSWER_INVALID" })
  })

  it.each(["value-1", ["value-1"], ["value-1", "value-2"], " ", [""]])(
    "accepts structural values without inventing content constraints: %j", (answer) => {
      expect(unwrap(validateAnswer("step-1", answer))).toEqual(answer)
      expect(getAnswerIssue("step-1", answer)).toBeNull()
    },
  )

  it("copies validated arrays and produces no issues for unrelated errors", () => {
    const answer = ["value-1"]
    const validated = unwrap(validateAnswer("step-1", answer))
    answer.push("value-2")
    expect(validated).toEqual(["value-1"])
    expect(getValidationIssues(null)).toEqual([])
    expect(getValidationIssues({ code: "STEP_NOT_FOUND", operation: "CMD-03", message: "technical" })).toEqual([])
    expect(getValidationIssues({ code: "ANSWER_INVALID", operation: "CMD-03", message: "technical" })).toEqual([])
  })
})

describe("command guards", () => {
  it.each([undefined, null, "", 42])("requires a selected objective: %j", (id) => {
    expect(validateObjective(id, null)).toMatchObject({ ok: false, error: { code: "OBJECTIVE_REQUIRED", operation: "CMD-01" } })
  })

  it("distinguishes unknown and known objectives", () => {
    expect(validateObjective("unknown", null)).toMatchObject({ ok: false, error: { code: "OBJECTIVE_NOT_FOUND" } })
    expect(unwrap(validateObjective("objective-1", sessionCatalog().getObjective("objective-1")))).toBe("objective-1")
  })

  it.each(["CMD-03", "CMD-04"] as const)("requires a session for %s", (operation) => {
    expect(requireSession(null, operation)).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation } })
  })

  it("distinguishes a missing objective on return from an inactive session on advance", () => {
    const state = sessionState({ objectiveId: null })
    expect(requireSession(state, "CMD-04")).toMatchObject({ ok: false, error: { code: "OBJECTIVE_REQUIRED" } })
    expect(requireSession(state, "CMD-03")).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED" } })
  })

  it("checks step existence, objective and activity in that order", () => {
    const catalog = sessionCatalog()
    const state = sessionState()
    const plan = unwrap(buildPlan("objective-1", state.preferences, catalog, "CMD-03"))
    for (const [id, code] of [["unknown", "STEP_NOT_FOUND"], ["step-other", "STEP_NOT_IN_OBJECTIVE"],
      ["step-2", "STEP_NOT_ACTIVE"], ["step-hidden", "STEP_NOT_ACTIVE"]]) {
      expect(validateActiveStep(state, id, catalog.getStep(id), plan))
        .toMatchObject({ ok: false, error: { code } })
    }
    expect(unwrap(validateActiveStep(state, "step-1", catalog.getStep("step-1"), plan))).toBe(true)
    expect(validateActiveStep(sessionState({ activeStepId: "step-hidden" }), "step-hidden", catalog.getStep("step-hidden"), plan))
      .toMatchObject({ ok: false, error: { code: "STEP_NOT_ACTIVE" } })
  })
})
