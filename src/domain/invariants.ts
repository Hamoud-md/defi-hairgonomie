import type {
  ContractResult,
  ErrorCode,
  Id,
  JourneyCatalog,
  JourneyPlan,
  Objective,
  OperationId,
  Preference,
  RuleCondition,
  RuleEffect,
  Step,
  TransitionRule,
} from "./models"

export interface CatalogContents {
  readonly objectives: readonly Objective[]
  readonly steps: readonly Step[]
  readonly preferences: readonly Preference[]
  readonly rules: readonly TransitionRule[]
}

export function validateCatalog(
  contents: CatalogContents,
  operation: OperationId,
): ContractResult<true> {
  const issue = findIntegrityIssue(contents)

  if (issue !== null) {
    return failure("CATALOG_INVALID", operation, issue)
  }

  return { ok: true, data: true, error: null }
}

export function validatePlan(
  plan: JourneyPlan,
  catalog: JourneyCatalog,
  operation: OperationId,
): ContractResult<true> {
  if (catalog.getObjective(plan.objectiveId) === null) {
    return failure(
      "CATALOG_INVALID",
      operation,
      `Plan references unknown objective: ${plan.objectiveId}`,
    )
  }

  const catalogSteps = catalog.getSteps(plan.objectiveId)
  const plannedStepsById = new Map<Id, JourneyPlan["steps"][number]>()

  for (const plannedStep of plan.steps) {
    if (typeof plannedStep.visible !== "boolean") {
      return failure("CATALOG_INVALID", operation, `Planned step ${plannedStep.stepId} has an invalid visibility`)
    }

    if (!Number.isFinite(plannedStep.order)) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Planned step ${plannedStep.stepId} has an invalid order`,
      )
    }

    const step = catalog.getStep(plannedStep.stepId)

    if (step === null) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Planned step ${plannedStep.stepId} does not exist`,
      )
    }

    if (step.objectiveId !== plan.objectiveId) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Planned step ${plannedStep.stepId} belongs to another objective`,
      )
    }

    if (plannedStepsById.has(plannedStep.stepId)) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Planned step ${plannedStep.stepId} is duplicated`,
      )
    }

    if (plannedStep.required !== step.requis) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Planned step ${plannedStep.stepId} has an inconsistent required flag`,
      )
    }

    plannedStepsById.set(plannedStep.stepId, plannedStep)
  }

  for (const step of catalogSteps) {
    if (!step.requis) {
      continue
    }

    const plannedStep = plannedStepsById.get(step.id)

    if (plannedStep === undefined) {
      return failure(
        "REQUIRED_STEP_REMOVED",
        operation,
        `Required step ${step.id} is missing from the plan`,
      )
    }

    if (!plannedStep.visible) {
      return failure(
        "REQUIRED_STEP_REMOVED",
        operation,
        `Required step ${step.id} is hidden`,
      )
    }
  }

  return { ok: true, data: true, error: null }
}

export function findRuleConditionIssue(
  condition: RuleCondition,
  preferencesById: ReadonlyMap<Id, Preference>,
): string | null {
  return findConditionIssue(condition, preferencesById, new Set())
}

export function findRuleEffectIssue(effect: RuleEffect): string | null {
  if (!isPlainRecord(effect)) {
    return "Effect must be an object"
  }

  if (effect.kind === "step_order") {
    if (typeof effect.order !== "number" || !Number.isFinite(effect.order)) {
      return "step_order requires a finite order"
    }

    return null
  }

  if (effect.kind === "step_visibility") {
    if (typeof effect.visible !== "boolean") {
      return "step_visibility requires a boolean visible flag"
    }

    return null
  }

  return "Effect has an unknown kind"
}

function findIntegrityIssue(contents: CatalogContents): string | null {
  const duplicateObjective = findDuplicateId(contents.objectives)
  if (duplicateObjective !== null) {
    return `Duplicate objective id: ${duplicateObjective}`
  }

  const duplicatePreference = findDuplicateId(contents.preferences)
  if (duplicatePreference !== null) {
    return `Duplicate preference id: ${duplicatePreference}`
  }

  const duplicateRule = findDuplicateId(contents.rules)
  if (duplicateRule !== null) {
    return `Duplicate transition rule id: ${duplicateRule}`
  }

  const duplicateStep = findDuplicateId(contents.steps)
  if (duplicateStep !== null) {
    return `Duplicate step id: ${duplicateStep}`
  }

  const objectiveIds = new Set(contents.objectives.map((objective) => objective.id))
  const stepIds = new Set(contents.steps.map((step) => step.id))
  const preferencesById = new Map(
    contents.preferences.map((preference) => [preference.id, preference]),
  )

  for (const step of contents.steps) {
    if (!objectiveIds.has(step.objectiveId)) {
      return `Step ${step.id} references unknown objective: ${step.objectiveId}`
    }

    if (!Number.isFinite(step.ordre)) {
      return `Step ${step.id} has an invalid order`
    }
  }

  for (const preference of contents.preferences) {
    if (preference.valeur.trim().length === 0) {
      return `Preference ${preference.id} has no declared value`
    }

    if (preference.valeurs !== undefined) {
      if (!Array.isArray(preference.valeurs) || preference.valeurs.length === 0) {
        return `Preference ${preference.id} has an invalid values list`
      }

      for (const value of preference.valeurs) {
        if (typeof value !== "string" || value.trim().length === 0) {
          return `Preference ${preference.id} has an invalid declared value`
        }
      }
      if (!preference.valeurs.includes(preference.valeur)) {
        return `Preference ${preference.id} has an undeclared default value`
      }
    }
  }

  for (const rule of contents.rules) {
    for (const stepId of rule.stepIds) {
      if (!stepIds.has(stepId)) {
        return `Transition rule ${rule.id} references unknown step: ${stepId}`
      }
    }

    const conditionIssue = findRuleConditionIssue(rule.condition, preferencesById)
    if (conditionIssue !== null) {
      return `Transition rule ${rule.id} has an invalid condition: ${conditionIssue}`
    }

    const effectIssue = findRuleEffectIssue(rule.effect)
    if (effectIssue !== null) {
      return `Transition rule ${rule.id} has an invalid effect: ${effectIssue}`
    }
  }

  return null
}

function findConditionIssue(
  condition: unknown,
  preferencesById: ReadonlyMap<Id, Preference>,
  seen: Set<object>,
): string | null {
  if (!isPlainRecord(condition)) {
    return "Condition must be an object"
  }

  if (seen.has(condition)) {
    return "Condition contains a cycle"
  }

  seen.add(condition)

  let issue: string | null = null

  if (condition.kind === "always") {
    issue = null
  } else if (condition.kind === "preference_equals") {
    const preferenceId = condition.preferenceId
    const value = condition.value

    if (typeof preferenceId !== "string" || typeof value !== "string") {
      issue = "preference_equals requires a preferenceId and a string value"
    } else {
      const preference = preferencesById.get(preferenceId)

      if (preference === undefined) {
        issue = `Condition references unknown preference: ${preferenceId}`
      } else if (!getPreferenceValues(preference).includes(value)) {
        issue = `Condition references an undeclared value for preference: ${preferenceId}`
      }
    }
  } else if (condition.kind === "all" || condition.kind === "any") {
    const conditions = condition.conditions

    if (!Array.isArray(conditions)) {
      issue = `${condition.kind} requires a conditions array`
    } else {
      for (const child of conditions) {
        issue = findConditionIssue(child, preferencesById, seen)

        if (issue !== null) {
          break
        }
      }
    }
  } else if (condition.kind === "not") {
    issue = findConditionIssue(condition.condition, preferencesById, seen)
  } else {
    issue = "Condition has an unknown kind"
  }

  seen.delete(condition)
  return issue
}

function getPreferenceValues(preference: Preference): readonly string[] {
  return preference.valeurs ?? [preference.valeur]
}

function findDuplicateId(items: readonly { id: string }[]): string | null {
  const seen = new Set<string>()

  for (const item of items) {
    if (seen.has(item.id)) {
      return item.id
    }

    seen.add(item.id)
  }

  return null
}

function isPlainRecord(value: unknown): value is Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false
  }

  const prototype = Object.getPrototypeOf(value)
  return prototype === Object.prototype || prototype === null
}

function failure(
  code: ErrorCode,
  operation: OperationId,
  message: string,
): ContractResult<never> {
  return {
    ok: false,
    data: null,
    error: {
      code,
      message,
      operation,
    },
  }
}
