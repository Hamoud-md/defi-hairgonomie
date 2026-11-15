# Le Chemin Vivant — Plan Backend (cœur local)

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version :** 1.0  
**Statut :** Phase 3 — Plan de réalisation du cœur applicatif local  
**Documents de référence :** `cahier_charge.md`, `new files/architecture.md`, `new files/api-contract.md`

> **Décision préalable :** Le Chemin Vivant **n'a pas de backend serveur**. Le cahier des charges n'exige ni backend, ni base de données, ni API externe, ni authentification, ni administration dans le MVP. Le présent document planifie donc le **cœur local** qui assume les responsabilités habituellement dévolues à un backend : domaine, règles, validation, état de session, accès au catalogue et persistance facultative.
>
> Ce document ne crée aucun serveur, aucune route HTTP, aucune base de données et aucun service externe. Il applique les décisions de `architecture.md` (AD01, AD02, AD05) et le contrat de `api-contract.md` (QRY-01 à CMD-06, PERSIST-*).

---

## Table des matières

1. Objet et sources
2. Périmètre et non-objectifs
3. Responsabilités et frontières
4. Correspondance avec les préoccupations « backend »
5. Modules et structure
6. Modèles et accès aux données
7. Logique métier
8. Correspondance avec le contrat d'interface
9. Plan d'implémentation incrémental
10. Stratégie de tests
11. Definition of Done
12. Compatibilité contractuelle et handoff
13. Risques et mitigations
14. Hypothèses et questions ouvertes
15. Traçabilité
16. Règles de non-invention du contenu

---

## 1. Objet et sources

### 1.1 Objet

Ce plan permet à un développeur ou à un AI Agent de construire, étape par étape, le **cœur fonctionnel local** du projet :

- modèles et types ;
- catalogue local en lecture seule ;
- moteur de parcours déterministe ;
- évaluateur de règles de transition ;
- validation ;
- état de session et transitions ;
- invalidation contrôlée des réponses ;
- explications ;
- synthèse et complétion ;
- persistance locale facultative ;
- tests unitaires et d'intégration du domaine.

Le plan ne couvre pas la présentation détaillée, les composants UI, les styles ou le déploiement, qui relèvent des Phases 4, 5 et 6.

### 1.2 Hiérarchie des sources

En cas de conflit :

1. `cahier_charge.md` — structure, exigences, contraintes.
2. `ressources/` — contenu réel (absent à la date de rédaction).
3. `new files/architecture.md` — décisions architecturales.
4. `new files/api-contract.md` — formes et opérations.
5. `fichiers principales/backend-plan.md` — méthodologie uniquement.

Aucun contenu, rôle, règle métier, entité ou technologie du projet précédent n'est repris.

---

## 2. Périmètre et non-objectifs

### 2.1 Dans le périmètre

- Le domaine pur, sans dépendance à React, au DOM ou au stockage.
- La couche application locale exposant les opérations `QRY-*` et `CMD-*`.
- L'accès en lecture au catalogue de démonstration.
- La validation structurelle et les invariants.
- La persistance locale facultative derrière un adaptateur.
- Les tests du cœur local.

### 2.2 Hors périmètre

| Élément | Décision | Référence |
|---|---|---|
| Backend HTTP | Aucun | Cahier section 8 ; architecture AD01 |
| Base de données | Aucune | Cahier section 8 ; architecture AD01 |
| ORM / migrations | Aucun | Aucun stockage serveur |
| Authentification | Aucune | Cahier section 2 |
| Rôles / RBAC | Aucun | Cahier section 2 |
| API externe | Aucune | Cahier section 9 |
| IA générative / chatbot | Aucun | Cahier section 2 |
| Notifications | Aucune | Aucun service requis |
| Tâches planifiées | Aucune | Aucun serveur ni temps réel |
| Upload de fichiers | Aucun | Aucun document à téléverser |
| Paiements | Aucun | Cahier section 2 |
| Administration | Aucune | Cahier section 2 |
| 3D / gamification | Aucune | Cahier section 2 |
| Analytics tiers | Aucun | N09, confidentialité |

---

## 3. Responsabilités et frontières

### 3.1 Ce que ce plan possède

- `src/domain/**`
- `src/application/**`
- `src/data/**`
- `src/platform/persistence.ts`
- `tests/unit/**` pour le domaine et l'application

### 3.2 Ce que ce plan ne possède pas

- `src/views/**`, `src/ui/**`, `src/app/**` : Phase 4.
- `src/platform/navigation.ts` : Phase 4.
- Déploiement, environnements et CI : Phase 5.
- Orchestration globale des phases : Phase 6.
- Workflow des agents : Phase 7.
- Contenu de démonstration réel : `ressources/`, actuellement absent.

### 3.3 Règles de dépendance

