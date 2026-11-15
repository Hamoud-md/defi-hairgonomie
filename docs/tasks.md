# Le Chemin Vivant — Audit et clôture technique des Phases 0–8

**Périmètre demandé :** vérifier les phases existantes et terminer le travail jusqu’à la Phase 8 incluse.  
**Exclusion explicite :** ne pas exécuter les Phases 9 et 10.  
**Statut :** implémentation 0–8 terminée, contrôles locaux réussis ; revues indépendantes et approbations historiques non auto-signées.  
**Sources :** [master-plan.md](master-plan.md) §5 Phases 0–8, [api-contract.md](api-contract.md) §5–13, [frontend-plan.md](frontend-plan.md) §11, §16–17 et étapes 7–8, [backend-plan.md](backend-plan.md) §7.8, [ai-workflow.md](ai-workflow.md) §12/16.

> Les tests exécutés ici vérifient les changements des Phases 7–8 et leurs régressions ; ils ne constituent pas l’exécution de la porte de publication G9. Aucun hébergement, GitHub, publication, README de soumission, dossier de preuves finales ni contenu métier réel n’a été ajouté.

## 1. Résultat de l’audit par phase

| Phase | Implémentation | Éléments vérifiés et travail effectué |
|---|---|---|
| 0 — Fondations | Terminée | TypeScript/Vite, modèles du contrat, scripts et arborescence ; fallback natif documenté, aucune dépendance React supposée |
| 1 — Catalogue | Terminée | Catalogue validé et lecture seule ; correction supplémentaire : refuser une valeur par défaut absente des options déclarées |
| 2 — Plan/règles/explications | Terminée | Tri déterministe, objectifs isolés, conflits explicites, invariants requis et changements réels |
| 3 — Session/progression | Terminée | CMD-01/03/04, validations structurelles, progression et retour immuables, complétion vérifiée |
| 4 — Réversibilité/sélecteurs | Terminée | CMD-02/05/06 et QRY-01/02/03, invalidations conservées, corrections et synthèse fidèles |
| 5 — Coque UI | Terminée | Landmarks, tokens, navigation interne, focus, états communs et protection d’erreurs |
| 6 — Vues connectées | Terminée | E01–E03, commandes du cœur, brouillons, préférences, feedback réel et reset confirmé |
| 7 — Persistance facultative | Terminée dans cette intervention | Adaptateur isolé, version, reprise revalidée, sauvegardes ordonnées, clear, erreurs non bloquantes |
| 8 — Durcissement | Terminée dans cette intervention | Clavier, 320/768/1440 px, reflow 200 %, contrastes, mouvement réduit, couleurs forcées et formulaires |
| 9 — Qualité de livraison/déploiement | Non exécutée — exclusion utilisateur | Aucune porte G9, publication ou intervention GitHub |
| 10 — Contenu/preuves finales | Non exécutée — exclusion utilisateur | Catalogue réel et schéma métier toujours absents ; aucune donnée métier inventée |

**Implémentation ≠ approbation de porte.** Le statut ci-dessus concerne le code et les contrôles techniques. Les handoffs historiques conservent leurs réserves de revue indépendante et d’approbation humaine, dont G0/G4 ; aucun verdict indépendant ni accord humain manquant n’est fabriqué.

## 2. Historique conservé

- [Phase 1](tasks-phase-1.md), [Phase 2](tasks-phase-2.md), [Phase 3](tasks-phase-3.md), [Phase 4](tasks-phase-4.md).
- [Phases 5–6 et leurs handoffs](tasks-phases-5-6.md), archivés avant ce nouvel audit.
- Les anciens items Phase 1 différés sur la grammaire/les effets sont couverts par le moteur et les tests livrés en Phase 2 ; ils ne constituent plus du code à implémenter. Les fichiers historiques ne sont pas réécrits pour prétendre que les décisions étaient connues à leur date initiale.
- Les sources de contenu absentes restent des limites Phase 10, expressément exclue.

## 3. Phase 7 — Adaptateur de persistance

- [x] Créer `src/platform/persistence.ts` derrière l’interface existante `SessionPersistence`.
- [x] Utiliser une acquisition paresseuse de `localStorage`, uniquement dans l’adaptateur ; aucune lecture directe dans une vue.
- [x] Implémenter `PERSIST-LOAD`, `PERSIST-SAVE`, `PERSIST-CLEAR` avec les enveloppes et codes existants.
- [x] Sauvegarder exclusivement `{ schemaVersion, state }` ; aucune duplication de catalogue, plan, explication, brouillon ou marque d’invalidation.
- [x] Retourner `null` si la clé n’existe pas.
- [x] Rejeter JSON illisible, version inconnue, structure incompatible ou champs supplémentaires avec `STORED_SESSION_INVALID`.
- [x] Traiter l’accès refusé, l’absence de stockage, le quota et l’échec de suppression comme `STORAGE_UNAVAILABLE`.
- [x] Réinitialiser en mémoire même lorsqu’un clear échoue ; signaler honnêtement l’indisponibilité au lieu de prétendre que la copie locale a été effacée.
- [x] Ne pas annuler une commande métier réussie après un échec de sauvegarde.

