# Le Chemin Vivant — Tâches d'exécution

**Phase :** 2 — Cœur local : moteur, règles et explications  
**Porte :** G2  
**Sources :** `master-plan.md` §5 (Phase 2), `backend-plan.md` §6.4, §7.1–§7.6 et étapes 2–4, `api-contract.md` §5.3, §6.3, §11–§13, `architecture.md` §8  
**Statut :** cœur local implémenté ; G2 en attente de revue indépendante et d'approbation humaine

> **Périmètre :** produire un plan déterministe, appliquer les préférences et expliquer uniquement les changements réels.  
> **Hors périmètre :** session, validation des réponses, progression, retour, révision, sélecteurs, UI, persistance, déploiement.  
> **Interdits :** backend, base de données, API HTTP, réseau, auth, secret, contenu métier inventé, IA générative, hasard, horloge.

> **Décision contractuelle (approuvée) :**
>
> 1. `RuleCondition` est fixée en `always | preference_equals | all | any | not`.
> 2. `TransitionRule.effect` est fixé en `step_order | step_visibility` et s'applique à chaque `stepIds`.
> 3. `Preference.valeurs` est optionnel ; `valeur` reste la valeur par défaut.
> 4. `ExplanationChange.before` / `after` accepte `boolean` pour la visibilité.
>
> `api-contract.md` a été mis à jour avant l'implémentation. Aucune sémantique métier n'a été inventée.

---

## 0. Préconditions et escalade

- [ ] Vérifier que G1 est validé et que la vérification indépendante de la Phase 1 est acceptée.
- [x] Vérifier que `loadCatalog` / `loadDemoCatalog` et `validateCatalog` sont disponibles et testés.
- [x] Vérifier que `ressources/` est toujours absent ; aucune règle métier réelle ne doit être créée.
- [x] Escalader `OQ-B4` / `OQ-AC4` : faire figer la grammaire de `RuleCondition`.
- [x] Escalader la forme de l'effet de règle (ordre et visibilité d'une étape non requise).
- [x] Si le contrat doit changer : mettre à jour `api-contract.md` d'abord, obtenir l'approbation humaine, puis seulement coder.
- [x] Confirmer qu'aucun changement de type, d'opération ou de code d'erreur non documenté n'est introduit.
- [x] Confirmer qu'aucun composant UI, aucune session et aucune validation d'étape ne sont implémentés dans cette phase.

**Les bloquants contractuels sont résolus. La Phase 2 reste ouverte jusqu'à la revue indépendante de G2.**

---

## 1. Fichiers autorisés

- [x] `src/domain/rule-evaluator.ts`
- [x] `src/domain/journey-engine.ts`
- [x] `src/domain/explanation.ts`
- [x] `src/domain/invariants.ts` (extension des invariants de plan uniquement)
- [x] `tests/unit/domain/rule-evaluator.test.ts`
- [x] `tests/unit/domain/journey-engine.test.ts`
- [x] `tests/unit/domain/explanation.test.ts`
- [x] `tests/unit/domain/plan-invariants.test.ts`
- [x] `tests/unit/fixtures/plan-fixtures.ts`
- [ ] `docs/api-contract.md` **uniquement** après décision et approbation explicite du changement de contrat.

## 2. Fichiers interdits

- [x] Ne pas modifier `src/domain/session.ts`, `src/domain/validation.ts` (Phase 3).
- [x] Ne pas modifier `src/application/**`, `src/views/**`, `src/ui/**`, `src/app/**`, `src/platform/**`.
- [x] Ne pas ajouter de contenu métier dans `src/data/demo-data.ts`.
- [x] Ne pas ajouter de dépendance, de script, de variable d'environnement ou de configuration de build.
- [x] Ne pas introduire `fetch`, réseau, stockage, DOM, React, horloge ou aléatoire dans le domaine.

---

## 3. Plan de base — `journey-engine.buildBasePlan`

