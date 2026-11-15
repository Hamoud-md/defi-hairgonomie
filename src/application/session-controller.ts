import type {
  AnswerValue, ContractResult, Explanation, Id, InvalidatedAnswer, JourneyCatalog,
  JourneyPlan, OperationId, SessionState, ValidationIssue,
} from "../domain/models"
import { buildPlan, recalculatePlan } from "../domain/journey-engine"
import {
  advanceSession, copyState, createSession, findInvalidatedAnswers,
  reconcileSession, resetSession, returnToPreviousStep,
} from "../domain/session"
import {
  failure, getValidationIssues, requireSession, validateActiveStep,
  validateAnswer, validateObjective, validatePreference, validateRevisionStep,
} from "../domain/validation"
import { buildInvalidationExplanations } from "../domain/explanation"
import { copyExplanations, getObjectives, getSessionView, getSummary } from "./selectors"
import { restoreSession } from "./session-restoration"

export function selectObjective(
  input: { objectiveId: Id },
  catalog: JourneyCatalog,
): ContractResult<{ state: SessionState; plan: JourneyPlan; explanations: Explanation[] }> {
  const objective = validateObjective(input.objectiveId,
    typeof input.objectiveId === "string" ? catalog.getObjective(input.objectiveId) : null)
  if (!objective.ok) return objective
  const preferences = Object.fromEntries([...catalog.getPreferences()]
    .sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    .map((preference) => [preference.id, preference.valeur]))
  const result = recalculatePlan(null, objective.data, preferences, catalog, "CMD-01")
  if (!result.ok) return configurationFailure(result)
  return { ok: true, data: {
    state: createSession(result.data.plan, preferences),
    plan: result.data.plan,
    explanations: [...result.data.explanations],
  }, error: null }
}

export function validateStep(
  state: SessionState | null,
  input: { stepId: Id; answer: AnswerValue },
  catalog: JourneyCatalog,
): ReturnType<typeof advanceSession> {
  const session = requireSession(state, "CMD-03")
  if (!session.ok) return session
  const plan = planForSession(session.data, catalog, "CMD-03")
  if (!plan.ok) return plan
  const validation = validateActiveStep(session.data, input.stepId, catalog.getStep(input.stepId), plan.data)
  if (!validation.ok) return validation
  return advanceSession(session.data, plan.data, input.answer)
}

export function goBack(
  state: SessionState | null,
  catalog: JourneyCatalog,
): ReturnType<typeof returnToPreviousStep> {
  const session = requireSession(state, "CMD-04")
  if (!session.ok) return session
  const plan = planForSession(session.data, catalog, "CMD-04")
  if (!plan.ok) return plan
  return returnToPreviousStep(session.data, plan.data)
}

export function updatePreference(
  state: SessionState | null, input: { preferenceId: Id; value: string }, catalog: JourneyCatalog,
  pendingInvalidations: readonly InvalidatedAnswer[] = [],
): ContractResult<{ state: SessionState; plan: JourneyPlan; explanations: Explanation[]; invalidatedAnswers: InvalidatedAnswer[] }> {
  const session = requireSession(state, "CMD-02")
  if (!session.ok) return session
  const preference = validatePreference(input.preferenceId, input.value, catalog.getPreference(input.preferenceId))
  if (!preference.ok) return preference
  const nextState = copyState(session.data)
  nextState.preferences = { ...nextState.preferences, [input.preferenceId]: preference.data }
  const result = adaptSession(session.data, nextState, catalog, "CMD-02", pendingInvalidations)
  if (!result.ok) return result
  return { ok: true, data: result.data, error: null }
}

export function reviseAnswer(
  state: SessionState | null, input: { stepId: Id; answer: AnswerValue }, catalog: JourneyCatalog,
  pendingInvalidations: readonly InvalidatedAnswer[] = [],
): ContractResult<{
  state: SessionState; plan: JourneyPlan; explanations: Explanation[];
  invalidatedAnswers: InvalidatedAnswer[]; issues: ValidationIssue[];
}> {
  const session = requireSession(state, "CMD-05")
  if (!session.ok) return session
  const step = validateRevisionStep(session.data, input.stepId, catalog.getStep(input.stepId))
  if (!step.ok) return step
  const answer = validateAnswer(input.stepId, input.answer, "CMD-05")
  if (!answer.ok) return answer
  const nextState = copyState(session.data)
  nextState.answers = { ...nextState.answers, [input.stepId]: answer.data }
  const result = adaptSession(session.data, nextState, catalog, "CMD-05", pendingInvalidations, input.stepId)
  if (!result.ok) return result
  return { ok: true, data: { ...result.data, issues: [] }, error: null }
}

export function restart(
  state: SessionState | null, input: { confirm: true },
): ContractResult<{ state: SessionState }> {
  if (state === null) return failure("SESSION_REQUIRED", "CMD-06", "An existing session is required")
  if (input.confirm !== true) return failure("CONFIRMATION_REQUIRED", "CMD-06", "Explicit confirmation is required")
  return { ok: true, data: { state: resetSession() }, error: null }
}

