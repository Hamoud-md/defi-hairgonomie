# Le Chemin Vivant — Tâches d’exécution

**Phases :** 5 — Coque, tokens et navigation ; 6 — Vues E01–E03 et intégration  
**Portes :** G5 puis G6, distinctes  
**Statut :** implémentation locale terminée ; contrôles automatiques réussis ; revues indépendantes G5/G6 et validations historiques encore à consigner  
**Historique :** [Phase 1](tasks-phase-1.md), [Phase 2](tasks-phase-2.md), [Phase 3](tasks-phase-3.md), [Phase 4](tasks-phase-4.md)

> **Objectif Phase 5 :** une coque accessible, cohérente et navigable avec trois vues vides.
>
> **Objectif Phase 6 :** brancher les trois vues sur le cœur local et permettre un parcours complet, réversible et expliqué, sans règle métier dans l’interface.
>
> **Interdits communs :** backend, base de données, API HTTP, auth, secret, appel réseau métier, stockage obligatoire, contenu métier inventé, routage URL ajouté implicitement.
>
> **Hors périmètre :** persistance (Phase 7), audit complet responsive/accessibilité et durcissement (Phase 8), déploiement et preuves finales (Phases 9–10). Les contrôles de base clavier, focus et 320 px restent requis dès les Phases 5–6.

## 1. Sources et ordre d’exécution

| Source | Références utilisées |
|---|---|
| [Master plan](master-plan.md) | §3–5 Phases 5–6, §6, §8 : dépendances, tâches, critères et portes |
| [Frontend](frontend-plan.md) | §5–15, §17, §20 étapes 0–6, §21–22 : composants, flux, copies, tests |
| [Architecture](architecture.md) | §5–6, §9–13, §15, §18, §20 : couches, navigation, structure et tokens |
| [Contrat](api-contract.md) | §5–9, §11–13 : DTO, QRY/CMD, erreurs et transitions autorisées |
| [Plan du cœur local](backend-plan.md) | §5.2, §8, §12 : contrôleur et sélecteurs comme points d’entrée UI |
| [Infrastructure](infra-plan.md) | §1–6 : build statique local ; aucune publication dans ces phases |
| [Workflow](ai-workflow.md) | §6–8, §12–13, §16, §21–22 : revues, approbation G4 et handoffs |
| [Handoff Phase 4](tasks-phase-4.md) | API réellement disponible, contexte des invalidations et limites du catalogue |

Le découpage d’exécution suit **le master plan**. Les numéros de phases documentaires des autres plans ne déplacent pas les tâches : la persistance reste en Phase 7, l’intégration des vues en Phase 6.

| Phase | Dépendances | Livrable | Condition de sortie |
|---|---|---|---|
| 5 | Phase 0 / G0 | Coque et trois vues vides | G5 vérifié indépendamment |
| 6 | Phases 3, 4, 5 | E01 → E02 → E03 connecté au cœur | G3/G4/G5 consignés, approbation humaine G4 avant intégration, puis revue G6 |

La Phase 5 peut être préparée indépendamment de l’intégration métier. Sa navigation technique de test ne doit pas créer un raccourci utilisateur vers un parcours sans session ou une synthèse incomplète. **La création de cette checklist ne valide aucune porte historique et n’autorise pas à déclarer G5/G6 franchis.**

## 2. État actuel et décisions préalables

- [x] Consigner l’état réel de G0 et des réserves historiques, sans inventer d’approbation.
- [ ] Avant la Phase 6, consigner la revue indépendante et l’approbation humaine G4 prévues par `ai-workflow.md` §16, ainsi que les dépendances G3/G5.
- [x] Vérifier la base existante : TypeScript + Vite, Vitest, `src/main.ts` minimal, contrôleur Phase 4 et catalogue de démonstration vide.
- [x] Relever les commandes disponibles : `npm.cmd run lint`, `typecheck`, `test`, `build`, `dev`, `preview` ; ne pas annoncer de script navigateur encore absent.
- [x] Confirmer H04 et consigner le choix de rendu : React reste conditionnel ; `react`, `react-dom` et l’outillage JSX ne sont actuellement pas installés. Ne pas convertir silencieusement le projet en React.
- [x] Choisir le chemin conforme à la stack retenue : composants React si confirmé, sinon rendu natif compatible avec le cœur TypeScript existant. Adapter les noms `.ts`/`.tsx` à ce choix sans changer les frontières architecturales.
- [x] Choisir et documenter l’outillage minimal de tests UI/navigateur ; Vitest existe, Playwright et un environnement DOM ne sont pas actuellement configurés. Justifier les éventuels ajouts dans le lot d’outillage, sans ajout automatique de bibliothèque UI, routeur ou store global.
- [x] Vérifier `ressources/` et inventorier les emplacements de contenu ; garder les lacunes explicites.
- [x] Conserver les contrôles existants du cœur et les 236 tests recensés dans le handoff Phase 4 ; vérifier leur résultat réel avant exécution.

