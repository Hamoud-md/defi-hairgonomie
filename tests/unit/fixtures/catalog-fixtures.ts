import type { CatalogContents } from "../../../src/domain/invariants"

export function createCatalogWithDuplicateObjective(): CatalogContents {
  const contents = createValidCatalog()

  return {
    ...contents,
    objectives: [...contents.objectives, { ...contents.objectives[0] }],
  }
}

export function createCatalogWithOrphanStep(): CatalogContents {
  const contents = createValidCatalog()

  return {
    ...contents,
    steps: [{ ...contents.steps[0], objectiveId: "objective-unknown" }],
  }
}

export function createCatalogWithUnknownRuleStep(): CatalogContents {
  const contents = createValidCatalog()

  return {
    ...contents,
    rules: [{ ...contents.rules[0], stepIds: ["step-unknown"] }],
  }
}

export function createCatalogWithEmptyPreferenceValue(): CatalogContents {
  const contents = createValidCatalog()

  return {
    ...contents,
    preferences: [{ ...contents.preferences[0], valeur: "   " }],
  }
}

export function createValidCatalog(): CatalogContents {
  return {
    objectives: [
      { id: "objective-1", titre: "", description: "" },
      { id: "objective-2", titre: "", description: "" },
    ],
    steps: [
      {
        id: "step-b",
        objectiveId: "objective-1",
        ordre: 2,
        titre: "",
        contenu: "",
        requis: false,
      },
      {
        id: "step-a",
        objectiveId: "objective-1",
        ordre: 1,
        titre: "",
        contenu: "",
        requis: true,
      },
      {
        id: "step-c",
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
        valeur: "technical-value-1",
        valeurs: ["technical-value-1", "technical-value-2"],
        description: "",
      },
    ],
    rules: [
      {
        id: "rule-b",
        condition: { kind: "always" },
        stepIds: ["step-b"],
        effect: { kind: "step_visibility", visible: false },
        explication: "",
      },
      {
        id: "rule-a",
        condition: {
          kind: "preference_equals",
          preferenceId: "preference-1",
          value: "technical-value-1",
        },
        stepIds: ["step-a"],
        effect: { kind: "step_visibility", visible: true },
        explication: "",
      },
    ],
  }
}
