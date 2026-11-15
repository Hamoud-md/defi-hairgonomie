import type {
  ContractResult, Explanation, InvalidatedAnswer, JourneyCatalog, JourneyPlan, Objective, ObjectiveView,
  OperationId, PreferenceView, SessionState, SessionView, Summary, ValidationIssue,
} from "../domain/models"
import { buildPlan } from "../domain/journey-engine"
import { validateCatalog } from "../domain/invariants"
import { copyState, getProgress, isCompleted } from "../domain/session"
import { failure, getAnswerIssue } from "../domain/validation"

interface SessionFeedback {
  readonly explanations?: readonly Explanation[]
  readonly issues?: readonly ValidationIssue[]
  readonly invalidatedAnswers?: readonly InvalidatedAnswer[]
}

export function getObjectives(
  catalog: JourneyCatalog, state: SessionState | null = null,
): ContractResult<ObjectiveView[]> {
  const objectives = catalog.getObjectives()
  const validation = validateCatalog({ objectives,
    steps: objectives.flatMap((objective) => catalog.getSteps(objective.id)),
    preferences: catalog.getPreferences(), rules: catalog.getRules(),
  }, "QRY-01")
  if (!validation.ok) return validation
  return { ok: true, data: objectives.map((objective) => ({
    objective: { ...objective }, selected: state?.objectiveId === objective.id,
  })), error: null }
}

export function getSessionView(
  state: SessionState | null, catalog: JourneyCatalog, feedback: SessionFeedback = {},
): ContractResult<SessionView> {
  const context = readSession(state, catalog, "QRY-02")
  if (!context.ok) return context
  const { plan, objective, session } = context.data
  const progress = getProgress(session, plan, "QRY-02")
  if (!progress.ok) return queryFailure(progress, "QRY-02")
  const activeStep = session.activeStepId === null ? null : catalog.getStep(session.activeStepId)
  const issues = (feedback.issues ?? []).filter((issue) => plan.steps.some((step) => step.stepId === issue.stepId)).map((issue) => ({ ...issue }))
  for (const step of plan.steps) {
    if (!step.visible || !Object.hasOwn(session.answers, step.stepId)) continue
    const issue = getAnswerIssue(step.stepId, session.answers[step.stepId])
    if (issue !== null && !issues.some((item) => item.stepId === issue.stepId && item.code === issue.code)) issues.push(issue)
  }
  for (const answer of feedback.invalidatedAnswers ?? []) {
    if (plan.steps.some((step) => step.stepId === answer.stepId && step.visible)
      && !issues.some((issue) => issue.stepId === answer.stepId)) {
      issues.push({ stepId: answer.stepId, code: "ANSWER_INVALID", message: answer.reason })
    }
  }
  const completed = isCompleted(session, plan) && !hasInvalidatedRequired(plan, feedback.invalidatedAnswers ?? [])
  return { ok: true, data: {
    view: completed ? "summary" : "journey", objective: { ...objective }, plan,
    activeStep: activeStep === null ? null : { ...activeStep }, progress: progress.data,
    preferences: preferenceViews(session, catalog), answers: copyState(session).answers,
    explanations: copyExplanations(feedback.explanations ?? []), issues,
    status: completed ? "completed" : "in_progress",
  }, error: null }
}

export function getSummary(
  state: SessionState | null, catalog: JourneyCatalog, explanations: readonly Explanation[] = [],
  invalidatedAnswers: readonly InvalidatedAnswer[] = [],
): ContractResult<Summary> {
  const context = readSession(state, catalog, "QRY-03")
  if (!context.ok) return context
  const { session, objective, plan } = context.data
  const progress = getProgress(session, plan, "QRY-03")
  if (!progress.ok) return queryFailure(progress, "QRY-03")
  if (!isCompleted(session, plan) || hasInvalidatedRequired(plan, invalidatedAnswers)) {
    return failure("JOURNEY_INCOMPLETE", "QRY-03", "Required answers are not all valid")
  }
  const requiredTotal = plan.steps.filter((step) => step.required).length
  const answers = copyState(session).answers
  return { ok: true, data: {
    objective: { ...objective }, preferences: preferenceViews(session, catalog),
    decisions: plan.steps.filter((step) => step.visible && !invalidatedAnswers.some((answer) => answer.stepId === step.stepId)
      && Object.hasOwn(answers, step.stepId)
      && getAnswerIssue(step.stepId, answers[step.stepId]) === null).map((step) => ({
        // The validated plan guarantees this catalogue reference exists.
        step: { ...catalog.getStep(step.stepId)! }, answer: answers[step.stepId],
      })),
    explanations: copyExplanations(explanations),
    completion: { completed: true, requiredTotal, requiredCompleted: requiredTotal },
  }, error: null }
}

function hasInvalidatedRequired(plan: JourneyPlan, invalidatedAnswers: readonly InvalidatedAnswer[]): boolean {
  return plan.steps.some((step) => step.required && invalidatedAnswers.some((answer) => answer.stepId === step.stepId))
}

export function copyExplanations(explanations: readonly Explanation[]): Explanation[] {
  return explanations.map((explanation) => ({ ...explanation, changes: explanation.changes.map((change) => ({ ...change })) }))
}

function preferenceViews(state: SessionState, catalog: JourneyCatalog): PreferenceView[] {
  return [...catalog.getPreferences()].sort((left, right) => left.id < right.id ? -1 : left.id > right.id ? 1 : 0)
    .map((preference) => ({
      preference: { ...preference, ...(preference.valeurs === undefined ? {} : { valeurs: [...preference.valeurs] }) },
      selectedValue: Object.hasOwn(state.preferences, preference.id) ? state.preferences[preference.id] : preference.valeur,
    }))
}

function readSession(
  state: SessionState | null, catalog: JourneyCatalog, operation: "QRY-02" | "QRY-03",
): ContractResult<{ session: SessionState; objective: Objective; plan: JourneyPlan }> {
  if (state === null) return failure("SESSION_REQUIRED", operation, "An active session is required")
  if (state.objectiveId === null) {
    return failure(operation === "QRY-02" ? "OBJECTIVE_REQUIRED" : "SESSION_REQUIRED", operation, "A selected objective is required")
  }
  const objective = catalog.getObjective(state.objectiveId)
  if (objective === null) return failure("CATALOG_INVALID", operation, "Session objective is not in the catalogue")
  for (const [id, value] of Object.entries(state.preferences)) {
    const preference = catalog.getPreference(id)
    if (preference === null || !(preference.valeurs ?? [preference.valeur]).includes(value)) {
      return failure("CATALOG_INVALID", operation, `Session references an undeclared preference value: ${id}`)
    }
  }
  for (const id of Object.keys(state.answers)) {
    if (catalog.getStep(id)?.objectiveId !== state.objectiveId) {
      return failure("CATALOG_INVALID", operation, `Session references a step outside its objective: ${id}`)
    }
  }
  const plan = buildPlan(state.objectiveId, state.preferences, catalog, operation)
  if (!plan.ok) return queryFailure(plan, operation)
  return { ok: true, data: { session: state, objective, plan: plan.data }, error: null }
}

function queryFailure(result: Extract<ContractResult<never>, { ok: false }>, operation: OperationId): ContractResult<never> {
  return failure("CATALOG_INVALID", operation, result.error.message)
}