| Point | Décision ou limite à consigner avant le code concerné |
|---|---|
| H04 — stack | Technologie de rendu et adaptation concrète de `ErrorBoundary`/protection de rendu ; aucune dépendance React supposée acquise |
| OQ-B3 / OQ-AC3 — réponses | `Step` ne déclare ni schéma de champs, ni options de réponse. Aucun formulaire métier ne peut être déduit de `contenu` ou de `requis` par heuristique. Prévoir un point de rendu injecté et des exemples strictement techniques dans les tests ; ne pas publier un formulaire métier inventé. Toute évolution du contrat suit sa procédure préalable. |
| OQ-M1 / OQ-AC1 — contenu | Le catalogue de production reste vide tant que les sources manquent. L’application montre alors un état vide honnête ; les parcours fonctionnels sont vérifiés avec des catalogues techniques injectés dans les tests. |
| Copie d’interface | Centraliser les textes génériques et les libellés connus du cahier. Aucun objectif, étape, préférence, argument marketing ou raison métier inventé. |
| Invalidations | `SessionView` n’ajoute pas de champ `invalidatedAnswers`. Consommer les listes de `CMD-02`/`CMD-05` comme feedback UI et employer la façade Phase 4 pour conserver les marques autoritatives ; ne pas modifier les DTO pour faciliter l’affichage. |
| Modifier depuis E03 | La vue UI active est distincte de `SessionView.view`. Le domaine peut rester `completed` pendant une correction ; éviter une redirection automatique qui empêcherait de revenir à E02. |
| Explications sans nouveau changement | `SessionView.explanations` est un historique. Ne pas annoncer tout cet historique à chaque rendu ni traiter sa présence comme une nouvelle adaptation. Séparer l’annonce de la dernière commande de l’historique réel de session. |

## 3. Périmètre des fichiers

### Phase 5 — fichiers prévus

- [x] `src/main.ts` (ou point d’entrée adapté si React confirmé), `index.html` uniquement pour montage, langue et métadonnées techniques nécessaires.
- [x] `src/app/` : coque, en-tête, protection des erreurs de rendu, état de vue active et montage.
- [x] `src/platform/navigation.ts` : changement interne de `ViewId` et gestion du focus, sans règle métier ni URL.
- [x] `src/ui/tokens.css` et styles communs : tokens, mise en page, focus et états.
- [x] `src/ui/components/` : composants génériques de coque/feedback/actions.
- [x] `src/ui/` : fichier central de copie d’interface et correspondance des erreurs, nom à fixer à l’implémentation.
- [x] `src/views/goal-selection/`, `journey/`, `summary/` : emplacements vides de coque uniquement en Phase 5.
- [x] Tests UI et navigateur ciblés, avec fixtures techniques de coque.

### Phase 6 — fichiers prévus

- [x] Les trois dossiers `src/views/` : composants des vues et état de formulaire local.
- [x] `src/ui/components/` : composants de sélection, progression, réponse, préférence, explications, invalidations, décisions et confirmation.
- [x] `src/app/` : composition et instance du contrôleur injecté ; orchestration UI de ses commandes et lectures.
- [x] Tests d’intégration UI/navigateur et fixtures techniques séparées du catalogue applicatif.
- [x] `docs/tasks.md` : résultats et handoff distincts G5/G6.

**À préserver :** `src/domain/**`, les modèles du contrat, les règles et les sélecteurs/commandes déjà implémentés, `src/data/demo-data.ts`. Toute correction du cœur révélée par l’intégration doit être isolée, motivée et testée ; ne pas placer son contournement dans un composant.

**À ne pas créer dans ces phases :** adaptateur de persistance, stockage direct dans les vues, API, auth, routeur URL, contenu métier de démonstration ou infrastructure de déploiement. Les changements d’outillage éventuels doivent être limités à la stack et aux tests retenus.

## 4. Phase 5 — coque et composants communs

