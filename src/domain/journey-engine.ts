import type {
  ContractResult,
  ErrorCode,
  Explanation,
  Id,
  JourneyCatalog,
  JourneyPlan,
  OperationId,
  PlannedStep,
} from "./models"
import { buildExplanations } from "./explanation"
import type { ExplanationEvent } from "./explanation"
import { validateCatalog, validatePlan } from "./invariants"
import { evaluateRules } from "./rule-evaluator"
import type { AppliedRuleEffect } from "./rule-evaluator"

export interface RecalculatedPlan {
  readonly plan: JourneyPlan
  readonly explanations: readonly Explanation[]
}

export function buildBasePlan(
  objectiveId: Id,
  catalog: JourneyCatalog,
  operation: OperationId,
): ContractResult<JourneyPlan> {
  const catalogValidation = validateCatalogView(catalog, operation)

  if (!catalogValidation.ok) {
    return catalogValidation
  }

  if (catalog.getObjective(objectiveId) === null) {
    return failure(
      "OBJECTIVE_NOT_FOUND",
      operation,
      `Unknown objective: ${objectiveId}`,
    )
  }

  const steps = [...catalog.getSteps(objectiveId)]
    .sort((left, right) => left.ordre - right.ordre || compareIds(left.id, right.id))
    .map<PlannedStep>((step) => ({
      stepId: step.id,
      order: step.ordre,
      required: step.requis,
      visible: true,
    }))

  const plan: JourneyPlan = { objectiveId, steps }
  const validation = validatePlan(plan, catalog, operation)

  if (!validation.ok) {
    return validation
  }

  return { ok: true, data: plan, error: null }
}

export function buildPlan(
  objectiveId: Id,
  preferences: Readonly<Record<Id, string>>,
  catalog: JourneyCatalog,
  operation: OperationId,
): ContractResult<JourneyPlan> {
  const basePlan = buildBasePlan(objectiveId, catalog, operation)

  if (!basePlan.ok) {
    return basePlan
  }

  const appliedRules = evaluateRules(basePlan.data, preferences, catalog, operation)

  if (!appliedRules.ok) {
    return appliedRules
  }

  const plan = applyRuleEffects(basePlan.data, appliedRules.data)
  const validation = validatePlan(plan, catalog, operation)

  if (!validation.ok) {
    return validation
  }

  return { ok: true, data: plan, error: null }
}

export function recalculatePlan(
  previousPlan: JourneyPlan | null,
  objectiveId: Id,
  preferences: Readonly<Record<Id, string>>,
  catalog: JourneyCatalog,
  operation: OperationId,
  event: ExplanationEvent = "preference_changed",
): ContractResult<RecalculatedPlan> {
  const basePlan = buildBasePlan(objectiveId, catalog, operation)

  if (!basePlan.ok) {
    return basePlan
  }

  // Keep matching no-op requests for attribution: their base value may differ
  // from the previous plan, even though it matches the newly built base plan.
  const appliedRules = evaluateRules(basePlan.data, preferences, catalog, operation, true)

  if (!appliedRules.ok) {
    return appliedRules
  }

  const plan = applyRuleEffects(basePlan.data, appliedRules.data)
  const validation = validatePlan(plan, catalog, operation)

  if (!validation.ok) {
    return validation
  }

  const explanations = buildExplanations(
    previousPlan,
    plan,
    appliedRules.data,
    event,
    catalog,
  )

  return { ok: true, data: { plan, explanations }, error: null }
}

function applyRuleEffects(
  plan: JourneyPlan,
  appliedRules: readonly AppliedRuleEffect[],
): JourneyPlan {
  const stepsById = new Map(
    plan.steps.map((step) => [step.stepId, { ...step }]),
  )

  for (const appliedRule of appliedRules) {
    for (const stepId of appliedRule.stepIds) {
      const step = stepsById.get(stepId)

      if (step === undefined) {
        continue
      }

      if (appliedRule.effect.kind === "step_order") {
        step.order = appliedRule.effect.order
      } else {
        step.visible = appliedRule.effect.visible
      }
    }
  }

  const steps = [...stepsById.values()].sort(
    (left, right) =>
      left.order - right.order || compareIds(left.stepId, right.stepId),
  )

  return { objectiveId: plan.objectiveId, steps }
}

function validateCatalogView(
  catalog: JourneyCatalog,
  operation: OperationId,
): ContractResult<true> {
  const objectives = catalog.getObjectives()
  const steps = objectives.flatMap((objective) =>
    catalog.getSteps(objective.id),
  )

  return validateCatalog(
    {
      objectives,
      steps,
      preferences: catalog.getPreferences(),
      rules: catalog.getRules(),
    },
    operation,
  )
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
