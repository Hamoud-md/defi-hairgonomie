import { describe, expect, it } from "vitest"

import { createSessionController } from "../../../src/application/session-controller"
import { loadDemoCatalog } from "../../../src/data/catalog"
import { demoAnswerFields, demoPreferenceLabels } from "../../../src/data/demo-fields"
import { createLabels } from "../../../src/data/labels"
import { buildPlan } from "../../../src/domain/journey-engine"
import type { JourneyCatalog } from "../../../src/domain/models"

// Scénario S01 exécuté sur le VRAI catalogue livré (pas sur des fixtures techniques).
function demoCatalog(): JourneyCatalog {
  const result = loadDemoCatalog("QRY-01")
  if (!result.ok) throw new Error(result.error.message)
  return result.data
}

function ok<T>(result: { ok: true; data: T } | { ok: false; error: { code: string } }): T {
  if (!result.ok) throw new Error(`Unexpected failure: ${result.error.code}`)
  return result.data
}

const OBJECTIVE = "atelier-preparation"
const REQUIRED = ["niveau", "support", "verification"]

describe("demo field contract (cahier §10.2)", () => {
  it("declares a real control with allowed values for every demo step", () => {
    const catalog = demoCatalog()
    for (const step of catalog.getSteps(OBJECTIVE)) {
      expect(demoAnswerFields[step.id], step.id).toBeDefined()
      expect(demoAnswerFields[step.id].options.length).toBeGreaterThan(0)
    }
    expect(demoAnswerFields.niveau.options.map((option) => option.value)).toEqual(["debutant", "autonome"])
    expect(demoAnswerFields.conseils.options.map((option) => option.value)).toEqual(["lus"])
    expect(demoAnswerFields.support.options.map((option) => option.value)).toEqual(["ordinateur", "mobile"])
    expect(demoAnswerFields.verification.options.map((option) => option.value)).toEqual(["pret", "a_revoir"])
  })

  it("labels every declared preference value and falls back to raw values", () => {
    const catalog = demoCatalog()
    const labels = createLabels(catalog, demoAnswerFields, demoPreferenceLabels)
    for (const preference of catalog.getPreferences()) {
      for (const value of preference.valeurs ?? [preference.valeur]) {
        expect(labels.preference(preference.id, value)).not.toBe(value)
      }
    }
    expect(labels.answer("niveau", "debutant")).toContain("Débutant")
    expect(labels.answer("niveau", "inconnu")).toBe("inconnu")
    expect(labels.step("support")).toBe("Mon support de travail")
  })
})

