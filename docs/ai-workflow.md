# Le Chemin Vivant — Workflow des agents IA

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version :** 1.0  
**Statut :** Phase 7 — Manuel d'exploitation par agents IA  
**Documents de référence :** `cahier_charge.md`, `new files/architecture.md`, `new files/api-contract.md`, `new files/backend-plan.md`, `new files/frontend-plan.md`, `new files/infra-plan.md`, `new files/master-plan.md`

> **Rôle de ce document :** définir comment des agents IA exécutent le projet, tâche par tâche, sans dériver du périmètre, sans inventer de contenu et sans introduire de backend, de base de données, d'authentification ou de service externe.
>
> **Spécificité du projet :** Le Chemin Vivant est une **application web statique client-only**. Le « backend » est un **cœur local** TypeScript, et la « base de données » est un **catalogue local en lecture seule**. Aucun agent ne doit créer d'API HTTP, de serveur, de compte, de rôle serveur ni de secret.
>
> `ressources/` est absent. **Aucun contenu métier réel ne peut être produit.** Tout emplacement de contenu reste une Open Question tant que `ressources/` n'est pas fourni. Le workflow intègre donc une règle anti-invention stricte et un rôle de vérification dédié.

---

## Table des matières

1. Objet, sources et principes
2. Hiérarchie des sources et contexte à charger
3. Rôles des agents
4. Classification des tâches
5. Workflow de l'Orchestrator
6. Règles de l'agent d'implémentation
7. Workflow de l'agent de vérification
8. Workflow de l'agent de revue (lecture seule)
9. Règles anti-hallucination
10. Règles d'escalade critique
11. Fichiers requis par type de tâche
12. Séquence d'implémentation et portes
13. Workflow de tests
14. Workflow de documentation et de preuves
15. Gestion des erreurs et rollback
16. Points d'approbation humaine
17. Contrôle des changements et cohérence
18. Taille des tâches et des PR
19. Modèles de prompts
20. Initialisation du projet (sans comptes)
21. Definition of Done d'une tâche d'agent
22. Handoff et clôture

---

## 1. Objet, sources et principes

### 1.1 Objet

Ce workflow est le manuel opératoire des agents IA travaillant sur Le Chemin Vivant. Il garantit :

- la conformité permanente à `cahier_charge.md` (structure) et à `ressources/` (contenu) ;
- la conformité au contrat (`api-contract.md`) et à l'architecture ;
- l'exécution ordonnée selon `master-plan.md` (Phases 0–10, portes G0–G10) ;
- l'absence de contenu inventé ;
- l'absence de backend, base, auth, API réseau ou secret ;
- une vérification indépendante avant chaque passage de phase.

### 1.2 Principes

| Principe | Application |
|---|---|
| Source de vérité d'abord | Lire les documents avant toute action |
| Périmètre minimal | N'exécuter que la tâche approuvée |
| Séparation des rôles | Implémenter ≠ vérifier ≠ approuver |
| Contrat d'abord | Aucun écart aux types, opérations et codes d'erreur |
| Contenu non inventé | Texte métier uniquement depuis `ressources/` |
| Client-only strict | Aucun backend, base, API, auth, secret |
| Incrémental | Une porte à la fois, pas de big-bang |
| Traçabilité | Chaque tâche reliée à une exigence F/R/N/A |
| Arrêt en cas de doute | Escalade plutôt qu'invention |

---

## 2. Hiérarchie des sources et contexte à charger

### 2.1 Hiérarchie

En cas de conflit, l'ordre est :

1. `cahier_charge.md` — structure, exigences, contraintes.
2. `ressources/` — contenu réel (**absent**).
3. `new files/architecture.md` — décisions architecturales.
4. `new files/api-contract.md` — types, opérations, erreurs, invariants.
5. `new files/backend-plan.md` — cœur local.
6. `new files/frontend-plan.md` — vues et composants.
7. `new files/infra-plan.md` — hébergement statique.
8. `new files/master-plan.md` — ordre d'exécution et portes.
9. `principales files/*` — méthodologie uniquement, jamais contenu.

### 2.2 Règle de chargement

- Aucune tâche ne commence sans avoir relu les sources **réelles** concernées (pas la mémoire).
- Le contexte minimal doit inclure : `cahier_charge.md` (toujours), plus les fichiers de la Phase visée.
- Pour toute tâche de contenu, `ressources/` doit être consulté ; en son absence, la tâche est **bloquée** sur Open Question, jamais complétée par invention.

