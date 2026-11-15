import type {
  ContractResult, Id, InvalidatedAnswer, JourneyPlan, OperationId,
  PlannedStep, Progress, SessionState, ValidationIssue,
} from "./models"
import { failure, getAnswerIssue, validateAnswer } from "./validation"

function applicableSteps(plan: JourneyPlan): PlannedStep[] {
  return plan.steps.filter((step) => step.visible).sort((left, right) =>
    left.order - right.order || (left.stepId < right.stepId ? -1 : left.stepId > right.stepId ? 1 : 0),
  )
}

export function copyState(state: SessionState): SessionState {
  return {
    ...state,
    preferences: { ...state.preferences },
    answers: Object.fromEntries(Object.entries(state.answers).map(([id, answer]) =>
      [id, Array.isArray(answer) ? [...answer] : answer],
    )),
  }
}

export function reconcileSession(state: SessionState, plan: JourneyPlan): SessionState {
  const nextState = copyState(state)
  const steps = applicableSteps(plan)
  if (!steps.some((step) => step.stepId === state.activeStepId)) {
    nextState.activeStepId = steps.find((step) => step.required
      && (!Object.hasOwn(state.answers, step.stepId) || getAnswerIssue(step.stepId, state.answers[step.stepId]) !== null))?.stepId
      ?? steps[0]?.stepId ?? null
  }
  return nextState
}

// Invalidity is derived from the current plan and the preserved answer values.
// No extra business state or answer-dependent rules are added to the contract.
export function findInvalidatedAnswers(
  state: SessionState, plan: JourneyPlan, labels: Readonly<Record<Id, string>>,
): InvalidatedAnswer[] {
  return [...plan.steps].sort((left, right) => left.stepId < right.stepId ? -1 : left.stepId > right.stepId ? 1 : 0)
    .filter((step) => Object.hasOwn(state.answers, step.stepId)
      && (!step.visible || getAnswerIssue(step.stepId, state.answers[step.stepId]) !== null))
    .map((step) => ({ stepId: step.stepId, reason: labels[step.stepId] ?? "" }))
}

export function resetSession(): SessionState {
  return { objectiveId: null, activeStepId: null, preferences: {}, answers: {} }
}

export function createSession(plan: JourneyPlan, preferences: Readonly<Record<Id, string>>): SessionState {
  return {
    objectiveId: plan.objectiveId,
    preferences: { ...preferences },
    activeStepId: applicableSteps(plan)[0]?.stepId ?? null,
    answers: {},
  }
}

export function isCompleted(state: SessionState, plan: JourneyPlan): boolean {
  return state.objectiveId === plan.objectiveId && plan.steps.every((step) =>
    !step.required || (Object.hasOwn(state.answers, step.stepId)
      && getAnswerIssue(step.stepId, state.answers[step.stepId]) === null),
  )
}

export function getProgress(
  state: SessionState,
  plan: JourneyPlan,
  operation: OperationId,
): ContractResult<Progress> {
  if (state.objectiveId !== plan.objectiveId) {
    return failure("CATALOG_INVALID", operation, "Session and plan objectives differ")
  }
  const steps = applicableSteps(plan)
  if (steps.length === 0 && state.activeStepId === null) {
    return { ok: true, data: { current: 0, total: 0 }, error: null }
  }
  const index = steps.findIndex((step) => step.stepId === state.activeStepId)
  if (index < 0) {
    return failure("STEP_NOT_FOUND", operation, "Active step is not in the applicable plan")
  }
  return { ok: true, data: { current: index + 1, total: steps.length }, error: null }
}

export function advanceSession(
  state: SessionState,
  plan: JourneyPlan,
  answer: unknown,
): ContractResult<{
  state: SessionState; issues: ValidationIssue[]; progress: Progress;
  completed: boolean; nextStepId: Id | null;
}> {
  const progress = getProgress(state, plan, "CMD-03")
  if (!progress.ok) return progress
  if (state.activeStepId === null) {
    return failure("STEP_NOT_ACTIVE", "CMD-03", "No active step to validate")
  }
  const validation = validateAnswer(state.activeStepId, answer)
  if (!validation.ok) return validation

  const nextState = copyState(state)
  nextState.answers = { ...nextState.answers, [state.activeStepId]: validation.data }
  const completed = isCompleted(nextState, plan)
  const steps = applicableSteps(plan)
  const nextStepId = completed ? null : (steps[progress.data.current]?.stepId
    ?? steps.find((step) => step.required && (!Object.hasOwn(nextState.answers, step.stepId)
      || getAnswerIssue(step.stepId, nextState.answers[step.stepId]) !== null))?.stepId ?? null)
  // Retain a real cursor at completion so return still has a defined predecessor.
  nextState.activeStepId = nextStepId ?? state.activeStepId
  const nextProgress = getProgress(nextState, plan, "CMD-03")
  if (!nextProgress.ok) return nextProgress
  return { ok: true, data: {
    state: nextState, issues: [], progress: nextProgress.data, completed, nextStepId,
  }, error: null }
}

export function returnToPreviousStep(
  state: SessionState,
  plan: JourneyPlan,
): ContractResult<{ state: SessionState; activeStepId: Id; progress: Progress }> {
  const progress = getProgress(state, plan, "CMD-04")
  if (!progress.ok) return progress
  if (progress.data.current <= 1) {
    return failure("FIRST_STEP", "CMD-04", "No previous applicable step")
  }
  const activeStepId = applicableSteps(plan)[progress.data.current - 2].stepId
  const nextState = copyState(state)
  nextState.activeStepId = activeStepId
  return { ok: true, data: {
    state: nextState, activeStepId,
    progress: { current: progress.data.current - 1, total: progress.data.total },
  }, error: null }
}
