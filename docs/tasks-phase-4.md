# Le Chemin Vivant — Tâches d’exécution

**Phase :** 4 — Cœur local : réversibilité, préférences et sélecteurs  
**Porte :** G4 — Cœur local complet, sélecteurs et synthèse conformes  
**Dépendance :** Phase 3 / G3  
**Statut :** implémentation terminée ; contrôles automatiques réussis ; revue indépendante et approbation humaine G4 en attente  
**Historique :** [Phase 1](tasks-phase-1.md), [Phase 2](tasks-phase-2.md), [Phase 3](tasks-phase-3.md)

> **Objectif :** conserver les réponses lors des adaptations et corrections, signaler les invalidations, produire les vues de lecture et une synthèse fidèle, puis permettre une réinitialisation confirmée.
>
> **Périmètre :** `CMD-02`, `CMD-05`, `CMD-06`, `QRY-01`, `QRY-02`, `QRY-03`, orchestration locale et tests sans DOM.
>
> **Hors périmètre :** UI et intégration des vues, navigation navigateur, persistance, déploiement et contenu métier réel.
>
> **Interdits :** backend, base de données, API HTTP, réseau, auth, secret, nouvelle dépendance, horloge, hasard ou contenu métier inventé.

## 1. Sources et état des préconditions

| Source | Références |
|---|---|
| [Master plan](master-plan.md) | §5 Phase 4, §6 et §8 : périmètre, critères et G4 |
| [Contrat](api-contract.md) | §5–8, §11–13 : types, commandes, requêtes, erreurs et invariants |
| [Plan du cœur local](backend-plan.md) | §5.2, §7.3–7.7, §8, §9 étapes 6–7, §10–12 |
| [Architecture](architecture.md) | §5–9, §18 et §20 : séparation domaine/application et révision |
| [Frontend](frontend-plan.md) | §7–8 et §11–12 : futurs consommateurs du cœur et état de feedback |
| [Workflow](ai-workflow.md) | §7–8, §12–13, §16 et §21–22 : revue indépendante et approbation humaine G4 |

- [x] Lire les sources Phase 4 et le handoff Phase 3.
- [x] Vérifier le point de départ : 172 tests, 9 fichiers, PASS.
- [x] Exécuter la demande explicite de poursuivre sans présenter les portes historiques comme signées.
- [ ] Consigner les revues indépendantes G2/G3 et les validations historiques encore absentes des handoffs.
- [x] Confirmer que `ressources/` est absent ; employer uniquement des fixtures techniques.
- [x] Conserver les types et enveloppes du contrat sans modification de `models.ts` ou `api-contract.md`.

## 2. Fichiers et couches

- [x] Étendre `src/domain/validation.ts` : préférences déclarées, révision d’une étape, erreurs `CMD-05`.
- [x] Étendre `src/domain/session.ts` : copie isolée, réconciliation du curseur, invalidations dérivées et état vierge.
- [x] Étendre `src/domain/explanation.ts` : explications des nouvelles invalidations réelles.
- [x] Étendre `src/application/session-controller.ts` : trois nouvelles commandes et contrôleur en mémoire.
- [x] Créer `src/application/selectors.ts` : lectures pures et copies des DTO.
- [x] Créer `tests/unit/fixtures/adaptation-fixtures.ts` : préférences et règles techniques.
- [x] Créer `tests/unit/domain/adaptation.test.ts`.
- [x] Créer `tests/unit/application/adaptation.test.ts` et `selectors.test.ts`.
- [x] Archiver la checklist Phase 3 dans `docs/tasks-phase-3.md` et mettre à jour `docs/tasks.md`.
- [x] Conserver catalogue métier, UI, configuration, dépendances et scripts existants.

Le domaine utilise uniquement des données injectées et des fonctions pures. Le contrôleur coordonne catalogue et moteur. Les sélecteurs dérivent leurs résultats sans enregistrer de changement ni produire un historique fictif.

## 3. Préférence — CMD-02

**Succès :** `ContractResult<{ state; plan; explanations; invalidatedAnswers }>` avec les types existants du contrat.

