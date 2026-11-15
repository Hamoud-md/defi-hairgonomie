# Le Chemin Vivant — Plan directeur (Master Plan)

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version :** 1.0  
**Statut :** Phase 6 — Plan d'exécution global  
**Documents de référence :** `cahier_charge.md`, `new files/architecture.md`, `new files/api-contract.md`, `new files/backend-plan.md`, `new files/frontend-plan.md`, `new files/infra-plan.md`

> **Rôle de ce document :** réunir les décisions des Phases 1 à 5 en un plan d'exécution unique, incrémental et ordonné par dépendances. Il décrit **comment construire** Le Chemin Vivant, phase par phase, jusqu'à l'URL publique et aux preuves attendues.
>
> **Adaptation obligatoire au projet :** Le Chemin Vivant est une **application web statique client-only**. Il n'y a pas de backend serveur, pas de base de données, pas d'API HTTP, ni d'authentification. Dans ce plan :
>
> - « Backend » désigne le **cœur local** (`domain/`, `application/`, `data/`, `platform/persistence`) décrit dans `backend-plan.md` ;
> - « Database » désigne le **catalogue local en lecture seule** ; **aucun SGBD** n'est utilisé ;
> - « Frontend » désigne les vues et composants décrits dans `frontend-plan.md` ;
> - « Infrastructure » désigne l'hébergement statique décrit dans `infra-plan.md`.
>
> `ressources/` est absent. Aucun contenu métier réel (identité, objectifs, étapes, préférences, règles, explications) n'est disponible. Le plan exécute donc la **structure** et réserve les **emplacements de contenu**, sans jamais inventer de texte métier. La Phase 10 traite l'intégration du contenu dès qu'il sera fourni.

---

## Table des matières

1. Objet, sources et limites
2. Principes directeurs
3. Vue d'ensemble de l'exécution
4. Séquencement et dépendances
5. Phases d'exécution
   - Phase 0 — Fondations et gel du contrat
   - Phase 1 — Cœur local : catalogue et invariants
   - Phase 2 — Cœur local : moteur, règles et explications
   - Phase 3 — Cœur local : session, validation et progression
   - Phase 4 — Cœur local : réversibilité, préférences et sélecteurs
   - Phase 5 — Frontend : coque, tokens et navigation
   - Phase 6 — Frontend : vues E01–E03 et intégration
   - Phase 7 — Persistance facultative
   - Phase 8 — Durcissement : responsive, accessibilité, mouvement
   - Phase 9 — Tests, porte qualité et déploiement statique
   - Phase 10 — Preuves, README et intégration du contenu
6. Definition of Done globale
7. Traçabilité croisée
8. Portes de vérification et approbation humaine
9. Gestion du changement et rollback
10. Risques et mitigations
11. Dépendance au contenu `ressources/`
12. Hypothèses et questions ouvertes
13. Handoff vers la Phase 7

---

## 1. Objet, sources et limites

### 1.1 Objet

Ce plan permet à un développeur ou à un AI Agent de :

- construire le MVP dans un ordre sûr, sans big-bang ;
- garantir la compatibilité permanente avec `api-contract.md` ;
- ne jamais introduire de backend, base de données ou service externe ;
- ne jamais inventer de contenu métier ;
- produire au fil des phases des critères de sortie vérifiables ;
- terminer par une URL publique, un dépôt GitHub et des preuves traçables.

### 1.2 Sources et hiérarchie

1. `cahier_charge.md` — structure, exigences, contraintes.
2. `ressources/` — contenu réel (**absent**).
3. `new files/architecture.md` — décisions architecturales (AD01–AD10).
4. `new files/api-contract.md` — types, opérations `QRY-*`/`CMD-*`/`PERSIST-*`, erreurs, invariants.
5. `new files/backend-plan.md` — implémentation du cœur local (étapes 0–9).
6. `new files/frontend-plan.md` — vues, composants, états (étapes 0–9).
7. `new files/infra-plan.md` — hébergement statique, environnements, checklist.
8. `principales files/master-plan.md` — méthodologie uniquement.

### 1.3 Limites

- `ressources/` absent : tout contenu métier reste une Open Question (OQ-M1).
- Domaine métier et tâche réelle non confirmés (H02).
- Défi Principal non fourni (H01).
- Stack React + TypeScript + Vite conditionnelle (H04).
- Durée et équipements non fournis (H05) ; aucune estimation calendaire n'est inventée.
- Hébergement et domaine à confirmer (H06/H07).
- Aucune preuve A01–A16 n'est déclarée produite ; elle est **planifiée**.
- Aucune conformité WCAG/RGAA complète n'est revendiquée.

---

## 2. Principes directeurs