- [x] Créer `AppShell` avec `header`, `main` identifié, zone de statut et protection des erreurs de rendu.
- [x] Créer `SkipLink`, premier élément focusable, qui mène effectivement au contenu principal.
- [x] Créer `AppHeader` avec identité connue du projet et contexte minimal ; aucun menu métier inventé.
- [x] Prévoir un unique `h1` par vue, une hiérarchie de titres cohérente et une langue de document correcte.
- [x] Créer `ErrorBoundary` ou protection équivalente selon la stack : exception récupérable → `ErrorState`, jamais une page blanche.
- [x] Couvrir aussi les erreurs de gestionnaires de commandes : une protection du rendu seule ne les intercepte pas nécessairement.
- [x] Créer `EmptyState` pour une absence réelle de données, sans masquer une erreur de configuration.
- [x] Créer `ErrorState` avec annonce d’erreur et action de reprise adaptée ; ne pas présenter une reprise comme réussie sans l’exécuter.
- [x] Créer `StatusBanner` pour les messages non bloquants et `LiveRegion` stable avec `aria-live="polite"`.
- [x] Préparer `PrimaryAction` et les actions secondaires natives, avec états focus, disabled et traitement des activations répétées.
- [x] Centraliser les copies génériques ; ne pas coder de texte métier dans les composants.
- [x] Ne brancher aucune commande métier ni persistance dans la coque Phase 5.

## 5. Phase 5 — tokens, navigation et focus

- [x] Définir des CSS variables pour couleurs, typographie, espacements, largeurs de lecture, rayons, focus et états.
- [x] Vérifier une lisibilité et un contraste suffisants dès la base ; ne pas revendiquer un audit WCAG/RGAA complet.
- [x] Préserver un focus visible ; ne jamais dépendre de la couleur seule pour un état.
- [x] Prévoir des styles fluides sans largeur minimale provoquant un débordement à 320 px.
- [x] Utiliser des ressources locales ; aucun CDN de police, icône ou script obligatoire.
- [x] Implémenter les trois valeurs du `ViewId` existant : `goal-selection`, `journey`, `summary`.
- [x] Séparer la mécanique d’affichage des conditions métier de transition, qui viennent des résultats de commandes en Phase 6.
- [x] Après montage de la nouvelle vue, déplacer le focus sur son `h1` (focus programmatique sans ajout permanent à l’ordre de tabulation).
- [x] Préserver la fonctionnalité du lien d’évitement après chaque changement de vue.
- [x] Ne pas ajouter de route, de hash, de données de session dans l’URL ou de faux historique navigateur.
- [x] Fournir trois vues structurelles vides vérifiables par injection de l’état de navigation dans les tests ; aucun bouton public de contournement de session.
- [x] Ne pas déclencher d’animations inutiles ; respecter les préférences de mouvement pour tout effet ajouté.

## 6. Phase 5 — tests et porte G5

- [x] Vérifier montage de la coque, landmarks et unique `h1` pour chaque vue vide.
- [x] Vérifier au clavier le lien d’évitement, la tabulation et les actions communes.
- [x] Vérifier le focus sur le `h1` après chaque changement de vue.
- [x] Vérifier l’absence de débordement horizontal critique à 320 px.
- [x] Vérifier `EmptyState`, `ErrorState`, statut non bloquant et protection contre une exception de rendu.
- [x] Vérifier l’absence d’appel réseau métier/externe ; les ressources statiques locales et le transport du serveur Vite ne constituent pas une API métier.
- [x] Exécuter lint, typecheck, tests du cœur et tests UI ajoutés, puis build statique et smoke test de preview.
- [x] Consigner les commandes réelles, résultats et limites de l’outillage choisi.
- [ ] Faire effectuer la revue indépendante G5, verdict `PASS` ou `PASS WITH NOTES`, sans constat bloquant.
- [x] Rédiger le handoff Phase 5 : fichiers, stack retenue, composants, tokens, navigation, tests et points ouverts.

**Sortie G5 :** coque accessible avec trois vues vides, sans route URL, sans règle métier, sans contenu métier inventé. G5 est distinct de G6 ; son implémenteur ne signe pas sa propre porte.

## 7. Phase 6 — branchement du cœur et état UI

