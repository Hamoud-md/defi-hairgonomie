import type { Id } from "../domain/models"

// Contrat de champs typé (cahier §10.2, décision H05) : configuration interne
// attachée aux IDs d'étapes, sans modifier `Step` ni ajouter de Backend.
// Les contrôles ne sont jamais déduits du titre d'une étape.
export interface ChoiceOption { readonly value: string; readonly label: string }

export interface ChoiceField {
  /** single : choix unique (boutons radio) ; confirm : confirmation explicite (case à cocher). */
  readonly kind: "single" | "confirm"
  readonly legend: string
  readonly options: readonly ChoiceOption[]
}

export type AnswerFields = Readonly<Record<Id, ChoiceField>>

export const demoAnswerFields: AnswerFields = {
  niveau: {
    kind: "single",
    legend: "Mon aisance numérique",
    options: [
      { value: "debutant", label: "Débutant — je découvre les outils numériques" },
      { value: "autonome", label: "Autonome — je me débrouille seul la plupart du temps" },
    ],
  },
  conseils: {
    kind: "confirm",
    legend: "Lecture des conseils",
    options: [{ value: "lus", label: "J'ai lu ces conseils" }],
  },
  support: {
    kind: "single",
    legend: "Appareil utilisé",
    options: [
      { value: "ordinateur", label: "Ordinateur" },
      { value: "mobile", label: "Mobile ou tablette" },
    ],
  },
  verification: {
    kind: "single",
    legend: "État de ma préparation",
    options: [
      { value: "pret", label: "Je suis prêt" },
      { value: "a_revoir", label: "Des points restent à revoir" },
    ],
  },
}

export const demoPreferenceLabels: Readonly<Record<Id, Readonly<Record<string, string>>>> = {
  accompagnement: {
    essentiel: "Essentiel — explications courtes",
    guide: "Guidé — conseils complémentaires",
  },
}