| Principe | Décision | Conséquence |
|---|---|---|
| Contrat d'abord | Aucun code ne dévie de `api-contract.md` | Toute divergence est corrigée ou documentée avant de continuer |
| Cœur pur d'abord | Domaine et application avant l'intégration UI | Les vues consomment des sélecteurs, jamais des règles |
| Incrémental et sûr | Chaque phase produit un résultat testable | Aucune intégration massive |
| Client-only strict | Pas de backend, base, API, auth, secret | Toute proposition contraire est rejetée |
| Contenu non inventé | Les textes viennent du catalogue/`ressources/` | Les lacunes restent des Open Questions |
| Invariant préservé | Aucune étape requise supprimée | Vérification bloquante avant tout plan |
| Explication réelle | Pas d'explication sans changement réel | Génération par diff uniquement |
| Réversibilité | Retour/révision sans perte silencieuse | État atomique et invalidation signalée |
| Accessibilité native | Sémantique, clavier, focus, annonces | Contrôles dès la Phase 5 |
| Sobriété | Aucune dépendance lourde justifiée | Build statique reproductible |

**Différence avec un projet client-serveur :** il n'y a pas deux équipes backend/frontend à synchroniser en parallèle. Le cœur et l'UI vivent dans le même dépôt TypeScript ; le séquencement est surtout une **ordre de dépendances** (domaine → application → vues). Une parallélisation légère est possible entre la coque UI (Phase 5) et le cœur (Phases 1–4) après le gel du contrat, mais l'intégration des vues (Phase 6) exige le cœur terminé.

---

## 3. Vue d'ensemble de l'exécution

```
Phase 0  Fondations + gel du contrat
   │
   ├─► Phase 1  Catalogue + invariants
   │      │
   │      └─► Phase 2  Moteur + règles + explications
   │             │
   │             └─► Phase 3  Session + validation + progression
   │                    │
   │                    └─► Phase 4  Réversibilité + préférences + sélecteurs
   │                           │
   └───────────────────────────┼─► Phase 5  Coque + tokens + navigation
                               │
                               └─► Phase 6  Vues E01–E03 + intégration
                                      │
                                      └─► Phase 7  Persistance facultative
                                             │
                                             └─► Phase 8  Responsive + accessibilité + mouvement
                                                    │
                                                    └─► Phase 9  Tests + qualité + déploiement statique
                                                           │
                                                           └─► Phase 10  Preuves + README + contenu
```

- La Phase 5 peut démarrer après la Phase 0 ; elle ne consomme aucune règle métier.
- La Phase 6 est le point de convergence du cœur (Phases 1–4) et de l'UI (Phase 5).
- Les Phases 7–10 s'enchaînent strictement.
- L'intégration de contenu réel (Phase 10) dépend de `ressources/` et peut être différée sans bloquer les Phases 0–9.

---

## 4. Séquencement et dépendances

| Phase | Dépend de | Bloque |
|---|---|---|
| 0 | Phases 1–5 livrées (documents) | Toutes |
| 1 | 0 | 2 |
| 2 | 1 | 3 |
| 3 | 2 | 4, 6 |
| 4 | 3 | 6, 7 |
| 5 | 0 | 6 |
| 6 | 3, 4, 5 | 7, 8 |
| 7 | 4, 6 | 8 |
| 8 | 6, 7 | 9 |
| 9 | 8 | 10 |
| 10 | 9 ; `ressources/` pour le contenu | Livraison finale |

**Règle :** aucune phase ne commence avant que ses dépendances soient terminées et vérifiées. Aucune durée en jours n'est fixée (H05).

---

## 5. Phases d'exécution

Chaque phase indique : objectif, tâches, tâches « backend/cœur local », tâches frontend, tâches « database/catalogue », tâches d'intégration, tâches d'infrastructure, tests, dépendances, sortie attendue et critères de fin.

---

### Phase 0 — Fondations et gel du contrat

**Objectif :** disposer d'un dépôt compilable, de types conformes au contrat et d'un inventaire de contenu, sans aucune logique métier.

**Tâches**

- Lire `cahier_charge.md`, `architecture.md`, `api-contract.md`, `backend-plan.md`, `frontend-plan.md`, `infra-plan.md`.
- Vérifier la disponibilité de `ressources/` et documenter son absence.
- Initialiser React + TypeScript + Vite si la stack est confirmée (H04) ; sinon prévoir un fallback JavaScript avec les mêmes formes.
- Initialiser l'arborescence de l'architecture (section 20).
- Configurer lint, typecheck, Vitest (recommandé) et Playwright (recommandé) si retenus.
- Figer la liste des opérations `QRY-01..03`, `CMD-01..06`, `PERSIST-LOAD/SAVE/CLEAR` et des codes d'erreur.
- Établir la matrice des emplacements de contenu (frontend §15.2).

**Backend / cœur local**

- Créer `domain/models.ts` avec les types de `api-contract.md` §5.
- Créer `ContractResult`, `ContractError`, `ErrorCode`, `OperationId`, `PersistedSession`.
- Créer les interfaces `JourneyCatalog` et `SessionPersistence`.
- Aucune fonction métier.

