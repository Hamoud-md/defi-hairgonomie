# Le Chemin Vivant — Tâches d'exécution

**Phase :** 1 — Cœur local : catalogue et invariants  
**Porte :** G1  
**Sources :** `master-plan.md` §5 (Phase 1), `backend-plan.md` §6.4 et Étape 1, `api-contract.md` §11 et §13  
**Statut :** implémentée — vérification indépendante `PASS WITH NOTES` ; approbations humaines G0/G1 en attente

> **Périmètre :** garantir un catalogue local cohérent, en lecture seule et validé avant toute utilisation.  
> **Hors périmètre :** moteur, règles, session, sélecteurs, UI, persistance, déploiement.  
> **Interdits :** backend, base de données, API HTTP, réseau, auth, secret, contenu métier inventé, `dangerouslySetInnerHTML`.

---

## 0. Préconditions (G0)

- [x] Créer le socle minimal nécessaire à la Phase 1 (`package.json`, `tsconfig.json`, Vite, Vitest, ESLint).
- [ ] Faire valider formellement G0 (approbation humaine requise).
- [x] Vérifier la présence de `src/domain/models.ts` avec les types de `api-contract.md` §5.
- [x] Vérifier `ContractResult`, `ContractError`, `ErrorCode`, `OperationId`, `PersistedSession`.
- [x] Vérifier les interfaces `JourneyCatalog` (`api-contract.md` §11) et `SessionPersistence` (§10).
- [x] Vérifier que `lint`, `typecheck` et `test` s'exécutent.
- [x] Vérifier que `ressources/` est absent et que son absence est documentée.
- [x] Confirmer qu'aucune modification de contrat, de type, d'opération ou de code d'erreur n'est nécessaire.

---

## 1. Fichiers autorisés

- [x] `src/data/demo-data.ts`
- [x] `src/data/catalog.ts`
- [x] `src/domain/invariants.ts`
- [x] `tests/unit/data/catalog.test.ts`
- [x] `tests/unit/domain/invariants.test.ts`
- [x] `tests/unit/fixtures/catalog-fixtures.ts` (fixtures techniques neutres, tests uniquement)

## 2. Fichiers interdits

- [x] Ne pas modifier `src/domain/journey-engine.ts`, `rule-evaluator.ts`, `validation.ts`, `explanation.ts`, `session.ts`.
- [x] Ne pas modifier `src/application/**`, `src/views/**`, `src/ui/**`, `src/app/**`, `src/platform/**`.
- [x] Ne pas modifier `docs/api-contract.md` ni `docs/architecture.md` sans validation explicite.
- [x] Ne pas ajouter de dépendance, de script ou de variable d'environnement hors socle Phase 0 validé.

---

## 3. Catalogue de démonstration — emplacement neutre

- [x] Créer `src/data/demo-data.ts` avec les collections vides typées (`objectives`, `steps`, `preferences`, `rules`).
- [x] Ne contenir aucun titre, description, contenu, libellé, explication ni règle métier.
- [x] Exporter uniquement des structures conformes à `Objective`, `Step`, `Preference`, `TransitionRule`.
- [x] Documenter que le contenu provient exclusivement de `ressources/` (absent).
- [x] Consigner l'Open Question OQ-B1 / OQ-M1 dans le handoff.

**Critères :**

- [x] Le fichier compile sans contenu métier.
- [x] Aucune donnée métier plausible n'est présentée comme définitive.

---

## 4. Catalogue local en lecture seule

- [x] Implémenter `src/data/catalog.ts` en exposant exactement `JourneyCatalog`.
- [x] `getObjectives(): readonly Objective[]` — ordre déclaré, aucune pagination, aucun filtre.
- [x] `getObjective(objectiveId): Objective | null` — `null` si absent.
- [x] `getSteps(objectiveId): readonly Step[]` — filtrées par `objectiveId`, triées par `ordre` croissant puis `id`.
- [x] `getStep(stepId): Step | null` — `null` si absent.
- [x] `getPreferences(): readonly Preference[]` — ordre déclaré.
- [x] `getPreference(preferenceId): Preference | null` — `null` si absent.
- [x] `getRules(): readonly TransitionRule[]` — ordre `id` croissant.
- [x] Aucune mutation des collections exposées ; aucune écriture ; aucune duplication de vérité.
- [x] Aucun `fetch`, import réseau, `localStorage`, DOM, React ou accès horloge/aléatoire.
- [x] Le catalogue est une instance locale construite à partir de `demo-data.ts`, pas un service déployé.

**Critères :**

