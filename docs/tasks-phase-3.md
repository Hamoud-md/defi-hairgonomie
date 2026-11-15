# Le Chemin Vivant — Tâches d’exécution

**Phase :** 3 — Cœur local : session, validation et progression  
**Porte :** G3 — Parcours local complet, atomicité testée  
**Dépendance :** Phase 2 / G2  
**Statut :** implémentation terminée et contrôles automatiques réussis ; revues indépendantes G2/G3 encore à consigner  
**Historique :** [Phase 1](tasks-phase-1.md), [Phase 2](tasks-phase-2.md)

> **Objectif :** permettre un parcours complet au niveau du domaine (E01 → E02), jusqu’à la complétion, avec initialisation, validation, progression et retour sans perte de réponse.
>
> **Périmètre :** `CMD-01`, `CMD-03`, `CMD-04`, transitions immuables, `Progress`, complétion et tests sans DOM.
>
> **Hors périmètre :** `CMD-02`, `CMD-05`, `CMD-06`, invalidation, sélecteurs `QRY-*`, `SessionView`, synthèse E03, UI, persistance et déploiement.
>
> **Interdits :** backend, base de données, API HTTP, réseau, auth, secret, contenu métier inventé, dépendance à l’horloge ou au hasard.

## 1. Sources et décisions de périmètre

| Source | Références à appliquer |
|---|---|
| [Master plan](master-plan.md) | §4, §5 Phase 3, §6, §8 : découpage des phases, dépendance G2, porte G3 |
| [Contrat](api-contract.md) | §5.2–5.5, §6, §8 CMD-01/03/04, §11–13 : types, sorties, erreurs et invariants |
| [Plan du cœur local](backend-plan.md) | §5.2, §7.3–7.5, §8, §9 étapes 5–6, §10–12 : couches, transitions et tests |
| [Architecture](architecture.md) | §5–7, §9.1/9.2/9.4, §18, §20 : dépendances et arborescence |
| [Plan frontend](frontend-plan.md) | §7, §11–12 : futurs consommateurs des commandes ; aucune UI à créer ici |
| [Infrastructure](infra-plan.md) | §1–3 : exécution locale client-only ; aucune action d’hébergement dans cette phase |
| [Workflow](ai-workflow.md) | §6–8, §12–13, §21–22 : vérification indépendante, tests et handoff |

Les numéros « Phase 3 » des en-têtes historiques du plan backend ne désignent pas le découpage d’exécution. **Le master plan fixe ce découpage.** Il place explicitement `CMD-04` en Phase 3, même si le plan backend le regroupe à l’étape 6 avec les révisions. Seul le retour simple est donc inclus ici ; préférence, révision, invalidation et redémarrage restent en Phase 4.

Le contrat reste la référence pour les formes de résultat et les erreurs. Cette checklist ne modifie aucun contrat et ne déclare aucune décision nouvelle approuvée.

## 2. Préconditions et questions à résoudre

- [ ] Consigner la vérification indépendante G2 (`PASS` ou `PASS WITH NOTES`) et vérifier l’absence de constat bloquant avant de commencer l’implémentation Phase 3.
- [ ] Vérifier les décisions et réserves héritées de G0/G1 ; ne pas présenter leurs validations comme acquises sans preuve.
- [x] Relire le handoff [Phase 2](tasks-phase-2.md) et confirmer les signatures disponibles : `buildBasePlan`, `buildPlan`, `recalculatePlan`, `validatePlan`.
- [x] Vérifier que les tests existants passent et conserver leur couverture de déterminisme et de l’invariant A08.
- [x] Confirmer que `ressources/` reste absent ; utiliser exclusivement des fixtures techniques pour les nouveaux tests.
- [x] Résoudre ou borner explicitement les questions ci-dessous avant le code concerné ; poursuivre les tâches indépendantes sans inventer de comportement.