- [x] Refuser une session inactive avec `SESSION_REQUIRED`.
- [x] Distinguer `PREFERENCE_NOT_FOUND` et `PREFERENCE_VALUE_INVALID`.
- [x] Accepter exclusivement les valeurs déclarées par `Preference.valeurs`, ou `Preference.valeur` lorsque la liste est absente.
- [x] Copier l’état et les réponses avant de modifier une préférence.
- [x] Reconstruire le plan précédent et recalculer le plan complet avec le moteur existant.
- [x] Renvoyer les vrais changements d’ordre/visibilité et leurs raisons issues du catalogue.
- [x] Ne produire aucune explication pour un plan inchangé.
- [x] Préserver les réponses masquées et signaler les réponses invalidées avec une raison.
- [x] Déplacer un curseur devenu invisible vers un requis non validé, ou la première étape applicable ; utiliser `null` seulement si aucune étape ne s’applique.
- [x] Propager `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` et `CATALOG_INVALID` sans état ni plan partiel.

## 4. Révision — CMD-05

**Succès :** `ContractResult<{ state; plan; explanations; invalidatedAnswers; issues }>`.

- [x] Vérifier la session, l’existence de l’étape et son appartenance à l’objectif actif.
- [x] Permettre une correction d’étape non active conformément au contrat.
- [x] Refuser une réponse absente/vide avec `ANSWER_REQUIRED` et une structure invalide avec `ANSWER_INVALID`, opération `CMD-05`.
- [x] Copier les tableaux et préserver les réponses non concernées ainsi que les préférences.
- [x] Recalculer le plan et ses invariants après correction.
- [x] Lever l’invalidation explicitement corrigée si la réponse est désormais applicable et valide ; maintenir celle d’une étape encore masquée.
- [x] Renvoyer `issues: []` en succès ; utiliser la correspondance existante `error.fields.stepId` → `ValidationIssue[]` en échec.
- [x] Ne pas fabriquer une adaptation ni une dépendance entre réponses quand le contrat n’en déclare aucune.

## 5. Invalidations, explications et atomicité

- [x] Détecter les réponses présentes devenues masquées ou structurellement invalides sans effacer leurs valeurs.
- [x] Trier les invalidations par identifiant pour un résultat reproductible.
- [x] Produire `answer_invalidated` uniquement pour une nouvelle invalidation ; ne pas répéter une adaptation inexistante.
- [x] Employer la raison et le `ruleId` du changement de visibilité lorsqu’ils existent, sinon un libellé d’étape du catalogue.
- [x] Conserver les invalidations en attente dans le contexte de feedback jusqu’à correction ou réinitialisation.
- [x] Ne pas réhabiliter silencieusement une réponse seulement parce que son étape redevient visible.
- [x] Exclure les réponses encore invalidées des décisions de synthèse ; bloquer la complétion si un requis reste explicitement invalidé.
- [x] Ne jamais muter l’état, les tableaux ou le catalogue d’entrée, en succès comme en échec.
- [x] Conserver les invariants des Phases 1–3, dont A08.

## 6. Recommencer — CMD-06

**Succès :** `ContractResult<{ state: SessionState }>`.

- [x] Refuser l’absence de session avec `SESSION_REQUIRED`.
- [x] Exiger `confirm === true`, sinon `CONFIRMATION_REQUIRED` sans effacement.
- [x] Retourner exactement `{ objectiveId: null, activeStepId: null, preferences: {}, answers: {} }` dans `state`.
- [x] Créer des conteneurs vides distincts à chaque reset.
- [x] Effacer historique, erreurs locales et invalidations dans le contrôleur en mémoire après un reset réussi.
- [x] Ne pas dépendre du catalogue ni du stockage pour effectuer la réinitialisation.
- [x] Laisser l’effacement de persistance à la Phase 7.

## 7. Sélecteurs — QRY-01, QRY-02, QRY-03