**Détails internes :** clé `le-chemin-vivant.session.v1`, `SESSION_SCHEMA_VERSION = 1`. Ces détails ne modifient pas le contrat public. La structure des objets est contrôlée par le domaine puis le sens des identifiants et valeurs est revalidé avant toute reprise.

## 4. Phase 7 — Revalidation et reprise

- [x] Ajouter les contrôles structurels et `validateRestoredState` dans `src/domain/validation.ts`, sans accès au stockage ni réparation silencieuse.
- [x] Créer `src/application/session-restoration.ts` pour coordonner le plan et les contrôles avec le catalogue injecté.
- [x] Ajouter le hook interne `controller.restore(savedState)` pour `PERSIST-LOAD`, sans créer de nouvelle opération métier du contrat.
- [x] Vérifier objectif existant, valeurs de préférence déclarées, réponses de l’objectif actif, validité structurelle des réponses présentes et curseur applicable.
- [x] Rejeter une sauvegarde d’une ancienne configuration incompatible plutôt que fabriquer un plan partiel.
- [x] Accepter une session réellement vierge, un objectif sans étape et une session partielle cohérente selon les conventions précédentes.
- [x] Préserver les valeurs de réponses masquées et reconstruire leurs invalidations réellement déductibles du plan courant.
- [x] Ne pas reconstruire un historique d’explications fictif à partir d’une sauvegarde ne contenant que l’état.
- [x] Conserver l’état courant lorsqu’un hook de restauration échoue ; remplacer état et feedback uniquement après une restauration valide.

**Compatibilité :** une session sauvegardée doit connaître exactement les préférences du catalogue actuel et leurs valeurs déclarées. Un changement de catalogue qui rend la sauvegarde incompatible provoque une reprise neuve explicite, pas une migration implicite.

## 5. Phase 7 — Composition applicative

- [x] Brancher la persistance au bootstrap dans `src/main.ts`.
- [x] Fournir un état de reprise avec `aria-busy` puis rendre une session revalidée ou une sélection neuve.
- [x] Brancher les sauvegardes après les commandes réussies et le clear après reset confirmé.
- [x] Sérialiser les écritures dans l’ordre des commandes pour éviter qu’une ancienne sauvegarde arrive après la nouvelle.
- [x] Copier le snapshot avant de le mettre en file.
- [x] Éviter qu’un ancien résultat de stockage remplace un statut plus récent.
- [x] Afficher un bandeau non bloquant pour session reprise, sauvegarde invalide ou stockage indisponible.
- [x] Continuer un parcours complet en mémoire quand tout accès au stockage est refusé ou quand les écritures échouent.
- [x] Exposer `ready` et `whenIdle()` comme synchronisation interne du montage ; aucune nouvelle donnée métier n’est ajoutée à `SessionState`.

**Limite contractuelle traitée : invalidations en attente.** Les marques d’invalidation ne figurent pas dans `PersistedSession`. Sauvegarder une réponse réaffichée mais non corrigée ferait perdre sa marque après reload. L’application suspend donc les snapshots de reprise pendant les corrections en attente et efface la copie de reprise en best effort. Le bandeau l’annonce explicitement ; les valeurs et le parcours courant restent en mémoire. La sauvegarde reprend après correction réussie. Aucun champ supplémentaire ni invalidation cachée dans la valeur d’une réponse n’est introduit.

Si le stockage refuse aussi la suppression, le bandeau indique l’échec ; la session en mémoire est néanmoins réinitialisée normalement. Le logiciel ne revendique pas la suppression d’une copie que le navigateur lui interdit de modifier.

## 6. Phase 8 — Durcissement livré