| ID | Point à clarifier | Référence et conséquence |
|---|---|---|
| OQ-B3 / OQ-AC3 | Options et schéma des réponses par étape non déclarés dans `Step` | `AnswerValue` reste `string | string[]`. Implémenter les contrôles structurels et d’absence documentés ; ne créer ni liste métier ni champ public d’options. La validation de valeurs déclarées reste limitée tant que leur source manque. |
| P3-Q1 | Transport de `ValidationIssue[]` lors d’un échec de `CMD-03` | §8 demande des erreurs dans `issues`, mais `ContractResult` impose `data: null` en échec et `ContractError` ne porte pas `issues`. Définir une correspondance conforme ou faire approuver une évolution préalable du contrat ; ne pas ajouter un champ d’erreur implicitement. |
| P3-Q2 | Progression en présence d’étapes masquées | Le contrat parle de plan applicable, le backend de nombre d’étapes du plan. Consigner le traitement des étapes `visible: false` pour le total, la position, l’avancement et le retour ; une étape masquée ne doit pas devenir active. |
| P3-Q3 | Fin du parcours et cas limites | Figer la valeur de `activeStepId`, `nextStepId` et `Progress` à la complétion, pour un objectif sans étape ou sans étape requise, et pour des étapes facultatives après le dernier requis. Concilier la complétion avec les invariants de l’étape active et les bornes de progression. |
| P3-Q4 | Erreurs du moteur pendant `CMD-01` | Le moteur peut produire `REQUIRED_STEP_REMOVED`, absent de la liste spécifique de `CMD-01`. Documenter une politique conforme au contrat sans masquer l’échec ni créer une session partielle. |

Toute modification nécessaire de type, opération, code d’erreur ou enveloppe exige une mise à jour préalable de `api-contract.md` et la validation prévue par le workflow. Les questions locales ci-dessus sont des constats à traiter, pas des décisions déjà approuvées.

## 3. Fichiers et frontières autorisés

- [x] Créer `src/domain/session.ts` : transitions immuables, progression et complétion à partir de données injectées ; aucun accès direct au catalogue ni au stockage.
- [x] Créer `src/domain/validation.ts` : gardes d’objectif, de session, d’étape et de réponse ; aucune règle métier inventée.
- [x] Créer `src/application/session-controller.ts` uniquement comme adaptation minimale de `CMD-01`, `CMD-03`, `CMD-04` aux résultats du contrat, conformément à l’architecture et au plan backend §5.2/§8. Coordonner les modules sans dupliquer leurs règles et sans brancher la persistance.
- [x] Créer `tests/unit/domain/session.test.ts` et `tests/unit/domain/validation.test.ts`.
- [x] Créer `tests/unit/application/session-controller.test.ts` pour les formes contractuelles et les séquences de commandes.
- [x] Créer `tests/unit/fixtures/session-fixtures.ts` ; réutiliser les fixtures de catalogue/plan existantes sans les importer dans l’application.
- [x] Mettre à jour `docs/tasks.md` avec les résultats et le handoff au fur et à mesure de l’exécution.

**À conserver :** modèles du contrat et implémentation des Phases 1–2. Toute correction nécessaire dans ces fichiers doit être motivée, limitée et accompagnée d’une régression ; aucune refonte n’est planifiée ici.

**À ne pas modifier :** `src/main.ts`, `src/app/**`, `src/views/**`, `src/ui/**`, `src/platform/**`, `src/data/demo-data.ts`, configuration de build, dépendances et scripts. Ne pas créer `application/selectors.ts` ni implémenter les commandes des phases suivantes.

## 4. Validation — `domain/validation.ts`

- [x] Définir des fonctions internes explicites utilisant les types existants et des données injectées, sans nouveau modèle métier public.
- [x] Refuser l’absence d’objectif pour `CMD-01` avec `OBJECTIVE_REQUIRED`, puis un objectif inconnu avec `OBJECTIVE_NOT_FOUND`.
- [x] Refuser les commandes nécessitant une session lorsqu’elle est absente avec `SESSION_REQUIRED`.
- [x] Distinguer pour `CMD-03` une étape inconnue (`STEP_NOT_FOUND`), hors objectif (`STEP_NOT_IN_OBJECTIVE`) et non active (`STEP_NOT_ACTIVE`).
- [x] Vérifier que l’étape active est dans le plan applicable de l’objectif, sans activation d’une étape masquée.
- [x] Traiter une clé absente, `""` et `[]` comme une réponse non fournie conformément au contrat ; documenter les autres cas vides selon les décisions retenues, sans contrainte métier implicite.
- [x] Retourner `ANSWER_REQUIRED` pour une réponse absente ou vide lors de la validation, selon `CMD-03`.
- [x] Vérifier la structure `string | string[]` ; refuser les formes non conformes avec `ANSWER_INVALID` sans prétendre valider des options métier absentes.
- [x] Préparer les `ValidationIssue` avec `stepId`, code exact et message technique neutre ; traiter leur transport selon P3-Q1.
- [x] Ne définir ni longueur minimale, regex métier, format d’e-mail, choix fermé ni valeur par défaut de réponse sans source approuvée.
- [x] Fixer et tester un ordre déterministe des gardes lorsque plusieurs erreurs sont possibles.