- [x] `getObjectives` : valider le catalogue, conserver son ordre déclaré, dériver `selected` de la session.
- [x] `getSessionView` : fournir objectif, plan, étape active, progression visible, préférences et réponses réelles.
- [x] Exposer uniquement l’historique effectivement fourni par le contexte ; ne pas recréer des explications à partir d’une simulation.
- [x] Rendre les erreurs locales encore pertinentes et les invalidations visibles à corriger.
- [x] Dériver `status` et `view` de la complétion réelle, sans compteur stocké dans `SessionState`.
- [x] `getSummary` : refuser un parcours requis incomplet avec `JOURNEY_INCOMPLETE`.
- [x] Fournir décisions réelles applicables et valides dans l’ordre du plan, préférences sélectionnées et historique réel.
- [x] Fournir `requiredTotal`, `requiredCompleted` et `completed` cohérents ; aucune réponse facultative ne compense un requis manquant.
- [x] Gérer les objectifs sans étape et les plans vides selon les conventions Phase 3, sans inventer de décision.
- [x] Refuser les contextes incohérents (objectif inconnu, curseur absent du plan, préférence non déclarée, réponse hors objectif) avec `CATALOG_INVALID`.
- [x] Conserver `SESSION_REQUIRED` et `OBJECTIVE_REQUIRED` selon l’opération et les préconditions du contrat.
- [x] Retourner des copies isolées des réponses tableaux, libellés, listes de valeurs et changements d’explication.
- [x] Garantir que des lectures répétées n’ajoutent ni historique ni effet de bord.

## 8. Orchestration en mémoire

- [x] Ajouter `createSessionController(catalog)` pour les futurs consommateurs UI, sans stockage ni dépendance DOM.
- [x] Exposer les six commandes et les trois lectures ; conserver les fonctions stateless disponibles séparément.
- [x] N’enregistrer un nouvel état qu’après un résultat `ok: true`.
- [x] Copier les résultats avant conservation interne pour empêcher une mutation par l’appelant.
- [x] Accumuler uniquement les explications des commandes réussies, avec des identifiants reproductibles et distincts dans l’historique.
- [x] Conserver les erreurs locales à travers un rejet sans rapport ; les remplacer lors d’une nouvelle erreur locale et les vider après une commande réussie.
- [x] Garder les invalidations en attente jusqu’à leur correction explicite ; ne les perdre ni lors d’une lecture, ni lors d’une commande sans changement.
- [x] Réinitialiser tout feedback lors d’une nouvelle sélection ou d’un restart réussi.
- [x] Vérifier l’isolation entre deux instances du contrôleur.

## 9. Tests et contrôles réalisés

