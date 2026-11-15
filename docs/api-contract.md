# Le Chemin Vivant — Contrat d'interface (API Contract)

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version :** 1.0  
**Statut :** Phase 2 — Contrat d'interface interne, compatible avec `new files/architecture.md`  
**Document compagnon :** `new files/architecture.md`

> **Décision centrale :** le projet ne comporte **aucun backend et aucune API HTTP**. Le cahier des charges exclut explicitement backend, base de données et API externe dans le MVP. Ce document définit donc le **contrat interne** entre la présentation, la couche application, le domaine et les adaptateurs locaux.
>
> Il n'y a ni endpoint réseau, ni serveur, ni authentification, ni autorisation, ni pagination serveur. Les opérations décrites ci-dessous sont des fonctions/commandes locales, appelées dans le navigateur.

---

## Table des matières

1. Portée et principes
2. Absence d'API HTTP
3. Conventions du contrat
4. Authentification et autorisation
5. Types et modèles exposés
6. Enveloppe de résultat et erreurs
7. Requêtes (lecture)
8. Commandes (écriture)
9. Contrat de navigation
10. Contrat de persistance locale
11. Contrat du catalogue de démonstration
12. Règles de validation
13. Déterminisme et invariants
14. Relations entre entités
15. Fonctionnalités API non applicables
16. Contenu et absence de `ressources/`
17. Traçabilité
18. Hypothèses et questions ouvertes
19. Gestion des changements

---

## 1. Portée et principes

Ce contrat couvre :

- la lecture du catalogue local ;
- la sélection d'un objectif et l'initialisation du parcours ;
- la modification d'une préférence ;
- la validation d'une étape et la progression ;
- le retour à une étape antérieure ;
- la révision d'une réponse ;
- la production d'explications ;
- la synthèse ;
- la réinitialisation ;
- la sauvegarde/reprise locale facultative.

Principes :

1. **Aucune invention de contenu** : le contrat transporte des objets dont le contenu vient du catalogue local, lui-même alimenté par `ressources/`. En l'absence de `ressources/`, seules les formes sont définies.
2. **Aucune dépendance réseau** : les opérations sont locales et ne doivent pas nécessiter de connexion.
3. **Déterminisme** : à entrées égales, le résultat est identique.
4. **Immutabilité** : une opération ne modifie jamais l'état reçu ; elle retourne un nouvel état ou une erreur.
5. **Atomicité** : en cas d'erreur, l'état de session reste inchangé.
6. **Traçabilité** : chaque opération est reliée aux exigences F01–F12 du cahier.
7. **Compatibilité** : toute évolution doit rester compatible avec `architecture.md` et être documentée dans ce fichier.

---

## 2. Absence d'API HTTP

| Élément demandé par la méthodologie | Décision pour Le Chemin Vivant | Justification |
|---|---|---|
| Endpoints | **Aucun** | Application statique client-only (architecture AD01) |
| Méthodes HTTP | **Aucune** | Pas de serveur applicatif |
| Routes HTTP | **Aucune route API** | Les vues logiques sont gérées côté client |
| Authentification | **Aucune** | Exclue par le cahier (section 2) |
| Autorisation | **Aucune** | Pas de comptes ni de rôles serveur |
| En-têtes / cookies | **Aucun** | Aucune session serveur |
| Codes de statut HTTP | **Non applicables** | Voir `ContractError` et `ok` |
| Pagination | **Non applicable** | Catalogue local de démonstration, sans liste distante |
| Filtrage / tri / recherche | **Non applicables au niveau API** | Les étapes sont sélectionnées par objectif ; aucun moteur de recherche requis |
| Upload de fichiers | **Aucun** | Hors périmètre |
| CORS / rate limiting | **Non applicables** | Aucun appel réseau |

**Conséquence contractuelle :** les sections suivantes remplacent les endpoints par des **opérations nommées** (`QRY-*`, `CMD-*`). Ces noms sont normatifs pour l'implémentation interne ; ils ne sont jamais exposés comme routes réseau.

---

## 3. Conventions du contrat

### 3.1 Nommage

- Opérations de lecture : `QRY-XX` (query).
- Opérations d'écriture : `CMD-XX` (command).
- Identifiants d'entités : chaînes opaques stables (`string`).
- Champs en `camelCase` côté TypeScript ; les noms conceptuels français du cahier sont conservés dans la documentation.

### 3.2 Ordre et stabilité

- Les étapes sont ordonnées par `ordre` croissant, puis par `id` en cas d'égalité.
- Les règles de transition sont évaluées par `id` croissant.
- Les explications sont ordonnées selon l'ordre d'évaluation des règles.
- Aucun résultat ne dépend de l'heure, d'un aléatoire ou de l'ordre d'itération d'un objet non trié.
- Les signatures TypeScript ci-dessous décrivent des formes normatives ; une implémentation JavaScript doit respecter les mêmes structures.