## 5. Initialisation — `CMD-01`

**Entrée contractuelle :** `{ objectiveId: Id }`  
**Succès :** `ContractResult<{ state: SessionState; plan: JourneyPlan; explanations: Explanation[] }>`

- [x] Valider l’objectif et le catalogue avant de rendre une session utilisable.
- [x] Initialiser les préférences depuis `Preference.valeur` dans un ordre stable.
- [x] Appeler le moteur Phase 2 avec ces préférences pour obtenir le plan applicable ; ne pas réimplémenter ses règles.
- [x] Initialiser une nouvelle `SessionState` avec l’objectif choisi, les préférences initiales, des réponses vides et la première étape applicable comme étape active.
- [x] Ne transférer aucune réponse d’une session précédente, même si l’objectif est identique.
- [x] Préserver les étapes requises et transmettre les échecs de configuration sans état ni plan partiel.
- [x] Retourner uniquement les explications d’une adaptation effective selon le comportement Phase 2 ; aucune explication fictive pour la simple initialisation.
- [x] Gérer le cas d’un plan sans étape selon P3-Q3 ; ne pas inventer un identifiant actif.
- [x] Garantir que mêmes entrées produisent même état, plan et explications.

## 6. Validation et progression — `CMD-03`

**Entrée contractuelle :** `{ stepId: Id; answer: AnswerValue }`  
**Succès :** `ContractResult<{ state: SessionState; issues: ValidationIssue[]; progress: Progress; completed: boolean; nextStepId: Id | null }>`

- [x] Appliquer les gardes de session, étape et réponse avant toute transition.
- [x] Enregistrer la réponse valide dans un nouvel état et conserver toutes les autres réponses.
- [x] Copier les tableaux de réponse pour éviter une mutation ultérieure par l’appelant.
- [x] Ne pas avancer ni modifier les réponses en cas d’échec ; ne pas retourner un succès ambigu pour contourner l’enveloppe d’erreur.
- [x] Déterminer la prochaine étape applicable selon le plan trié existant ; ignorer les étapes masquées selon P3-Q2.
- [x] Garantir que `nextStepId` et l’étape active existent dans le plan et appartiennent à l’objectif.
- [x] Calculer la progression et la complétion depuis le nouvel état validé.
- [x] Retourner `issues: []` en succès lorsqu’aucun problème n’est constaté ; rendre les échecs selon P3-Q1.
- [x] Préserver l’état et le catalogue d’entrée sur tous les chemins, y compris lorsqu’une erreur survient après une garde précédente réussie.

## 7. Progression et complétion

- [x] Calculer `Progress.current` comme position 1-based de l’étape active dans le plan applicable ; ne pas confondre position courante et nombre de réponses enregistrées.
- [x] Calculer `Progress.total` selon le périmètre applicable fixé par P3-Q2.
- [x] Garantir des valeurs finies et cohérentes, sans indice hors bornes ; couvrir l’absence d’étape selon P3-Q3.
- [x] Calculer `completed` à partir de la validation de toutes les étapes requises de l’objectif, pas du seul nombre de clés dans `answers` ni de la position du curseur.
- [x] Ne pas compter comme valide une réponse absente, vide, étrangère à l’objectif ou structurellement invalide.
- [x] Ne pas laisser des réponses d’étapes facultatives ou d’un autre objectif compenser un requis manquant.
- [x] Distinguer le déplacement du curseur par retour de l’effacement d’une réponse ; un simple retour conserve les validations encore valides.
- [x] Garder progression et complétion dérivées ; ne pas ajouter de champ à `SessionState`.
- [x] Appliquer les décisions de fin de parcours P3-Q3 sans créer de synthèse ni de navigation UI.

## 8. Retour — `CMD-04`

**Entrée contractuelle :** aucune entrée métier, contexte injecté  
**Succès :** `ContractResult<{ state: SessionState; activeStepId: Id; progress: Progress }>`