- [ ] Vérifier les préconditions G3/G4/G5 et l’approbation humaine G4 avant l’intégration fonctionnelle.
- [x] Charger et valider le catalogue local via `loadDemoCatalog`/`loadCatalog` ; distinguer catalogue vide et catalogue invalide.
- [x] Instancier `createSessionController(catalog)` une seule fois pour la session applicative ; ne pas le recréer au rendu et perdre les réponses.
- [x] Consommer ses six commandes et ses trois requêtes ; aucune importation directe du moteur ou des règles dans les vues.
- [x] Garder uniquement l’état UI local : vue active, objectif choisi avant démarrage, brouillons par étape, feedback, focus et modale.
- [x] Ne pas dupliquer le plan, les réponses validées, la complétion ou les invalidations autoritatives dans un store métier parallèle.
- [x] Après succès, relire les sélecteurs et afficher leur résultat ; après échec, préserver session, brouillons utiles et vue, avec les reprises documentées pour une session absente.
- [x] Ne pas modifier les préférences affichées avant un succès de `CMD-02`.
- [x] Conserver les résultats d’invalidation nécessaires à leur affichage comme feedback, sans recalculer leur validité dans les composants.
- [x] Prévoir un chemin de correction explicite d’une réponse masquée conservée, via `CMD-05`, sans rendre son étape active artificiellement.
- [x] Empêcher les activations répétées d’une même action de déclencher des commandes doubles.
- [x] Ne brancher aucun `PERSIST-*` ; l’application fonctionne intégralement en mémoire.

## 8. Phase 6 — E01 : objectif et démarrage

- [x] Brancher `QRY-01` comme seule source des objectifs et conserver l’ordre déclaré du catalogue.
- [x] Créer `ObjectiveSelector`/`ObjectiveCard` avec contrôles radio natifs, `fieldset`, `legend`, titre et description associés.
- [x] Garder la sélection locale tant que `CMD-01` n’a pas réussi.
- [x] Créer l’action « Commencer » ; aucune progression sans objectif valide.
- [x] Appeler `CMD-01` avec l’identifiant choisi puis afficher E02 uniquement après succès et plan utilisable.
- [x] Afficher `OBJECTIVE_REQUIRED` près du groupe avec lien d’erreur et focus approprié.
- [x] Gérer `OBJECTIVE_NOT_FOUND`, `CATALOG_INVALID`, `RULE_CONFLICT` et les erreurs inattendues sans parcours partiel.
- [x] Gérer `QRY-01 = []` avec un état vide explicite, sans objectif de remplacement inventé ni démarrage possible.
- [x] Garder la proposition de valeur absente comme contenu à fournir ; ne pas écrire de promesse marketing.
- [x] Vérifier sélection et démarrage au clavier et à 320 px.

## 9. Phase 6 — E02 : étape, réponse et progression

- [x] Brancher `QRY-02` pour `activeStep`, objectif, `progress`, préférences, réponses, erreurs et historique.
- [x] Créer `ProgressIndicator` affichant les valeurs fournies, selon « Étape X sur Y », sans recompter les étapes dans l’UI.
- [x] Créer `StepView` à partir des champs du catalogue ; ne pas analyser son texte pour deviner un schéma de réponse.
- [x] Créer `AnswerForm` avec le point de rendu de champs retenu pour OQ-B3/OQ-AC3, labels explicites et une action principale.
- [x] Alimenter les champs depuis un brouillon local ou la réponse réelle de l’étape, sans effacer un brouillon sur une simple erreur.
- [x] Soumettre `CMD-03` avec `stepId` et `AnswerValue`, puis rafraîchir la vue après succès.
- [x] Afficher `ANSWER_REQUIRED`/`ANSWER_INVALID` près du champ avec `aria-invalid`, `aria-describedby` et focus sur le premier champ invalide.
- [x] Gérer `SESSION_REQUIRED`, `STEP_NOT_FOUND`, `STEP_NOT_IN_OBJECTIVE` et `STEP_NOT_ACTIVE` selon la correspondance d’erreurs.
- [x] Naviguer vers E03 seulement après complétion confirmée et `QRY-03` réussi ; aucun compteur UI ne décide de la complétion.
- [x] Gérer le cas d’un objectif sans étape/requis selon le comportement du cœur, sans inventer de champ ni laisser une vue inutilisable.
- [x] Rendre les régions de formulaire, préférences et feedback utilisables en une colonne mobile ; suivre la disposition deux colonnes à partir de 768 px si appropriée.

## 10. Phase 6 — E02 : préférences, explications, retour et correction

