import { describe, expect, it } from "vitest"
import { getObjectives, getSessionView, getSummary } from "../../../src/application/selectors"
import { selectObjective, updatePreference } from "../../../src/application/session-controller"
import type { AnswerValue, Explanation, JourneyCatalog, SessionState } from "../../../src/domain/models"
import { adaptationCatalog, adaptationContents } from "../fixtures/adaptation-fixtures"
import { freezeInputs, sessionCatalog, sessionState, unwrap } from "../fixtures/session-fixtures"

describe("QRY-01 objectives", () => {
  it("preserves the catalogue order and derives selection without mutation", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState())
    const views = unwrap(getObjectives(catalog, state))
    expect(views.map((view) => view.objective.id)).toEqual(["objective-1", "objective-2", "objective-empty"])
    expect(views.map((view) => view.selected)).toEqual([true, false, false])
    views[0].objective.titre = "external"
    expect(catalog.getObjective("objective-1")?.titre).toBe("")
    expect(unwrap(getObjectives(catalog)).every((view) => !view.selected)).toBe(true)
  })

  it("supports an empty catalogue without manufacturing content", () => {
    const catalog = sessionCatalog({ objectives: [], preferences: [], steps: [], rules: [] })
    expect(unwrap(getObjectives(catalog))).toEqual([])
  })
})

describe("QRY-02 session view", () => {
  it("returns the exact view contract, visible progress, selected preferences and actual answers", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState({ activeStepId: "step-2", answers: { "step-1": ["value-1"], "step-hidden": "retained" } }))
    const view = unwrap(getSessionView(state, catalog))
    expect(Object.keys(view).sort()).toEqual(["activeStep", "answers", "explanations", "issues", "objective", "plan", "preferences", "progress", "status", "view"])
    expect(view).toMatchObject({ view: "journey", status: "in_progress", activeStep: { id: "step-2" },
      progress: { current: 2, total: 3 }, explanations: [], issues: [], answers: state.answers })
    expect(view.preferences.map((item) => item.selectedValue)).toEqual(["value-1", "value-2"])
    ;(view.answers["step-1"] as string[]).push("external")
    view.preferences[0].preference.valeurs?.push("external")
    view.plan!.steps[0].order = 100
    expect(state.answers["step-1"]).toEqual(["value-1"])
    expect(catalog.getPreference("preference-1")?.valeurs).not.toContain("external")
    expect(unwrap(getSessionView(state, catalog)).plan?.steps[0].order).toBe(1)
  })

  it("retains only actual supplied explanations and relevant local errors, and never invents history", () => {
    const catalog = adaptationCatalog()
    const changed = unwrap(updatePreference(sessionState(), { preferenceId: "preference-1", value: "value-reorder" }, catalog))
    expect(unwrap(getSessionView(changed.state, catalog)).explanations).toEqual([])
    const feedback = freezeInputs({ explanations: changed.explanations, issues: [
      { stepId: "step-2", code: "ANSWER_REQUIRED" as const, message: "technical-local" },
      { stepId: "unknown", code: "ANSWER_REQUIRED" as const, message: "technical-unknown" },
    ] })
    const view = unwrap(getSessionView(changed.state, catalog, feedback))
    expect(view.explanations).toEqual(changed.explanations)
    expect(view.issues).toEqual([{ stepId: "step-2", code: "ANSWER_REQUIRED", message: "technical-local" }])
    view.explanations[0].changes[0].after = 100
    expect(feedback.explanations[0].changes[0].after).toBe(0)
  })

  it("surfaces structurally invalid saved answers and does not claim completion", () => {
    const state = sessionState({ answers: { "step-1": 42 as unknown as AnswerValue, "step-2": "value-2" } })
    const view = unwrap(getSessionView(state, adaptationCatalog()))
    expect(view.status).toBe("in_progress")
    expect(view.issues[0]).toMatchObject({ stepId: "step-1", code: "ANSWER_INVALID" })
  })

  it("uses default preferences for absent entries consistently with the rule engine", () => {
    const state = sessionState({ preferences: {} })
    expect(unwrap(getSessionView(state, adaptationCatalog())).preferences.map((item) => item.selectedValue))
      .toEqual(["value-1", "value-2"])
  })
})

