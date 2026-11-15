import { describe, expect, it } from "vitest"

import { loadCatalog, loadDemoCatalog } from "../../../src/data/catalog"
import type { JourneyCatalog, Step } from "../../../src/domain/models"
import { createCatalogWithOrphanStep, createValidCatalog } from "../fixtures/catalog-fixtures"

function loadValidCatalog(): JourneyCatalog {
  const result = loadCatalog(createValidCatalog(), "QRY-01")

  if (!result.ok) {
    throw new Error("Expected a valid catalog")
  }

  return result.data
}

describe("catalog", () => {
  it("returns objectives in declared order", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getObjectives().map((objective) => objective.id)).toEqual([
      "objective-1",
      "objective-2",
    ])
  })

  it("returns null for an unknown objective", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getObjective("objective-unknown")).toBeNull()
  })

  it("returns steps for one objective ordered by order then id", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getSteps("objective-1").map((step) => step.id)).toEqual([
      "step-a",
      "step-b",
    ])
  })

  it("breaks equal order ties by id", () => {
    const contents = createValidCatalog()
    const result = loadCatalog(
      {
        ...contents,
        steps: contents.steps.map((step) =>
          step.id === "step-b" ? { ...step, ordre: 1 } : step,
        ),
      },
      "QRY-01",
    )

    if (!result.ok) {
      throw new Error("Expected a valid catalog")
    }

    expect(result.data.getSteps("objective-1").map((step) => step.id)).toEqual([
      "step-a",
      "step-b",
    ])
  })

  it("does not mix steps from other objectives", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getSteps("objective-2").map((step) => step.id)).toEqual(["step-c"])
  })

  it("returns null for an unknown step", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getStep("step-unknown")).toBeNull()
  })

  it("returns preferences in declared order", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getPreferences().map((preference) => preference.id)).toEqual([
      "preference-1",
    ])
  })

  it("returns null for an unknown preference", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getPreference("preference-unknown")).toBeNull()
  })

  it("returns rules ordered by id", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getRules().map((rule) => rule.id)).toEqual(["rule-a", "rule-b"])
  })

  it("is deterministic across reads", () => {
    const catalog = loadValidCatalog()

    expect(catalog.getSteps("objective-1")).toEqual(catalog.getSteps("objective-1"))
    expect(catalog.getRules()).toEqual(catalog.getRules())
  })

  it("exposes frozen collections and entities", () => {
    const catalog = loadValidCatalog()
    const steps = catalog.getSteps("objective-1")
    const rule = catalog.getRules()[0]

    expect(Object.isFrozen(catalog.getObjectives())).toBe(true)
    expect(Object.isFrozen(catalog.getPreferences())).toBe(true)
    expect(Object.isFrozen(catalog.getRules())).toBe(true)
    expect(Object.isFrozen(catalog.getObjective("objective-1"))).toBe(true)
    expect(Object.isFrozen(catalog.getStep("step-a"))).toBe(true)
    expect(Object.isFrozen(catalog.getPreference("preference-1"))).toBe(true)
    expect(Object.isFrozen(steps)).toBe(true)
    expect(Object.isFrozen(rule)).toBe(true)
    expect(Object.isFrozen(rule.condition)).toBe(true)
    expect(Object.isFrozen(rule.stepIds)).toBe(true)
    expect(() => {
      ;(steps as Step[]).push({
        id: "step-unknown",
        objectiveId: "objective-1",
        ordre: 3,
        titre: "",
        contenu: "",
        requis: false,
      })
    }).toThrow()
    expect(() => {
      ;(catalog.getObjectives() as unknown as { id: string }[]).push({
        id: "objective-unknown",
      })
    }).toThrow()
    expect(() => {
      ;(catalog.getPreferences() as unknown as { id: string }[]).push({
        id: "preference-unknown",
      })
    }).toThrow()
    expect(() => {
      ;(catalog.getRules() as unknown as { id: string }[]).push({
        id: "rule-unknown",
      })
    }).toThrow()
  })

  it("does not mutate the input contents", () => {
    const contents = createValidCatalog()
    const result = loadCatalog(contents, "QRY-01")

    if (!result.ok) {
      throw new Error("Expected a valid catalog")
    }

    expect(Object.isFrozen(contents.objectives)).toBe(false)
    expect(result.data.getObjectives()).not.toBe(contents.objectives)
  })
})

describe("loadCatalog", () => {
  it("returns a catalog for valid contents", () => {
    const result = loadCatalog(createValidCatalog(), "QRY-01")

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.data.getObjectives()).toHaveLength(2)
  })

  it("rejects invalid contents with CATALOG_INVALID", () => {
    const result = loadCatalog(createCatalogWithOrphanStep(), "QRY-02")

    expect(result.ok).toBe(false)

    if (result.ok) {
      return
    }

    expect(result.error.code).toBe("CATALOG_INVALID")
    expect(result.error.operation).toBe("QRY-02")
  })
})

describe("loadDemoCatalog", () => {
  it("loads the valid S01 demonstration catalog (cahier §10.1)", () => {
    const result = loadDemoCatalog("QRY-01")

    expect(result.ok).toBe(true)

    if (!result.ok) {
      return
    }

    expect(result.data.getObjectives().map((objective) => objective.id)).toEqual(["atelier-preparation"])
    expect(result.data.getSteps("atelier-preparation").map((step) => [step.id, step.requis])).toEqual([
      ["niveau", true], ["conseils", false], ["support", true], ["verification", true],
    ])
    expect(result.data.getSteps("objective-unknown")).toEqual([])
    expect(result.data.getPreferences().map((preference) => [preference.id, preference.valeur, preference.valeurs])).toEqual([
      ["accompagnement", "essentiel", ["essentiel", "guide"]],
    ])
    expect(result.data.getRules().map((rule) => [rule.id, rule.stepIds])).toEqual([
      ["afficher-conseils-en-mode-guide", ["conseils"]],
      ["masquer-conseils-en-mode-essentiel", ["conseils"]],
    ])
  })
})