- [x] Vérifier la session, l’objectif sélectionné et l’existence de l’étape active selon les erreurs documentées pour cette commande.
- [x] Refuser le retour depuis la première étape applicable avec `FIRST_STEP`.
- [x] Choisir l’étape applicable précédente selon l’ordre du plan, sans soustraire une valeur d’`order` ni fabriquer un identifiant.
- [x] Conserver intégralement les réponses et les préférences ; aucune invalidation ni suppression lors du retour simple.
- [x] Retourner un nouvel état, l’identifiant actif correspondant et la progression recalculée.
- [x] Ne modifier ni plan ni règles pour effectuer un simple retour.
- [x] Couvrir les ordres égaux, les étapes masquées, les appels répétés et les limites retenues après complétion.

## 9. Matrice de tests

| Sujet | Cas minimaux | Traces |
|---|---|---|
| Initialisation | Objectif absent/inconnu, catalogue invalide, préférences par défaut, première étape applicable, nouvelle session sans réponses héritées | F01, F02 |
| Intégration moteur | Adaptation initiale, conflit `RULE_CONFLICT`, invariant requis, absence de plan/session partiel, P3-Q4 | F02, A08, N07 |
| Gardes d’étape | Session absente, étape inconnue, hors objectif, non active, étape masquée non activée | F08 |
| Réponses | Absence, `""`, `[]`, type invalide, tableau avec élément non string, string/tableau valides sans contrainte métier inventée | F08, A06 au domaine |
| Avancement | Bonne réponse enregistrée, autres réponses conservées, bonne prochaine étape, isolation par objectif | F03, F08 |
| Progression | Position 1-based, total applicable, ordres égaux, étapes masquées, absence d’indice hors bornes | F03 |
| Complétion | Requis manquant/vide/invalide, tous requis valides, cas limites P3-Q3 | A01 au domaine |
| Retour | Première étape, étape précédente réelle, réponses/préférences conservées, erreurs de contexte | F06, A05 partiel |
| Atomicité | Chaque code d’échec laisse l’état inchangé ; échec de validation puis correction réussie | N07, V12, A06 |
| Immutabilité | Entrées gelées, réponse tableau modifiée par l’appelant après succès, catalogue inchangé | N07 |
| Déterminisme | Même catalogue/état/commande ⇒ mêmes sorties ; ordre des clés sans incidence | F02 |
| Contrat | Champs exacts des trois succès, `data: null` en échec, `error.operation` correct, transport des issues décidé | CMD-01/03/04 |

- [x] Écrire au moins un test pour chaque erreur prévue dans ces commandes : `OBJECTIVE_REQUIRED`, `OBJECTIVE_NOT_FOUND`, `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE`, `STEP_NOT_ACTIVE`, `ANSWER_REQUIRED`, `ANSWER_INVALID`, `FIRST_STEP`, `CATALOG_INVALID`, `RULE_CONFLICT` ; traiter `REQUIRED_STEP_REMOVED` selon P3-Q4.
- [x] Tester `CMD-01` → plusieurs `CMD-03` → `completed: true`, sans invoquer `QRY-03` ni créer de synthèse.
- [x] Tester `CMD-01` → `CMD-03` → `CMD-04` avec conservation exacte des réponses.
- [x] Tester `CMD-03` invalide → état inchangé → correction valide → progression.
- [x] Réutiliser uniquement des identifiants et libellés techniques, sans contenu métier réaliste.
- [x] Conserver les tests Phases 1–2 et l’invariant A08 sans régression.

La couverture A01/A05/A06 est limitée aux comportements du domaine : aucune preuve UI, navigateur ou livraison finale n’est revendiquée.

## 10. Vérifications et porte G3

- [x] `npm.cmd run lint` passe.
- [x] `npm.cmd run typecheck` passe.
- [x] `npm.cmd test` passe, y compris les tests existants.
- [x] `npm.cmd run build` passe.
- [x] Vérifier l’absence de réseau, DOM, stockage, horloge et hasard dans les nouveaux modules du cœur.
- [x] Vérifier l’absence de changement de dépendance, de configuration et de contenu métier.
- [x] Vérifier que les décisions P3-Q1 à P3-Q4 et les limites OQ-B3/OQ-AC3 sont consignées ; aucun choix contractuel implicite.
- [x] Vérifier les formes exactes des sorties `CMD-01`, `CMD-03`, `CMD-04`.
- [x] Confirmer qu’un parcours local atteint la complétion seulement après validation de tous les requis.
- [x] Confirmer qu’aucune erreur ne modifie l’état, ne supprime une réponse ou ne renvoie une étape inexistante.
- [ ] Faire effectuer une revue indépendante en lecture seule : verdict `PASS` ou `PASS WITH NOTES`, aucun constat bloquant non corrigé.
- [x] Rédiger le handoff et consigner explicitement l’état de G3 avant toute Phase 4.

