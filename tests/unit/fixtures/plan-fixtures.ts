import { loadCatalog } from "../../../src/data/catalog"
import type { CatalogContents } from "../../../src/domain/invariants"
import type {
  Id,
  JourneyCatalog,
  TransitionRule,
} from "../../../src/domain/models"

export function createPlanCatalogContents(): CatalogContents {
  return {
    objectives: [
      { id: "objective-1", titre: "", description: "" },
      { id: "objective-2", titre: "", description: "" },
    ],
    steps: [
      {
        id: "step-required-a",
        objectiveId: "objective-1",
        ordre: 1,
        titre: "",
        contenu: "",
        requis: true,
      },
      {
        id: "step-required-b",
        objectiveId: "objective-1",
        ordre: 2,
        titre: "",
        contenu: "",
        requis: true,
      },
      {
        id: "step-optional-a",
        objectiveId: "objective-1",
        ordre: 3,
        titre: "",
        contenu: "",
        requis: false,
      },
      {
        id: "step-optional-b",
        objectiveId: "objective-1",
        ordre: 4,
        titre: "",
        contenu: "",
        requis: false,
      },
      {
        id: "step-optional-c",
        objectiveId: "objective-1",
        ordre: 5,
        titre: "",
        contenu: "",
        requis: false,
      },
      {
        id: "step-tie-a",
        objectiveId: "objective-1",
        ordre: 6,
        titre: "",
        contenu: "",
        requis: false,
      },
      {
        id: "step-tie-b",
        objectiveId: "objective-1",
        ordre: 6,
        titre: "",
        contenu: "",
        requis: false,
      },
      {
        id: "step-other",
        objectiveId: "objective-2",
        ordre: 1,
        titre: "",
        contenu: "",
        requis: true,
      },
    ],
    preferences: [
      {
        id: "preference-1",
        valeur: "default-1",
        valeurs: ["default-1", "alternate-1"],
        description: "",
      },
      {
        id: "preference-2",
        valeur: "default-2",
        description: "",
      },
    ],
    rules: [
      {
        id: "rule-01",
        condition: { kind: "always" },
        stepIds: ["step-optional-a"],
        effect: { kind: "step_order", order: 0 },
        explication: "technical-rule-01",
      },
      {
        id: "rule-02",
        condition: {
          kind: "preference_equals",
          preferenceId: "preference-1",
          value: "alternate-1",
        },
        stepIds: ["step-optional-b"],
        effect: { kind: "step_visibility", visible: false },
        explication: "technical-rule-02",
      },
      {
        id: "rule-03",
        condition: {
          kind: "preference_equals",
          preferenceId: "preference-1",
          value: "alternate-1",
        },
        stepIds: ["step-optional-c"],
        effect: { kind: "step_order", order: 2 },
        explication: "technical-rule-03",
      },
      {
        id: "rule-04",
        condition: { kind: "always" },
        stepIds: ["step-optional-a"],
        effect: { kind: "step_order", order: 0 },
        explication: "technical-rule-04",
      },
      {
        id: "rule-10",
        condition: { kind: "always" },
        stepIds: ["step-other"],
        effect: { kind: "step_order", order: 0 },
        explication: "technical-rule-10",
      },
      {
        id: "rule-11",
        condition: {
          kind: "preference_equals",
          preferenceId: "preference-2",
          value: "default-2",
        },
        stepIds: ["step-required-b"],
        effect: { kind: "step_visibility", visible: true },
        explication: "technical-rule-11",
      },
    ],
  }
}

export function createPlanCatalog(): JourneyCatalog {
  return loadPlanCatalog(createPlanCatalogContents())
}

export function createPlanCatalogWithRules(rules: TransitionRule[]): JourneyCatalog {
  return loadPlanCatalog({
    ...createPlanCatalogContents(),
    rules,
  })
}

export function createPlanCatalogWithRule(rule: TransitionRule): JourneyCatalog {
  return createPlanCatalogWithRules([rule])
}

export function createDefaultPreferences(): Record<Id, string> {
  return {
    "preference-1": "default-1",
    "preference-2": "default-2",
  }
}

export function createAlternatePreferences(): Record<Id, string> {
  return {
    "preference-1": "alternate-1",
    "preference-2": "default-2",
  }
}

function loadPlanCatalog(contents: CatalogContents): JourneyCatalog {
  const result = loadCatalog(contents, "QRY-01")

  if (!result.ok) {
    throw new Error(result.error.message)
  }

  return result.data
}