- [x] Définir une signature interne explicite, sans créer de nouveau type public hors contrat.
- [x] Charger l'objectif et ses étapes via `JourneyCatalog`.
- [x] Refuser un objectif absent avec `OBJECTIVE_NOT_FOUND` si la fonction porte cette validation.
- [x] Refuser un catalogue invalide avec `CATALOG_INVALID`.
- [x] Isoler strictement les étapes de l'objectif actif ; aucun mélange d'objectifs.
- [x] Trier les étapes par `ordre` croissant puis par `id` (comparaison déterministe, sans locale).
- [x] Construire `JourneyPlan` avec `objectiveId` et `PlannedStep[]`.
- [x] Conserver toutes les étapes `requis: true` avec `required: true` et `visible: true`.
- [x] Initialiser les étapes non requises avec `visible` selon la valeur par défaut définie par la règle/le contrat approuvé.
- [x] Conserver l'ordre de base comme ordre de référence avant règles.
- [x] Ne produire aucune explication lors du simple plan de base.
- [x] Ne muter ni le catalogue, ni les étapes, ni les préférences, ni le plan précédent.
- [x] Garantir le déterminisme : mêmes entrées ⇒ même plan.

**Critères :**

- [x] Aucune étape requise manquante.
- [x] Aucune étape d'un autre objectif.
- [x] Ordre identique à chaque exécution.
- [x] Aucun contenu métier produit par le moteur.

---

## 4. Évaluation des règles — `rule-evaluator.ts`

- [x] Évaluer uniquement les règles applicables à l'objectif actif et aux préférences déclarées.
- [x] Trier les règles par `id` croissant avec une comparaison déterministe.
- [x] Évaluer `RuleCondition` selon la grammaire approuvée, sans heuristique ni interprétation implicite.
- [x] Ne référencer que des entités et valeurs déclarées dans le catalogue.
- [x] Retourner une erreur `CATALOG_INVALID` pour une condition invalide ou une référence inconnue.
- [x] Collecter les effets demandés avant application.
- [x] Autoriser uniquement les effets prévus : ordre et visibilité d'une étape **non requise**.
- [x] Refuser tout effet qui supprimerait ou masquerait une étape requise (`REQUIRED_STEP_REMOVED`).
- [x] Détecter les effets d'ordre ou de visibilité incompatibles (`RULE_CONFLICT`), sans les masquer ni choisir silencieusement.
- [x] Ne jamais appliquer partiellement un ensemble d'effets en conflit.
- [x] Ne produire aucune explication pour une règle qui ne change rien.
- [x] Ne dépendre ni de l'heure, ni du hasard, ni de la locale, ni de l'ordre d'énumération non trié.

**Critères :**

- [x] Même catalogue + mêmes préférences ⇒ mêmes effets.
- [x] Une étape requise reste toujours présente et visible.
- [x] Un conflit produit `RULE_CONFLICT`, jamais un plan partiel.
- [x] Une tentative de retrait requis produit `REQUIRED_STEP_REMOVED`.

---

## 5. Invariants de plan — extension de `invariants.ts`

- [x] Vérifier que chaque `PlannedStep.stepId` existe dans le catalogue.
- [x] Vérifier que chaque `PlannedStep.stepId` appartient à l'objectif du plan.
- [x] Vérifier qu'aucune étape n'est dupliquée dans le plan.
- [x] Vérifier que toute étape `requis: true` de l'objectif est présente.
- [x] Vérifier que toute étape `requis: true` reste `visible: true`.
- [x] Vérifier que les `order` sont numériques et finis.
- [x] Vérifier l'absence de mélange entre objectifs.
- [x] Vérifier que `required` correspond à `Step.requis`.
- [x] Distinguer une incohérence structurelle (`CATALOG_INVALID`) d'une violation de l'invariant requis (`REQUIRED_STEP_REMOVED`).
- [x] Ne jamais corriger silencieusement un plan invalide ; ne jamais retourner de plan partiel.