describe("S01 on the delivered catalogue", () => {
  it("A02/A04 — keeps the three required steps visible under every preference", () => {
    const catalog = demoCatalog()
    for (const value of ["essentiel", "guide"]) {
      const plan = ok(buildPlan(OBJECTIVE, { accompagnement: value }, catalog, "QRY-02"))
      const visible = plan.steps.filter((step) => step.visible).map((step) => step.stepId)
      for (const id of REQUIRED) expect(visible, `${value}:${id}`).toContain(id)
      expect(visible.includes("conseils")).toBe(value === "guide")
      // Determinism: identical inputs give an identical plan.
      expect(ok(buildPlan(OBJECTIVE, { accompagnement: value }, catalog, "QRY-02"))).toEqual(plan)
    }
  })

  it("A02/A03/A05/A08 — completes S01 with an explained adaptation", () => {
    const controller = createSessionController(demoCatalog())
    ok(controller.selectObjective({ objectiveId: OBJECTIVE }))
    let view = ok(controller.getSessionView())
    expect(view.activeStep?.id).toBe("niveau")
    expect(view.progress).toEqual({ current: 1, total: 3 })

    ok(controller.validateStep({ stepId: "niveau", answer: "debutant" }))
    const adaptation = ok(controller.updatePreference({ preferenceId: "accompagnement", value: "guide" }))
    expect(adaptation.plan.steps.find((step) => step.stepId === "conseils")?.visible).toBe(true)
    expect(adaptation.explanations.length).toBeGreaterThan(0)
    expect(adaptation.explanations.some((explanation) => explanation.changes.some((change) =>
      change.kind === "step_visibility" && change.targetId === "conseils" && change.after === true))).toBe(true)
    expect(adaptation.explanations.map((explanation) => explanation.reason).join(" ")).toContain("parcours guidé")
    const back = ok(controller.updatePreference({ preferenceId: "accompagnement", value: "essentiel" }))
    expect(back.explanations.map((explanation) => explanation.reason).join(" ")).toContain("parcours essentiel")
    ok(controller.updatePreference({ preferenceId: "accompagnement", value: "guide" }))

    view = ok(controller.getSessionView())
    // The cursor stays on the current step; the revealed optional step sits
    // before it and is reachable with "Retour" without losing any answer.
    expect(view.activeStep?.id).toBe("support")
    expect(view.progress).toEqual({ current: 3, total: 4 })
    expect(view.answers.niveau).toBe("debutant")
    ok(controller.goBack())
    expect(ok(controller.getSessionView()).activeStep?.id).toBe("conseils")

    ok(controller.validateStep({ stepId: "conseils", answer: "lus" }))
    expect(ok(controller.getSessionView()).activeStep?.id).toBe("support")
    ok(controller.validateStep({ stepId: "support", answer: "ordinateur" }))
    const last = ok(controller.validateStep({ stepId: "verification", answer: "pret" }))
    expect(last.completed).toBe(true)

    const summary = ok(controller.getSummary())
    expect(summary.completion).toEqual({ completed: true, requiredTotal: 3, requiredCompleted: 3 })
    expect(summary.decisions.map((decision) => [decision.step.id, decision.answer])).toEqual([
      ["niveau", "debutant"], ["conseils", "lus"], ["support", "ordinateur"], ["verification", "pret"],
    ])
    expect(summary.preferences[0].selectedValue).toBe("guide")
  })

  it("A06 — refuses an empty answer without losing the previous ones", () => {
    const controller = createSessionController(demoCatalog())
    ok(controller.selectObjective({ objectiveId: OBJECTIVE }))
    ok(controller.validateStep({ stepId: "niveau", answer: "autonome" }))
    const refused = controller.validateStep({ stepId: "support", answer: "" })
    expect(refused.ok).toBe(false)
    if (!refused.ok) expect(refused.error.code).toBe("ANSWER_REQUIRED")
    const view = ok(controller.getSessionView())
    expect(view.issues.map((issue) => issue.stepId)).toEqual(["support"])
    expect(view.answers.niveau).toBe("autonome")
  })

  it("A07 — revises the level after completion and keeps a coherent summary", () => {
    const controller = createSessionController(demoCatalog())
    ok(controller.selectObjective({ objectiveId: OBJECTIVE }))
    ok(controller.validateStep({ stepId: "niveau", answer: "debutant" }))
    ok(controller.validateStep({ stepId: "support", answer: "mobile" }))
    ok(controller.validateStep({ stepId: "verification", answer: "a_revoir" }))
    ok(controller.reviseAnswer({ stepId: "niveau", answer: "autonome" }))
    const summary = ok(controller.getSummary())
    expect(summary.completion.completed).toBe(true)
    expect(summary.decisions.find((decision) => decision.step.id === "niveau")?.answer).toBe("autonome")
    expect(summary.decisions.find((decision) => decision.step.id === "support")?.answer).toBe("mobile")
  })

  it("A09 — never reports completion while a required step is missing", () => {
    const controller = createSessionController(demoCatalog())
    ok(controller.selectObjective({ objectiveId: OBJECTIVE }))
    ok(controller.validateStep({ stepId: "niveau", answer: "debutant" }))
    const summary = controller.getSummary()
    if (summary.ok) expect(summary.data.completion.completed).toBe(false)
    else expect(summary.error.code).toBe("JOURNEY_INCOMPLETE")
    expect(ok(controller.getSessionView()).status).toBe("in_progress")
  })
})