### 3.3 Immutabilité

- Les entrées sont en lecture seule.
- Les sorties sont de nouvelles structures.
- Aucune opération ne mute `SessionState`, le catalogue ou les objets retournés précédemment.

### 3.4 Textes destinés à l'utilisateur

- Les titres, descriptions, contenus d'étapes et raisons d'adaptation proviennent du **catalogue** et des **règles**.
- Le moteur ne fabrique jamais un texte métier.
- Les messages techniques génériques (erreur inattendue, stockage indisponible) peuvent être fournis par l'interface, sans prétendre à un contenu métier.
- En l'absence de `ressources/`, aucun libellé concret n'est défini par ce document.

### 3.5 Synchronisation synchrone / asynchrone

- Les opérations de domaine et d'application sont **synchrones**.
- Seule la persistance locale est **asynchrone** (interface navigateur).
- Aucune opération de domaine n'est bloquée par le stockage.

---

## 4. Authentification et autorisation

| Sujet | Contrat |
|---|---|
| Inscription | Aucune |
| Connexion | Aucune |
| Jetons | Aucun |
| Sessions serveur | Aucune |
| Rôles | Aucun rôle serveur ; seuls des contextes d'usage (novice, autonome, évaluateur) |
| Permissions | Aucune permission par rôle |
| Données protégées | Aucune |
| Contrôle d'accès | Uniquement les règles de progression (objectif requis, étape valide, parcours complet) |

Toutes les opérations `QRY-*` et `CMD-*` sont accessibles à tout utilisateur de la démonstration.

---

## 5. Types et modèles exposés

Les entités ci-dessous reprennent les objets conceptuels de la section 9 du cahier et les structures dérivées de `architecture.md`. Les champs sont **structurels** ; leur contenu réel reste à fournir.

### 5.1 Entités du catalogue

```ts
type Id = string

interface Objective {
  id: Id
  titre: string
  description: string
}

interface Step {
  id: Id
  objectiveId: Id
  ordre: number
  titre: string
  contenu: string
  requis: boolean
}

interface Preference {
  id: Id
  valeur: string
  valeurs?: string[]
  description: string
}

type RuleCondition =
  | { kind: "always" }
  | { kind: "preference_equals"; preferenceId: Id; value: string }
  | { kind: "all"; conditions: RuleCondition[] }
  | { kind: "any"; conditions: RuleCondition[] }
  | { kind: "not"; condition: RuleCondition }

type RuleEffect =
  | { kind: "step_order"; order: number }
  | { kind: "step_visibility"; visible: boolean }

interface TransitionRule {
  id: Id
  condition: RuleCondition
  stepIds: Id[]
  effect: RuleEffect
  explication: string
}
```

- `RuleCondition` est une condition déclarative, déterministe et évaluable localement. Elle ne peut référencer que des entités et valeurs déclarées dans le catalogue.
- `Preference.valeur` est la valeur par défaut. `Preference.valeurs`, lorsqu'elle est fournie, énumère les valeurs autorisées pour cette préférence ; sinon seule `valeur` est déclarée.
- `RuleEffect` s'applique à chaque étape de `TransitionRule.stepIds`. Un effet d'ordre ne peut pas cibler une étape requise. Une visibilité `false` sur une étape requise produit `REQUIRED_STEP_REMOVED`.
- `Step.requis = true` implique que l'étape ne peut jamais être retirée du parcours produit.
- Aucune contrainte de longueur, de format ou de valeur métier n'est inventée ici : ces contraintes dépendront du contenu réellement fourni.

### 5.2 État de session

```ts
type AnswerValue = string | string[]

interface SessionState {
  objectiveId: Id | null
  preferences: Record<Id, string>
  activeStepId: Id | null
  answers: Record<Id, AnswerValue>
}
```

- Une clé absente de `answers` signifie « réponse non fournie ».
- Une réponse vide (`""` ou `[]`) est traitée comme absente par la validation.
- `activeStepId` doit appartenir à l'objectif actif.
- Cet état est le seul état métier conservé par la session.

### 5.3 Structures dérivées

```ts
interface PlannedStep {
  stepId: Id
  order: number
  required: boolean
  visible: boolean
}

interface JourneyPlan {
  objectiveId: Id
  steps: PlannedStep[]
}

interface Progress {
  current: number
  total: number
}

interface ExplanationChange {
  kind: "step_order" | "step_visibility" | "answer_invalidated"
  targetId: Id
  before?: string | number | boolean
  after?: string | number | boolean
}

interface Explanation {
  id: Id
  ruleId?: Id
  event: "preference_changed" | "answer_revised" | "answer_invalidated"
  reason: string
  changes: ExplanationChange[]
}

interface ValidationIssue {
  stepId: Id
  field?: string
  code:
    | "ANSWER_REQUIRED"
    | "ANSWER_INVALID"
  message: string
}

interface InvalidatedAnswer {
  stepId: Id
  reason: string
}
```