**Les cases cochées reflètent l’implémentation et les contrôles du handoff ci-dessous. Les revues indépendantes non réalisées restent décochées. G3 ne peut pas être signé par son implémenteur.** Les points d’approbation humaine du workflow restent applicables, notamment en cas de changement de contrat ; aucune approbation humaine supplémentaire propre à G3 n’est inventée.

## 11. Handoff attendu vers la Phase 4

- [x] Liste exacte des fichiers créés/modifiés et justification des éventuelles corrections Phase 1–2.
- [x] Fonctions disponibles, signatures, données injectées et exemples techniques conformes aux trois commandes.
- [x] Décisions de validation, représentation des issues, progression et fin de parcours, avec références au contrat.
- [x] Tests ajoutés, codes d’erreur couverts, commandes exécutées et résultats réels.
- [x] Confirmation des propriétés d’atomicité, d’immuabilité, de déterminisme et de préservation des requis/réponses.
- [x] Limites connues : contenu absent, options de réponses non fournies et portée des tests techniques.
- [ ] Rapport de revue indépendante et statut G3, sans auto-approbation.
- [x] Rappel du travail restant en Phase 4 : `CMD-02`, `CMD-05`, `CMD-06`, invalidations, sélecteurs et synthèse.
- [x] Confirmation explicite : aucun backend, base, API réseau, auth, secret, UI, stockage ni contenu métier inventé introduit.

## 12. Handoff d’implémentation — 14 novembre 2026

**Livraison :** `CMD-01`, `CMD-03` et `CMD-04` implémentées. La demande explicite de poursuivre a été exécutée ; aucune revue indépendante G2/G3 ni approbation historique G0/G1 n’est déclarée acquise. Aucun fichier des Phases 1–2 ni aucun type de `models.ts` ou du contrat n’a été modifié.

### Fichiers créés

| Fichier | Responsabilité |
|---|---|
| `src/domain/validation.ts` | Gardes, contrôle structurel des réponses, erreurs et correspondance vers `ValidationIssue[]` |
| `src/domain/session.ts` | Initialisation, copies d’état, avancement, retour, progression et complétion |
| `src/application/session-controller.ts` | Adaptation des trois commandes, catalogue injecté, orchestration du moteur Phase 2 |
| `tests/unit/fixtures/session-fixtures.ts` | Catalogue technique, états, gel des entrées et lecture des résultats |
| `tests/unit/domain/validation.test.ts` | Réponses absentes/invalides, gardes et restitution des erreurs locales |
| `tests/unit/domain/session.test.ts` | Transitions, complétion, progression, cas limites et immutabilité |
| `tests/unit/application/session-controller.test.ts` | Contrat des commandes, séquences complètes, configuration, atomicité et déterminisme |

`docs/tasks.md` a été mis à jour avec les résultats. Les dépendances, scripts, configuration, catalogue de démonstration et UI restent inchangés.

### API disponible et couches

Les fonctions du contrôleur sont stateless et synchrones ; l’appelant garde l’état uniquement après un résultat `ok: true`.

- `selectObjective({ objectiveId }, catalog)` retourne `{ state, plan, explanations }` dans `ContractResult` et crée toujours une nouvelle session.
- `validateStep(state, { stepId, answer }, catalog)` retourne `{ state, issues, progress, completed, nextStepId }` dans `ContractResult`.
- `goBack(state, catalog)` retourne `{ state, activeStepId, progress }` dans `ContractResult`.
- `createSession(plan, preferences)`, `advanceSession(state, plan, answer)` et `returnToPreviousStep(state, plan)` utilisent les données injectées, sans accès au catalogue ni au stockage.
- `getProgress(state, plan, operation)` retourne un `ContractResult<Progress>` ; `isCompleted(state, plan)` retourne un booléen dérivé.
- `getValidationIssues(error)` dérive les erreurs locales depuis un `ContractError` existant, sans modifier `SessionState`.

Le contrôleur reconstruit un plan cohérent depuis l’objectif et les préférences via le moteur existant ; il ne conserve aucun cache obsolète. Le module session réutilise les contrôles purs de `domain/validation.ts` afin de ne pas dupliquer la validité d’une réponse pour l’avancement et la complétion. Il ne dépend d’aucun module applicatif, de données ou de plateforme.