describe("QRY-03 summary", () => {
  it("does not count an explicitly pending required invalidation as completed", () => {
    const catalog = adaptationCatalog()
    const state = sessionState({ answers: { "step-1": "value-1", "step-2": "value-2" } })
    const invalidatedAnswers = [{ stepId: "step-1", reason: "technical-step-1" }]
    expect(getSummary(state, catalog, [], invalidatedAnswers))
      .toMatchObject({ ok: false, error: { code: "JOURNEY_INCOMPLETE" } })
    expect(unwrap(getSessionView(state, catalog, { invalidatedAnswers })))
      .toMatchObject({ status: "in_progress", issues: [{ stepId: "step-1", code: "ANSWER_INVALID", message: "technical-step-1" }] })
  })

  it.each([{}, { "step-1": "value-1" }, { "step-1": "", "step-2": "value-2" },
    { "step-1": [], "step-2": "value-2" }, { "step-tail": "optional" }])("refuses incomplete required answers: %j", (answers) => {
      expect(getSummary(sessionState({ answers: answers as Record<string, AnswerValue> }), adaptationCatalog()))
        .toMatchObject({ ok: false, data: null, error: { code: "JOURNEY_INCOMPLETE", operation: "QRY-03" } })
    })

  it("derives a faithful summary and counters, omitting hidden and unanswered optional decisions", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState({ activeStepId: "step-2",
      answers: { "step-hidden": "retained", "step-2": "value-2", "step-1": ["value-1"] } }))
    const summary = unwrap(getSummary(state, catalog))
    expect(Object.keys(summary).sort()).toEqual(["completion", "decisions", "explanations", "objective", "preferences"])
    expect(summary.completion).toEqual({ completed: true, requiredTotal: 2, requiredCompleted: 2 })
    expect(summary.decisions.map((decision) => [decision.step.id, decision.answer]))
      .toEqual([["step-1", ["value-1"]], ["step-2", "value-2"]])
    expect(summary.explanations).toEqual([])
    expect(unwrap(getSessionView(state, catalog))).toMatchObject({ view: "summary", status: "completed" })
    ;(summary.decisions[0].answer as string[]).push("external")
    summary.decisions[0].step.titre = "external"
    expect(state.answers["step-1"]).toEqual(["value-1"])
    expect(catalog.getStep("step-1")?.titre).toBe("technical-step-1")
  })

  it("includes valid optional decisions in plan order and only the supplied actual history", () => {
    const catalog = adaptationCatalog()
    const changed = unwrap(updatePreference(sessionState({ answers: { "step-tail": "value-tail" } }),
      { preferenceId: "preference-1", value: "value-reorder" }, catalog))
    const state = freezeInputs({ ...changed.state, answers: { ...changed.state.answers, "step-1": "value-1", "step-2": "value-2" } })
    const history: Explanation[] = changed.explanations
    const summary = unwrap(getSummary(state, catalog, history))
    expect(summary.decisions.map((decision) => decision.step.id)).toEqual(["step-tail", "step-1", "step-2"])
    expect(summary.explanations).toEqual(history)
    expect(history).toHaveLength(1)
  })

  it("supports zero required steps without pretending that answers were provided", () => {
    const catalog = adaptationCatalog()
    const initial = unwrap(selectObjective({ objectiveId: "objective-empty" }, catalog))
    const summary = unwrap(getSummary(initial.state, catalog))
    expect(summary.decisions).toEqual([])
    expect(summary.completion).toEqual({ completed: true, requiredTotal: 0, requiredCompleted: 0 })
    expect(unwrap(getSessionView(initial.state, catalog))).toMatchObject({ activeStep: null, progress: { current: 0, total: 0 }, status: "completed" })
  })
})

describe("query errors and purity", () => {
  it("distinguishes missing session and unselected objective", () => {
    const catalog = adaptationCatalog()
    expect(getSessionView(null, catalog)).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation: "QRY-02" } })
    expect(getSessionView(sessionState({ objectiveId: null }), catalog))
      .toMatchObject({ ok: false, error: { code: "OBJECTIVE_REQUIRED", operation: "QRY-02" } })
    expect(getSummary(null, catalog)).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED", operation: "QRY-03" } })
    expect(getSummary(sessionState({ objectiveId: null }), catalog)).toMatchObject({ ok: false, error: { code: "SESSION_REQUIRED" } })
  })

  it.each<Partial<SessionState>>([
    { objectiveId: "unknown" }, { activeStepId: "unknown" }, { activeStepId: "step-hidden" },
    { preferences: { unknown: "value" } }, { preferences: { "preference-1": "undeclared" } },
    { answers: { "step-other": "value" } }, { answers: { unknown: "value" } },
  ])("refuses incoherent session data without partial views: %j", (overrides) => {
    const state = freezeInputs(sessionState(overrides))
    const before = structuredClone(state)
    for (const result of [getSessionView(state, adaptationCatalog()), getSummary(state, adaptationCatalog())]) {
      expect(result).toMatchObject({ ok: false, data: null, error: { code: "CATALOG_INVALID" } })
    }
    expect(state).toEqual(before)
  })

  it("converts rule configuration errors to the documented query error", () => {
    const catalog = adaptationCatalog()
    for (const value of ["value-conflict", "value-required"]) {
      const state = sessionState({ preferences: { "preference-1": value } })
      expect(getSessionView(state, catalog)).toMatchObject({ ok: false, error: { code: "CATALOG_INVALID", operation: "QRY-02" } })
      expect(getSummary(state, catalog)).toMatchObject({ ok: false, error: { code: "CATALOG_INVALID", operation: "QRY-03" } })
    }
  })

  it("rejects invalid catalogues from all queries, preserving operation ids", () => {
    const original = sessionCatalog(adaptationContents())
    const catalog: JourneyCatalog = { ...original, getRules: () => [{ id: "invalid", condition: { kind: "always" },
      stepIds: ["unknown"], effect: { kind: "step_order", order: 0 }, explication: "technical" }] }
    const results = [getObjectives(catalog), getSessionView(sessionState(), catalog), getSummary(sessionState(), catalog)]
    for (const [index, result] of results.entries()) {
      expect(result).toMatchObject({ ok: false, data: null, error: { code: "CATALOG_INVALID", operation: `QRY-0${index + 1}` } })
    }
  })

  it("is repeatable and preserves frozen inputs and catalogue data", () => {
    const catalog = adaptationCatalog()
    const state = freezeInputs(sessionState({ answers: { "step-1": ["value-1"], "step-2": "value-2" } }))
    const before = structuredClone({ state, steps: catalog.getSteps("objective-1"), preferences: catalog.getPreferences(), rules: catalog.getRules() })
    const view = getSessionView(state, catalog)
    const summary = getSummary(state, catalog)
    for (let index = 0; index < 10; index += 1) {
      expect(getSessionView(state, catalog)).toEqual(view)
      expect(getSummary(state, catalog)).toEqual(summary)
    }
    expect({ state, steps: catalog.getSteps("objective-1"), preferences: catalog.getPreferences(), rules: catalog.getRules() }).toEqual(before)
  })
})