---

## 3. Rôles des agents

Le workflow distingue des **rôles**. Dans une petite équipe, un même agent peut cumuler des rôles, **sauf** implémentation et approbation de porte, qui doivent rester séparées.

| Rôle | Responsabilité | Écrit des fichiers ? |
|---|---|---|
| **Orchestrator** | Lit `master-plan.md`, `architecture.md`, le contrat ; détermine la phase, le périmètre, les fichiers autorisés/interdits ; bloque ou escalade | Non (planifie seulement) |
| **Core Agent** (cœur local) | Implémente `domain/`, `application/`, `data/`, `platform/persistence` | Oui (périmètre approuvé) |
| **UI Agent** | Implémente `app/`, `views/`, `ui/`, `platform/navigation` | Oui (périmètre approuvé) |
| **Test Agent** | Écrit et exécute les tests (Vitest/Playwright), grille manuelle | Oui (tests uniquement) |
| **Verification Agent** | Audit **lecture seule** du travail produit contre les sources ; produit un rapport `PASS` / `PASS WITH NOTES` / `FAIL` | Non |
| **Documentation Agent** | Rédige `README`, note ergonomique, preuves A01–A16 | Oui (documentation) |
| **Human Approver** | Valide les portes critiques et les changements de contrat | Décision |

**Séparation obligatoire :** l'agent qui implémente ne signe pas sa propre porte. La vérification est indépendante.

### 3.1 Alignement avec le Verification Agent du projet

Le rôle **Verification Agent** reprend les règles de `Agents.md` :

- lit `cahier_charge.md`, `ressources/` (si présent), le fichier produit et ses dépendances ;
- vérifie structure (cahier), contenu (`ressources/`), cohérence (dependencies) et absence de fuite d'un projet antérieur ;
- ne modifie aucun fichier ;
- produit un rapport avec verdict explicite.

---

## 4. Classification des tâches

Les tâches sont classées par **phase** et **module**, jamais par un domaine métier inventé.

| Type | Portée | Documents clés |
|---|---|---|
| `foundation` | Types, outillage, structure | `api-contract.md`, `architecture.md` |
| `domain` | Catalogue, moteur, règles, invariants | `backend-plan.md`, `api-contract.md` |
| `session` | Session, validation, progression, réversibilité | `backend-plan.md`, `api-contract.md` |
| `selectors` | `SessionView`, `Summary`, `QRY-*` | `backend-plan.md`, `api-contract.md` |
| `ui-shell` | Coque, tokens, navigation, états | `frontend-plan.md` |
| `ui-view` | E01, E02, E03, composants | `frontend-plan.md`, `api-contract.md` |
| `persistence` | `PERSIST-*`, stockage local | `api-contract.md`, `backend-plan.md` |
| `hardening` | Responsive, accessibilité, mouvement | `frontend-plan.md`, `cahier_charge.md` |
| `testing` | Unitaires, composants, E2E, manuel | `backend-plan.md`, `frontend-plan.md` |
| `infra` | Build, déploiement statique, URL | `infra-plan.md` |
| `documentation` | README, note ergonomique, preuves | `cahier_charge.md`, `master-plan.md` |
| `content` | Intégration de `ressources/` | `ressources/` (**requis**) |

**Règle :** aucune classification ne doit introduire d'entité, de rôle ou de fonction hors `cahier_charge.md`.

---

## 5. Workflow de l'Orchestrator

1. Lire `master-plan.md` (phase courante et porte) et `architecture.md`.
2. Identifier la phase (0–10) et vérifier que la porte précédente (G0–G10) est validée.
3. Classifier la tâche (section 4).
4. Vérifier les dépendances et blocages (ex. cœur non terminé avant les vues).
5. Définir le périmètre exact : opérations `QRY/CMD/PERSIST`, composants, exigences F/R/N/A visées.
6. Lister les **fichiers autorisés** et **interdits**.
7. Confirmer si un changement de contrat, de type, d'opération, de dépendance ou d'environnement est sollicité (par défaut : **non autorisé**).
8. Assigner au Core Agent ou à l'UI Agent uniquement si le périmètre est sûr et dans la phase.
9. Envoyer le travail à l'agent de vérification avant clôture de la porte.
10. Résumer les fichiers modifiés et les vérifications requises pour la porte.

**Règle :** l'Orchestrator ne lance pas la phase N+1 avant que la porte de la phase N soit validée.

---

## 6. Règles de l'agent d'implémentation