### Décisions et limites consignées

| Point | Comportement livré sans changement de contrat |
|---|---|
| OQ-B3 / OQ-AC3 | Les réponses sont validées structurellement (`string` ou tableau de strings). `undefined`, `null`, `""` et `[]` sont absents. Aucun trim, format, longueur, option métier ou champ de schéma n’est inventé. Une string composée d’espaces ou un tableau contenant une string vide reste structurellement valide ; les contraintes de contenu attendent leurs sources. Les tableaux creux ou contenant une valeur non string sont refusés. |
| P3-Q1 | Un échec reste `{ ok: false, data: null, error }`. Les erreurs `ANSWER_*` transportent `stepId` dans le champ optionnel existant `error.fields`. `getValidationIssues(error)` restitue `[{ stepId, code, message }]`. `issues` vaut `[]` dans le résultat de succès de `CMD-03` ; aucun champ d’erreur public n’est ajouté. |
| P3-Q2 | Le plan applicable est le sous-ensemble visible, trié par `order` puis identifiant. Il détermine positions 1-based, total, première étape, prochaine étape et retour. Aucune étape masquée ne devient active. |
| P3-Q3 | Toutes les étapes requises doivent avoir une réponse propre, non vide et structurellement valide. La complétion n’attend pas les étapes facultatives placées après le dernier requis. Lorsqu’elle est atteinte, `nextStepId` est `null`, l’étape active reste celle qui vient d’être validée et la progression reflète cette position réelle. Le retour conserve les réponses et donc une complétion encore valide. Un objectif sans requis est complet au sens de ce prédicat. Un plan applicable vide initialise `activeStepId: null`, progression `0/0` ; aucune étape inexistante n’est créée, aucun avancement n’est accepté et le retour échoue avec `FIRST_STEP`. |
| P3-Q3 — état incomplet tardif | Si un curseur tardif arrive en fin de plan alors qu’un requis antérieur reste invalide, l’avancement rejoint le premier requis non validé plutôt que de produire une fin sans complétion. |
| P3-Q4 | Une tentative initiale de masquer un requis est exposée par `CMD-01` comme `CATALOG_INVALID`, avec le message technique du moteur conservé : le catalogue ne permet pas d’initialiser une session cohérente. Un objectif de session devenu inconnu est également une configuration invalide. Les conflits restent `RULE_CONFLICT`. Aucun état partiel n’est renvoyé. |

Ordre des gardes : session/contexte requis, construction et contrôle du plan, existence de l’étape soumise, appartenance à l’objectif, activité et visibilité, puis validité de la réponse. `CMD-01` vérifie la sélection et l’existence de l’objectif avant de construire le plan. `CMD-04` distingue session absente (`SESSION_REQUIRED`), objectif nul (`OBJECTIVE_REQUIRED`), curseur hors plan applicable (`STEP_NOT_FOUND`) et absence de prédécesseur (`FIRST_STEP`).

### Validation exécutée

- `npm.cmd test` avant implémentation : **98 tests**, 6 fichiers, PASS.
- `npm.cmd run lint` : PASS.
- `npm.cmd run typecheck` : PASS.
- `npm.cmd test` après implémentation : **172 tests**, 9 fichiers, PASS ; **74 nouveaux tests**.
- `npm.cmd run build` : PASS.
- Recherche statique dans les trois nouveaux modules : aucun réseau, DOM, stockage, horloge ou hasard.

Les tests couvrent tous les codes d’erreur planifiés pour les trois commandes, les résultats exacts, l’échec atomique suivi d’une correction, une séquence complète avec retour, les réponses conservées et copiées, les étapes masquées, l’ordre égal, la complétion et ses limites, les catalogues invalides/conflits et le déterminisme. Les 98 tests existants, dont l’invariant A08, restent verts.

### État des portes et suite

**G3 : implémentation prête pour revue indépendante ; porte non signée.** Les réserves historiques G0/G1 et la revue indépendante G2 restent explicitement ouvertes dans la documentation. Le présent handoff n’est pas une revue indépendante.

`ressources/` est toujours absent : aucun contenu métier ni validation d’options réelles ne peut être finalisé. Aucun backend, base, API HTTP/réseau, auth, secret, UI, stockage ni dépendance n’a été ajouté. La Phase 4 conserve `CMD-02`, `CMD-05`, `CMD-06`, invalidations, sélecteurs et synthèse.