```
application  →  domain  →  (modèles)
     │             ▲
     │             │
     └──────────► data (lecture seule)
     │
     └──────────► platform/persistence (adaptateur facultatif)

Le domaine ne dépend ni de React, ni du DOM, ni de `localStorage`, ni du réseau, ni de l'horloge, ni du routeur.
```

- Les règles métier restent dans `domain`.
- L'orchestration reste dans `application`.
- Les données restent déclaratives et sans logique.
- La persistance est un adaptateur remplaçable.
- Aucun appel réseau n'est autorisé.

---

## 4. Correspondance avec les préoccupations « backend »

| Préoccupation | Décision pour Le Chemin Vivant | Justification |
|---|---|---|
| **Modules** | Modules de domaine, application, données et persistance | Architecture section 6 |
| **Services** | `journey-engine`, `rule-evaluator`, `validation`, `explanation`, `session`, `invariants` | Responsabilités séparées |
| **Controllers** | `session-controller` mince : traduit les commandes CMD en appels de domaine ; les lectures QRY passent par `selectors` | Aucune logique métier dans l'orchestration |
| **Routes** | Aucune route HTTP ; vues logiques E01–E03 gérées côté présentation | Cahier section 5 ; contrat section 9 |
| **Business logic** | Plan déterministe, adaptation, invalidation, complétion | F02–F10 |
| **Data access** | `JourneyCatalog` local en lecture seule ; session en mémoire | Pas de base de données |
| **Models** | `Objective`, `Step`, `Preference`, `TransitionRule`, `SessionState`, `Explanation` | Cahier section 9 ; contrat section 5 |
| **Validation** | Validation structurelle locale et invariants | F01, F04, F07, F08 |
| **Authentication** | Aucune | Hors périmètre |
| **Authorization** | Aucune permission par rôle | Aucun rôle serveur |
| **Permissions** | Aucune permission ; seules des gardes de progression fonctionnelles | F01, F06, F08, F09 |
| **Background jobs** | Aucun | Aucune tâche différée nécessaire |
| **Events** | Aucun bus d'événements ; retours synchrones des commandes | Complexité injustifiée |
| **Notifications** | Aucune | Hors périmètre |
| **Integrations** | Aucune | Aucune API externe |
| **File handling** | Aucun | Aucun fichier utilisateur |
| **Caching** | Aucun cache persistant ; une mémoïsation locale sans effet sémantique est tolérée | Catalogue local de démonstration |
| **Logging** | Diagnostics de développement uniquement, sans données personnelles | N09 ; pas de télémétrie |
| **Error handling** | `ContractResult`, codes d'erreur du contrat, atomicité | Contrat sections 5–6 |
| **Security** | Pas de secrets, pas de données personnelles, pas de contenu injecté | N09 ; architecture section 17 |
| **Testing** | Tests unitaires et d'intégration du domaine avec Vitest | Architecture section 18 ; cahier section 8 |

---

## 5. Modules et structure

### 5.1 Arborescence cible

```
src/
├── domain/
│   ├── models.ts
│   ├── rule-evaluator.ts
│   ├── journey-engine.ts
│   ├── validation.ts
│   ├── explanation.ts
│   ├── session.ts
│   └── invariants.ts
├── application/
│   ├── session-controller.ts
│   └── selectors.ts
├── data/
│   ├── catalog.ts
│   └── demo-data.ts
└── platform/
    └── persistence.ts
tests/
└── unit/
    ├── domain/
    └── application/
```

Les dossiers `views`, `ui`, `app`, `platform/navigation` et `tests/e2e` existent dans l'architecture mais sont planifiés en Phase 4.

### 5.2 Responsabilités détaillées

| Module | Responsabilité | Ne fait pas | Dépend de |
|---|---|---|---|
| `domain/models.ts` | Types, DTOs, structures dérivées, codes d'erreur | Aucune logique d'affichage | Aucun |
| `domain/rule-evaluator.ts` | Évalue les règles dans un ordre stable | Ne décide pas de l'UI | `models` |
| `domain/journey-engine.ts` | Produit le plan, applique les préférences, recalcule | Aucun accès DOM/stockage | `rule-evaluator`, `invariants`, `models` |
| `domain/validation.ts` | Valide objectif, préférence, étape, réponse | N'efface aucune autre réponse | `models` |
| `domain/explanation.ts` | Produit les explications par diff réel | Ne fabrique pas de contenu métier | `models` |
| `domain/session.ts` | Transitions immuables, progression, invalidation | Ne lit pas le catalogue directement | `models` |
| `domain/invariants.ts` | Vérifie les invariants bloquants et l'intégrité du catalogue | Ne corrige pas silencieusement, ne charge pas les données | `models` |
| `application/session-controller.ts` | Expose les commandes CMD, coordonne domaine et persistance | Ne contient aucune règle métier, ne porte pas les lectures | Domaine, `platform/persistence` |
| `application/selectors.ts` | Expose les lectures QRY, dérive `SessionView`, `Summary`, progression | N'écrit pas d'état | Domaine (catalogue injecté), `journey-engine` |
| `data/catalog.ts` | Fournit un `JourneyCatalog` en lecture seule | Aucune mutation, aucun réseau | `models` |
| `data/demo-data.ts` | Emplacement du jeu synthétique | Aucun contenu inventé sans `ressources/` | `models` |
| `platform/persistence.ts` | Sauvegarde/reprise locale facultative | Ne valide pas les règles | `models` |