- [x] Les sept méthodes existent avec les signatures du contrat.
- [x] Les tris sont déterministes (`ordre` puis `id` pour les étapes, `id` pour les règles).
- [x] Aucune entrée n'est modifiée par un appel de lecture.

---

## 5. Validation d'intégrité — `src/domain/invariants.ts`

- [x] Implémenter une fonction de validation du catalogue réutilisant `ContractResult` et `ContractError` (aucun nouveau type public).
- [x] Retourner une erreur `CATALOG_INVALID` avec un message technique neutre et l'`OperationId` fourni par l'appelant.
- [x] Ne jamais corriger silencieusement une incohérence.
- [x] Ne jamais charger de données ni appeler le réseau.

### Vérifications obligatoires

- [x] Identifiants uniques par type : objectifs, étapes, préférences, règles.
- [x] `Step.objectiveId` référence un `Objective` existant.
- [x] `TransitionRule.stepIds` référence des étapes existantes.
- [x] Aucune étape orpheline (sans objectif valide).
- [x] Chaque `Preference` possède une `valeur` déclarée non vide (contrôle structurel uniquement).
- [x] `Step.ordre` est numérique et fini ; tri déterministe garanti par `ordre` puis `id`.
- [x] `TransitionRule.condition` est une structure déclarative (objet simple, valeurs sérialisables, sans cycle).
- [ ] Vérifier que `TransitionRule.condition` ne référence que des entités et valeurs déclarées — **différé** : grammaire absente (OQ-B4 / OQ-AC4).
- [ ] Vérifier qu'aucune règle ne peut supprimer une étape requise — **différé Phase 2** : le contrat ne représente pas encore les effets de règle.

### Limite explicite (à ne pas contourner)

- [x] La grammaire exacte de `RuleCondition` n'est pas fournie (OQ-B4 / OQ-AC4). Aucune syntaxe métier inventée.
- [x] Implémenter uniquement les contrôles rendus possibles par une forme déclarée ; le reste est consigné en Open Question.
- [x] Ne pas transformer une hypothèse de forme en règle contractuelle.

**Critères :**

- [x] Un catalogue invalide produit `CATALOG_INVALID`.
- [x] Aucun parcours partiel n'est rendu possible par un catalogue invalide.
- [x] Aucun contenu métier n'est produit par la validation.

---

## 6. Fixtures techniques neutres

- [x] Créer des fixtures de test clairement identifiées comme techniques (`objective-1`, `step-1`, etc.).
- [x] Les libellés restent neutres ou vides ; aucune démonstration métier.
- [x] Couvrir au minimum : catalogue valide, doublons, étape orpheline, règle invalide, valeur inconnue.
- [x] Ne pas importer les fixtures dans le code applicatif.

**Critères :**

- [x] Les fixtures ne sont utilisées que par les tests.
- [x] Aucun contenu métier réaliste n'y est présenté.

---

## 7. Tests

### 7.1 Intégrité du catalogue

- [x] Catalogue valide ⇒ validation réussie.
- [x] Objectif avec `id` dupliqué ⇒ `CATALOG_INVALID`.
- [x] Étape avec `id` dupliqué ⇒ `CATALOG_INVALID`.
- [x] Préférence avec `id` dupliqué ⇒ `CATALOG_INVALID`.
- [x] Règle avec `id` dupliqué ⇒ `CATALOG_INVALID`.
- [x] `Step.objectiveId` inconnu ⇒ `CATALOG_INVALID`.
- [x] `TransitionRule.stepIds` inconnu ⇒ `CATALOG_INVALID`.
- [x] Préférence sans valeur non vide ⇒ `CATALOG_INVALID`.
- [x] `ordre` non numérique ou non fini ⇒ `CATALOG_INVALID`.
- [x] Condition non déclarative ou cyclique ⇒ `CATALOG_INVALID`.
- [ ] Condition référençant une entité ou valeur inconnue ⇒ `CATALOG_INVALID` — **différé** avec OQ-B4 / OQ-AC4.

### 7.2 Accès au catalogue

- [x] `getObjectives` retourne l'ordre déclaré.
- [x] `getObjective` retourne `null` pour un id absent.
- [x] `getSteps` isole l'objectif et trie par `ordre` puis `id`.
- [x] `getStep` retourne `null` pour un id absent.
- [x] `getPreferences` retourne l'ordre déclaré et `getPreference` gère l'absence.
- [x] `getRules` retourne les règles par `id` croissant.
- [x] Deux appels successifs retournent le même résultat (déterminisme).
- [x] Une tentative de mutation du tableau retourné n'affecte pas le catalogue.