- `Explanation.reason` vient de `TransitionRule.explication` ou d'un libellé de catalogue.
- Une `Explanation` n'existe que si un changement réel a eu lieu.
- `visible = false` n'est autorisé que pour une étape non requise ; toute étape requise reste visible.
- `current` et `total` doivent permettre d'afficher exactement « Étape X sur Y ».

### 5.4 Vues de lecture

```ts
type ViewId = "goal-selection" | "journey" | "summary"

interface ObjectiveView {
  objective: Objective
  selected: boolean
}

interface PreferenceView {
  preference: Preference
  selectedValue: string
}

interface SessionView {
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

interface DecisionView {
  step: Step
  answer: AnswerValue
}

interface Summary {
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
```

### 5.5 Résultat d'opération

```ts
type ErrorCode =
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

interface ContractError {
  code: ErrorCode
  message: string
  operation: OperationId
  fields?: Record<string, string>
}

type ContractResult<T> =
  | { ok: true; data: T; error: null }
  | { ok: false; data: null; error: ContractError }

type OperationId =
  | "QRY-01" | "QRY-02" | "QRY-03"
  | "CMD-01" | "CMD-02" | "CMD-03"
  | "CMD-04" | "CMD-05" | "CMD-06"
  | "PERSIST-LOAD" | "PERSIST-SAVE" | "PERSIST-CLEAR"
```

---

## 6. Enveloppe de résultat et erreurs

### 6.1 Succès

```json
{
  "ok": true,
  "data": {},
  "error": null
}
```

### 6.2 Échec

```json
{
  "ok": false,
  "data": null,
  "error": {
    "code": "OBJECTIVE_REQUIRED",
    "message": "<message technique ou libellé d'interface>",
    "operation": "CMD-01",
    "fields": {
      "<champ>": "<raison>"
    }
  }
}
```

### 6.3 Codes d'erreur