### 5.3 Règles de qualité

- Chaque module expose une API explicite et typée.
- Aucune fonction de domaine ne dépend de l'heure ou du hasard.
- Aucune mutation d'entrée.
- Les erreurs sont retournées, jamais avalées.
- Les invariants sont vérifiés avant qu'un résultat ne quitte le domaine.
- Les textes destinés à l'utilisateur proviennent du catalogue, jamais du code.

---

## 6. Modèles et accès aux données

### 6.1 Modèles

Les modèles sont ceux du contrat d'interface, section 5 :

- `Objective`, `Step`, `Preference`, `TransitionRule`, `RuleCondition` ;
- `SessionState`, `AnswerValue` ;
- `JourneyPlan`, `PlannedStep`, `Progress` ;
- `Explanation`, `ExplanationChange`, `InvalidatedAnswer`, `ValidationIssue` ;
- `SessionView`, `Summary`, `DecisionView`, `ObjectiveView`, `PreferenceView` ;
- `ContractResult`, `ContractError`, `ErrorCode`, `OperationId` ;
- `PersistedSession` (contrat de persistance, section 10).

**Aucun champ métier supplémentaire n'est inventé.** Les champs de contenu (`titre`, `description`, `contenu`, `explication`) restent vides tant que `ressources/` n'est pas fourni.

### 6.2 Catalogue

`JourneyCatalog` est l'unique porte d'entrée des données :

```ts
interface JourneyCatalog {
  getObjectives(): readonly Objective[]
  getObjective(objectiveId: Id): Objective | null
  getSteps(objectiveId: Id): readonly Step[]
  getStep(stepId: Id): Step | null
  getPreferences(): readonly Preference[]
  getPreference(preferenceId: Id): Preference | null
  getRules(): readonly TransitionRule[]
}
```

Caractéristiques :

- lecture seule ;
- locale ;
- chargée sans réseau ;
- validée au démarrage ;
- jamais dupliquée dans la sauvegarde de session.

### 6.3 Accès aux données

| Donnée | Stockage | Durée de vie | Accès |
|---|---|---|---|
| Catalogue | Module local statique | Toute la session applicative | Lecture seule |
| `SessionState` | Mémoire applicative | Session courante | Lecture/écriture via commandes |
| Sauvegarde | `localStorage` facultatif | Entre deux ouvertures | Adaptateur isolé |
| Diagnostics | Console de développement | Éphémère | Développement uniquement |

**Aucune base de données, aucun ORM, aucune migration, aucun index serveur.**

### 6.4 Intégrité du catalogue

La validation du catalogue, dans `domain/invariants.ts`, vérifie :

1. identifiants uniques par type ;
2. `Step.objectiveId` existant ;
3. `TransitionRule.stepIds` existants ;
4. condition ne référençant que des entités et valeurs déclarées ;
5. aucune règle ne supprimant une étape requise ;
6. aucune étape orpheline ;
7. chaque `Preference` possède une valeur déclarée non vide ;
8. cohérence des ordres.

En cas d'échec : `CATALOG_INVALID`, aucun parcours partiel.

---

## 7. Logique métier

### 7.1 Construction du plan

Entrées : objectif, préférences, catalogue.

Étapes :

1. Vérifier le catalogue.
2. Charger l'objectif et ses étapes.
3. Trier les étapes par `ordre`, puis `id`.
4. Identifier les étapes requises.
5. Appliquer les règles de transition éligibles dans l'ordre `id` croissant.
6. Autoriser uniquement les effets prévus par le contrat : ordre et visibilité d'une étape non requise.
7. Vérifier que toutes les étapes requises sont présentes et visibles.
8. Si une étape requise manque : `REQUIRED_STEP_REMOVED`, aucun plan partiel.
9. Comparer avec le plan précédent.
10. Produire les explications des changements réels.
11. Retourner un nouveau `JourneyPlan`.

Invariants :

- aucune étape requise supprimée ou masquée ;
- aucun mélange d'étapes de plusieurs objectifs ;
- ordre stable et déterministe ;
- aucune mutation de l'état d'entrée.

### 7.2 Évaluation des règles