L'agent d'implémentation travaille uniquement dans le périmètre approuvé.

### 6.1 Doit

- Relire les documents de la phase et le contrat.
- **Reformuler le périmètre et la phase** avant toute édition.
- **Lister les fichiers prévus** avant de coder.
- Garder les changements minimaux et relisibles (une tâche = un lot cohérent).
- Suivre exactement le contrat : types, opérations, codes d'erreur, enveloppes.
- Respecter les invariants : aucune étape requise supprimée ; explications uniquement sur changement réel ; atomicité des erreurs.
- Laisser les règles métier dans `domain/` ; l'UI consomme sélecteurs et commandes.
- Ajouter ou mettre à jour les tests lorsque l'infrastructure de test existe.
- S'arrêter et escalader dès que le périmètre déborde.

### 6.2 Ne doit pas

- Inventer des types, opérations, codes d'erreur, champs, dépendances, scripts ou règles.
- Créer un endpoint, un serveur, une base, une authentification, un rôle serveur ou un secret.
- Modifier `api-contract.md` ou `architecture.md` sans mise à jour explicite et validation.
- Dupliquer une règle métier dans un composant d'interface.
- Mélanger refactorisation, formatage et fonctionnalité dans le même lot.
- Lire `localStorage` directement dans un composant (passer par `platform/persistence`).
- Utiliser `dangerouslySetInnerHTML`.
- Introduire un CDN/service externe dans le chemin critique.
- Écrire du texte métier en dur (il doit venir du catalogue/`ressources/`).

### 6.3 Sortie attendue

- Fichiers modifiés listés.
- Tests ajoutés ou exécutés.
- Résultat des commandes (`lint`, `typecheck`, `test`, `build`).
- Points ouverts et limites.

---

## 7. Workflow de l'agent de vérification

L'agent de vérification est **lecture seule**. Il applique la structure de `Agents.md`.

### 7.1 Sources à lire

1. `cahier_charge.md` (structure et exigences).
2. `ressources/` (contenu réel — absent).
3. Le travail produit (fichiers modifiés, tests).
4. Les dépendances (`architecture.md`, `api-contract.md`, plans de phase).

### 7.2 Vérifications

- **Structure :** E01–E03 et éléments respectés ; aucune fonction/rôle/écran inventé ; NFR et contraintes respectées.
- **Contenu :** aucun texte métier inventé ; tout contenu réel provient de `ressources/` ; lacunes en Open Question.
- **Cohérence :** types/opérations/erreurs identiques au contrat ; respect des plans de phase ; frontières Phase non franchies.
- **Non-fuite :** aucun élément d'un projet antérieur (backend, base, auth, rôles, services) importé sans source.

### 7.3 Sortie

Rapport contenant :

1. Verdict : `✅ PASS` / `⚠️ PASS WITH NOTES` / `❌ FAIL`.
2. Tableau des écarts (fichier, position, type, référence, correction proposée).
3. Écarts par catégorie (structure / contenu / cohérence / fuite).
4. Hypothèses et Open Questions.

**Règle :** `FAIL` bloque la transition ; il faut corriger puis re-vérifier. `PASS WITH NOTES` autorise la suite en enregistrant les notes.

---

## 8. Workflow de l'agent de revue (lecture seule)

La revue de code complète la vérification de phase. Elle est **lecture seule** sauf demande explicite de correction.

### 8.1 Points de revue

- Dérive de périmètre (fichiers hors phase).
- Conformité au contrat (formes de données, opérations, codes).
- Enveloppe `ContractResult` respectée.
- Absence de `fetch`/réseau/endpoint/secret.
- Absence de duplication de règle métier dans l'UI.
- Invariants : étapes requises, explications réelles, atomicité, préservation des réponses.
- Accessibilité : sémantique, clavier, focus, `aria`.
- Responsive et mouvement réduit.
- Couverture de tests des flux critiques et des codes d'erreur.
- Neutralité des fixtures (aucun contenu métier inventé).

### 8.2 Format de sortie

1. Constats d'abord, triés par sévérité (élevée → faible), avec fichier/ligne si possible.
2. Questions ouvertes pour intention floue ou contrat incomplet.
3. Résumé du risque résiduel.
4. Pas de réécriture de code sauf demande séparée.

---

## 9. Règles anti-hallucination

### 9.1 Types, opérations, erreurs, champs

Avant d'utiliser un type, une opération, un code d'erreur ou un champ :