**Critères :**

- [x] L'invariant « aucune étape requise supprimée ou masquée » est bloquant.
- [x] Chaque invariant possède un test de non-régression.
- [x] Aucune violation n'est avalée par le moteur.

---

## 6. Explications — `explanation.ts`

- [x] Comparer le plan avant et le plan après recalcul.
- [x] Ne produire une `Explanation` que si un changement réel est constaté.
- [x] Produire `step_order` uniquement lorsqu'un `order` change réellement.
- [x] Produire `step_visibility` uniquement lorsqu'une visibilité change réellement.
- [x] Renseigner `changes` avec `targetId`, `before` et `after` exacts.
- [x] Renseigner `ruleId` lorsque l'explication provient d'une `TransitionRule`.
- [x] Utiliser `TransitionRule.explication` ou un libellé du catalogue pour `reason`.
- [x] Ne jamais fabriquer de texte métier dans le code du domaine.
- [x] Ordonner les explications de façon stable, conformément à l'ordre d'évaluation des règles.
- [x] Ne produire aucune explication si les plans sont identiques.
- [x] Laisser `answer_invalidated`, `answer_revised` et les invalidations à la Phase 4.

**Critères :**

- [x] Une explication référence toujours un changement effectif.
- [x] Aucune adaptation fictive n'est annoncée.
- [x] L'ordre des explications est reproductible.
- [x] Aucun contenu métier n'est codé en dur.

---

## 7. Recalcul et application des préférences

- [x] Exposer une fonction de recalcul du plan à partir de l'objectif, des préférences et du catalogue.
- [x] Recaculer le plan complet, sans réutiliser un résultat obsolète.
- [x] Appliquer les préférences dans un ordre déterministe (clé de préférence triée).
- [x] Récupérer les explications produites par les changements réels.
- [x] Signaler `RULE_CONFLICT` et `REQUIRED_STEP_REMOVED` au lieu de retourner un plan incohérent.
- [x] Ne pas enregistrer de session ni modifier `SessionState` (Phase 3/4).
- [x] Ne pas toucher aux réponses ; l'invalidation appartient à la Phase 4.

**Critères :**

- [x] Le recalcul est pur et sans effet de bord.
- [x] Les préférences inconnues ne sont pas traitées ici (Phase 4) ; aucune validation métier dupliquée.
- [x] Le résultat respecte `JourneyPlan` et `Explanation[]`.

---

## 8. Fixtures techniques neutres

- [x] Créer `tests/unit/fixtures/plan-fixtures.ts` avec des identifiants techniques (`objective-1`, `step-1`, `rule-1`).
- [x] Aucun libellé, objectif ou contenu métier réaliste.
- [x] Couvrir : plan de base, étapes requises/facultatives, ordre égal, règle sans effet, règle avec effet, conflit, tentative de retrait requis, condition invalide.
- [x] Ne pas importer les fixtures dans le code applicatif.

**Critères :**

- [x] Les fixtures restent techniques et clairement identifiées.
- [x] Aucune donnée de démonstration réelle n'est présentée comme définitive.

---

## 9. Tests

### 9.1 Plan de base

- [x] Ordre par `ordre` puis `id`.
- [x] Isolation stricte par objectif.
- [x] Toutes les étapes requises présentes et visibles.
- [x] Aucune étape requise ajoutée ou retirée à tort.
- [x] Répétition avec les mêmes entrées ⇒ plan identique (F02).

### 9.2 Règles

- [x] Règles évaluées par `id` croissant.
- [x] Effet d'ordre appliqué à une étape non requise.
- [x] Effet de visibilité appliqué à une étape non requise.
- [x] Une étape requise ne peut être ni retirée ni masquée (`REQUIRED_STEP_REMOVED`).
- [x] Conflit d'effets ⇒ `RULE_CONFLICT`, aucun plan partiel.
- [x] Condition invalide ou référence inconnue ⇒ `CATALOG_INVALID`.
- [x] Une règle sans changement ne produit aucun effet ni explication.