- Évaluation triée par `id` croissant.
- Condition pure et déterministe.
- Les effets sont collectés puis confrontés aux invariants.
- Un conflit d'ordre ou de visibilité incompatible produit `RULE_CONFLICT`.
- Une règle invalide produit `CATALOG_INVALID`.
- Aucune règle ne peut court-circuiter la validation d'une étape.
- Aucune règle ne peut retirer une étape requise.
- Une règle qui ne produit aucun changement ne génère aucune explication.

### 7.3 Session et transitions

| Transition | Entrée | Sortie | Erreurs |
|---|---|---|---|
| Initialiser | `objectiveId` | Nouvelle session, plan, explications éventuelles | `OBJECTIVE_REQUIRED`, `OBJECTIVE_NOT_FOUND`, `CATALOG_INVALID`, `RULE_CONFLICT` |
| Modifier préférence | `preferenceId`, valeur | Nouvelle session, plan, explications, invalidations | `SESSION_REQUIRED`, `PREFERENCE_NOT_FOUND`, `PREFERENCE_VALUE_INVALID`, `CATALOG_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` |
| Valider et avancer | `stepId`, réponse | Nouvelle session, `issues`, progression, complétion, `nextStepId` | `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `STEP_NOT_ACTIVE`, `ANSWER_REQUIRED`, `ANSWER_INVALID` |
| Revenir | — | Étape antérieure, progression | `SESSION_REQUIRED`, `FIRST_STEP`, `STEP_NOT_FOUND`, `OBJECTIVE_REQUIRED` |
| Réviser | `stepId`, réponse | Nouvelle session, plan, invalidations, `issues` | `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `ANSWER_REQUIRED`, `ANSWER_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` |
| Réinitialiser | confirmation | Session vierge | `SESSION_REQUIRED`, `CONFIRMATION_REQUIRED` |

Règles :

- Toute transition retourne un nouvel état ; l'ancien reste intact.
- En cas d'erreur, l'état n'est pas modifié.
- Les réponses valides non concernées sont conservées.
- Les réponses invalidées sont listées, conservées et signalées.
- Le retour ne supprime aucune réponse.
- La réinitialisation est explicite et confirmée.

### 7.4 Progression et complétion

- `Progress.current` : position 1-based de l'étape active dans le plan.
- `Progress.total` : nombre d'étapes du plan.
- `completed` : vrai uniquement si toutes les étapes requises sont validées.
- Une progression invalide ne produit jamais un indice hors bornes.
- La synthèse refuse un parcours incomplet avec `JOURNEY_INCOMPLETE`.

### 7.5 Validation

Règles minimales, sans inventer de contraintes métier :

| Règle | Source | Erreur |
|---|---|---|
| Objectif sélectionné | F01 | `OBJECTIVE_REQUIRED` |
| Objectif existant | F01 | `OBJECTIVE_NOT_FOUND` |
| Préférence existante et valeur déclarée | F04 | `PREFERENCE_NOT_FOUND`, `PREFERENCE_VALUE_INVALID` |
| Étape existante | F07/F08 | `STEP_NOT_FOUND` |
| Étape de l'objectif actif | F07/F08 | `STEP_NOT_IN_OBJECTIVE` |
| Étape active pour avancer | F08 | `STEP_NOT_ACTIVE` |
| Réponse requise non vide | F08 | `ANSWER_REQUIRED` |
| Réponse conforme aux options déclarées | F08 | `ANSWER_INVALID` |
| Retour interdit depuis la première étape | F06 | `FIRST_STEP` |
| Synthèse seulement si requis validés | F09 | `JOURNEY_INCOMPLETE` |
| État restauré cohérent | F11 | `STORED_SESSION_INVALID` |

**Aucune validation de longueur, de format ou de liste de valeurs métier n'est définie avant la fourniture du contenu.**

### 7.6 Explications

- Une explication est produite uniquement pour un changement réel.
- La raison provient de `TransitionRule.explication` ou d'un libellé du catalogue.
- Les changements sont calculés par comparaison avant/après.
- Les explications sont ordonnées de façon stable.
- Aucun texte métier n'est fabriqué par le moteur.
- Une adaptation sans changement n'est jamais annoncée.

### 7.7 Synthèse

La synthèse est dérivée, jamais stockée :

- objectif ;
- préférences sélectionnées ;
- décisions (étape + réponse) ;
- explications significatives ;
- compteurs de complétion (`requiredTotal`, `requiredCompleted`) ;
- indicateur `completed`.

Une synthèse ne peut être produite si une étape requise manque.

### 7.8 Persistance facultative

- `load()` : retourne un `ContractResult` contenant `null` si absent ; valide la version et la cohérence de `PersistedSession` ; sinon `STORED_SESSION_INVALID`.
- `save()` : best effort, jamais bloquant.
- `clear()` : efface la sauvegarde sans bloquer la réinitialisation.
- `STORAGE_UNAVAILABLE` ne bloque jamais le parcours.
- Aucune donnée personnelle réelle.
- Le catalogue n'est pas dupliqué.

