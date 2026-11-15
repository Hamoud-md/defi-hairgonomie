export type Id = string

export type AnswerValue = string | string[]

export type RuleCondition =
  | { kind: "always" }
  | { kind: "preference_equals"; preferenceId: Id; value: string }
  | { kind: "all"; conditions: RuleCondition[] }
  | { kind: "any"; conditions: RuleCondition[] }
  | { kind: "not"; condition: RuleCondition }

export type RuleEffect =
  | { kind: "step_order"; order: number }
  | { kind: "step_visibility"; visible: boolean }

export interface Objective {
  id: Id
  titre: string
  description: string
}

export interface Step {
  id: Id
  objectiveId: Id
  ordre: number
  titre: string
  contenu: string
  requis: boolean
}

export interface Preference {
  id: Id
  valeur: string
  valeurs?: string[]
  description: string
}

export interface TransitionRule {
  id: Id
  condition: RuleCondition
  stepIds: Id[]
  effect: RuleEffect
  explication: string
}

export interface SessionState {
  objectiveId: Id | null
  preferences: Record<Id, string>
  activeStepId: Id | null
  answers: Record<Id, AnswerValue>
}

export interface PlannedStep {
  stepId: Id
  order: number
  required: boolean
  visible: boolean
}

export interface JourneyPlan {
  objectiveId: Id
  steps: PlannedStep[]
}

export interface Progress {
  current: number
  total: number
}

export interface ExplanationChange {
  kind: "step_order" | "step_visibility" | "answer_invalidated"
  targetId: Id
  before?: string | number | boolean
  after?: string | number | boolean
}

export interface Explanation {
  id: Id
  ruleId?: Id
  event: "preference_changed" | "answer_revised" | "answer_invalidated"
  reason: string
  changes: ExplanationChange[]
}

export interface ValidationIssue {
  stepId: Id
  field?: string
  code: "ANSWER_REQUIRED" | "ANSWER_INVALID"
  message: string
}

export interface InvalidatedAnswer {
  stepId: Id
  reason: string
}

export type ViewId = "goal-selection" | "journey" | "summary"

export interface ObjectiveView {
  objective: Objective
  selected: boolean
}

export interface PreferenceView {
  preference: Preference
  selectedValue: string
}

export interface SessionView {
  view: ViewId
  objective: Objective | null
  plan: JourneyPlan | null
  activeStep: Step | null
  progress: Progress | null
  preferences: PreferenceView[]
  answers: Record<Id, AnswerValue>
  explanations: Explanation[]
  issues: ValidationIssue[]
  status: "idle" | "in_progress" | "completed"
}

export interface DecisionView {
  step: Step
  answer: AnswerValue
}

export interface Summary {
  objective: Objective
  preferences: PreferenceView[]
  decisions: DecisionView[]
  explanations: Explanation[]
  completion: {
    completed: boolean
    requiredTotal: number
    requiredCompleted: number
  }
}

export type ErrorCode =
  | "CATALOG_INVALID"
  | "OBJECTIVE_REQUIRED"
  | "OBJECTIVE_NOT_FOUND"
  | "PREFERENCE_NOT_FOUND"
  | "PREFERENCE_VALUE_INVALID"
  | "STEP_NOT_FOUND"
  | "STEP_NOT_IN_OBJECTIVE"
  | "STEP_NOT_ACTIVE"
  | "SESSION_REQUIRED"
  | "ANSWER_REQUIRED"
  | "ANSWER_INVALID"
  | "FIRST_STEP"
  | "JOURNEY_INCOMPLETE"
  | "RULE_CONFLICT"
  | "REQUIRED_STEP_REMOVED"
  | "CONFIRMATION_REQUIRED"
  | "STORAGE_UNAVAILABLE"
  | "STORED_SESSION_INVALID"
  | "UNEXPECTED_ERROR"

export interface ContractError {
  code: ErrorCode
  message: string
  operation: OperationId
  fields?: Record<string, string>
}

export type ContractResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: ContractError }

export type OperationId =
  | "QRY-01"
  | "QRY-02"
  | "QRY-03"
  | "CMD-01"
  | "CMD-02"
  | "CMD-03"
  | "CMD-04"
  | "CMD-05"
  | "CMD-06"
  | "PERSIST-LOAD"
  | "PERSIST-SAVE"
  | "PERSIST-CLEAR"

export interface PersistedSession {
  schemaVersion: number
  state: SessionState
}

export interface SessionPersistence {
  load(): Promise<ContractResult<PersistedSession | null>>
  save(session: PersistedSession): Promise<ContractResult<void>>
  clear(): Promise<ContractResult<void>>
}

export interface JourneyCatalog {
  getObjectives(): readonly Objective[]
  getObjective(objectiveId: Id): Objective | null
  getSteps(objectiveId: Id): readonly Step[]
  getStep(stepId: Id): Step | null
  getPreferences(): readonly Preference[]
  getPreference(preferenceId: Id): Preference | null
  getRules(): readonly TransitionRule[]
}