**Frontend**

- Créer l'ossature des dossiers `app/`, `views/`, `ui/`, `platform/`, sans composant métier.

**Database / catalogue**

- Aucun SGBD. Définir seulement l'interface du catalogue local ; aucun contenu.

**Intégration**

- Vérifier que chaque type et chaque opération est présent exactement comme dans le contrat.

**Infrastructure**

- `npm run dev` démarre une application vide.
- Aucun secret, aucune variable obligatoire.
- Build local possible.

**Tests**

- `npm run typecheck` passe.
- Vérification de conformité des types au contrat.
- Aucun contenu métier inventé.

**Dépendances :** documents des Phases 1–5.

**Sortie attendue :** squelette compilable, contrat gelé, inventaire de contenu, liste d'Open Questions.

**Critères de fin :**

- Types conformes à `api-contract.md`.
- Opérations et codes d'erreur figés.
- Aucun backend, base, auth ou endpoint introduit.
- Absence de `ressources/` documentée, non contournée.

---

### Phase 1 — Cœur local : catalogue et invariants

**Objectif :** garantir un catalogue local cohérent et en lecture seule avant toute utilisation.

**Tâches**

- Implémenter `data/catalog.ts` (accès lecture seule).
- Créer `data/demo-data.ts` comme emplacement vide tant que `ressources/` est absent.
- Implémenter la validation d'intégrité dans `domain/invariants.ts`.
- Écrire les tests d'intégrité du catalogue.

**Backend / cœur local**

- `getObjectives`, `getObjective`, `getSteps`, `getStep`, `getPreferences`, `getPreference`, `getRules`.
- Vérifications : identifiants uniques, `Step.objectiveId` existant, `TransitionRule.stepIds` existants, conditions sur valeurs déclarées, ordres cohérents, aucune étape orpheline.

**Frontend**

- Aucune tâche (hors types déjà posés).

**Database / catalogue**

- **Aucun SGBD.** Le catalogue est un module local synthétique, versionné avec le code, jamais dupliqué dans la sauvegarde de session.

**Intégration**

- Un catalogue invalide produit `CATALOG_INVALID` ; aucun parcours partiel.

**Infrastructure**

- Aucune action ; le catalogue est inclus dans le build.

**Tests**

- Doublons, étapes orphelines, règles invalides, valeurs inconnues.
- Aucune dépendance réseau.

**Dépendances :** Phase 0.

**Sortie attendue :** catalogue lisible et validé (contenu de démonstration encore absent ou provisoire neutre).

**Critères de fin :**

- `CATALOG_INVALID` correctement déclenché.
- Tests d'intégrité passent.
- Aucun contenu métier inventé.
- Aucun appel réseau.

---

### Phase 2 — Cœur local : moteur, règles et explications

**Objectif :** produire un plan déterministe, appliquer les préférences et expliquer uniquement les changements réels.

**Tâches**

- Implémenter `domain/rule-evaluator.ts` (évaluation triée par `id` croissant).
- Implémenter `domain/journey-engine.ts` (`buildBasePlan`, recalcul, application des préférences).
- Compléter les invariants de plan (étapes requises, isolation par objectif).
- Implémenter `domain/explanation.ts` (diff avant/après).
- Détecter `RULE_CONFLICT` et `REQUIRED_STEP_REMOVED`.

**Backend / cœur local**

- Plan ordonné par `ordre` puis `id`.
- Effets autorisés uniquement : ordre et visibilité d'une étape non requise.
- Aucune étape requise supprimée ou masquée.
- Aucune explication sans changement réel.

**Frontend**

- Aucune tâche.

**Database / catalogue**

- Aucun SGBD ; lecture du catalogue local uniquement.

**Intégration**

- Les sorties (`JourneyPlan`, `Explanation[]`) respectent les types du contrat.

**Infrastructure**

- Aucune action.

**Tests**

- Déterminisme (F02).
- Préservation des étapes requises (A08).
- Explications réelles/absentes (F05, A04).
- Règles et conflits (F04).

**Dépendances :** Phase 1.

**Sortie attendue :** plan adapté et explications testables.

**Critères de fin :**

- Même entrée ⇒ même plan.
- Aucune étape requise retirée.
- Conflit signalé, jamais masqué.
- Aucun texte métier fabriqué par le moteur.

---

### Phase 3 — Cœur local : session, validation et progression

**Objectif :** permettre un parcours complet au niveau du domaine (E01 → E02), jusqu'à la complétion.

**Tâches**

- Implémenter `domain/session.ts` et `domain/validation.ts`.
- Implémenter `CMD-01` (initialiser), `CMD-03` (valider et avancer), `CMD-04` (revenir).
- Calculer `Progress` et la complétion.
- Conserver l'état en cas d'erreur (atomicité).

**Backend / cœur local**