---

## 8. Correspondance avec le contrat d'interface

| Opération | Point d'entrée | Modules impliqués | Écrit |
|---|---|---|---|
| `QRY-01` | `getObjectives()` | `data/catalog`, `selectors` | Non |
| `QRY-02` | `getSessionView()` | `selectors`, `journey-engine` | Non |
| `QRY-03` | `getSummary()` | `selectors`, `session` | Non |
| `CMD-01` | `selectObjective()` | `validation`, `journey-engine`, `session` | Oui |
| `CMD-02` | `updatePreference()` | `validation`, `journey-engine`, `explanation`, `session` | Oui |
| `CMD-03` | `validateStep()` | `validation`, `session` | Oui |
| `CMD-04` | `goBack()` | `session` | Oui |
| `CMD-05` | `reviseAnswer()` | `validation`, `journey-engine`, `explanation`, `session` | Oui |
| `CMD-06` | `restart()` | `session`, `persistence` | Oui |
| `PERSIST-LOAD` | `load()` | `platform/persistence` | Non |
| `PERSIST-SAVE` | `save()` | `platform/persistence` | Oui (stockage) |
| `PERSIST-CLEAR` | `clear()` | `platform/persistence` | Oui (stockage) |

**Règle de compatibilité :** les identifiants d'opérations (`QRY-*`, `CMD-*`, `PERSIST-*`) suivent `api-contract.md` ; les noms de fonctions locaux de la colonne « Point d'entrée » sont indicatifs. Les lectures `QRY-*` sont portées par `selectors`, les commandes `CMD-*` par `session-controller`. Aucune opération, aucun type, aucun code d'erreur ne peut diverger du contrat sans mise à jour documentée de `api-contract.md` et nouvelle vérification.

---

## 9. Plan d'implémentation incrémental

L'ordre ci-dessous est obligatoire : chaque étape ne commence que lorsque la précédente est terminée et testée.

### Étape 0 — Fondations et gel du contrat

**Objectif :** préparer les types et l'ossature sans logique métier.

**Tâches :**

- Lire `cahier_charge.md`, `architecture.md`, `api-contract.md`.
- Créer `domain/models.ts` avec les types du contrat.
- Créer les types `ContractResult`, `ContractError`, `ErrorCode`, `OperationId`, `PersistedSession`.
- Créer les interfaces `JourneyCatalog` et `SessionPersistence`.
- Configurer Vitest.
- Créer des fixtures neutres pour les tests (identifiants techniques, aucun contenu de démonstration).

**Dépendances :** aucune.

**Sortie :** types compilables, aucun comportement.

**Critères de fin :**

- `npm run typecheck` passe.
- Les types correspondent à `api-contract.md`.
- Aucun contenu métier inventé.

### Étape 1 — Catalogue local et intégrité

**Objectif :** garantir que le catalogue est cohérent avant toute utilisation.

**Tâches :**

- Implémenter `data/catalog.ts`.
- Implémenter la validation d'intégrité dans `domain/invariants.ts`.
- Créer `data/demo-data.ts` comme emplacement vide tant que `ressources/` est absent.
- Écrire les tests d'intégrité : doublons, étapes orphelines, règles invalides, valeurs inconnues.

**Dépendances :** étape 0.

**Sortie :** catalogue lisible et validé.

**Critères de fin :**

- Un catalogue invalide retourne `CATALOG_INVALID`.
- Aucune donnée n'est chargée par réseau.
- Les tests d'intégrité passent.
- `ressources/` absent est documenté, pas contourné.

### Étape 2 — Plan de base

**Objectif :** produire un plan déterministe sans règles.

**Tâches :**

- Implémenter `journey-engine.buildBasePlan(objectiveId)`.
- Trier par `ordre` puis `id`.
- Isoler les étapes de l'objectif.
- Garantir la présence des étapes requises.
- Compléter les invariants de plan (étapes requises, isolation par objectif).

**Dépendances :** étapes 0–1.

**Sortie :** `JourneyPlan` de base.

**Critères de fin :**

- Aucune étape requise manquante.
- Aucun mélange d'objectifs.
- Ordre identique à chaque exécution.
- Tests de non-régression sur A08.

### Étape 3 — Règles et adaptation

**Objectif :** appliquer les préférences et produire les adaptations.

**Tâches :**

- Implémenter `rule-evaluator.ts`.
- Évaluer les règles par `id` croissant.
- Appliquer les effets autorisés.
- Détecter `RULE_CONFLICT` et `REQUIRED_STEP_REMOVED`.
- Générer les changements avant/après.

**Dépendances :** étape 2.

**Sortie :** plan adapté et ensemble de changements.

**Critères de fin :**

