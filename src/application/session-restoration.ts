import type { ContractResult, InvalidatedAnswer, JourneyCatalog, SessionState } from "../domain/models"
import { buildPlan } from "../domain/journey-engine"
import { copyState, findInvalidatedAnswers } from "../domain/session"
import { failure, isSessionState, validateRestoredState } from "../domain/validation"

export function restoreSession(
  state: unknown, catalog: JourneyCatalog,
): ContractResult<{ state: SessionState; invalidatedAnswers: InvalidatedAnswer[] }> {
  const invalid = () => failure("STORED_SESSION_INVALID", "PERSIST-LOAD", "Saved session is not compatible with the catalogue")
  if (!isSessionState(state)) return invalid()
  if (state.objectiveId === null) {
    if (state.activeStepId !== null || Object.keys(state.answers).length > 0 || Object.keys(state.preferences).length > 0) return invalid()
    return { ok: true, data: { state: copyState(state), invalidatedAnswers: [] }, error: null }
  }
  const plan = buildPlan(state.objectiveId, state.preferences, catalog, "PERSIST-LOAD")
  if (!plan.ok) return invalid()
  const validation = validateRestoredState(state, plan.data, catalog.getPreferences(), catalog.getSteps(state.objectiveId))
  if (!validation.ok) return validation
  const labels = Object.fromEntries(catalog.getSteps(state.objectiveId).map((step) => [step.id, step.titre]))
  return { ok: true, data: {
    state: copyState(state), invalidatedAnswers: findInvalidatedAnswers(state, plan.data, labels),
  }, error: null }
}