| Commande | Résultat |
|---|---|
| `npm.cmd test` avant intervention | PASS — 172 tests, 9 fichiers |
| `npm.cmd run lint` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd test` après intervention | PASS — 236 tests, 12 fichiers ; 64 nouveaux tests |
| `npm.cmd run build` | PASS |
| Recherche statique dans `src/domain` et `src/application` | Aucun réseau, DOM, stockage, horloge ou hasard |

- [x] Couvrir les trois nouvelles commandes, les trois requêtes et leurs champs de succès exacts.
- [x] Couvrir les erreurs Phase 4 : `PREFERENCE_NOT_FOUND`, `PREFERENCE_VALUE_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED`, `JOURNEY_INCOMPLETE`, `CONFIRMATION_REQUIRED` et les gardes de session/étape/réponse applicables.
- [x] Tester masquer → conserver → réafficher → maintenir invalide → corriger → réintégrer en synthèse.
- [x] Tester les rejets atomiques, les entrées gelées, les tableaux copiés et les mutations des résultats par l’appelant.
- [x] Tester synthèse fidèle, requis incomplets, objectifs vides, étapes facultatives et masquées, historique réel et absence d’explication fictive.
- [x] Tester reset confirmé/refusé, absence de résidu et nouvelle sélection après reset.
- [x] Tester déterminisme, absence d’effet de bord des lectures et maintien des 172 tests existants.

Les erreurs de persistance et leur adaptateur restent à la Phase 7 ; aucun test artificiel de fonction non implémentée n’est présenté comme couverture de stockage. Les tests du domaine ne constituent pas des preuves UI ou navigateur A01–A16.

## 10. Décisions, limites et signatures du handoff

**Contrat conservé :** aucune modification de `models.ts`, des opérations, des codes ou des enveloppes. Les fonctions d’application reçoivent explicitement leur contexte injecté ; les entrées/sorties métier restent celles du contrat.

- `updatePreference(state, { preferenceId, value }, catalog, pendingInvalidations = [])`.
- `reviseAnswer(state, { stepId, answer }, catalog, pendingInvalidations = [])`.
- `restart(state, { confirm: true })`.
- `getObjectives(catalog, state = null)`.
- `getSessionView(state, catalog, { explanations, issues, invalidatedAnswers } = {})`.
- `getSummary(state, catalog, explanations = [], invalidatedAnswers = [])`.
- `createSessionController(catalog)` : façade en mémoire qui transporte automatiquement ce contexte entre les six commandes et les trois requêtes.

**Conservation des invalidations :** `SessionState` ne possède pas de champ pour marquer les invalidations ou stocker les explications. Ces informations sont conservées séparément dans le feedback applicatif, comme prévu par le plan frontend §11. Les appels stateless doivent retransmettre les `invalidatedAnswers` retournés en contexte lors des appels suivants. La façade le fait automatiquement. Une réapparition seule ne vaut pas correction. Les valeurs restent dans `state.answers` ; la synthèse les exclut tant qu’elles sont marquées.

**Révision et dépendances :** la grammaire approuvée de `RuleCondition` dépend uniquement des préférences, pas des réponses. Une correction recalcule donc le plan, mais ne fabrique pas de dépendance ni d’invalidation en aval lorsque les règles n’en déclarent aucune. Une révision sans changement de plan ne produit pas une explication d’ordre/visibilité fictive. Le contrat ne définit pas de `ExplanationChange.kind` pour le simple remplacement d’une valeur de réponse ; aucune extension implicite n’a été ajoutée.

**Validation de contenu :** OQ-B3/OQ-AC3 et l’absence de `ressources/` restent ouverts. Les réponses sont contrôlées selon leur forme `string | string[]` et les règles d’absence Phase 3. Aucun format, option métier ou contrainte de contenu supplémentaire n’est inventé.

**Raisons :** les règles et les titres techniques du catalogue fournissent les raisons d’adaptation/invalidation. Des titres réels seront nécessaires lorsque le contenu sera fourni. Les messages techniques de validation n’inventent aucun texte métier.

**Historique :** les sélecteurs stateless ne produisent pas d’historique lorsqu’aucun n’est fourni. La façade conserve uniquement les événements réellement retournés par les commandes réussies ; les lectures n’en ajoutent pas. Les resets/nouvelles sélections réussis effacent historique, issues et invalidations.

**Sortie attendue livrée :** cœur local pour `CMD-01..06` et `QRY-01..03`, `SessionView` et `Summary` prêts pour une future intégration UI. Aucun composant UI n’a été implémenté.

## 11. Porte G4 et suite

- [x] Aucune perte silencieuse des réponses lors d’une préférence, d’un retour ou d’une correction.
- [x] Aucune complétion incorrecte dans les cas couverts ; aucune étape requise masquée ou supprimée.
- [x] Erreurs et résultats conformes aux opérations implémentées.
- [x] Aucun contenu métier produit par le moteur ; aucun backend, base, auth, API réseau, secret, stockage ou nouvelle dépendance introduit.
- [x] Handoff rédigé : fichiers, signatures, tests, décisions et limites ci-dessus.
- [ ] Faire effectuer la vérification indépendante en lecture seule, verdict `PASS` ou `PASS WITH NOTES`, et corriger tout constat bloquant.
- [ ] Consigner l’approbation humaine G4 requise par `ai-workflow.md` §16 avant l’intégration des vues.

**G4 : implémentation prête pour revue, porte non signée.** Le présent handoff n’est pas une vérification indépendante et ne valide pas les portes antérieures. La Phase 5 concerne la coque UI ; l’intégration fonctionnelle des vues appartient à la Phase 6 et attend la validation du cœur.
