import type { CatalogContents } from "../domain/invariants"

// Jeu de démonstration SYNTHÉTIQUE — cahier des charges v2.0 §10.1, scénario S01.
// Atelier fictif : aucun atelier réel, aucune inscription, aucune place ni
// recommandation officielle n'est affirmé. Contenu à faire approuver par l'équipe
// (décisions H03/H04) avant toute présentation comme contenu validé.
export const DEMO_OBJECTIVE_ID = "atelier-preparation"

export const demoCatalogContents: CatalogContents = {
  objectives: [
    {
      id: DEMO_OBJECTIVE_ID,
      titre: "Préparer ma participation à un atelier numérique",
      description: "Organiser les informations utiles avant un atelier fictif de découverte numérique.",
    },
  ],
  steps: [
    {
      id: "niveau",
      objectiveId: DEMO_OBJECTIVE_ID,
      ordre: 10,
      titre: "Mon niveau",
      contenu: "Choisissez votre aisance numérique actuelle. Elle sert uniquement à rédiger votre synthèse ; vous pourrez la corriger à tout moment.",
      requis: true,
    },
    {
      id: "conseils",
      objectiveId: DEMO_OBJECTIVE_ID,
      ordre: 20,
      titre: "Conseils complémentaires",
      contenu: "Indications générales fictives : si vous débutez, notez à l'avance vos questions et prévoyez quelques minutes pour vous installer ; si vous êtes autonome, vérifiez simplement que votre appareil est chargé et à jour. Étape facultative, visible en accompagnement « guidé ».",
      requis: false,
    },
    {
      id: "support",
      objectiveId: DEMO_OBJECTIVE_ID,
      ordre: 30,
      titre: "Mon support de travail",
      contenu: "Indiquez l'appareil que vous comptez utiliser pendant l'atelier.",
      requis: true,
    },
    {
      id: "verification",
      objectiveId: DEMO_OBJECTIVE_ID,
      ordre: 40,
      titre: "Ma checklist",
      contenu: "Vérifiez la préparation de base : appareil chargé, identifiants nécessaires à portée de main, questions éventuelles notées.",
      requis: true,
    },
  ],
  preferences: [
    {
      id: "accompagnement",
      valeur: "essentiel",
      valeurs: ["essentiel", "guide"],
      description: "Quantité d'explications souhaitée",
    },
  ],
  rules: [
    {
      id: "masquer-conseils-en-mode-essentiel",
      condition: { kind: "preference_equals", preferenceId: "accompagnement", value: "essentiel" },
      stepIds: ["conseils"],
      effect: { kind: "step_visibility", visible: false },
      explication: "Vous avez choisi le parcours essentiel : les conseils complémentaires sont masqués, mais toutes les étapes nécessaires restent disponibles.",
    },
    // Complément documenté (écart mineur au §10.1, au service de F05/A03) : sans
    // cette règle, le retour en mode guidé n'aurait pour explication que le titre
    // de l'étape. Conditions mutuellement exclusives ; aucun requis n'est ciblé.
    {
      id: "afficher-conseils-en-mode-guide",
      condition: { kind: "preference_equals", preferenceId: "accompagnement", value: "guide" },
      stepIds: ["conseils"],
      effect: { kind: "step_visibility", visible: true },
      explication: "Vous avez choisi le parcours guidé : l'étape facultative « Conseils complémentaires » est ajoutée au parcours, juste après « Mon niveau ». Toutes vos réponses sont conservées.",
    },
  ],
}
