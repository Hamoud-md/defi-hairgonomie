import { loadCatalog } from "../../../src/data/catalog"
import type { CatalogContents } from "../../../src/domain/invariants"
import type { ContractResult, JourneyCatalog, SessionState } from "../../../src/domain/models"

export function unwrap<T>(result: ContractResult<T>): T {
  if (!result.ok) throw new Error(result.error.message)
  return result.data
}

export function sessionContents(): CatalogContents {
  return {
    objectives: [
      { id: "objective-1", titre: "", description: "" },
      { id: "objective-2", titre: "", description: "" },
      { id: "objective-empty", titre: "", description: "" },
    ],
    steps: [
      { id: "step-2", objectiveId: "objective-1", ordre: 2, titre: "", contenu: "", requis: true },
      { id: "step-1", objectiveId: "objective-1", ordre: 1, titre: "", contenu: "", requis: true },
      { id: "step-hidden", objectiveId: "objective-1", ordre: 1.5, titre: "", contenu: "", requis: false },
      { id: "step-tail", objectiveId: "objective-1", ordre: 3, titre: "", contenu: "", requis: false },
      { id: "step-other", objectiveId: "objective-2", ordre: 1, titre: "", contenu: "", requis: true },
    ],
    preferences: [
      { id: "preference-2", valeur: "value-2", description: "" },
      { id: "preference-1", valeur: "value-1", description: "" },
    ],
    rules: [{ id: "rule-hide", condition: { kind: "always" }, stepIds: ["step-hidden"],
      effect: { kind: "step_visibility", visible: false }, explication: "technical-hide" }],
  }
}

export function sessionCatalog(contents: CatalogContents = sessionContents()): JourneyCatalog {
  return unwrap(loadCatalog(contents, "CMD-01"))
}

export function sessionState(overrides: Partial<SessionState> = {}): SessionState {
  return {
    objectiveId: "objective-1", activeStepId: "step-1", answers: {},
    preferences: { "preference-1": "value-1", "preference-2": "value-2" },
    ...overrides,
  }
}

export function freezeInputs<T>(value: T): T {
  if (typeof value === "object" && value !== null) {
    Object.values(value).forEach(freezeInputs)
    Object.freeze(value)
  }
  return value
}