### 7.3 Contraintes transverses

- [x] Aucun test ne dépend du réseau, de l'horloge ou du hasard.
- [x] Aucun `fetch`, `XMLHttpRequest`, WebSocket ou import distant dans le code livré.
- [x] `npm run lint` passe.
- [x] `npm run typecheck` passe.
- [x] `npm run test` passe.
- [x] `npm run build` passe.

---

## 8. Porte G1 — Critères de fin

- [x] Catalogue lisible et validé.
- [x] `CATALOG_INVALID` correctement déclenché pour chaque incohérence couverte.
- [x] Tests d'intégrité et d'accès passent.
- [x] Aucun contenu métier inventé.
- [x] Aucun appel réseau.
- [x] Aucun backend, base de données, API HTTP, auth, rôle ou secret introduit.
- [x] Aucun fichier hors périmètre modifié.
- [x] Vérification indépendante effectuée (lecture seule), verdict `PASS WITH NOTES`.
- [x] Handoff rédigé : fichiers, commandes, tests, limites, Open Questions, état de G1.

**Verdict d'implémentation :** `PASS WITH NOTES` — la validation des références de `RuleCondition` reste différée jusqu'à la fourniture de sa grammaire (OQ-B4 / OQ-AC4). Les notes de revue (catalogue démo non branché, type dupliqué, détection de cycle, tests manquants) ont été corrigées.

---

## 9. Traçabilité

| Élément | Couverture Phase 1 |
|---|---|
| F12 Démonstration reproductible | Catalogue local synthétique, lecture seule, sans réseau |
| F01 Sélectionner un objectif | Source des objectifs (`getObjectives`), sans UI |
| A08 Étapes obligatoires préservées | Contrôle structurel préparatoire ; invariant complet en Phase 2 |
| R04 Module démontrable | Socle de données local |
| N06 Performance | Accès local synchrone |
| N07 Stabilité | Validation avant utilisation, aucun parcours partiel |
| N09 Confidentialité | Données synthétiques uniquement |

---

## 10. Open Questions et limites

| ID | Question | Impact Phase 1 |
|---|---|---|
| OQ-B1 / OQ-M1 | `ressources/` absent : aucun contenu réel | `demo-data.ts` reste vide ; aucune démonstration métier |
| OQ-B4 / OQ-AC4 | Grammaire exacte de `RuleCondition` non fournie | Contrôles structurels seulement ; références déclarées non vérifiables |
| OQ-B2 | Domaine métier et tâche réelle non fournis | Libellés et valeurs restent neutres |
| H02 | Tâche métier non confirmée | Aucun contenu métier ne peut être finalisé |
| H04 | Stack React/TS/Vite conditionnelle | Phase 1 reste portable TypeScript |

---

## 11. Handoff

- [x] Liste des fichiers créés et modifiés.
- [x] Commandes exécutées et résultats.
- [x] Tests ajoutés et éléments de traçabilité couverts.
- [x] Limites connues et Open Questions.
- [x] Confirmation explicite : aucun backend, base, auth, API réseau, secret ni contenu métier inventé.
- [x] État de la porte G1.

### Fichiers créés

- `package.json`, `tsconfig.json`, `vite.config.ts`, `eslint.config.js`, `index.html`, `.gitignore`
- `src/main.ts`
- `src/domain/models.ts`
- `src/domain/invariants.ts`
- `src/data/demo-data.ts`
- `src/data/catalog.ts`
- `tests/unit/fixtures/catalog-fixtures.ts`
- `tests/unit/domain/invariants.test.ts`
- `tests/unit/data/catalog.test.ts`

### Commandes

| Commande | Résultat |
|---|---|
| `npm install -D typescript vite vitest eslint @eslint/js typescript-eslint` | succès |
| `npm run lint` | succès |
| `npm run typecheck` | succès |
| `npm run test` | 30 tests, 2 fichiers, succès |
| `npm run build` | succès |

### Limites

- `src/data/demo-data.ts` est volontairement vide : aucun contenu métier inventé.
- `RuleCondition` est typé de façon structurelle (`Record<string, unknown>`) ; sa grammaire et ses références restent à figer.
- Le catalogue de démonstration est chargé exclusivement via `loadDemoCatalog` / `loadCatalog` ; `createCatalog` est interne et non validable directement.
- Exception de couche documentée : `data/catalog.ts` appelle `domain/invariants.ts` pour valider avant construction ; l'orchestration pourra être déplacée en `application/` en Phase 4.
- G0 et G1 requièrent encore les approbations humaines prévues.
