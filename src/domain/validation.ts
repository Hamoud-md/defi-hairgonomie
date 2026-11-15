import type {
  AnswerValue, ContractError, ContractResult, ErrorCode, Id, JourneyPlan,
  Objective, OperationId, Preference, SessionState, Step, ValidationIssue,
} from "./models"

export function failure(
  code: ErrorCode,
  operation: OperationId,
  message: string,
  fields?: Record<string, string>,
): ContractResult<never> {
  return { ok: false, data: null, error: {
    code, operation, message, ...(fields === undefined ? {} : { fields }),
  } }
}

export function validateObjective(
  objectiveId: unknown,
  objective: Objective | null,
): ContractResult<Id> {
  if (typeof objectiveId !== "string" || objectiveId.length === 0) {
    return failure("OBJECTIVE_REQUIRED", "CMD-01", "An objective is required")
  }
  if (objective === null || objective.id !== objectiveId) {
    return failure("OBJECTIVE_NOT_FOUND", "CMD-01", `Unknown objective: ${objectiveId}`)
  }
  return { ok: true, data: objectiveId, error: null }
}

export function requireSession(
  state: SessionState | null,
  operation: "CMD-02" | "CMD-03" | "CMD-04" | "CMD-05",
): ContractResult<SessionState & { objectiveId: Id }> {
  if (state === null) {
    return failure("SESSION_REQUIRED", operation, "An active session is required")
  }
  if (state.objectiveId === null) {
    return failure(operation === "CMD-04" ? "OBJECTIVE_REQUIRED" : "SESSION_REQUIRED",
      operation, "A selected objective is required")
  }
  return { ok: true, data: { ...state, objectiveId: state.objectiveId }, error: null }
}

export function validateActiveStep(
  state: SessionState,
  stepId: Id,
  step: Step | null,
  plan: JourneyPlan,
): ContractResult<true> {
  if (step === null) {
    return failure("STEP_NOT_FOUND", "CMD-03", `Unknown step: ${stepId}`)
  }
  if (step.objectiveId !== state.objectiveId) {
    return failure("STEP_NOT_IN_OBJECTIVE", "CMD-03", `Step ${stepId} belongs to another objective`)
  }
  if (state.activeStepId !== stepId || !plan.steps.some((item) => item.stepId === stepId && item.visible)) {
    return failure("STEP_NOT_ACTIVE", "CMD-03", `Step ${stepId} is not active`)
  }
  return { ok: true, data: true, error: null }
}

export function isAnswerValue(answer: unknown): answer is AnswerValue {
  return typeof answer === "string" || (Array.isArray(answer)
    && Array.from(answer).every((item) => typeof item === "string"))
}

export function isSessionState(value: unknown): value is SessionState {
  if (!isRecord(value) || Object.keys(value).sort().join(",") !== "activeStepId,answers,objectiveId,preferences") return false
  return (value.objectiveId === null || typeof value.objectiveId === "string")
    && (value.activeStepId === null || typeof value.activeStepId === "string")
    && isRecord(value.preferences) && Object.values(value.preferences).every((item) => typeof item === "string")
    && isRecord(value.answers) && Object.values(value.answers).every(isAnswerValue)
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value)
    && (Object.getPrototypeOf(value) === Object.prototype || Object.getPrototypeOf(value) === null)
}

// Revalidate restored data against injected catalogue entities and its freshly
// computed plan. This does not access storage or repair invalid saved data.
export function validateRestoredState(
  state: SessionState, plan: JourneyPlan, preferences: readonly Preference[], steps: readonly Step[],
): ContractResult<true> {
  const invalid = () => failure("STORED_SESSION_INVALID", "PERSIST-LOAD", "Saved session is inconsistent with the catalogue")
  if (state.objectiveId !== plan.objectiveId) return invalid()
  if (Object.keys(state.preferences).length !== preferences.length) return invalid()
  for (const preference of preferences) {
    if (!Object.hasOwn(state.preferences, preference.id)
      || !(preference.valeurs ?? [preference.valeur]).includes(state.preferences[preference.id])) return invalid()
  }
  for (const [id, answer] of Object.entries(state.answers)) {
    if (!steps.some((step) => step.id === id && step.objectiveId === state.objectiveId)
      || getAnswerIssue(id, answer) !== null) return invalid()
  }
  const applicable = plan.steps.filter((step) => step.visible)
  if (applicable.length === 0) return state.activeStepId === null ? { ok: true, data: true, error: null } : invalid()
  if (!applicable.some((step) => step.stepId === state.activeStepId)) return invalid()
  return { ok: true, data: true, error: null }
}

export function getAnswerIssue(stepId: Id, answer: unknown): ValidationIssue | null {
  if (answer === undefined || answer === null || answer === "" || (Array.isArray(answer) && answer.length === 0)) {
    return { stepId, code: "ANSWER_REQUIRED", message: "An answer is required" }
  }
  if (!isAnswerValue(answer)) {
    return { stepId, code: "ANSWER_INVALID", message: "Answer must be a string or an array of strings" }
  }
  return null
}

export function validateAnswer(
  stepId: Id, answer: unknown, operation: "CMD-03" | "CMD-05" = "CMD-03",
): ContractResult<AnswerValue> {
  const issue = getAnswerIssue(stepId, answer)
  if (issue !== null) {
    return failure(issue.code, operation, issue.message, { stepId })
  }
  // The issue check also narrows the runtime shape; keep that guarantee explicit.
  if (!isAnswerValue(answer)) {
    return failure("ANSWER_INVALID", operation, "Invalid answer", { stepId })
  }
  return { ok: true, data: Array.isArray(answer) ? [...answer] : answer, error: null }
}

export function validatePreference(
  preferenceId: Id, value: unknown, preference: Preference | null,
): ContractResult<string> {
  if (preference === null) {
    return failure("PREFERENCE_NOT_FOUND", "CMD-02", `Unknown preference: ${preferenceId}`)
  }
  if (typeof value !== "string" || !(preference.valeurs ?? [preference.valeur]).includes(value)) {
    return failure("PREFERENCE_VALUE_INVALID", "CMD-02", `Undeclared value for preference: ${preferenceId}`)
  }
  return { ok: true, data: value, error: null }
}

export function validateRevisionStep(state: SessionState, stepId: Id, step: Step | null): ContractResult<true> {
  if (step === null) return failure("STEP_NOT_FOUND", "CMD-05", `Unknown step: ${stepId}`)
  if (step.objectiveId !== state.objectiveId) {
    return failure("STEP_NOT_IN_OBJECTIVE", "CMD-05", `Step ${stepId} belongs to another objective`)
  }
  return { ok: true, data: true, error: null }
}

// Error transport stays ContractResult (data: null). Consumers can derive local
// feedback without adding fields to ContractError or storing it in SessionState.
export function getValidationIssues(error: ContractError | null): ValidationIssue[] {
  if (error === null || (error.code !== "ANSWER_REQUIRED" && error.code !== "ANSWER_INVALID")
    || error.fields?.stepId === undefined) {
    return []
  }
  return [{ stepId: error.fields.stepId, code: error.code, message: error.message }]
}