### 9.3 Explications

- [x] Changement d'ordre ⇒ une explication `step_order`.
- [x] Changement de visibilité ⇒ une explication `step_visibility`.
- [x] Plan identique ⇒ `explanations` vide.
- [x] `reason` provient de la règle ou du catalogue, jamais du code.
- [x] `ruleId` présent lorsque l'explication provient d'une règle.
- [x] Ordre des explications stable et déterministe.
- [x] Aucun texte métier fabriqué.

### 9.4 Invariants et non-régression

- [x] Étape requise absente ⇒ erreur, aucun plan retourné.
- [x] Étape requise masquée ⇒ erreur, aucun plan retourné.
- [x] Étape hors objectif ⇒ erreur.
- [x] Étape dupliquée ⇒ erreur.
- [x] Test de non-régression A08 : après application de toute règle, toutes les étapes requises restent présentes et visibles.

### 9.5 Contraintes transverses

- [x] Aucun test ne dépend du réseau, de l'horloge ou du hasard.
- [x] Aucune mutation des entrées dans les tests de non-régression.
- [x] `npm run lint` passe.
- [x] `npm run typecheck` passe.
- [x] `npm run test` passe.
- [x] `npm run build` passe.
- [x] Aucun `fetch` dans le code source livré.

---

## 10. Porte G2 — Critères de fin

- [x] Même entrée ⇒ même plan.
- [x] Aucune étape requise retirée ou masquée.
- [x] Conflit signalé (`RULE_CONFLICT`), jamais masqué.
- [x] Aucun texte métier fabriqué par le moteur.
- [x] Toutes les explications correspondent à un changement réel.
- [x] Invariant A08 couvert par un test de non-régression.
- [x] Aucun contenu métier inventé.
- [x] Aucun backend, base, API HTTP, auth, rôle ou secret introduit.
- [x] Aucun fichier hors périmètre modifié.
- [ ] Vérification indépendante effectuée (lecture seule), verdict `PASS` ou `PASS WITH NOTES`.
- [x] Handoff rédigé : fichiers, commandes, tests, limites, Open Questions, état de G2.

**Les décisions contractuelles sont résolues. G2 reste en attente de vérification indépendante et de validation de porte. Aucun verdict indépendant n’est revendiqué par l’implémentation.**

---

## 11. Traçabilité

| Élément | Couverture Phase 2 |
|---|---|
| F02 Initialiser le parcours | `buildBasePlan`, déterminisme |
| F04 Modifier une préférence | Recalcul du plan, application des règles |
| F05 Expliquer l'adaptation | `explanation.ts`, diff réel uniquement |
| A04 Justification d'une adaptation | `Explanation.reason` issue du catalogue |
| A08 Étapes obligatoires préservées | Invariants de plan + tests de non-régression |
| N04 Feedback | Explications réelles, erreurs de configuration |
| N06 Performance | Évaluation locale synchrone |
| N07 Stabilité | Aucun plan partiel, erreurs retournées |

---

## 12. Open Questions et limites

| ID | Question | Impact Phase 2 |
|---|---|---|
| OQ-B4 / OQ-AC4 | Grammaire de `RuleCondition` et forme de l'effet d'une règle | **Résolue** : décision approuvée et contrat mis à jour |
| OQ-B1 / OQ-M1 | `ressources/` absent | Fixtures techniques uniquement ; aucun contenu réel |
| OQ-B2 | Domaine métier non fourni | Aucune règle métier ne peut être finalisée |
| OQ-B3 | Forme exacte des réponses par étape | Hors Phase 2 ; concerne la Phase 3 |
| H02 | Tâche métier non confirmée | Aucun contenu métier ne peut être finalisé |
| H04 | Stack React/TS/Vite conditionnelle | Domaine portable TypeScript |