- Validation : objectif requis/existant, étape existante/de l'objectif/active, réponse requise/valide, retour interdit à la première étape.
- Erreurs : `OBJECTIVE_REQUIRED`, `OBJECTIVE_NOT_FOUND`, `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `STEP_NOT_ACTIVE`, `ANSWER_REQUIRED`, `ANSWER_INVALID`, `FIRST_STEP`, `RULE_CONFLICT`.

**Frontend**

- Aucune tâche.

**Database / catalogue**

- Aucun SGBD.

**Intégration**

- `CMD-01`, `CMD-03`, `CMD-04` renvoient les formes exactes du contrat.

**Infrastructure**

- Aucune action.

**Tests**

- F01, F02, F03, F06, F08.
- A01 (parcours complet au domaine), A06 (valeur invalide).
- Tous les codes de validation couverts.
- Aucune perte de réponse.

**Dépendances :** Phase 2.

**Sortie attendue :** parcours local complet jusqu'à `completed`.

**Critères de fin :**

- `completed` vrai seulement si toutes les étapes requises sont validées.
- Échec ⇒ état inchangé.
- Aucune étape inexistante renvoyée.

---

### Phase 4 — Cœur local : réversibilité, préférences et sélecteurs

**Objectif :** garantir la réversibilité, l'invalidation contrôlée et produire les vues de lecture (`SessionView`, `Summary`).

**Tâches**

- Implémenter `CMD-02` (préférence) avec recalcul, explications et invalidations.
- Implémenter `CMD-05` (réviser une réponse).
- Implémenter `CMD-06` (recommencer) avec confirmation.
- Implémenter `application/selectors.ts` : `QRY-01`, `QRY-02`, `QRY-03`.
- Implémenter `Summary` et les compteurs de complétion.

**Backend / cœur local**

- Conserver les réponses valides ; lister les réponses invalidées avec raison.
- Refuser la synthèse incomplète (`JOURNEY_INCOMPLETE`).
- Erreurs : `PREFERENCE_NOT_FOUND`, `PREFERENCE_VALUE_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED`, `JOURNEY_INCOMPLETE`, `CONFIRMATION_REQUIRED`.

**Frontend**

- Aucune tâche.

**Database / catalogue**

- Aucun SGBD.

**Intégration**

- `QRY-01..03` et `CMD-02`, `CMD-05`, `CMD-06` conformes au contrat.
- Les sélecteurs ne produisent aucun effet de bord.

**Infrastructure**

- Aucune action.

**Tests**

- F04, F05, F07, F09, F10.
- A03, A04, A05, A07, A08.
- Invariant de préservation des réponses et étapes requises.
- Session vierge sans résidu.

**Dépendances :** Phase 3.

**Sortie attendue :** cœur local complet, `SessionView` et `Summary` prêts pour l'UI.

**Critères de fin :**

- Aucune perte silencieuse.
- Aucune complétion incorrecte.
- Tous les codes du contrat ont un test.
- Aucun contenu métier produit par le moteur.

---

### Phase 5 — Frontend : coque, tokens et navigation

**Objectif :** disposer d'une application vide mais navigable, accessible et cohérente.

**Tâches**

- Créer `AppShell`, `SkipLink`, `AppHeader`, `ErrorBoundary`.
- Créer les Design Tokens (couleurs, espacements, typographie, focus, états).
- Créer la navigation interne `ViewId` (`goal-selection`, `journey`, `summary`).
- Créer `EmptyState`, `ErrorState`, `StatusBanner`, `LiveRegion`.
- Gérer le focus au changement de vue.

**Backend / cœur local**

- Aucune logique métier dans la coque.

**Frontend**

- Coque, landmarks, lien d'évitement, `h1` unique par vue.
- Aucune route URL (MVP).
- Aucune règle métier.

**Database / catalogue**

- Aucun SGBD ; la coque ne lit pas le stockage directement.

**Intégration**

- La navigation suit les transitions du contrat (section 9) sans effet de bord.

**Infrastructure**

- Build statique fonctionnel ; aucun réseau.

**Tests**

- Lien d'évitement, focus, absence de débordement à 320 px, absence d'appel réseau.

**Dépendances :** Phase 0 (peut avancer en parallèle des Phases 1–4, mais ne peut pas intégrer les vues avant la Phase 4).

**Sortie attendue :** coque accessible avec trois vues vides.

**Critères de fin :**

- Navigation E01/E02/E03 sans route URL.
- Aucun débordement critique à 320 px.
- Focus visible et skip link opérationnel.
- Aucun contenu métier codé en dur.

---

### Phase 6 — Frontend : vues E01–E03 et intégration

**Objectif :** rendre les trois vues fonctionnelles contre le cœur local, sans dupliquer de règle métier.

**Tâches**

- E01 : `ObjectiveSelector`, `ObjectiveCard`, `PrimaryAction` ; brancher `QRY-01` et `CMD-01` ; gérer sélection, absence, catalogue vide/invalide.
- E02 : `ProgressIndicator`, `StepView`, `AnswerForm`, `PreferenceControl`, `ExplanationPanel`, `InvalidatedAnswerNotice` ; brancher `CMD-02`, `CMD-03`, `CMD-04`, `CMD-05` ; gérer Retour, révision, invalidations, erreurs locales.
- E03 : `SummaryView`, `DecisionList`, `CompletionStatus`, `ConfirmDialog` ; brancher `QRY-03` et `CMD-06` ; gérer `JOURNEY_INCOMPLETE`, `SESSION_REQUIRED`, `CONFIRMATION_REQUIRED`.
- Appliquer la correspondance des erreurs (frontend §14).

**Backend / cœur local**

- Aucune nouvelle règle ; uniquement consommation des sélecteurs et commandes.

**Frontend**

- Composants conformes à `frontend-plan.md` §9.
- Aucun `fetch`, aucune règle métier dans les composants.
- Aucun `dangerouslySetInnerHTML`.

**Database / catalogue**

- Aucun SGBD ; la liste des objectifs provient exclusivement de `QRY-01`.

**Intégration**

- Toutes les opérations `QRY-*`/`CMD-*` utilisées existent et renvoient les formes du contrat.
- Les erreurs ne sont jamais avalées ; un code inconnu est traité comme `UNEXPECTED_ERROR`.

**Infrastructure**

- Aucune action ; build inchangé.

**Tests**

- F01–F10 ; A01, A03, A04, A05, A06, A07, A08.
- Parcours clavier.
- Erreurs locales sans reset.

**Dépendances :** Phases 3, 4, 5.

**Sortie attendue :** parcours complet E01 → E02 → E03 utilisable.

**Critères de fin :**

- Aucun démarrage sans objectif.
- Aucune étape requise supprimée après adaptation.
- Aucune explication sans changement réel.
- Aucune réponse effacée par une erreur.
- Aucune complétion incorrecte.
- Aucun contenu métier inventé.

---

### Phase 7 — Persistance facultative

**Objectif :** permettre la reprise d'une session sans jamais rendre le stockage obligatoire.

**Tâches**

- Implémenter `platform/persistence.ts` si ce n'est déjà fait (Phase 3 du backend-plan).
- Brancher `PERSIST-LOAD` au démarrage, `PERSIST-SAVE` après transition significative, `PERSIST-CLEAR` après redémarrage.
- Gérer `STORED_SESSION_INVALID` et `STORAGE_UNAVAILABLE`.
- Revalider toute session restaurée par le domaine.

**Backend / cœur local**

- Adaptateur isolé, non bloquant, sans validation métier.
- Sauvegarde limitée à `SessionState` + `schemaVersion`.

**Frontend**

- Bandeau non bloquant (stockage indisponible / sauvegarde invalide).
- Aucune lecture directe de `localStorage` dans les composants.

**Database / catalogue**

- Aucun SGBD. `localStorage` navigateur uniquement ; catalogue non dupliqué.

**Intégration**

- `PERSIST-*` conformes au contrat §10.

**Infrastructure**

- Le stockage est une API navigateur, pas un service déployé ; aucune action d'hébergement.

**Tests**

- F11 ; absence, corruption, version inconnue, indisponibilité.
- Parcours nominal inchangé sans stockage.

**Dépendances :** Phases 4, 6.

**Sortie attendue :** reprise optionnelle, non bloquante.

**Critères de fin :**

- L'application fonctionne sans stockage.
- Une sauvegarde invalide démarre une session neuve.
- Aucune donnée personnelle.
- Aucun impact sur le parcours nominal.

---

### Phase 8 — Durcissement : responsive, accessibilité, mouvement

**Objectif :** rendre l'interface conforme aux exigences non fonctionnelles N01, N03, N05, N07.

**Tâches**

- Vérifier 320 / 768 / 1440 px.
- Vérifier la navigation clavier complète et le focus après navigation.
- Vérifier les annonces (`aria-live`, `role="alert"`) et les formulaires.
- Vérifier `prefers-reduced-motion`, le zoom 200 % et les contrastes.
- Vérifier que l'information ne dépend pas de la couleur.
- Vérifier la modale (focus trap, `Échap`, restauration du focus).
- Vérifier l'absence d'écran vide en cas d'erreur.

**Backend / cœur local**

- Aucune règle modifiée.

**Frontend**

- Ajustements de layout, focus, annonces, transitions discrètes.
- Aucun contenu masqué derrière un survol.

**Database / catalogue**

- Aucun SGBD.

**Intégration**

- Les états d'erreur/vide/chargement restent cohérents entre vues.

**Infrastructure**

- Vérifier le viewport dans `index.html` et l'absence de ressources externes bloquantes.

**Tests**

- N01, N03, N05, N07.
- A09, A10, A11, A12.
- Grille manuelle (clavier, zoom, contraste, mouvement réduit).

**Dépendances :** Phases 6, 7.

**Sortie attendue :** interface responsive et accessible.

**Critères de fin :**

- Aucun débordement critique.
- Parcours clavier complet.
- Aucune information dépendante de la couleur seule.
- Mouvement réduit respecté.
- Aucune page blanche non gérée.

---

### Phase 9 — Tests, porte qualité et déploiement statique

**Objectif :** stabiliser, prouver la qualité et publier une URL publique.

**Tâches**

- Compléter les tests de composants.
- Compléter les tests E2E Playwright (E01→E02→E03, préférence, retour, révision, erreur, synthèse, A08, clavier, responsive, mouvement réduit, stockage).
- Exécuter la grille manuelle.
- Exécuter `npm run lint`, `npm run typecheck`, `npm run test`, `npm run build`.
- Vérifier : aucun secret, aucun appel réseau, fixtures neutres.
- Publier `dist/` sur un hébergement statique.
- Vérifier l'URL depuis un autre navigateur/machine (A15).
- Vérifier le dépôt GitHub et le `README` (A14).

**Backend / cœur local**

- Aucune nouvelle fonctionnalité ; corrections de bugs uniquement.

**Frontend**

- Corrections finales, aucune nouvelle feature.

**Database / catalogue**

- Aucun SGBD ; vérifier la neutralité des fixtures.

**Intégration**

- Tous les scénarios critiques passent sur le build de production.

**Infrastructure**

- Appliquer la checklist de `infra-plan.md` §18 : HTTPS, `base` Vite correct, rollback possible, aucune variable secrète.

**Tests**

- A01, A03–A09, A11, A12, A14, A15.
- Aucun test dépendant du réseau, de l'horloge ou du hasard.

**Dépendances :** Phase 8.

**Sortie attendue :** application testée, build publié, URL et dépôt vérifiés.

**Critères de fin :**

- Definition of Done globale satisfaite.
- `lint`, `typecheck`, `test`, `build` passent.
- URL accessible hors machine locale.
- Rollback possible.
- Aucun backend, base, auth ou secret.

---

### Phase 10 — Preuves, README et intégration du contenu

**Objectif :** produire les livrables attendus (R05, R07, R08) et intégrer le contenu réel dès qu'il est fourni.

**Tâches**

- Rédiger le `README` : problème, parti pris ergonomique, bénéfice attendu, compromis, inspirations, limites (R05, R07, R08).
- Produire la courte note ergonomique (priorités, compromis, inspirations).
- Documenter le tableau de correspondance exigences/fonctions/preuves.
- Rassembler les preuves A01–A16 dans l'état réellement atteint (sans surinterprétation).
- Comparer au parcours classique si une étude est réalisée (A16), en présentant l'échantillon et les limites.
- **Lorsque `ressources/` sera fourni :** intégrer identité, proposition de valeur, objectifs, étapes, préférences, règles et explications dans `data/demo-data.ts`, sans changer la sémantique du moteur.
- Revalider le catalogue et re-exécuter les tests après intégration de contenu.

**Backend / cœur local**

- Aucune modification de la sémantique ; le contenu est ajouté au catalogue.
- Vérifier que les nouveaux contenus respectent les invariants.

**Frontend**

- Vérifier que les emplacements de contenu affichent bien le contenu fourni.
- Aucun texte métier codé en dur dans les composants.

**Database / catalogue**

- Aucun SGBD ; le catalogue local devient complet et synthétique.

**Intégration**

- Le contenu réel provient exclusivement de `ressources/`.
- Les Open Questions de contenu sont closes ou maintenues explicitement.

**Infrastructure**

- Redéployer si le contenu change le build ; re-vérifier l'URL.

**Tests**

- Re-exécuter les scénarios A01–A10 avec le contenu réel.
- Vérifier l'absence de contenu inventé.
- Vérifier R05, R07, R08 et A13.

**Dépendances :** Phase 9 ; `ressources/` pour la partie contenu.

**Sortie attendue :** `README` argumenté, note ergonomique, preuves et contenu intégré (ou explicitement signalé comme absent).

**Critères de fin :**

- Aucun contenu métier inventé.
- Toutes les preuves déclarées correspondent à un état réel.
- R05, R07, R08 documentés.
- Contenu intégré uniquement s'il provient de `ressources/`, sinon Open Question maintenue.

---

## 6. Definition of Done globale

Le projet est terminé lorsque :

1. les trois vues E01–E03 sont présentes, navigables et reliées au contrat ;
2. aucun backend, base de données, API HTTP, auth, rôle ou secret n'a été introduit ;
3. le cœur local est pur, déterministe et testé ;
4. l'invariant « aucune étape requise supprimée » est vérifié et testé ;
5. les explications n'apparaissent que pour un changement réel ;
6. les réponses valides sont préservées et les invalides signalées ;
7. la synthèse ne déclare jamais une complétion incorrecte ;
8. la persistance locale est facultative et non bloquante ;
9. le parcours est utilisable au clavier et à 320/768/1440 px ;
10. `prefers-reduced-motion` est respecté ;
11. `lint`, `typecheck`, `test`, `build` passent ;
12. aucun contenu métier n'est inventé ;
13. l'URL publique et le dépôt GitHub sont accessibles ;
14. le `README` satisfait R05, R07 et R08 ;
15. les preuves A01–A16 sont fournies ou explicitement non produites.

---

## 7. Traçabilité croisée

### 7.1 Exigences fonctionnelles

| Exigence | Phases |
|---|---|
| F01 Sélectionner un objectif | 3, 6 |
| F02 Initialiser le parcours | 2, 3 |
| F03 Montrer la progression | 3, 6 |
| F04 Modifier une préférence | 4, 6 |
| F05 Expliquer l'adaptation | 2, 4, 6 |
| F06 Revenir | 3, 6 |
| F07 Réviser un choix | 4, 6 |
| F08 Valider une étape | 3, 6 |
| F09 Afficher la synthèse | 4, 6 |
| F10 Recommencer | 4, 6 |
| F11 Sauvegarde locale | 7 |
| F12 Démonstration reproductible | 1, 9 |

### 7.2 Exigences du défi

| Exigence | Phases |
|---|---|
| R01 Navigation par objectif | 3, 6 |
| R02 Parcours fluide et crédible | 2, 6 |
| R03 Pas de mini-jeu | 6 |
| R04 Module démontrable | 6, 9 |
| R05 Justification | 2, 4, 10 |
| R06 Style libre | 5 |
| R07 Note ergonomique | 10 |
| R08 GitHub + rendu | 9, 10 |

### 7.3 Exigences non fonctionnelles

| Exigence | Phases |
|---|---|
| N01 Responsive | 8 |
| N02 Lisibilité | 5, 8 |
| N03 Accessibilité | 5, 8 |
| N04 Feedback | 4, 6 |
| N05 Animation | 8 |
| N06 Performance | 8, 9 |
| N07 Stabilité | 5, 8 |
| N08 Cohérence visuelle | 5 |
| N09 Confidentialité | 7, 9 |

### 7.4 Preuves

| Preuve | Phases |
|---|---|
| A01 Parcours complet | 6, 9 |
| A02 Expliquer le parti pris | 10 |
| A03 Modifier une préférence | 6, 9 |
| A04 Justification d'une adaptation | 6, 9 |
| A05 Revenir / modifier | 6, 9 |
| A06 Valeur invalide | 6, 9 |
| A07 Finir le parcours | 6, 9 |
| A08 Étapes obligatoires préservées | 2, 4, 6, 9 |
| A09 Clavier | 8, 9 |
| A10 Responsive | 8, 9 |
| A11 Mouvement réduit | 8, 9 |
| A12 Cas critiques | 8, 9 |
| A13 Note ergonomique | 10 |
| A14 Dépôt GitHub | 9, 10 |
| A15 URL publique | 9 |
| A16 Comparaison | 10 |

---

## 8. Portes de vérification et approbation humaine

Chaque phase se termine par une porte (gate) avant la suivante :

| Porte | Vérification | Bloquante |
|---|---|---|
| G0 | Types et opérations conformes au contrat | Oui |
| G1 | Catalogue validé, `CATALOG_INVALID` correct | Oui |
| G2 | Déterminisme et invariant A08 testés | Oui |
| G3 | Parcours local complet, atomicité testée | Oui |
| G4 | Sélecteurs et synthèse conformes, tous codes testés | Oui |
| G5 | Coque accessible, aucune règle métier | Oui |
| G6 | Vues fonctionnelles, aucune règle dupliquée | Oui |
| G7 | Persistance non bloquante | Oui |
| G8 | Responsive, clavier, mouvement réduit | Oui |
| G9 | Quality gate + URL + dépôt | Oui |
| G10 | README, preuves et contenu | Oui |

**Approbation humaine recommandée :**

- après le gel du contrat (G0) ;
- après le cœur local complet (G4) ;
- avant le déploiement public (G9) ;
- avant la soumission finale (G10).

**Principe :** aucune phase ne se déclare terminée sans vérification ; si une porte échoue, la phase reste ouverte et est corrigée.

---

## 9. Gestion du changement et rollback

### 9.1 Changement

- Toute modification d'un type, d'une opération ou d'un code d'erreur exige une mise à jour préalable de `api-contract.md`, puis une nouvelle vérification.
- Toute évolution de l'architecture est documentée dans `architecture.md` avant propagation.
- Aucun changement ne peut introduire de backend, base, API, auth ou secret sans mise à jour explicite du cahier et de l'architecture.
- Tout nouveau contenu métier doit provenir de `ressources/`.

### 9.2 Rollback

| Situation | Action |
|---|---|
| Contrat cassé | Revenir à la version précédente du contrat et du code ; réintégrer proprement |
| Régression fonctionnelle | Rétablir le commit précédent (déploiement basé sur Git) |
| Déploiement défaillant | Redéployer la version précédente conservée par l'hébergeur |
| Contenu invalide | Retirer le contenu du catalogue et restaurer l'état neutre ; aucun contenu inventé |
| Bug critique UI | Corriger puis redéployer ; pas de fonctionnalité cachée |

- Aucun rollback ne doit introduire de dépendance serveur.
- Le rollback s'appuie sur les commits et les déploiements statiques, pas sur des migrations (il n'y en a pas).

---

## 10. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| `ressources/` absent | Élevé | Emplacements de contenu, OQ, aucun texte inventé ; Phase 10 conditionnelle |
| Dérive du contrat | Élevé | Gel du contrat (G0), tests de conformité, revue |
| Suppression d'une étape requise | Élevé | Invariant bloquant + tests A08 |
| Explications fictives | Élevé | Diff réel uniquement |
| Perte de réponses | Élevé | État atomique + tests régression |
| Règles dupliquées dans l'UI | Élevé | Les vues consomment sélecteurs/commandes |
| Stockage bloquant | Moyen | Best effort, bandeau non bloquant |
| Défauts clavier/responsive | Élevé | Phase 8 + grille manuelle |
| URL inaccessible | Critique | Test hors machine (A15) |
| README incomplet | Critique | Checklist R05/R07/R08 en Phase 10 |
| Stack React non confirmée | Élevé | Fallback JS avec mêmes formes |
| Surcharge de dépendances | Moyen | Aucune librairie non nécessaire |

---

## 11. Dépendance au contenu `ressources/`

| Contenu attendu | Utilisé en | Statut |
|---|---|---|
| Identité du projet | E01 | Partiel (concept connu) |
| Proposition de valeur | E01 | **À fournir** |
| Objectifs (titre, description) | E01, E03 | **À fournir** |
| Étapes (titre, contenu, requis) | E02 | **À fournir** |
| Préférences (valeurs, description) | E02 | **À fournir** |
| Règles de transition (condition, explication) | Domaine | **À fournir** |
| Explications et invalidations | E02, E03 | **À fournir** |

**Règle :** tant que `ressources/` est absent, les Phases 0–9 exécutent la structure avec un contenu neutre ou vide, et la Phase 10 reste partiellement bloquée. Aucune donnée métier n'est inventée.

---

## 12. Hypothèses et questions ouvertes

### 12.1 Hypothèses

| ID | Hypothèse | Source |
|---|---|---|
| MP-A1 | Application statique client-only suffisante | Cahier section 8 ; architecture AD01 |
| MP-A2 | Le cœur local remplace un backend serveur | Architecte AD01 ; backend-plan |
| MP-A3 | Le catalogue local remplace une base de données | Cahier section 9 ; D05 |
| MP-A4 | Navigation interne sans routes URL | Cahier section 5 ; contrat §9 |
| MP-A5 | La persistance locale est facultative | Cahier F11 ; contrat §10 |
| MP-A6 | Le contenu réel sera fourni par `ressources/` | Cahier section 9 ; OQ-A1 |
| MP-A7 | React + TypeScript + Vite reste conditionnel | H04 |

### 12.2 Questions ouvertes

| ID | Question | Impact |
|---|---|---|
| OQ-M1 | `ressources/` absent : aucun contenu réel | Phase 10 partiellement bloquée |
| OQ-M2 | Domaine métier et tâche réelle non fournis (H02) | Contenu générique |
| OQ-M3 | Défi Principal non fourni (H01) | Compatibilité indécidable |
| OQ-M4 | Stack non confirmée (H04) | Chaîne de build |
| OQ-M5 | Durée et équipements non fournis (H05) | Aucune estimation calendaire |
| OQ-M6 | Hébergement et domaine non confirmés (H06/H07) | Publication (Phase 9) |
| OQ-M7 | Routes URL à introduire ? | Fallback statique (Phase 9) |
| OQ-M8 | CI à activer ? | Automatisation (Phase 9) |

Les hypothèses H01–H10 du cahier restent ouvertes. Ce plan ne les transforme pas en exigences.

---

## 13. Handoff vers la Phase 7

La Phase 7 (`ai-workflow.md`) pourra s'appuyer sur :

- les 11 phases d'exécution ci-dessus et leurs portes G0–G10 ;
- les rôles d'agents candidats (architecte, implémenteur domaine, implémenteur UI, testeur, auditeur) ;
- les règles de non-invention et de non-dérive du contrat ;
- la dépendance explicite à `ressources/` pour tout contenu métier ;
- les critères de sortie par phase et la Definition of Done globale ;
- les points d'approbation humaine (G0, G4, G9, G10).

**Interdit :** introduire dans le workflow un backend, une base de données, une authentification, un service externe ou une étape qui produirait du contenu métier sans `ressources/`.

---

**Fin du plan directeur — Le Chemin Vivant, Phase 6.**