- Aucune étape requise supprimée ou masquée.
- Même entrée ⇒ même plan.
- Conflit signalé, jamais masqué.
- Tests F04 et A08.

### Étape 4 — Explications

**Objectif :** expliquer uniquement les changements réels.

**Tâches :**

- Implémenter `explanation.ts`.
- Comparer ancien et nouveau plan.
- Produire `Explanation` avec raison issue du catalogue.
- Supprimer toute explication sans changement.
- Ordonner les explications de façon stable.

**Dépendances :** étape 3.

**Sortie :** explications testables.

**Critères de fin :**

- Aucun texte métier fabriqué.
- Aucune explication fictive.
- Tests F05, A04.

### Étape 5 — Session, validation et progression

**Objectif :** permettre un parcours complet.

**Tâches :**

- Implémenter `session.ts` et `validation.ts`.
- Initialiser une session (`CMD-01`).
- Valider et avancer (`CMD-03`).
- Calculer progression et complétion.
- Conserver l'état en cas d'erreur.

**Dépendances :** étapes 0–4 (les explications sont nécessaires aux sorties de `CMD-01`).

**Sortie :** parcours E01 → E02 utilisable au niveau domaine, jusqu'à la complétion.

**Critères de fin :**

- Tous les codes d'erreur de validation sont testés.
- Aucune perte de réponse.
- `completed` n'est vrai que si toutes les étapes requises sont validées.
- Tests F01, F03, F08, A01, A06.

### Étape 6 — Retour, révision, préférence et invalidation

**Objectif :** garantir la réversibilité et la conservation contrôlée des réponses.

**Tâches :**

- Implémenter `CMD-04`.
- Implémenter `CMD-05`.
- Implémenter `CMD-02` avec recalcul, explications et invalidations.
- Conserver les réponses valides.
- Lister les réponses invalidées avec raison.
- Recalculer le plan et les explications.

**Dépendances :** étapes 3–5.

**Sortie :** transitions réversibles et modifications de préférence maîtrisées.

**Critères de fin :**

- Retour sans perte silencieuse.
- Aucune étape inexistante.
- Réponses invalidées conservées et signalées.
- Tests F04, F06, F07, A03, A05.

### Étape 7 — Synthèse, redémarrage et sélecteurs

**Objectif :** produire les vues de lecture finales.

**Tâches :**

- Implémenter `selectors.ts` : `ObjectiveView[]`, `SessionView`, `Summary`.
- Refuser une synthèse incomplète.
- Implémenter `CMD-06` avec confirmation.
- Réinitialiser intégralement la session.

**Dépendances :** étapes 4–6.

**Sortie :** `SessionView` et `Summary` conformes, synthèse E03 alimentée.

**Critères de fin :**

- Synthèse fidèle, aucune complétion incorrecte.
- Session vierge sans résidu.
- Tests F09, F10, A07.

### Étape 8 — Persistance facultative

**Objectif :** permettre la reprise sans dépendance obligatoire.

**Tâches :**

- Implémenter `platform/persistence.ts`.
- Valider le schéma et la version.
- Gérer absence, corruption, indisponibilité.
- Brancher `clear()` sur la réinitialisation (`CMD-06`) sans bloquer celle-ci.
- Ne jamais bloquer une commande métier.

**Dépendances :** étapes 5–7.

**Sortie :** sauvegarde/reprise optionnelle.

**Critères de fin :**

- L'application fonctionne sans stockage.
- Une sauvegarde corrompue démarre une session neuve.
- Aucune donnée personnelle.
- Tests F11.

### Étape 9 — Durcissement et handoff

**Objectif :** stabiliser le cœur avant la Phase 4.

**Tâches :**

- Vérifier déterminisme sur plusieurs exécutions.
- Vérifier l'atomicité des erreurs.
- Vérifier l'absence de dépendance UI/réseau dans le domaine.
- Exécuter lint, typecheck, tests et build.
- Produire une note de handoff : types, opérations, codes d'erreur, fixtures, limites.

**Dépendances :** étapes 0–8.

**Sortie :** cœur local prêt pour l'intégration UI.

**Critères de fin :**

- Definition of Done satisfaite.
- Aucune violation du contrat.
- Aucune fonctionnalité hors périmètre.

---

## 10. Stratégie de tests

### 10.1 Tests unitaires du domaine

| Sujet | Cas couverts | Traces |
|---|---|---|
| Plan de base | Ordre stable, étapes requises, isolation par objectif | F02, A08 |
| Règles | Application, ordre, conflits, valeurs inconnues | F04, F05 |
| Invariants | Étape requise absente/masquée, IDs incohérents | A08 |
| Explications | Changement réel, aucun changement, ordre stable | F05, A04 |
| Validation | Tous les codes V01–V12 | F01–F09 |
| Session | Initialisation, avance, retour, révision, reset | F01, F06, F07, F10 |
| Invalidation | Conservation des réponses valides, liste des invalides | F07, A05 |
| Complétion | Requis validés vs incomplets | F09 |
| Synthèse | Fidélité, refus si incomplet | F09, A07 |
| Persistance | Absent, corrompu, version inconnue, indisponible | F11 |
| Déterminisme | Répétition avec mêmes entrées | F02 |