function adaptSession(
  previousState: SessionState & { objectiveId: Id }, nextState: SessionState,
  catalog: JourneyCatalog, operation: "CMD-02" | "CMD-05",
  pendingInvalidations: readonly InvalidatedAnswer[], correctedStepId?: Id,
): ContractResult<{ state: SessionState; plan: JourneyPlan; explanations: Explanation[]; invalidatedAnswers: InvalidatedAnswer[] }> {
  const previousPlan = buildPlan(previousState.objectiveId, previousState.preferences, catalog, operation)
  if (!previousPlan.ok) return configurationFailure(previousPlan)
  const nextPlan = recalculatePlan(previousPlan.data, previousState.objectiveId, nextState.preferences,
    catalog, operation, operation === "CMD-02" ? "preference_changed" : "answer_revised")
  if (!nextPlan.ok) return configurationFailure(nextPlan)
  const reconciled = reconcileSession(nextState, nextPlan.data.plan)
  const labels = Object.fromEntries(catalog.getSteps(previousState.objectiveId).map((step) => [step.id, step.titre]))
  const before = [...new Map([...pendingInvalidations,
    ...findInvalidatedAnswers(previousState, previousPlan.data, labels)].map((answer) => [answer.stepId, answer])).values()]
  const retained = before.filter((answer) => answer.stepId !== correctedStepId
    && nextPlan.data.plan.steps.some((step) => step.stepId === answer.stepId)
    && Object.hasOwn(reconciled.answers, answer.stepId))
  const invalidatedAnswers = [...new Map([...retained,
    ...findInvalidatedAnswers(reconciled, nextPlan.data.plan, labels)].map((answer) => [answer.stepId, answer])).values()]
    .sort((left, right) => left.stepId < right.stepId ? -1 : left.stepId > right.stepId ? 1 : 0).map((answer) => {
    const cause = nextPlan.data.explanations.find((explanation) => explanation.changes.some((change) =>
      change.kind === "step_visibility" && change.targetId === answer.stepId && change.after === false,
    ))
    return { ...answer, reason: cause?.reason ?? answer.reason }
  })
  const explanations = [...nextPlan.data.explanations,
    ...buildInvalidationExplanations(before, invalidatedAnswers, nextPlan.data.explanations)]
  return { ok: true, data: { state: reconciled, plan: nextPlan.data.plan, explanations, invalidatedAnswers }, error: null }
}

// Optional in-memory orchestration for future UI callers. Only successful
// commands commit state; feedback is separate from the contract's business state.
export function createSessionController(catalog: JourneyCatalog) {
  let state: SessionState | null = null
  let explanations: Explanation[] = []
  let issues: ValidationIssue[] = []
  let invalidatedAnswers: InvalidatedAnswer[] = []

  function commit<T extends { state: SessionState; explanations?: Explanation[]; invalidatedAnswers?: InvalidatedAnswer[] }>(
    result: ContractResult<T>, clear = false, correctedStepId?: Id,
  ): ContractResult<T> {
    if (result.ok) {
      state = copyState(result.data.state)
      if (clear) explanations = []
      if (clear) invalidatedAnswers = []
      if (result.data.invalidatedAnswers !== undefined) {
        invalidatedAnswers = result.data.invalidatedAnswers.map((answer) => ({ ...answer }))
      } else if (correctedStepId !== undefined) {
        invalidatedAnswers = invalidatedAnswers.filter((answer) => answer.stepId !== correctedStepId)
      }
      explanations.push(...copyExplanations(result.data.explanations ?? []).map((explanation, index) => ({
        ...explanation, id: `${explanation.id}-history-${explanations.length + index}`,
      })))
      issues = []
    } else {
      const validationIssues = getValidationIssues(result.error)
      if (validationIssues.length > 0) issues = validationIssues
    }
    return result
  }

  return {
    restore: (savedState: unknown) => {
      const result = restoreSession(savedState, catalog)
      if (!result.ok) return result
      state = copyState(result.data.state)
      invalidatedAnswers = result.data.invalidatedAnswers.map((answer) => ({ ...answer }))
      explanations = []; issues = []
      return result
    },
    selectObjective: (input: { objectiveId: Id }) => commit(selectObjective(input, catalog), true),
    updatePreference: (input: { preferenceId: Id; value: string }) => commit(updatePreference(state, input, catalog, invalidatedAnswers)),
    validateStep: (input: { stepId: Id; answer: AnswerValue }) => commit(validateStep(state, input, catalog), false, input.stepId),
    goBack: () => commit(goBack(state, catalog)),
    reviseAnswer: (input: { stepId: Id; answer: AnswerValue }) => commit(reviseAnswer(state, input, catalog, invalidatedAnswers)),
    restart: (input: { confirm: true }) => commit(restart(state, input), true),
    getObjectives: () => getObjectives(catalog, state),
    getSessionView: () => getSessionView(state, catalog, { explanations, issues, invalidatedAnswers }),
    getSummary: () => getSummary(state, catalog, explanations, invalidatedAnswers),
  }
}

function planForSession(
  state: SessionState & { objectiveId: Id },
  catalog: JourneyCatalog,
  operation: OperationId,
): ContractResult<JourneyPlan> {
  const result = buildPlan(state.objectiveId, state.preferences, catalog, operation)
  if (!result.ok) return configurationFailure(result)
  return result
}

function configurationFailure(result: Extract<ContractResult<never>, { ok: false }>): ContractResult<never> {
  // These existing codes describe malformed configuration at the command layer;
  // keep the engine detail, but expose only errors declared for these commands.
  if ((result.error.code === "REQUIRED_STEP_REMOVED"
    && result.error.operation !== "CMD-02" && result.error.operation !== "CMD-05")
    || result.error.code === "OBJECTIVE_NOT_FOUND") {
    return failure("CATALOG_INVALID", result.error.operation, result.error.message)
  }
  return result
}
