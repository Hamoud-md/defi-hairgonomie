import { validateCatalog } from "../domain/invariants"
import type { CatalogContents } from "../domain/invariants"
import type {
  ContractResult,
  Id,
  JourneyCatalog,
  OperationId,
} from "../domain/models"
import { demoCatalogContents } from "./demo-data"

function createCatalog(contents: CatalogContents): JourneyCatalog {
  const objectives = deepFreeze(contents.objectives)
  const steps = deepFreeze(contents.steps)
  const preferences = deepFreeze(contents.preferences)
  const rules = deepFreeze(
    [...contents.rules].sort((left, right) => compareIds(left.id, right.id)),
  )

  const objectivesById = new Map(objectives.map((objective) => [objective.id, objective]))
  const stepsById = new Map(steps.map((step) => [step.id, step]))
  const preferencesById = new Map(
    preferences.map((preference) => [preference.id, preference]),
  )

  return {
    getObjectives: () => objectives,
    getObjective: (objectiveId: Id) => objectivesById.get(objectiveId) ?? null,
    getSteps: (objectiveId: Id) =>
      Object.freeze(
        steps
          .filter((step) => step.objectiveId === objectiveId)
          .sort((left, right) => left.ordre - right.ordre || compareIds(left.id, right.id)),
      ),
    getStep: (stepId: Id) => stepsById.get(stepId) ?? null,
    getPreferences: () => preferences,
    getPreference: (preferenceId: Id) => preferencesById.get(preferenceId) ?? null,
    getRules: () => rules,
  }
}

export function loadCatalog(
  contents: CatalogContents,
  operation: OperationId,
): ContractResult<JourneyCatalog> {
  const validation = validateCatalog(contents, operation)

  if (!validation.ok) {
    return validation
  }

  return { ok: true, data: createCatalog(contents), error: null }
}

export function loadDemoCatalog(operation: OperationId): ContractResult<JourneyCatalog> {
  return loadCatalog(demoCatalogContents, operation)
}

function compareIds(left: string, right: string): number {
  if (left < right) {
    return -1
  }

  if (left > right) {
    return 1
  }

  return 0
}

function deepFreeze<T>(value: T): T {
  if (Array.isArray(value)) {
    return Object.freeze(value.map((entry) => deepFreeze(entry))) as T
  }

  if (typeof value === "object" && value !== null) {
    const copy = Object.fromEntries(
      Object.entries(value).map(([key, entry]) => [key, deepFreeze(entry)]),
    )

    return Object.freeze(copy) as T
  }

  return value
}