1. Le localiser dans `api-contract.md`.
2. S'il est absent, le considérer comme **indisponible**.
3. Demander une mise à jour du contrat au lieu de l'inventer.
4. Vérifier que le code final ne contient aucun champ ou comportement non documenté.

### 9.2 Règles métier

Avant d'appliquer une règle :

1. La localiser dans `cahier_charge.md` ou dans les plans.
2. Si elle est floue, s'arrêter et demander.
3. Ne jamais choisir silencieusement entre des règles contradictoires.

### 9.3 Contenu métier (règle absolue)

Avant d'écrire un texte métier (identité, proposition de valeur, objectif, étape, préférence, règle, explication) :

1. Vérifier sa présence dans `ressources/`.
2. En l'absence de `ressources/`, **ne rien inventer** : conserver un emplacement vide/neutre et consigner une Open Question.
3. Aucune donnée métier plausible ne doit être présentée comme définitive.

### 9.4 Interdits absolus

- Inventer un service, une condition, un document, un lien, une question de test, une décision ou un message d'expert.
- Importer du contenu d'un projet antérieur.
- Créer un backend, une base, une auth, un rôle serveur ou un secret « pour compléter ».

### 9.5 Hypothèses (Assumptions) et Open Questions

Lorsqu'une information est introuvable après recherche dans les sources :

1. Ne jamais la présenter comme une exigence confirmée.
2. L'enregistrer comme **Open Question** si elle est bloquante (notamment toute donnée de `ressources/`).
3. N'utiliser une **Assumption** que si elle est indispensable pour avancer sur un point non contractuel.
4. **Documenter** chaque Assumption : énoncé, raison, portée, impact si elle est fausse.
5. Ne jamais convertir une Assumption en exigence originale, en règle métier ou en contenu définitif.
6. Réexaminer toute Assumption lorsqu'une porte est franchie ou qu'une source devient disponible.

**Règle :** une Assumption non documentée est traitée comme une hallucination et bloque la porte concernée.

---

## 10. Règles d'escalade critique

L'agent **s'arrête et escalade** dès qu'une tâche touche ou modifie :

