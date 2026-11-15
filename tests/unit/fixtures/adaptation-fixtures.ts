import type { CatalogContents } from "../../../src/domain/invariants"
import { sessionCatalog, sessionContents } from "./session-fixtures"

export function adaptationContents(): CatalogContents {
  const contents = sessionContents()
  return {
    ...contents,
    steps: contents.steps.map((step) => ({ ...step, titre: `technical-${step.id}` })),
    preferences: contents.preferences.map((preference) => preference.id === "preference-1"
      ? { ...preference, valeurs: ["value-1", "value-alt", "value-conflict", "value-required", "value-reorder"] }
      : preference),
    rules: [...contents.rules,
      { id: "rule-alt-hide", condition: { kind: "preference_equals", preferenceId: "preference-1", value: "value-alt" },
        stepIds: ["step-tail"], effect: { kind: "step_visibility", visible: false }, explication: "technical-hide-tail" },
      { id: "rule-reorder", condition: { kind: "preference_equals", preferenceId: "preference-1", value: "value-reorder" },
        stepIds: ["step-tail"], effect: { kind: "step_order", order: 0 }, explication: "technical-reorder-tail" },
      { id: "rule-conflict-1", condition: { kind: "preference_equals", preferenceId: "preference-1", value: "value-conflict" },
        stepIds: ["step-tail"], effect: { kind: "step_visibility", visible: true }, explication: "technical-conflict-1" },
      { id: "rule-conflict-2", condition: { kind: "preference_equals", preferenceId: "preference-1", value: "value-conflict" },
        stepIds: ["step-tail"], effect: { kind: "step_visibility", visible: false }, explication: "technical-conflict-2" },
      { id: "rule-required", condition: { kind: "preference_equals", preferenceId: "preference-1", value: "value-required" },
        stepIds: ["step-1"], effect: { kind: "step_visibility", visible: false }, explication: "technical-required" },
    ],
  }
}

export function adaptationCatalog() {
  return sessionCatalog(adaptationContents())
}