---

## 13. Handoff attendu

- [x] Liste des fichiers créés et modifiés.
- [x] Décisions prises pour `RuleCondition` et les effets de règle (ou blocage documenté).
- [x] Commandes exécutées et résultats.
- [x] Tests ajoutés et éléments de traçabilité couverts.
- [x] Limites connues et Open Questions.
- [x] Confirmation explicite : aucun backend, base, auth, API réseau, secret ni contenu métier inventé.
- [x] État de la porte G2.

### Handoff d’implémentation — 14 novembre 2026

**État :** implémentation Phase 2 terminée et contrôles automatiques réussis. La vérification indépendante G2 reste à effectuer. La preuve des approbations humaines G0/G1 mentionnées dans `tasks-phase-1.md` reste à consigner ; la demande explicite de poursuivre la Phase 2 a été appliquée sans prétendre signer ces portes.

**Fichiers modifiés dans cette intervention :**

- `src/domain/rule-evaluator.ts` : validation du plan et des références, validation des effets même lorsque la condition est fausse, préférences déclarées triées avec leurs valeurs par défaut, exclusion des propriétés héritées, application aux seules étapes de l’objectif actif, cibles triées, omission des effets sans changement et détection des conflits conservée même pour une demande sans changement.
- `src/domain/journey-engine.ts` : recalcul complet avec attribution des changements aux règles actives, y compris une règle dont la valeur correspond au plan de base.
- `src/domain/explanation.ts` : explication des retours aux valeurs de base lorsque les règles deviennent inactives ; raison issue de `Step.titre`, sans `ruleId` fictif. Les explications de règles restent dans l’ordre d’évaluation ; les restaurations restantes sont triées par identifiant d’étape.
- `src/domain/invariants.ts` : rejet d’une visibilité non booléenne avec `CATALOG_INVALID`.
- `tests/unit/domain/rule-evaluator.test.ts`, `journey-engine.test.ts`, `plan-invariants.test.ts` : régressions pour les comportements ci-dessus, conditions composites et cycliques, atomicité après conflit tardif, déterminisme répété, immutabilité des entrées et invariant A08.
- `docs/tasks.md` : checklist et présent handoff.

Les modules, les tests d’explication et les fixtures techniques déjà présents ont été conservés. Aucun type du contrat, aucune opération ni aucun code d’erreur n’a été changé ; `api-contract.md` n’a pas été modifié.

**Commandes et résultats :**

- `npm.cmd run lint` : PASS. La première invocation `npm run lint` a été refusée par la politique PowerShell sur `npm.ps1` ; le lanceur `.cmd` a réussi sans changer cette politique.
- `npm run typecheck` : PASS.
- `npm test` : PASS, 6 fichiers, 98 tests.
- `npm run build` : PASS.
- Recherche statique dans `src/domain` et `src/data` : aucun réseau, stockage, DOM, horloge ou hasard. Le DOM existant dans `src/main.ts` appartient à la coque Phase 0.

**Traçabilité :** F02 (ordre stable et déterminisme), F04 (préférences et recalcul), F05/A04 (diff réel et raisons issues du catalogue), A08 (requis présents et visibles), N07 (erreurs sans résultat partiel).

**Limites :** `ressources/` reste absent et le catalogue de démonstration reste vide. Les libellés techniques des fixtures peuvent être vides ; le contenu réel devra fournir les titres servant aux explications de restauration. La validation des préférences utilisateur, les sessions, réponses, invalidations, sélecteurs, UI et persistance restent aux phases suivantes. Aucun backend, base de données, auth, API réseau, secret ni contenu métier inventé n’a été introduit. Aucun changement de dépendance ou de configuration.

**G2 :** prêt pour revue indépendante, non signé. L’implémentation ne s’attribue pas un verdict `PASS` indépendant.
