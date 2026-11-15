import type {
  ContractResult,
  ErrorCode,
  Id,
  JourneyCatalog,
  JourneyPlan,
  OperationId,
  RuleCondition,
  RuleEffect,
} from "./models"
import { findRuleConditionIssue, findRuleEffectIssue, validatePlan } from "./invariants"

export interface AppliedRuleEffect {
  readonly ruleId: Id
  readonly reason: string
  readonly effect: RuleEffect
  readonly stepIds: readonly Id[]
}

export function evaluateRules(
  plan: JourneyPlan,
  preferences: Readonly<Record<Id, string>>,
  catalog: JourneyCatalog,
  operation: OperationId,
  includeUnchanged = false,
): ContractResult<readonly AppliedRuleEffect[]> {
  const validation = validatePlan(plan, catalog, operation)
  if (!validation.ok) {
    return validation
  }

  const plannedStepsById = new Map(plan.steps.map((step) => [step.stepId, step]))
  const preferencesById = new Map(
    catalog.getPreferences().map((preference) => [preference.id, preference]),
  )
  const rules = [...catalog.getRules()].sort((left, right) => compareIds(left.id, right.id))
  const requestedOrders = new Map<Id, number>()
  const requestedVisibility = new Map<Id, boolean>()
  const applied: AppliedRuleEffect[] = []
  const selectedPreferences = Object.fromEntries(
    [...preferencesById.values()]
      .sort((left, right) => compareIds(left.id, right.id))
      .map((preference) => [
        preference.id,
        Object.hasOwn(preferences, preference.id)
          ? preferences[preference.id]
          : preference.valeur,
      ]),
  )

  for (const rule of rules) {
    if (rule.stepIds.some((stepId) => catalog.getStep(stepId) === null)) {
      return failure("CATALOG_INVALID", operation, `Transition rule ${rule.id} references an unknown step`)
    }

    const conditionIssue = findRuleConditionIssue(rule.condition, preferencesById)

    if (conditionIssue !== null) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Transition rule ${rule.id} has an invalid condition: ${conditionIssue}`,
      )
    }

    const effectIssue = findRuleEffectIssue(rule.effect)

    if (effectIssue !== null) {
      return failure(
        "CATALOG_INVALID",
        operation,
        `Transition rule ${rule.id} has an invalid effect: ${effectIssue}`,
      )
    }

    if (!evaluateCondition(rule.condition, selectedPreferences)) {
      continue
    }

    const effectiveStepIds: Id[] = []

    for (const stepId of [...new Set(rule.stepIds)].sort(compareIds)) {
      const plannedStep = plannedStepsById.get(stepId)

      if (plannedStep === undefined) {
        continue
      }

      if (rule.effect.kind === "step_order") {
        if (plannedStep.required) {
          return failure(
            "CATALOG_INVALID",
            operation,
            `Transition rule ${rule.id} cannot reorder required step ${stepId}`,
          )
        }

        const existingOrder = requestedOrders.get(stepId)

        if (existingOrder !== undefined && existingOrder !== rule.effect.order) {
          return failure(
            "RULE_CONFLICT",
            operation,
            `Conflicting order effects for step ${stepId}`,
          )
        }

        if (existingOrder === undefined) {
          requestedOrders.set(stepId, rule.effect.order)
          if (includeUnchanged || plannedStep.order !== rule.effect.order) {
            effectiveStepIds.push(stepId)
          }
        }
      } else {
        if (!rule.effect.visible && plannedStep.required) {
          return failure(
            "REQUIRED_STEP_REMOVED",
            operation,
            `Transition rule ${rule.id} hides required step ${stepId}`,
          )
        }

        const existingVisibility = requestedVisibility.get(stepId)

        if (existingVisibility !== undefined && existingVisibility !== rule.effect.visible) {
          return failure(
            "RULE_CONFLICT",
            operation,
            `Conflicting visibility effects for step ${stepId}`,
          )
        }

        if (existingVisibility === undefined) {
          requestedVisibility.set(stepId, rule.effect.visible)
          if (includeUnchanged || plannedStep.visible !== rule.effect.visible) {
            effectiveStepIds.push(stepId)
          }
        }
      }
    }

    if (effectiveStepIds.length > 0) {
      applied.push({
        ruleId: rule.id,
        reason: rule.explication,
        effect: rule.effect,
        stepIds: effectiveStepIds,
      })
    }
  }

  return { ok: true, data: applied, error: null }
}

function evaluateCondition(
  condition: RuleCondition,
  preferences: Readonly<Record<Id, string>>,
): boolean {
  switch (condition.kind) {
    case "always":
      return true
    case "preference_equals":
      return preferences[condition.preferenceId] === condition.value
    case "all":
      return condition.conditions.every((child) => evaluateCondition(child, preferences))
    case "any":
      return condition.conditions.some((child) => evaluateCondition(child, preferences))
    case "not":
      return !evaluateCondition(condition.condition, preferences)
  }
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