### 10.2 Tests d'intégration sans DOM

Séquences à tester :

1. `CMD-01` → `CMD-03` (toutes les étapes) → `QRY-03` (A01).
2. `CMD-01` → `CMD-02` → `QRY-02` avec explication (A03, A04).
3. `CMD-01` → `CMD-03` → `CMD-04` (A05).
4. `CMD-01` → réponses → `CMD-05` (A05).
5. `CMD-03` avec réponse invalide → correction → progression (A06).
6. `QRY-03` avant complétion → `JOURNEY_INCOMPLETE` (F09).
7. `CMD-06` avec et sans confirmation (F10).
8. Persistance : sauvegarde → rechargement → reprise (F11).

### 10.3 Ce qui n'est pas testé ici

- Rendu visuel, responsiveness, clavier : Phase 4.
- E2E navigateur : Phase 4 avec Playwright.
- Déploiement : Phase 5.

### 10.4 Règles de test

- Aucune dépendance réseau.
- Aucune attente temporelle.
- Fixtures minimales et neutres.
- Aucun contenu métier inventé présenté comme démonstration.
- Chaque code d'erreur du contrat a au moins un test.
- Chaque invariant bloquant a un test de non-régression.

---

## 11. Definition of Done

Une étape n'est terminée que si :

1. l'opération ou le module existe dans le contrat ou l'architecture ;
2. les types correspondent exactement à `api-contract.md` ;
3. les erreurs utilisent les codes documentés ;
4. les invariants sont vérifiés et testés ;
5. les tests unitaires concernés passent ;
6. `npm run lint` passe ;
7. `npm run typecheck` passe ;
8. `npm run build` passe ;
9. aucune dépendance UI, réseau ou stockage n'a pénétré le domaine ;
10. aucun contenu métier n'a été inventé ;
11. aucun endpoint serveur, backend ou base de données n'a été introduit ;
12. le handoff de l'étape est rédigé.

---

## 12. Compatibilité contractuelle et handoff

### 12.1 Compatibilité

- Les noms d'opérations et les formes de résultats suivent `api-contract.md`.
- Toute divergence doit être corrigée ou documentée avant de continuer.
- Un changement de type ou de code d'erreur exige une mise à jour préalable du contrat.
- Aucun champ de contenu ne peut être ajouté sans source dans `ressources/`.
- Le contrat ne peut pas être contourné par une logique cachée dans l'UI.

### 12.2 Handoff vers la Phase 4 (Frontend)

Pour chaque étape livrée, fournir :

- les types exportés ;
- les opérations disponibles ;
- les codes d'erreur ;
- un exemple de résultat avec des valeurs de remplissage neutres ;
- les fixtures de test ;
- les limites connues ;
- la liste des points restés ouverts.

**Interdit :** fournir des données de démonstration non issues de `ressources/` comme si elles étaient définitives.

---

## 13. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| `ressources/` absent | Élevé | Types et moteur agnostiques ; contenu en Open Question ; aucun contenu inventé |
| Domaine métier inconnu (H02) | Élevé | Aucune règle métier inventée ; champs génériques |
| Règle supprimant une étape requise | Élevé | Invariant bloquant + tests A08 |
| Explications fictives | Élevé | Génération par diff réel uniquement |
| Perte de réponses au retour | Élevé | État immuable + tests de non-régression |
| Conflit de règles | Moyen | Ordre déterministe + `RULE_CONFLICT` explicite |
| Complexité excessive du moteur | Moyen | Un objectif, une adaptation, règles déclaratives minimales |
| Stockage local corrompu | Moyen | Validation à la reprise ; session neuve ; tests |
| Glissement vers un backend | Critique | Aucun serveur, aucune base, aucun endpoint ; revue de périmètre |
| Stack React non confirmée (H04) | Moyen | Domaine en TypeScript portable ; fallback JS avec mêmes formes |

---

## 14. Hypothèses et questions ouvertes

### 14.1 Hypothèses

| ID | Hypothèse | Source |
|---|---|---|
| BP-A1 | Aucun backend serveur n'est requis | Cahier section 8 ; architecture AD01 |
| BP-A2 | Le cœur local peut satisfaire F01–F12 sans réseau | Architecture section 2 |
| BP-A3 | Le catalogue est local, synthétique et en lecture seule | Cahier section 9 |
| BP-A4 | Un objectif et une adaptation suffisent au MVP | Cahier section 2 |
| BP-A5 | La persistance locale est facultative | Cahier section 9 ; contrat section 10 |