| Code | Signification | Opérations concernées |
|---|---|---|
| `CATALOG_INVALID` | Catalogue local incohérent (étape orpheline, règle invalide, doublon d'id) | Toutes |
| `OBJECTIVE_REQUIRED` | Aucun objectif sélectionné alors qu'il est requis | CMD-01, progression |
| `OBJECTIVE_NOT_FOUND` | `objectiveId` absent du catalogue | CMD-01 |
| `PREFERENCE_NOT_FOUND` | Préférence absente du catalogue | CMD-02 |
| `PREFERENCE_VALUE_INVALID` | Valeur non déclarée pour la préférence | CMD-02 |
| `STEP_NOT_FOUND` | Étape absente du catalogue | CMD-03, CMD-05 |
| `STEP_NOT_IN_OBJECTIVE` | Étape n'appartenant pas à l'objectif actif | CMD-03, CMD-05 |
| `STEP_NOT_ACTIVE` | Étape fournie différente de l'étape active lors d'une progression | CMD-03 |
| `SESSION_REQUIRED` | Aucune session active pour l'opération | QRY-02, QRY-03, CMD-02 à CMD-06 |
| `ANSWER_REQUIRED` | Champ requis absent ou vide | CMD-03 |
| `ANSWER_INVALID` | Réponse non conforme aux options déclarées | CMD-03, CMD-05 |
| `FIRST_STEP` | Retour demandé depuis la première étape | CMD-04 |
| `JOURNEY_INCOMPLETE` | Synthèse demandée avant validation des étapes requises | QRY-03 |
| `RULE_CONFLICT` | Règles incompatibles ou configuration incohérente | CMD-01, CMD-02, CMD-05 |
| `REQUIRED_STEP_REMOVED` | Invariant violé : une étape requise serait supprimée | CMD-02, CMD-05 |
| `CONFIRMATION_REQUIRED` | Réinitialisation demandée sans confirmation explicite | CMD-06 |
| `STORAGE_UNAVAILABLE` | Stockage local indisponible ou en échec | Persistance |
| `STORED_SESSION_INVALID` | Session sauvegardée illisible ou incohérente | Persistance |
| `UNEXPECTED_ERROR` | Erreur non gérée récupérable | Toutes |

### 6.4 Règles d'erreur

- Une erreur ne modifie jamais l'état de session.
- Les erreurs de validation sont locales à l'étape concernée et n'effacent aucune autre réponse.
- Une erreur de configuration (`CATALOG_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED`) est présentée comme un état d'erreur de l'application, jamais comme une faute de l'utilisateur.
- `UNEXPECTED_ERROR` ne doit jamais produire un écran vide (N07).
- Aucun message d'erreur ne doit inventer un contenu métier absent du catalogue.

---

## 7. Requêtes (lecture)

### QRY-01 — Obtenir les objectifs disponibles

| Élément | Contrat |
|---|---|
| Objectif | Alimenter E01 en objectifs sélectionnables |
| Entrée | Aucune |
| Sortie | `ObjectiveView[]` |
| Précondition | Catalogue chargé et valide |
| Effet de bord | Aucun |
| Erreurs | `CATALOG_INVALID` |
| Trace | F01, F12, R04 |

**Règles**

- Retourne tous les objectifs du catalogue de démonstration.
- L'ordre suit l'ordre déclaré du catalogue.
- Aucune pagination, aucun filtre, aucune recherche.
- `selected` reflète uniquement la session courante, s'il en existe une.

---

### QRY-02 — Obtenir la vue du parcours

| Élément | Contrat |
|---|---|
| Objectif | Alimenter E02 avec plan, progression, préférences, explications et erreurs |
| Entrée | Aucune (lit l'état de session courant) |
| Sortie | `SessionView` |
| Précondition | Session active avec objectif sélectionné |
| Effet de bord | Aucun |
| Erreurs | `SESSION_REQUIRED`, `OBJECTIVE_REQUIRED`, `CATALOG_INVALID` |
| Trace | F03, F04, F05, F06 |

**Règles**

- `progress.current` est l'indice 1-based de l'étape active parmi les étapes du plan.
- `progress.total` est le nombre d'étapes du plan applicable.
- `activeStep` est l'étape complète correspondant à `SessionState.activeStepId`.
- `explanations` ne contient que les explications de changements réels survenus dans la session.
- `issues` contient les erreurs de validation locales encore pertinentes.
- Si `status = "completed"`, la vue peut orienter vers `summary` sans annoncer la complétion avant vérification.

---

### QRY-03 — Obtenir la synthèse

| Élément | Contrat |
|---|---|
| Objectif | Alimenter E03 avec les décisions et l'état de complétion |
| Entrée | Aucune (lit l'état de session courant) |
| Sortie | `Summary` |
| Précondition | Session active |
| Effet de bord | Aucun |
| Erreurs | `SESSION_REQUIRED`, `JOURNEY_INCOMPLETE`, `CATALOG_INVALID` |
| Trace | F09, A07 |

**Règles**

- Refuse la synthèse si une étape requise n'est pas validée (`JOURNEY_INCOMPLETE`).
- Ne déclare jamais `completed: true` à tort.
- Les décisions reprennent les réponses réelles de la session.
- Les explications sont celles réellement produites.
- Aucune donnée n'est recalculée à partir d'un résultat simulé.

---

## 8. Commandes (écriture)

### CMD-01 — Sélectionner un objectif

| Élément | Contrat |
|---|---|
| Objectif | Enregistrer l'objectif, initialiser le parcours et produire le plan |
| Entrée | `{ objectiveId: Id }` |
| Sortie | `{ state: SessionState; plan: JourneyPlan; explanations: Explanation[] }` |
| Précondition | Catalogue valide |
| Effet | Nouvelle session dont l'objectif est sélectionné ; préférences initiales déclarées par le catalogue ; étape active = première étape applicable |
| Erreurs | `OBJECTIVE_REQUIRED`, `OBJECTIVE_NOT_FOUND`, `CATALOG_INVALID`, `RULE_CONFLICT` |
| Trace | F01, F02, R01, R04 |

**Règles**

- Sans `objectiveId`, la commande échoue avec `OBJECTIVE_REQUIRED` et aucune session n'est créée.
- Toutes les étapes requises de l'objectif sont présentes dans le plan.
- À données égales, le plan produit est identique (F02).
- La sélection initialise une nouvelle session pour l'objectif choisi ; aucune réponse d'une session précédente n'est transférée.
- Aucune explication fictive n'est produite lors de la seule sélection initiale, sauf si le catalogue déclare une adaptation effective.

---

### CMD-02 — Modifier une préférence

| Élément | Contrat |
|---|---|
| Objectif | Changer une préférence de présentation et expliquer l'adaptation |
| Entrée | `{ preferenceId: Id; value: string }` |
| Sortie | `{ state: SessionState; plan: JourneyPlan; explanations: Explanation[]; invalidatedAnswers: InvalidatedAnswer[] }` |
| Précondition | Session active |
| Effet | Nouvelle valeur de préférence ; recalcul du plan ; conservation des réponses encore valides ; signalement des réponses invalidées |
| Erreurs | `SESSION_REQUIRED`, `PREFERENCE_NOT_FOUND`, `PREFERENCE_VALUE_INVALID`, `CATALOG_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` |
| Trace | F04, F05, A03, A04, A08 |

**Règles**

- La valeur doit être déclarée pour la préférence concernée.
- Une étape requise ne peut jamais être retirée ni rendue invisible.
- Si aucune différence réelle n'en résulte, `explanations` est vide et aucune adaptation n'est annoncée.
- Les réponses incompatibles sont signalées dans `invalidatedAnswers`, jamais supprimées silencieusement.
- Toute explication doit être compréhensible et reliée à la règle concernée.

---

### CMD-03 — Valider une étape et avancer

| Élément | Contrat |
|---|---|
| Objectif | Valider les champs requis de l'étape active et progresser |
| Entrée | `{ stepId: Id; answer: AnswerValue }` |
| Sortie | `{ state: SessionState; issues: ValidationIssue[]; progress: Progress; completed: boolean; nextStepId: Id | null }` |
| Précondition | Session active ; `stepId` est l'étape active |
| Effet | Enregistrement de la réponse si valide ; passage à l'étape suivante ; `completed = true` si parcours terminé |
| Erreurs | `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `STEP_NOT_ACTIVE`, `ANSWER_REQUIRED`, `ANSWER_INVALID` |
| Trace | F03, F08, A01, A06 |

**Règles**

- Une réponse absente ou vide échoue avec `ANSWER_REQUIRED`.
- Une réponse non conforme aux valeurs déclarées échoue avec `ANSWER_INVALID`.
- L'erreur est retournée dans `issues` et associée à l'étape.
- Aucune autre réponse n'est effacée.
- Le passage à l'étape suivante n'a lieu que si la validation réussit.
- Lorsque toutes les étapes requises du plan sont validées, `completed = true` ; l'interface peut alors naviguer vers E03.
- Aucune étape inexistante n'est renvoyée.

---

### CMD-04 — Revenir à l'étape antérieure

| Élément | Contrat |
|---|---|
| Objectif | Revenir en arrière sans perte silencieuse |
| Entrée | Aucune |
| Sortie | `{ state: SessionState; activeStepId: Id; progress: Progress }` |
| Précondition | Session active ; étape active > première étape |
| Effet | Étape active = étape antérieure ; toutes les réponses restent présentes |
| Erreurs | `SESSION_REQUIRED`, `FIRST_STEP`, `STEP_NOT_FOUND`, `OBJECTIVE_REQUIRED` |
| Trace | F06, A05 |

**Règles**

- Depuis la première étape, la commande échoue avec `FIRST_STEP` ; l'interface peut désactiver l'action.
- Aucune réponse n'est supprimée par le simple retour.
- L'étape cible doit exister dans le plan de l'objectif actif.

---

### CMD-05 — Réviser une réponse

| Élément | Contrat |
|---|---|
| Objectif | Modifier une réponse antérieure et recalculer les dépendances |
| Entrée | `{ stepId: Id; answer: AnswerValue }` |
| Sortie | `{ state: SessionState; plan: JourneyPlan; explanations: Explanation[]; invalidatedAnswers: InvalidatedAnswer[]; issues: ValidationIssue[] }` |
| Précondition | Session active ; `stepId` appartient à l'objectif actif |
| Effet | Nouvelle réponse ; recalcul du plan ; réponses encore valides conservées ; invalides signalées |
| Erreurs | `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `ANSWER_REQUIRED`, `ANSWER_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` |
| Trace | F05, F06, F07, A05 |

**Règles**

- Les réponses valides non concernées sont préservées.
- Les réponses devenues incompatibles sont listées dans `invalidatedAnswers` avec une raison.
- Une invalidation ne supprime pas la valeur de l'état ; elle est marquée et doit être corrigée.
- L'explication ne mentionne que les changements réellement produits.
- L'invariant de préservation des étapes requises est vérifié après recalcul.

---

### CMD-06 — Recommencer

| Élément | Contrat |
|---|---|
| Objectif | Réinitialiser explicitement la session |
| Entrée | `{ confirm: true }` |
| Sortie | `{ state: SessionState }` |
| Précondition | Session existante |
| Effet | Session vierge : objectif nul, préférences vides, étape active nulle, réponses vides |
| Erreurs | `SESSION_REQUIRED`, `CONFIRMATION_REQUIRED` |
| Trace | F10 |

**Règles**

- L'action doit être explicite et confirmée ; aucun effacement automatique.
- Si `confirm !== true`, la commande échoue avec `CONFIRMATION_REQUIRED` et n'efface rien.
- La session vierge ne contient aucune réponse résiduelle.
- Si une persistance locale existe, l'effacement correspondant relève de l'adaptateur, sans bloquer la réinitialisation.
- Aucun contenu métier n'est créé par la réinitialisation.

---

## 9. Contrat de navigation

### 9.1 Vues logiques

| `ViewId` | Rôle | Écran du cahier |
|---|---|---|
| `goal-selection` | Identité, proposition de valeur, sélection d'objectif, Commencer | E01 |
| `journey` | Parcours, étape, progression, préférences, retour, explications | E02 |
| `summary` | Synthèse, décisions, complétion, Modifier, Recommencer | E03 |

### 9.2 Transitions autorisées

| De | Commande / action | Vers | Condition |
|---|---|---|---|
| `goal-selection` | `CMD-01` puis navigation | `journey` | Objectif sélectionné et plan valide |
| `journey` | `CMD-03` | `journey` | Étape validée, parcours non terminé |
| `journey` | `CMD-03` | `summary` | Étape validée, parcours complet |
| `journey` | `CMD-04` | `journey` | Étape > première |
| `journey` | `CMD-02` | `journey` | Préférence valide |
| `summary` | Action Modifier | `journey` | Session disponible |
| `summary` | `CMD-06` | `goal-selection` | Confirmation explicite |

### 9.3 Routes URL

- **Aucune route URL n'est exigée** par le cahier ni par ce contrat.
- La navigation interne entre vues logiques suffit au MVP.
- Si des routes URL sont introduites, elles doivent être documentées, rafraîchissables, testables en accès direct, et ne doivent pas exposer de données sensibles.
- L'absence de routes ne constitue pas une violation du contrat.

---

## 10. Contrat de persistance locale

La persistance est **facultative** (F11). Elle est isolée derrière un adaptateur.

```ts
interface PersistedSession {
  schemaVersion: number
  state: SessionState
}

interface SessionPersistence {
  load(): Promise<ContractResult<PersistedSession | null>>
  save(session: PersistedSession): Promise<ContractResult<void>>
  clear(): Promise<ContractResult<void>>
}
```

### 10.1 Règles

- `load()` retourne `null` si aucune sauvegarde n'existe.
- Une sauvegarde illisible ou incompatible échoue avec `STORED_SESSION_INVALID` ; l'application démarre une session neuve et ne plante pas.
- Une erreur de stockage (`STORAGE_UNAVAILABLE`) ne bloque jamais le parcours.
- `save()` est une tentative « best effort » : son échec ne défait pas l'opération métier déjà réussie.
- Toute session restaurée est revalidée par le domaine avant affichage.
- Aucune donnée personnelle réelle n'est stockée (N09).
- Le nom de la clé de stockage et le format sérialisé sont des détails d'implémentation, hors contrat public.

### 10.2 Contenu minimal sauvegardé

Uniquement `SessionState` et `schemaVersion`. Les données du catalogue ne sont pas dupliquées dans la sauvegarde ; elles restent la source de vérité locale.

---

## 11. Contrat du catalogue de démonstration

Le catalogue est local, en lecture seule, et synthétique.

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

### 11.1 Règles de cohérence

- Tous les `id` sont uniques par type d'entité.
- Chaque `Step.objectiveId` référence un `Objective` existant.
- Chaque `TransitionRule.stepIds` référence des étapes existantes.
- Chaque `TransitionRule.condition` référence uniquement des identifiants et valeurs déclarés dans le catalogue.
- Chaque `TransitionRule.effect` est bien formé : `step_order.order` est un nombre fini et `step_visibility.visible` est un booléen.
- Aucune règle ne peut produire un plan sans une étape requise.
- En cas d'incohérence, toutes les opérations échouent avec `CATALOG_INVALID` ; aucun parcours partiel n'est affiché.

### 11.2 Contenu

- Le catalogue est le seul point d'entrée du contenu de démonstration.
- Il est alimenté par des données locales synthétiques.
- Aucun appel réseau n'est autorisé pour le charger.

---

## 12. Règles de validation

| ID | Règle | Source | Comportement en échec |
|---|---|---|---|
| V01 | Un objectif doit être sélectionné pour initialiser le parcours | F01 | `OBJECTIVE_REQUIRED` |
| V02 | L'objectif doit exister dans le catalogue | F01 | `OBJECTIVE_NOT_FOUND` |
| V03 | Une préférence doit exister et sa valeur doit être déclarée | F04 | `PREFERENCE_NOT_FOUND`, `PREFERENCE_VALUE_INVALID` |
| V04 | Une étape doit appartenir à l'objectif actif ; pour avancer, elle doit être l'étape active | F07/F08 | `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `STEP_NOT_ACTIVE` |
| V05 | Un champ requis ne doit pas être absent ou vide | F08 | `ANSWER_REQUIRED` |
| V06 | Une réponse doit respecter les options déclarées | F08 | `ANSWER_INVALID` |
| V07 | Le retour est refusé depuis la première étape | F06 | `FIRST_STEP` |
| V08 | Une étape requise ne peut pas être retirée du plan | Section 4, A08 | `REQUIRED_STEP_REMOVED` |
| V09 | Une explication ne peut exister sans changement réel | F05 | Aucune explication retournée |
| V10 | La synthèse exige la validation de toutes les étapes requises | F09 | `JOURNEY_INCOMPLETE` |
| V11 | Une session restaurée doit être cohérente avec le catalogue | F11 | `STORED_SESSION_INVALID` |
| V12 | Une erreur ne doit pas modifier l'état | N07 | État inchangé |

**Limite explicite :** aucune validation de contenu (longueur minimale, format d'e-mail, liste fermée de valeurs métier, etc.) n'est définie ici, car le contenu réel n'est pas fourni.

---

## 13. Déterminisme et invariants

### 13.1 Déterminisme

Pour un même catalogue, un même état et une même commande :

- le plan produit est identique ;
- l'ordre des étapes est identique ;
- les explications sont identiques ;
- les invalidations sont identiques ;
- aucune dépendance à l'horloge, au hasard, à la locale ou à l'ordre d'énumération non trié.

### 13.2 Invariants bloquants

1. Toute étape `requis: true` de l'objectif actif apparaît dans `JourneyPlan.steps`.
2. Toute étape `requis: true` reste `visible: true`.
3. `activeStepId` appartient au plan actif ou est `null` avant initialisation.
4. Aucune réponse valide n'est supprimée par une simple préférence, un retour ou une révision non liée.
5. Les réponses invalidées sont listées et conservées jusqu'à correction explicite ou réinitialisation.
6. `completed: true` implique que toutes les étapes requises sont validées.
7. Une `Explanation` référence un changement effectif.
8. Un échec d'opération laisse `SessionState` inchangé.
9. Aucun contenu métier n'est produit par le moteur.
10. Aucun appel réseau n'est nécessaire à une opération.

---

## 14. Relations entre entités

| Relation | Cardinalité | Contrat |
|---|---|---|
| `Objective` → `Step` | 1 → 0..N | Une étape appartient à un seul objectif |
| `Objective` → `JourneyPlan` | 1 → 1 (par session) | Le plan est calculé pour l'objectif actif |
| `Preference` → `TransitionRule` | 1 → 0..N | Une règle peut dépendre d'une préférence et d'une valeur |
| `TransitionRule` → `Step` | 0..N → 0..N | Les étapes concernées existent dans le catalogue |
| `SessionState` → `Objective` | 0..1 | `null` avant sélection |
| `SessionState` → `Preference` | 0..N | Une valeur par préférence déclarée |
| `SessionState` → `Step` | 0..N | Une réponse par étape répondable |
| `Explanation` → `TransitionRule` | 0..1 | Présent si l'explication provient d'une règle |
| `Summary` → entités | agrégation | Construit à partir de la session, sans duplication de vérité |

**Invariant de relation :** aucune entité ne peut référencer un identifiant inexistant au moment de l'évaluation.

---

## 15. Fonctionnalités API non applicables

| Fonctionnalité | Décision | Motif |
|---|---|---|
| Endpoints REST/GraphQL | Aucun | Client-only |
| Authentification | Aucune | Hors périmètre |
| Autorisation / RBAC | Aucune | Hors périmètre |
| Pagination | Aucune | Catalogue local |
| Filtrage | Aucun filtre serveur | Sélection par objectif uniquement |
| Tri | Ordre déterministe local | `ordre` puis `id` |
| Recherche | Non requise | Aucun besoin exprimé |
| Upload de fichiers | Aucun | Aucun document à téléverser |
| Webhooks | Aucun | Aucun système externe |
| Notifications | Aucune | Aucun service de notification requis |
| Cache réseau | Aucun | Aucune donnée distante |
| WebSocket / temps réel | Aucun | Application locale |

---

## 16. Contenu et absence de `ressources/`

### 16.1 Contenu effectivement défini

Le cahier définit uniquement les objets conceptuels suivants : objectif, étape, préférence, règle de transition, état de session, explication.

### 16.2 Contenu absent

Aucun des éléments de contenu suivants n'est fourni par `cahier_charge.md` :

- noms de services ;
- conditions métier ;
- documents ;
- liens ;
- questions de test ;
- décisions ;
- messages d'expert.

`ressources/`, qui doit fournir ce contenu, **n'existe pas** dans le projet à la date de ce contrat.

### 16.3 Conséquence contractuelle

- Le contrat ne définit aucun contenu concret et n'en invente aucun.
- Les emplacements de contenu restent des champs typés (`titre`, `description`, `contenu`, `explication`, `message`).
- Toute future fourniture de contenu devra être ajoutée au catalogue sans modifier la sémantique des opérations.
- Si un contenu nécessite de nouvelles opérations, ce contrat doit être mis à jour et vérifié avant implémentation.
- Aucune donnée issue d'iCampus, Ici-Grenoble, ComUE ou d'un autre corpus externe n'est importée : ces sources ne font pas partie de ce projet.

---

## 17. Traçabilité

### 17.1 Exigences fonctionnelles

| Exigence | Opération / contrat |
|---|---|
| F01 Sélectionner un objectif | CMD-01, QRY-01 |
| F02 Initialiser le parcours | CMD-01 |
| F03 Montrer la progression | QRY-02, CMD-03 |
| F04 Modifier une préférence | CMD-02 |
| F05 Expliquer l'adaptation | CMD-02, CMD-05, `Explanation` |
| F06 Revenir | CMD-04 |
| F07 Réviser un choix | CMD-05 |
| F08 Valider une étape | CMD-03 |
| F09 Afficher la synthèse | QRY-03 |
| F10 Recommencer | CMD-06 |
| F11 Sauvegarde locale | `SessionPersistence` |
| F12 Démonstration reproductible | QRY-01, catalogue local |

### 17.2 Exigences du défi

| Exigence | Couverture |
|---|---|
| R01 Navigation par objectif | CMD-01, QRY-01 |
| R02 Parcours fluide et crédible | CMD-03, CMD-04, QRY-02 |
| R03 Pas de mini-jeu | Aucune opération de jeu ; contrat fonctionnel uniquement |
| R04 Module démontrable | Toutes les opérations E01–E03 |
| R05 Justification | `Explanation`, CMD-02, CMD-05 |
| R06 Style libre | Aucune contrainte de style dans ce contrat |
| R07 Note ergonomique | Hors contrat d'interface |
| R08 GitHub + rendu | Hors contrat d'interface |

### 17.3 Exigences non fonctionnelles

| Exigence | Contrat |
|---|---|
| N01 Responsive | Aucune dépendance à la taille d'écran dans les opérations |
| N02 Lisibilité | Textes issus du catalogue ; messages d'erreur explicites |
| N03 Accessibilité | Aucune opération ne dépend de la souris ou de la couleur |
| N04 Feedback | `Explanation`, `ValidationIssue`, `ContractError` |
| N05 Animation | Aucune animation requise par le contrat |
| N06 Performance | Opérations locales synchrones |
| N07 Stabilité | Enveloppe d'erreur, atomicité, `UNEXPECTED_ERROR` |
| N08 Cohérence | Types et enveloppes uniques |
| N09 Confidentialité | Aucune donnée personnelle dans le contrat |

### 17.4 Preuves

| Preuve | Contrat associé |
|---|---|
| A01 Parcours complet | CMD-01 → CMD-03 → QRY-03 |
| A03 Modification de préférence | CMD-02 |
| A04 Justification lisible | `Explanation.reason` |
| A05 Retour / modification | CMD-04, CMD-05 |
| A06 Valeur invalide | CMD-03 |
| A07 Synthèse fidèle | QRY-03 |
| A08 Étape obligatoire conservée | Invariant 1 et 2, CMD-02, CMD-05 |

---

## 18. Hypothèses et questions ouvertes

### 18.1 Hypothèses

| ID | Hypothèse | Source | Statut |
|---|---|---|---|
| AC-A1 | Aucun backend ni API HTTP n'est nécessaire au MVP | Cahier section 8, architecture AD01 | Confirmée par le cahier |
| AC-A2 | Le contenu de démonstration sera local et synthétique | Cahier section 9 | Confirmée par le cahier |
| AC-A3 | Un objectif et une adaptation suffisent au MVP | Cahier section 2 | Confirmée par le cahier |
| AC-A4 | Le catalogue est la seule source de contenu métier | Architecture section 11 | Décision d'architecture |
| AC-A5 | Le contrat reste agnostique au domaine | Cahier H02 | Nécessaire tant que le domaine n'est pas fourni |

### 18.2 Questions ouvertes

| ID | Question | Impact contractuel |
|---|---|---|
| OQ-AC1 | `ressources/` est absent : aucun contenu réel n'est disponible | Aucun contenu concret ne peut être défini ou testé |
| OQ-AC2 | Le domaine métier et la tâche réelle ne sont pas fournis (H02) | Les champs de contenu resteront génériques |
| OQ-AC3 | La forme exacte des champs de réponse par étape n'est pas définie | `AnswerValue` reste générique (`string | string[]`) |
| OQ-AC4 | Grammaire de `RuleCondition` et forme de `RuleEffect` | Résolue en section 5.1 après approbation humaine |
| OQ-AC5 | Le routage URL est facultatif | Aucune route URL n'est normative |
| OQ-AC6 | La persistance locale est facultative | L'adaptateur est défini mais non bloquant |
| OQ-AC7 | Le fallback « Commencer par la Fin » n'est pas activé | Le contrat reste compatible avec un ensemble de règles réduit |

---

## 19. Gestion des changements

1. Toute modification d'une opération, d'un type exposé ou d'un code d'erreur doit être reportée dans ce fichier avant implémentation.
2. Le contrat ne doit pas introduire d'endpoint réseau, de backend ou d'authentification sans mise à jour explicite de `cahier_charge.md` et de `architecture.md`.
3. Le contrat ne doit pas introduire de contenu métier non fourni par `ressources/`.
4. Toute évolution doit préserver les invariants de la section 13.
5. Une incompatibilité entre ce contrat et `architecture.md` doit être résolue en faveur du cahier des charges, puis documentée.
6. Les tests de domaine doivent couvrir chaque opération et chaque code d'erreur.
7. Toute nouvelle règle de validation doit citer sa source dans le cahier ou dans `ressources/`.

---

**Fin du contrat d'interface — Le Chemin Vivant, Phase 2.**