- [x] Créer `PreferenceControl` natif et accessible depuis `PreferenceView`, avec les seules valeurs déclarées.
- [x] Brancher `CMD-02` ; conserver l’ancienne valeur et les réponses après un rejet.
- [x] Traiter `PREFERENCE_NOT_FOUND`/`PREFERENCE_VALUE_INVALID` localement, les conflits/invariants comme erreurs de configuration.
- [x] Créer `ExplanationPanel` depuis les raisons et changements réellement retournés.
- [x] N’annoncer que les nouvelles explications de la dernière commande ; une lecture/rerendu ou une commande sans changement ne doit pas réannoncer l’historique.
- [x] Conserver la consultation de l’historique réel séparément du panneau d’adaptation courante et de l’annonce live.
- [x] Créer `InvalidatedAnswerNotice` montrant la valeur conservée, sa raison et le chemin de correction ; ne pas traiter une réapparition seule comme correction.
- [x] Brancher « Retour » sur `CMD-04` ; à la première étape, désactiver l’action avec une explication.
- [x] Après retour réussi, présenter l’étape réellement retournée et restaurer sa réponse sans perdre les autres.
- [x] Prévoir la révision d’une réponse antérieure via `CMD-05`, sans modifier directement le curseur ni appeler `CMD-03` pour une étape non active.
- [x] Préserver les réponses valides non concernées ; afficher les invalidations retournées et leur maintien jusqu’à correction explicite.
- [x] Après correction réussie, refléter le feedback autoritatif du contrôleur ; ne pas supprimer un avis sur un simple changement local de texte.
- [x] Gérer `FIRST_STEP`, `STEP_*`, `ANSWER_*`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` sans reset.
- [x] Maintenir l’utilisation clavier, le focus après changement d’étape et des annonces polies sans vol de focus sur une adaptation.

## 11. Phase 6 — E03 : synthèse, Modifier et Recommencer

- [x] Brancher `QRY-03` ; refuser une synthèse lorsqu’il retourne `JOURNEY_INCOMPLETE`.
- [x] Créer `SummaryView`, `DecisionList` et `CompletionStatus` depuis `Summary`.
- [x] Afficher objectif, préférences, décisions valides/applicables et historique réel, sans recalculer les choix côté UI.
- [x] Afficher `completed`, `requiredCompleted`, `requiredTotal` tels que fournis ; aucun pourcentage ni estimation inventé.
- [x] Ne pas afficher une réponse invalidée comme décision finale, même si sa valeur reste conservée dans la session.
- [x] Brancher « Modifier » vers E02 en conservant la session et en permettant une correction réelle, même si le prédicat de complétion est encore vrai.
- [x] Créer `ConfirmDialog` pour « Recommencer » ; aucune autre modale métier non prévue.
- [x] Gérer focus initial, confinement du focus, libellé accessible, fermeture par Échap, annulation et retour du focus au déclencheur.
- [x] N’appeler `CMD-06` qu’après confirmation explicite avec `confirm: true`.
- [x] En cas d’annulation ou `CONFIRMATION_REQUIRED`, conserver la session et son feedback.
- [x] Après reset réussi, vider les brouillons/choix locaux/annonces/avis de l’ancienne session puis afficher E01 vierge.
- [x] Gérer `SESSION_REQUIRED` et les erreurs inattendues sans page blanche ni synthèse simulée.

## 12. Phase 6 — transitions et erreurs

| Déclencheur | Transition autorisée |
|---|---|
| `CMD-01` réussi | E01 → E02 avec objectif et plan valides |
| `CMD-03` réussi, non terminé | E02 → étape applicable suivante |
| `CMD-03` réussi, terminé et synthèse disponible | E02 → E03 |
| `CMD-02`, `CMD-04`, `CMD-05` réussis | Actualiser E02 et le feedback réel sans perte de réponse |
| Modifier | E03 → E02 avec session conservée |
| `CMD-06` confirmé et réussi | E03 → E01 vierge |
| Échec d’une commande | Rester dans le contexte courant et afficher l’erreur sans mutation métier |
| Session réellement absente | Reprise E01 avec message, sans fabriquer une session |

- [x] Centraliser la correspondance des codes du contrat selon `frontend-plan.md` §14.
- [x] Séparer erreurs locales, erreurs de configuration et exceptions récupérables.
- [x] Afficher les messages techniques génériques et les raisons issues du catalogue sans exposer de stack trace à l’utilisateur.
- [x] Traiter un code inconnu comme `UNEXPECTED_ERROR` avec une reprise visible ; aucune erreur avalée.
- [x] Ne pas introduire de timers ou faux chargements pour des opérations locales synchrones.
- [x] Garder le focus logique après navigation, retour, erreur et fermeture de modale.

## 13. Phase 6 — matrice de tests et porte G6

| Scénario | Attendu | Traces |
|---|---|---|
| Catalogue vide/invalide | État vide honnête / erreur distincte, aucun démarrage inventé | F01, N07 |
| Choix puis démarrage | `QRY-01` + `CMD-01`, E02 seulement après succès | F01, F02 |
| Réponse absente/invalide puis correction | Erreur locale, brouillon/session conservés, progression après succès | F08, A06 |
| Parcours complet technique | E01 → E02 → E03, compteurs et décisions réels | F03, A01, A07 |
| Préférence avec changement | Adaptation visible, vraie explication et annonce unique | F04, F05, A03, A04 |
| Préférence sans changement | Aucun nouveau panneau/annonce fictive | F05 |
| Préférence refusée ou conflit | Ancienne valeur et réponses conservées, erreur adaptée | N07, A08 |
| Retour et révision | Réponses retrouvées, correction via la bonne commande | F06, F07, A05 |
| Réponse invalidée puis réaffichée puis corrigée | Valeur conservée, marque maintenue jusqu’à correction, synthèse fidèle | A05, A08 |
| Synthèse incomplète/absence de session | Refus explicite, aucune complétion inventée | F09, A07 |
| Modifier une synthèse complète | E02 utilisable sans renvoi automatique immédiat à E03 | F07, F09 |
| Recommencer annulé/confirmé | Conservation / session et brouillons vierges | F10 |
| Lecture/rerendu répété | Aucune commande double, aucune annonce répétée ni perte de données | N07 |
| Clavier et modale | Focus visible, skip link, champs, préférences, Échap et restauration | N03 |
| 320 / 768 / 1440 px | Pas de débordement critique, contenu et actions accessibles | N01 |

- [x] Réaliser les tests de composants/intégration et les parcours navigateur retenus avec des catalogues techniques injectés uniquement dans le harness de test.
- [x] Vérifier le comportement de production avec le catalogue vide réel ; ne pas embarquer de fixture dans l’application livrée.
- [x] Observer les annonces et le focus, pas seulement les états de données.
- [x] Contrôler qu’une erreur locale ne réinitialise aucune réponse et qu’une adaptation ne masque jamais de requis.
- [x] Vérifier les erreurs de configuration et l’absence de réseau métier/externe.
- [x] Exécuter lint, typecheck, tous les tests existants et nouveaux, build et smoke test en preview.
- [x] Consigner les résultats réels et la couverture manquante ; les preuves A01–A08 finales avec contenu réel restent à distinguer des scénarios techniques.
- [ ] Faire effectuer la revue indépendante G6, verdict `PASS` ou `PASS WITH NOTES`, sans constat bloquant.
- [x] Rédiger le handoff Phase 6 et consigner G6 avant de commencer la suite.

**Sortie G6 :** trois vues reliées au cœur, parcours fonctionnel vérifié avec des données techniques, production honnête sur le contenu absent. Aucun démarrage sans objectif, aucune perte de réponse sur erreur, aucun requis supprimé, aucune explication fictive ni complétion incorrecte. Aucun contenu métier inventé.

## 14. Handoffs et limites à conserver

- [ ] **Handoff G5 distinct :** fichiers, choix de stack et d’outillage, composants communs, tokens, navigation, focus, tests, limites et verdict indépendant.
- [ ] **Handoff G6 distinct :** points d’entrée consommés, branchement des six commandes/trois requêtes, feedback/invalidations, formulaires et leur source, tests UI/navigateur, erreurs couvertes et verdict indépendant.
- [x] Confirmer le maintien des tests du cœur et l’absence de changement de contrat ou de règle métier non approuvé.
- [x] Consigner les éventuelles corrections ciblées du cœur séparément, avec leur test de régression.
- [x] Conserver les Open Questions de contenu et de schéma de réponse ; ne pas les présenter comme résolues par des fixtures.
- [x] Indiquer les commandes réellement ajoutées à l’outillage, sans présenter un script ou une dépendance simplement planifié comme installé.
- [x] Confirmer qu’aucun backend, base, auth, API métier/réseau, secret, persistance ou déploiement n’a été ajouté.
- [x] Rappeler la suite : Phase 7 persistance facultative ; Phase 8 durcissement responsive/accessibilité ; Phase 9 qualité/déploiement ; Phase 10 contenu réel et preuves finales.

**État après implémentation : Phases 5 et 6 implémentées et testées localement ; G5/G6 non signés.** Les handoffs techniques sont ci-dessous ; les verdicts indépendants restent attendus. Aucun contrat métier ne change.

## 15. Handoff technique Phase 5 — 14 novembre 2026

**Livré :** une coque native TypeScript/Vite, trois vues structurelles vérifiables séparément, tokens CSS, navigation interne, focus, états vides/erreurs/statut et région live stable. La demande explicite d’implémenter les deux phases a été exécutée sans prétendre produire une revue indépendante ni signer les anciennes portes.

**Choix H04 :** conserver le chemin natif compatible avec la stack existante. Aucun React, JSX, routeur, store global, bibliothèque de composants, police ou ressource distante n’a été ajouté. La protection de rendu et des gestionnaires utilise des frontières explicites `try/catch` et un `ErrorState` de reprise ; elle remplit le rôle prévu pour `ErrorBoundary` dans la variante React.

| Fichiers | Rôle |
|---|---|
| `src/app/shell.ts` | AppShell, SkipLink, AppHeader, landmarks, trois contextes de vue, statut et LiveRegion |
| `src/platform/navigation.ts` | `ViewId` interne et focus du titre, sans URL ni règle métier |
| `src/ui/tokens.css` | Couleurs, typographie système, espacements, états, focus, mise en page responsive et mouvement réduit |
| `src/ui/copy.ts` | Copies françaises génériques, libellés du cahier et correspondance des codes ; code inconnu → erreur inattendue |
| `src/ui/components/common.ts` | Éléments DOM sûrs, actions natives, EmptyState, ErrorState et erreurs locales |
| `src/main.ts`, `index.html` | Montage, validation du catalogue de démonstration, langue et métadonnées locales |

**Validation G5 :** tests navigateur de landmarks, lien d’évitement, focus sur chacune des trois vues de coque, statut non bloquant, absence de routes, état vide de production, erreurs et protection de rendu, absence de débordement à 320 px. Le harness de coque est uniquement dans `tests/browser/` ; aucun bouton public ne contourne la session.

**Revue visuelle :** capture desktop de l’état réel de production inspectée : [phase5-production.png](qa/phase5-production.png). Cette capture montre honnêtement le catalogue vide, sans objectifs inventés.

**G5 :** prêt pour vérification indépendante ; aucun verdict indépendant attribué par l’implémenteur.

## 16. Handoff technique Phase 6 — 14 novembre 2026

**Livré :** composition des trois vues avec une seule instance du contrôleur Phase 4 par montage. Les six commandes et les trois lectures sont utilisées par leurs points d’entrée existants, sans modification de `src/domain/**`, de `src/application/**`, des DTO ou des règles.

| Fichiers | Rôle |
|---|---|
| `src/app/app.ts` | Montage, orchestration des commandes/lectures, état UI et brouillons, reprises, protection des exceptions |
| `src/views/goal-selection/view.ts` | E01 : radios natives, absence de choix, liste issue de QRY-01, catalogue vide et démarrage |
| `src/views/journey/view.ts` | E02 : étape, progression fournie, préférences déclarées, réponses conservées, correction, retour et feedback |
| `src/views/summary/view.ts` | E03 : décisions/compteurs fournis, Modifier et Recommencer |
| `src/ui/components/answer-form.ts` | Point d’injection `AnswerRenderer`, brouillon, erreurs liées au champ et actions CMD-03/CMD-05 |
| `src/ui/components/feedback.ts` | Explications courantes, historique distinct et avis de réponses invalidées avec correction |
| `src/ui/components/confirm-dialog.ts` | Dialogue natif de reset, confinement explicite Tab/Shift+Tab, Échap et restitution du focus |

**État et corrections :** les brouillons par identifiant sont locaux ; les réponses validées et les marques autoritatives restent dans le contrôleur. Les listes d’invalidation retournées par CMD-02/CMD-05 alimentent le feedback d’affichage. Après une validation réussie de CMD-03, l’avis correspondant est retiré conformément au comportement de correction du contrôleur. Une réponse masquée reste consultable et corrigeable par CMD-05 sans rendre son étape active. L’application lit uniquement les métadonnées `catalog.getStep` pour présenter l’éditeur d’une réponse antérieure ; elle ne recalcule ni plan, ni complétion, ni invalidité.

**Navigation :** le `ViewId` de présentation est indépendant de `SessionView.view`. Modifier depuis E03 ouvre réellement E02 et ne reboucle pas sur la synthèse. Une validation terminée n’oriente vers E03 qu’après succès de QRY-03. Un objectif sans étape peut rejoindre la synthèse vide valide du cœur. Les exceptions de rendu, de commande et de lecture de champ, ainsi que les codes inconnus, produisent une reprise visible ; aucune reprise ne réinitialise automatiquement une session valide.

**Feedback :** seules les nouvelles explications d’une commande sont annoncées ; le panneau courant disparaît après une commande sans changement. L’historique réel demeure consultable dans une région distincte. Une lecture/rerendu n’annonce pas à nouveau l’historique. Une préférence rejetée conserve l’ancienne valeur et les brouillons. La confirmation de restart est la seule modale prévue ; annuler/Échap conserve tout, confirmer vide les états métier et UI avant E01.

**Limite de contenu maintenue :** `ressources/` et le schéma des champs sont absents. Aucun champ métier n’est déduit de `Step.contenu` ou `Step.requis`. L’API `mountApplication(root, { catalog, answerRenderer, ... })` accepte un adaptateur de présentation issu d’une future source déclarée ; sans adaptateur, l’étape affiche un état explicite et l’action Continuer est désactivée. Le champ technique de test n’existe que dans le harness. La production conserve `src/data/demo-data.ts` vide et montre donc E01 en état vide. L’intégration de contenu réel reste en Phase 10.

**Revue visuelle :** capture desktop de la synthèse technique inspectée : [phase6-summary.png](qa/phase6-summary.png). Les données techniques sont des fixtures de test, pas du contenu de démonstration publié.

**G6 :** prêt pour vérification indépendante ; aucun verdict indépendant attribué par l’implémenteur. L’approbation humaine historique G4 et les revues mentionnées dans la checklist restent explicitement à consigner.

## 17. Outillage, commandes et résultats réels

**Ajouts limités aux tests :** `@playwright/test` dans les dépendances de développement, verrou mis à jour, `playwright.config.ts`, `playwright.preview.config.ts`, `tests/browser/setup.ts`, `harness.html`, `harness.ts`, `frontend.spec.ts` et `preview.spec.ts`. Les sorties Playwright sont ignorées dans `.gitignore`.

Le setup démarre Vite/preview via leur API dans le processus de test puis ferme le serveur dans le teardown. Ce choix corrige un blocage observé du teardown Windows lorsqu’un processus enfant doit être arrêté par énumération de processus. Aucun serveur de test n’est réutilisé ou arrêté par PID externe.

| Commande | Résultat |
|---|---|
| `npm.cmd test` avant et après implémentation | PASS — 236 tests du cœur, 12 fichiers |
| `npm.cmd run lint` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd run build` | PASS — HTML, CSS et JS statiques ; 25 modules transformés |
| `npm.cmd run test:browser` | PASS — 22 scénarios navigateur, Microsoft Edge installé |
| `npm.cmd run test:preview` | PASS — 1 smoke test du build réel : HTTP 200, assets locaux, catalogue vide et aucune fixture embarquée |
| Recherche statique dans `src/` | Aucun réseau métier, stockage, insertion `innerHTML`, horloge ou hasard |
| Recherche dans `dist/` | Aucun identifiant/renderer du harness technique ou import de tests |

Les scénarios navigateur couvrent : trois vues de coque, clavier sans pointeur jusqu’au reset, focus du titre et du champ invalide, double activation, erreurs de sélection/réponse, retour et révision sans perte, préférences avec/sans effet, maintien puis correction des invalidations, conflits/invariant requis, erreurs de rendu/commande/lecteur/code inconnu, session absente, objectif vide, modale et largeurs 320/768/1440 px. Les captures ont été inspectées pour la coque réelle et la synthèse technique.

**Limite d’environnement :** le téléchargement Chromium a échoué avec `ENOSPC`. Les tests ont été exécutés avec le navigateur Microsoft Edge déjà installé, sans dépendre de ce téléchargement. Les configurations emploient `channel: "msedge"` ; sur une machine sans Edge, sélectionner un navigateur Playwright installé avant de les exécuter. L’installation npm a signalé 7 vulnérabilités modérées dans l’arbre de dépendances de développement ; aucune mise à niveau générale hors périmètre n’a été appliquée.

**Limites de validation :** ces contrôles ne sont pas une revue indépendante, un audit WCAG/RGAA complet ni une validation multi-navigateurs. Aucun backend, base, API métier, auth, secret, persistance ou déploiement n’a été introduit. Les Phases 7–10 restent distinctes.