- un type, une opération `QRY/CMD/PERSIST`, un code d'erreur ou une enveloppe ;
- l'invariant « aucune étape requise supprimée » ;
- la logique d'explication ou d'invalidation ;
- le contrat de persistance ou le format `PersistedSession` ;
- l'absence de backend/base/auth/API (toute tentative d'en ajouter) ;
- le contenu métier (toute tentative d'en inventer) ;
- les dépendances, scripts, variables d'environnement ou configuration de build ;
- la navigation E01–E03 ou les transitions autorisées.

**Escalade = décision de l'Orchestrator et, si contractuelle, de l'Human Approver.**

---

## 11. Fichiers requis par type de tâche

| Type de tâche | Fichiers à lire avant d'agir |
|---|---|
| Toute tâche | `cahier_charge.md` ; `new files/master-plan.md` (phase) |
| `foundation` | + `api-contract.md` ; `architecture.md` |
| `domain` | + `api-contract.md` ; `backend-plan.md` ; `architecture.md` |
| `session` / `selectors` | + `api-contract.md` ; `backend-plan.md` |
| `ui-shell` / `ui-view` | + `frontend-plan.md` ; `api-contract.md` ; `architecture.md` |
| `persistence` | + `api-contract.md` (PERSIST) ; `backend-plan.md` |
| `hardening` | + `frontend-plan.md` ; `cahier_charge.md` (N01–N09) |
| `testing` | + `backend-plan.md` ; `frontend-plan.md` ; `architecture.md` (tests) |
| `infra` | + `infra-plan.md` ; `frontend-plan.md` (build) |
| `documentation` | + `cahier_charge.md` (R05/R07/R08) ; `master-plan.md` (§7, §11) |
| `content` | + `ressources/` (**obligatoire**) ; `api-contract.md` (types du catalogue) |

**Règle :** si un fichier requis est absent (notamment `ressources/`), la tâche de contenu est **bloquée**, pas improvisée.

---

## 12. Séquence d'implémentation et portes

La séquence suit `master-plan.md` (§3–§5) :

```
Phase 0 Foundation → G0
Phase 1 Catalogue → G1
Phase 2 Moteur → G2
Phase 3 Session → G3
Phase 4 Réversibilité + sélecteurs → G4
Phase 5 Coque UI → G5
Phase 6 Vues E01–E03 → G6
Phase 7 Persistance → G7
Phase 8 Durcissement → G8
Phase 9 Tests + déploiement → G9
Phase 10 Preuves + contenu → G10
```

### 12.1 Règles de porte

- Une porte n'est franchie que si la vérification (section 7) donne `PASS` ou `PASS WITH NOTES` et que l'agent de revue ne relève aucun constat bloquant.
- `FAIL` ⇒ correction puis nouvelle vérification.
- Aucune porte ne peut être validée par l'agent qui a implémenté.
- Les portes G0, G4, G9, G10 exigent une approbation humaine (section 16).

### 12.2 Parallélisation autorisée

- Après G0, la coque UI (Phase 5) peut avancer en parallèle des Phases 1–4.
- L'intégration des vues (Phase 6) reste bloquée jusqu'à G4.

---

## 13. Workflow de tests

| Niveau | Cible | Rôle |
|---|---|---|
| Domaine | Règles, invariants, invalidation, explications, déterminisme | Test Agent |
| Composants | Validation locale, messages, clavier | Test Agent |
| E2E | E01→E02→E03, préférence, retour, révision, erreur, synthèse, A08, clavier, responsive, mouvement réduit, stockage | Test Agent |
| Manuel | Clavier seul, 320/768/1440, contrastes, zoom, modale | Test Agent + humain |

### 13.1 Règles

- Aucun test ne dépend du réseau, de l'horloge ou du hasard.
- Les fixtures restent neutres et techniques.
- Chaque code d'erreur affiché possède au moins un test.
- Chaque invariant bloquant possède un test de non-régression.
- Les tests de règles vivent dans le domaine, pas dans l'UI.
- Aucun contenu non fourni n'est présenté comme définitif.

---

## 14. Workflow de documentation et de preuves

- Le `README` documente : problème, parti pris ergonomique, bénéfice attendu, compromis, inspirations, limites (R05, R07, R08).
- La note ergonomique (priorités, compromis, inspirations) peut être une section identifiable du `README`.
- Le tableau de correspondance exigences/fonctions/preuves est tenu à jour.
- Les preuves A01–A16 reflètent l'état **réellement atteint**, sans surinterprétation.
- Toute preuve non produite est déclarée comme telle.
- Le contenu métier du `README` respecte la même règle anti-invention.

---

## 15. Gestion des erreurs et rollback

| Situation | Réponse |
|---|---|
| Écart au contrat détecté | Revenir à la version précédente du contrat et du code ; réintégrer proprement |
| Régression fonctionnelle | Rétablir le commit précédent |
| Déploiement défaillant | Redéployer la version précédente conservée par l'hébergeur |
| Contenu invalide | Retirer le contenu du catalogue et restaurer l'état neutre |
| Tâche hors périmètre | Arrêt immédiat et escalade |
| Blocage sur information manquante | Open Question, pas d'invention |

- Le rollback s'appuie sur les commits Git et les déploiements statiques.
- Aucune migration de base n'existe.
- Aucun rollback ne doit introduire de dépendance serveur.

---

## 16. Points d'approbation humaine

L'approbation humaine est **obligatoire** pour :

1. **G0 — gel du contrat** (types, opérations, codes d'erreur).
2. **Tout changement de contrat, de type ou d'opération.**
3. **G4 — cœur local complet** avant l'intégration des vues.
4. **G9 — avant publication** de l'URL publique.
5. **G10 — avant soumission finale** (README, preuves, contenu).

Aucune de ces étapes ne peut être approuvée par l'agent qui a produit le travail.

---

## 17. Contrôle des changements et cohérence

1. Toute modification d'un type, d'une opération, d'un code d'erreur ou d'un invariant exige une mise à jour préalable de `api-contract.md` et une nouvelle vérification.
2. Toute évolution architecturale est documentée dans `architecture.md` avant propagation.
3. Aucun changement ne peut contredire `cahier_charge.md`.
4. Aucun contenu ne peut être ajouté sans source dans `ressources/`.
5. Toute évolution du `master-plan.md` (phases, portes) doit être répercutée dans ce workflow.
6. Une incompatibilité se résout en faveur du cahier, puis est documentée.
7. Les fichiers de phase précédents restent la référence des décisions déjà prises.

---

## 18. Taille des tâches et des PR

- Une PR = une tâche ou une tranche de module du `master-plan.md`.
- Les changements de contrat sont isolés et approuvés séparément.
- Les flux critiques peuvent être répartis entre plusieurs PR, mais chaque porte exige leur cohérence.
- Aucune réécriture large d'un module sans demande explicite.
- Aucun mélange formatage/fonctionnalité.
- Un lot reste relisible et testable.

---

## 19. Modèles de prompts

### 19.1 Tâche d'implémentation

```md
Tâche : <nom>
Phase : <0–10>
Type : <foundation | domain | session | selectors | ui-shell | ui-view | persistence | hardening | testing | infra | documentation | content>

À lire d'abord :
- cahier_charge.md
- new files/master-plan.md (phase et porte)
- new files/architecture.md (section concernée)
- new files/api-contract.md (opérations/types concernés)
- <frontend-plan.md | backend-plan.md | infra-plan.md selon la tâche>
- ressources/ (UNIQUEMENT pour une tâche de contenu)

Périmètre :
- <comportement, opérations QRY/CMD/PERSIST, composants exacts>

Fichiers autorisés :
- <chemins>

Fichiers interdits :
- <chemins>

Règles :
- Aucun changement de contrat, de type, d'opération, de dépendance ou d'environnement sans approbation.
- Aucun backend, base, auth, API réseau, secret.
- Aucun contenu métier inventé (ressources/ uniquement).
- Changements minimaux ; arrêt si le périmètre s'étend.

Critères d'acceptation :
- <liste, incluant les éléments de la porte concernée>

Avant d'éditer :
- Reformuler le périmètre et la phase.
- Lister les fichiers prévus.
```

### 19.2 Tâche de vérification

```md
Vérifie ce travail en lecture seule.
Lis : cahier_charge.md, ressources/ (si présent), le travail produit, et les dépendances (architecture.md, api-contract.md, plans de phase).
Vérifie : structure (cahier), contenu (ressources), cohérence (contrat/dépendances), non-fuite d'un projet antérieur.
Sortie : verdict PASS / PASS WITH NOTES / FAIL, puis tableau des écarts (fichier, position, type, référence, correction), puis hypothèses et questions ouvertes.
Ne modifie aucun fichier.
```

### 19.3 Tâche de revue de code

```md
Relis ce changement en lecture seule.
Focus : périmètre, contrat, invariants, absence de réseau/backend/base/auth/secret, duplication de règles dans l'UI, accessibilité, responsive, tests.
Sortie : constats d'abord par sévérité avec fichier/ligne, puis questions ouvertes, puis risque résiduel.
Pas de réécriture sauf demande séparée.
```

---

## 20. Initialisation du projet (sans comptes)

Contrairement à un projet client-serveur, il n'y a **aucun compte à créer, aucun administrateur à amorcer, aucun rôle à initialiser**.

L'initialisation consiste uniquement à :

1. créer le dépôt et l'arborescence de `architecture.md` §20 ;
2. configurer React + TypeScript + Vite si la stack est confirmée (H04), sinon fallback JavaScript ;
3. figer le contrat (types, opérations, codes) ;
4. créer `data/demo-data.ts` vide (aucun contenu inventé) ;
5. configurer les tests ;
6. documenter l'absence de `ressources/`.

**Interdit :** ajouter une authentification, un compte, un rôle serveur ou un amorçage d'utilisateur.

---

## 21. Definition of Done d'une tâche d'agent

Une tâche est terminée lorsque :

1. elle respecte le périmètre approuvé et les fichiers autorisés ;
2. elle est conforme à `cahier_charge.md` et au contrat ;
3. aucun contenu métier n'a été inventé ;
4. aucun backend, base, auth, API réseau ou secret n'a été introduit ;
5. les invariants concernés sont préservés et testés ;
6. `lint`, `typecheck`, `test`, `build` passent (selon disponibilité) ;
7. la vérification indépendante donne `PASS` ou `PASS WITH NOTES` ;
8. les points ouverts sont consignés ;
9. la porte de phase concernée est franchie.

---

## 22. Handoff et clôture

À la clôture, l'agent fournit :

- la liste des fichiers modifiés et créés ;
- les commandes exécutées et leurs résultats ;
- les tests ajoutés et leur couverture des exigences ;
- les points restés ouverts et les Open Questions ;
- l'état des portes G0–G10 ;
- la confirmation qu'aucun backend, base, auth, API réseau, secret ou contenu inventé n'a été introduit.

**Règle finale :** en cas de doute, s'arrêter et demander à l'Orchestrator, puis à l'Human Approver pour toute question contractuelle. Ne jamais compléter une information manquante par une invention.

---

**Fin du workflow des agents IA — Le Chemin Vivant, Phase 7.**
