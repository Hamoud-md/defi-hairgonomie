import type { ErrorCode } from "../domain/models"
import { getErrorMessage, getLanguage, translations } from "./i18n"
import type { CopyContent } from "./i18n"

export type { CopyContent }

export const copy: CopyContent = new Proxy(translations.fr, {
  get(_target, prop: string | symbol) {
    const current = translations[getLanguage()] ?? translations.fr
    const val = (current as unknown as Record<string | symbol, unknown>)[prop]
    return val !== undefined ? val : (translations.fr as unknown as Record<string | symbol, unknown>)[prop]
  },
})

export function errorMessage(code: string): string {
  return getErrorMessage(code)
}

export function isKnownErrorCode(code: string): code is ErrorCode {
  return Object.hasOwn(translations.fr, code) || [
    "CATALOG_INVALID", "OBJECTIVE_REQUIRED", "OBJECTIVE_NOT_FOUND", "PREFERENCE_NOT_FOUND",
    "PREFERENCE_VALUE_INVALID", "STEP_NOT_FOUND", "STEP_NOT_IN_OBJECTIVE", "STEP_NOT_ACTIVE",
    "SESSION_REQUIRED", "ANSWER_REQUIRED", "ANSWER_INVALID", "FIRST_STEP", "JOURNEY_INCOMPLETE",
    "RULE_CONFLICT", "REQUIRED_STEP_REMOVED", "CONFIRMATION_REQUIRED", "STORAGE_UNAVAILABLE",
    "STORED_SESSION_INVALID", "UNEXPECTED_ERROR",
  ].includes(code)
}

export function answerText(answer: string | string[]): string {
  return Array.isArray(answer) ? answer.join(" · ") : answer
}

// Presentation labels only: stored answers and preferences keep their declared values.
export interface Labels {
  step: (stepId: string) => string
  answer: (stepId: string, answer: string | string[]) => string
  preference: (preferenceId: string, value: string) => string
}

export const rawLabels: Labels = {
  step: () => "",
  answer: (_stepId, answer) => answerText(answer),
  preference: (_preferenceId, value) => value,
}