### 14.2 Questions ouvertes

| ID | Question | Impact |
|---|---|---|
| OQ-B1 | `ressources/` absent : aucun contenu réel | Impossible de finaliser le catalogue de démonstration |
| OQ-B2 | Domaine métier et tâche réelle non fournis (H02) | Champs de contenu génériques |
| OQ-B3 | Forme exacte des réponses et champs par étape | `AnswerValue` reste générique |
| OQ-B4 | Grammaire exacte de `RuleCondition` et forme de l'effet d'une règle | Résolue : voir `api-contract.md` §5.1, décision approuvée avant implémentation |
| OQ-B5 | Le fallback « Commencer par la Fin » sera-t-il activé ? | Un ensemble de règles réduit doit rester compatible |
| OQ-B6 | Le routage URL sera-t-il utilisé ? | Hors domaine ; n'affecte pas le cœur |

Les hypothèses H01–H10 du cahier restent ouvertes. Seules celles qui touchent le cœur local sont reprises ici ; les autres relèvent des Phases 4–6 et de la validation finale.

---

## 15. Traçabilité

| Exigence | Modules / étapes |
|---|---|
| F01 Sélectionner un objectif | `validation`, `session`, étape 5 |
| F02 Initialiser le parcours | `journey-engine`, étapes 2–3 |
| F03 Montrer la progression | `selectors`, `session`, étape 5 |
| F04 Modifier une préférence | `journey-engine`, `rule-evaluator`, étape 3 |
| F05 Expliquer l'adaptation | `explanation`, étape 4 |
| F06 Revenir | `session`, étape 6 |
| F07 Réviser un choix | `session`, `validation`, étape 6 |
| F08 Valider une étape | `validation`, étape 5 |
| F09 Afficher la synthèse | `selectors`, étape 7 |
| F10 Recommencer | `session`, étape 7 |
| F11 Sauvegarde locale | `platform/persistence`, étape 8 |
| F12 Démonstration reproductible | `data/catalog`, étape 1 ; URL publique Phase 5 |

| Exigence | Couverture |
|---|---|
| R01 Navigation par objectif | Session initialisée par objectif |
| R02 Parcours fluide et crédible | Moteur déterministe, retour, validation |
| R03 Pas de mini-jeu | Aucun service de jeu |
| R04 Module démontrable | Étapes 0–9 |
| R05 Justification | `explanation` |
| R06 Style libre | Aucune règle de style |
| R07 Note ergonomique | Hors cœur local |
| R08 GitHub + rendu | Hors cœur local |

| Exigence | Couverture |
|---|---|
| N01 Responsive | Aucun impact du cœur local ; contrainte de la Phase 4 |
| N02 Lisibilité | Messages d'erreur techniques mappés par la Phase 4 |
| N03 Accessibilité | Aucune dépendance souris/couleur |
| N04 Feedback | Erreurs, explications, progression |
| N05 Animation | Aucune animation dans le cœur |
| N06 Performance | Opérations locales synchrones |
| N07 Stabilité | Atomicité et erreurs récupérables |
| N08 Cohérence visuelle | Aucun style ni token dans le cœur ; contrainte de la Phase 4 |
| N09 Confidentialité | Aucune donnée personnelle |

| Preuve | Couverture |
|---|---|
| A01 Parcours complet | Séquences d'intégration 10.2, étapes 5–7 |
| A02 Expliquer le parti pris | `explanation` et documentation Phase 6 |
| A03 Modifier une préférence | `journey-engine`, `rule-evaluator`, étape 6 |
| A04 Justification d'une adaptation | `explanation`, étape 4 |
| A05 Revenir / modifier | `session`, `journey-engine`, étape 6 |
| A06 Valeur invalide | `validation`, étape 5 |
| A07 Finir le parcours | `selectors`, étape 7 |
| A08 Étapes obligatoires préservées | `invariants`, `rule-evaluator`, étapes 2–3 |

A09–A16 portent sur l'interface, les tests manuels, la documentation et le déploiement (Phases 4–6). Le cœur local ne les revendique pas.

---

## 16. Règles de non-invention du contenu

1. Aucun nom d'objectif, d'étape, de préférence ou de règle n'est défini dans ce plan.
2. Aucun texte utilisateur n'est écrit en dur dans le code du domaine.
3. Toute donnée de démonstration doit venir de `ressources/`.
4. Les fixtures de test restent techniques, neutres et clairement identifiées.
5. Une information absente reste une Open Question, jamais une règle inventée.
6. Toute future fourniture de contenu doit être ajoutée au catalogue sans modifier la sémantique du moteur.
7. Aucun contenu d'iCampus, Ici-Grenoble, ComUE ou d'un projet antérieur n'est importé.

---

**Fin du plan backend — Le Chemin Vivant, Phase 3.**