- [x] Vérifier 320 / 768 / 1440 px sans débordement critique dans les trois vues.
- [x] Assouplir le bandeau d’étapes et les mots longs pour supporter le reflow et les contenus fournis ultérieurement.
- [x] Conserver un ordre de lecture logique, des actions natives, des cibles suffisamment grandes et un focus visible.
- [x] Vérifier un parcours principal et reset entièrement au clavier, sans pointeur.
- [x] Vérifier le focus du h1 après navigation et du champ après erreur.
- [x] Vérifier labels, références `aria-describedby`, `aria-invalid`, région `aria-live` et erreurs `role="alert"`.
- [x] Vérifier les contrastes des tokens de texte (au moins 4.5:1) et de focus (au moins 3:1) sur les fonds testés.
- [x] Vérifier que requis, erreur, progression, complétion et invalidation ont une représentation textuelle indépendante de la couleur.
- [x] Vérifier `prefers-reduced-motion` et l’absence d’animation non essentielle en cours.
- [x] Vérifier les couleurs forcées et le parcours clavier dans ce mode.
- [x] Vérifier un zoom de mise en page à 200 % aux largeurs 640 / 768 / 1440 px, champs et modale inclus.
- [x] Vérifier le confinement Tab/Shift+Tab, Échap, annulation, confirmation et restitution du focus de la modale.
- [x] Vérifier états vides, erreurs de rendu/commande et reprises sans page blanche.
- [x] Garder une action Annuler dans un éditeur de révision même si les champs de contenu ne sont pas encore définis.
- [x] Conserver le viewport responsive et l’absence de ressource externe bloquante.

**Grille de vérification :** les interactions clavier, focus, ARIA et géométries sont vérifiées par navigateur ; la capture du reflow/modal à 200 % a été inspectée visuellement : [phase8-zoom.png](qa/phase8-zoom.png). Le zoom de test est un zoom CSS de mise en page, documenté comme tel ; il ne prétend pas vérifier tous les réglages de zoom de toutes les interfaces navigateur. Les contrôles de mouvement et de couleurs forcées utilisent les émulations navigateur correspondantes.

Aucun audit complet WCAG/RGAA, test de lecteur d’écran vocal, contrôle multi-navigateurs ou validation indépendante humaine n’est revendiqué. L’installation d’un outil d’accessibilité supplémentaire a été refusée par l’environnement (`EACCES`) ; aucune dépendance partiellement installée n’est utilisée. Les contrôles locaux ne prétendent pas être une exécution de cet outil.

## 7. Correction ciblée issue de l’audit des phases antérieures

- [x] Compléter `validateCatalog` dans `src/domain/invariants.ts` : la valeur par défaut d’une préférence doit appartenir à `valeurs` lorsque cette liste existe.
- [x] Ajouter la régression correspondante dans `tests/unit/domain/invariants.test.ts`.

Cette correction évite qu’un catalogue accepté crée une session dont la préférence initiale est ensuite refusée par les sélecteurs. Elle applique la règle déjà déclarée dans `api-contract.md` §5.1 ; aucun type, code d’erreur ou comportement métier nouveau n’est inventé.

## 8. Fichiers créés et modifiés

| Fichiers | Changement |
|---|---|
| `src/platform/persistence.ts` | Nouvel adaptateur local versionné et isolé |
| `src/application/session-restoration.ts` | Nouvelle orchestration de revalidation de sauvegarde |
| `src/domain/validation.ts` | Structure de session et cohérence des données restaurées |
| `src/application/session-controller.ts` | Hook interne de restauration atomique |
| `src/app/app.ts` | Bootstrap/reprise, file de sauvegardes, clear, statuts non bloquants et reprise suspendue pendant correction |
| `src/main.ts` | Adaptateur optionnel branché et teardown de l’ancien montage avant reprise de bootstrap |
| `src/ui/copy.ts`, `tokens.css` | Copies de stockage et reflow renforcé |
| `src/ui/components/answer-form.ts` | Annulation disponible même sans adaptateur de champ |
| `src/domain/invariants.ts` | Cohérence de la valeur de préférence par défaut |
| `tests/unit/platform/persistence.test.ts` | Format/version, round-trip, quota/refus, clear et copies |
| `tests/unit/application/restoration.test.ts` | Revalidation catalogue, état partiel/vierge, invalidations et atomicité |
| `tests/unit/domain/invariants.test.ts` | Régression de la valeur par défaut non déclarée |
| `tests/browser/harness.ts`, `phase78.spec.ts`, `playwright.config.ts` | Fixtures de stockage et contrôles ciblés Phases 7–8 |
| `docs/tasks.md`, `tasks-phases-5-6.md`, `qa/phase8-zoom.png` | Audit actuel, historique conservé et capture technique |

Aucun changement de `models.ts`, du contrat public, de dépendance de production, du catalogue métier, de configuration d’hébergement ou de ressource distante. L’ajout d’outil d’accessibilité n’a pas abouti et n’apparaît pas dans `package.json`/le verrou.

## 9. Résultats de validation des changements

| Commande/contrôle | Résultat |
|---|---|
| `npm.cmd run lint` | PASS |
| `npm.cmd run typecheck` | PASS |
| `npm.cmd test` | PASS — 269 tests, 14 fichiers ; les 236 tests antérieurs restent verts |
| `npm.cmd run build` | PASS — 27 modules, sortie statique HTML/CSS/JS |
| `npm.cmd run test:browser` | PASS — 40 scénarios ; les 22 scénarios antérieurs restent verts |
| `npm.cmd run test:preview` | PASS — 1 smoke test du build local |
| Contrôles de stockage | Absence, corruption, version inconnue, contexte incompatible, accès refusé, quota, clear refusé, ordre des sauvegardes et corrections en attente |
| Recherche statique | `localStorage` uniquement dans l’adaptateur ; aucun réseau métier, stockage en vue ou insertion HTML non échappée |
| Build | Aucune fixture technique embarquée |

Ces commandes valident le travail autorisé des Phases 7–8 et ses régressions. Elles ne signent pas G9 et ne publient rien.

## 10. État des portes et exclusions

- [x] Implémentation et handoff technique des Phases 0–8 disponibles.
- [x] Contrats/types publics conservés, contenu manquant explicitement documenté.
- [x] Aucun backend, base, auth, API HTTP, réseau métier, secret ou déploiement introduit.
- [ ] Consigner les revues indépendantes et accords humains historiques non présents dans les handoffs.
- [ ] Faire effectuer les revues indépendantes G7/G8 selon le workflow, sans auto-approbation de l’implémenteur.
- Phase 9 : laissée hors périmètre à la demande de l’utilisateur.
- Phase 10 : laissée hors périmètre à la demande de l’utilisateur.

**Handoff :** la reprise facultative et le durcissement sont livrés. Les données réelles, le schéma métier de réponse et la livraison publique ne sont pas créés. Le prochain travail ne peut pas être présenté comme autorisé implicitement : l’utilisateur a expressément exclu les Phases 9 et 10 de cette intervention.

---

## 11. Mise en conformité avec le cahier des charges v2.0 (intervention du 15/11/2026)

**Autorisation :** l’utilisateur a demandé de réaliser tout ce que le cahier exige et qui n’était pas fait. Le scénario S01, le jeu de données §10.1, la stratégie de champs §10.2 et le TDR-001 sont appliqués **tels que proposés** par le cahier ; leur approbation formelle par l’équipe (H03–H06) reste à consigner.

| Exigence | Avant | Fait |
|---|---|---|
| F01/F12/A01 — catalogue S01 non vide en production | Catalogue vide (« Aucun objectif disponible ») | `src/data/demo-data.ts` : objectif `atelier-preparation`, 4 étapes, préférence `accompagnement`, règle de masquage |
| F13/H05/A05 — `AnswerRenderer` en production | Absent de `src/main.ts`, Continuer désactivé | `src/data/demo-fields.ts` (contrat typé par ID d’étape) + `src/ui/components/choice-renderer.ts` (radios / case à cocher, legend, valeurs hors liste refusées) branchés dans `src/main.ts` |
| F05/A03 — explication intelligible | En retour au mode guidé, l’explication n’affichait que le titre de l’étape | Règle complémentaire `afficher-conseils-en-mode-guide` (**écart mineur documenté** au §10.1 : conditions exclusives, aucun requis ciblé) |
| Lisibilité synthèse / réponses | Valeurs brutes (`debutant`, `guide`), réponses sans titre d’étape | `src/data/labels.ts` : libellés d’affichage, titre d’étape dans « Vos réponses enregistrées » ; valeurs stockées inchangées |
| §10.1 — complétion ≠ réservation | — | Mention de démonstration dans la synthèse |
| R05/R06/R07/R08/A15 — README et note ergonomique | Absent | `README.md` : parti pris, problème, amélioration, priorités, compromis, inspirations, limites, scénario, données, architecture, déploiement |
| A01/A03/A05–A08/A10/A11/A14 sur build réel | Smoke test « catalogue vide » uniquement | `tests/browser/preview.spec.ts` : S01 complet sur `vite preview`, 320/768/1440 px, clavier seul ; captures `docs/qa/s01-*.png` |
| Tests sur vrai catalogue (§9) | Fixtures techniques uniquement | `tests/unit/data/demo-journey.test.ts` (A02, A03, A04, A06, A07, A08, A09) |

**Non réalisable par l’agent (à faire par l’équipe) :** création du dépôt GitHub public et déploiement de l’URL de rendu (R08/A16, H10) ; test de compréhension A17 avec 3 participants novices ; approbation formelle H03–H06 ; revues indépendantes G7/G8.
