# Le Chemin Vivant — Plan Frontend

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version :** 1.0  
**Statut :** Phase 4 — Plan de réalisation de l'interface  
**Documents de référence :** `cahier_charge.md`, `new files/architecture.md`, `new files/api-contract.md`, `new files/backend-plan.md`

> **Décision préalable :** l'interface est une application web statique, exécutée entièrement côté client. Elle expose **trois vues logiques** — E01 (objectif), E02 (parcours), E03 (synthèse) — conformément au `cahier_charge.md`. Elle ne comporte ni backend, ni authentification, ni rôles, ni base de données, ni API réseau.
>
> `ressources/` est absent. Aucun contenu métier réel (identité, proposition de valeur, objectifs, étapes, préférences, règles, explications) ne peut donc être rédigé. Le plan définit les **emplacements de contenu**, les **clés de liaison** et les **états**, sans inventer de texte métier.

---

## Table des matières

1. Objet et sources
2. Périmètre et non-objectifs
3. Expérience utilisateur et flux
4. Cartographie des vues
5. Layouts et navigation
6. E01 — Accueil / objectif
7. E02 — Parcours
8. E03 — Synthèse
9. Composants
10. Formulaires, tableaux, dashboards et modales
11. Gestion d'état
12. Intégration au contrat
13. États de chargement, vide et erreur
14. Validation et correspondance des erreurs
15. Liaison au contenu de `ressources/`
16. Responsive et comportement mobile/desktop
17. Accessibilité
18. Feedback, animation et performance
19. Sécurité et confidentialité
20. Plan d'implémentation incrémental
21. Stratégie de tests
22. Definition of Done
23. Traçabilité
24. Risques et mitigations
25. Hypothèses et questions ouvertes
26. Handoff vers la Phase 5

---

## 1. Objet et sources

### 1.1 Objet

Ce plan permet à un développeur ou à un AI Agent de construire l'interface complète du MVP :

- la coque applicative et les trois vues ;
- la sélection d'objectif et le démarrage du parcours ;
- l'affichage de l'étape, de la progression et des préférences ;
- les formulaires de réponse et de préférence ;
- les explications d'adaptation ;
- le retour, la révision et le signalement des réponses invalidées ;
- la synthèse, la modification et le redémarrage ;
- les états de chargement, vide, erreur et stockage indisponible ;
- le responsive, le clavier, le focus et le mouvement réduit ;
- les tests d'interface et de parcours.

Le plan ne couvre ni le domaine, ni le moteur de règles, ni la persistance interne, qui appartiennent à la Phase 3. Il ne couvre pas non plus le déploiement, qui appartient à la Phase 5.

### 1.2 Sources

| Source | Usage |
|---|---|
| `cahier_charge.md` | Trois vues E01–E03, éléments, états, flux, F01–F12, N01–N09, A01–A16, contraintes |
| `ressources/` | Contenu réel de chaque vue (**absent**) |
| `new files/architecture.md` | Modules, frontières, navigation, composants, accessibilité, responsive |
| `new files/api-contract.md` | Types, QRY/CMD/PERSIST, erreurs, invariants, navigation |
| `new files/backend-plan.md` | Cœur local, opérations disponibles, handoff |
| `fichiers principales/frontend-plan.md` | Méthodologie de planification uniquement |

### 1.3 Hiérarchie en cas de conflit

1. `cahier_charge.md` — structure, exigences, contraintes.
2. `ressources/` — contenu réel (absent).
3. `new files/architecture.md` — décisions architecturales.
4. `new files/api-contract.md` — formes et opérations.
5. `new files/backend-plan.md` — implémentation du cœur local.
6. `fichiers principales/frontend-plan.md` — méthode uniquement.

### 1.4 Limites documentaires

- Aucun contenu métier n'est disponible : identité, proposition de valeur, objectifs, étapes, préférences, règles et explications restent à fournir.
- Le domaine métier et la tâche réelle ne sont pas confirmés (H02).
- La stack React + TypeScript + Vite reste conditionnelle aux compétences de l'équipe (H04).
- Aucune conformité WCAG/RGAA complète n'est revendiquée.
- Aucune preuve A01–A16 n'est déclarée produite.

---

## 2. Périmètre et non-objectifs

### 2.1 Dans le périmètre

- `src/app/**` : coque, providers, error boundary.
- `src/views/**` : E01, E02, E03.
- `src/ui/**` : Design Tokens, composants, états visuels.
- `src/platform/navigation.ts` : navigation interne entre vues.
- Intégration des opérations `QRY-*`, `CMD-*` et `PERSIST-*` via les modules de la Phase 3.
- Tests de composants, tests E2E et grille manuelle.
- Responsive, accessibilité, feedback, mouvement réduit.

### 2.2 Hors périmètre

| Élément | Décision | Référence |
|---|---|---|
| Backend HTTP | Aucun | Cahier section 8 ; architecture AD01 |
| Base de données | Aucune | Cahier section 8 ; architecture AD01 |
| Authentification / comptes | Aucune | Cahier section 2 ; contrat section 4 |
| Rôles / permissions | Aucun rôle ; seules les gardes de progression | Contrat section 4 |
| API externe / réseau | Aucune dans le MVP | Architecture AD01 |
| Paiements, IA, chatbot, 3D, gamification | Aucun | Cahier section 2 |
| Administration | Aucune | Cahier section 2 |
| Analytics / tracking | Aucun | N09 ; architecture section 17 |
| Upload de fichiers | Aucun | Aucun besoin exprimé |
| Notifications | Aucune | Aucun service requis |
| Tableaux de données | Aucun | Les vues ne sont pas des écrans de gestion |
| Dashboards | Aucun | La synthèse n'est pas un tableau de bord analytique |
| Routes URL | Facultatives, non retenues pour le MVP | Cahier section 5 ; contrat section 9 |
| Contenu de démonstration réel | Bloqué par l'absence de `ressources/` | OQ-F1 |

### 2.3 Note sur le nombre d'écrans

Les consignes génériques mentionnent « sept écrans ». Le `cahier_charge.md` définit **trois vues logiques** : E01, E02 et E03. Le cahier est la référence supérieure. Le plan n'ajoute aucun écran, panneau ou parcours non prévu.

---

## 3. Expérience utilisateur et flux

### 3.1 Principe

L'utilisateur exprime son objectif avant de découvrir les étapes. Le parcours peut s'adapter à une préférence de présentation, mais :

- aucune étape requise n'est supprimée ou masquée ;
- une adaptation réelle est expliquée ;
- une absence de changement ne produit aucune explication ;
- les réponses valides sont conservées lors d'un retour ou d'une révision ;
- les réponses devenues incompatibles sont signalées, jamais effacées silencieusement ;
- la complétion n'est annoncée que lorsque toutes les étapes requises sont validées.

### 3.2 Flux

| Flux | Séquence | Résultat attendu |
|---|---|---|
| Nominal | E01 → objectif → E02 → étapes / adaptation → E03 | Synthèse atteinte sans blocage |
| Correction | E03 → Modifier → E02 → mise à jour → E03 | Décision corrigée, synthèse cohérente |
| Préférence | E02 → modification → explication → poursuite | Changement visible et justifié |
| Retour | E02 → Retour | Étape antérieure, réponses conservées |
| Révision | E02 → réponse antérieure → nouvelle valeur | Dépendances recalculées, invalidations signalées |
| Erreur locale | E02 → valeur absente/invalide | Erreur près du contrôle, autres données conservées |
| Redémarrage | E03 → Recommencer → confirmation | Nouvelle session vierge |
| Reprise | Ouverture → session sauvegardée valide | Reprise sans perte ; stockage non bloquant |

### 3.3 Transitions autorisées

| Depuis | Action | Vers | Condition |
|---|---|---|---|
| E01 | Commencer | E02 | Objectif sélectionné et plan valide |
| E02 | Action principale | E02 | Étape validée, parcours non terminé |
| E02 | Action principale | E03 | Étape validée, parcours complet |
| E02 | Retour | E02 | Étape > première |
| E02 | Modifier préférence | E02 | Valeur déclarée |
| E03 | Modifier | E02 | Session disponible |
| E03 | Recommencer | E01 | Confirmation explicite |

Aucune transition ne doit être déclenchée par un changement d'URL implicite ou par un effet de bord visuel.

### 3.4 Règles UX

1. Une action principale est identifiable sans ambiguïté.
2. Le retour est toujours disponible, sauf à la première étape ; l'indisponibilité est explicite.
3. Une erreur est affichée près du contrôle concerné et n'efface aucune autre réponse.
4. Une explication n'apparaît que si un changement réel a eu lieu.
5. Une réponse invalidée reste visible et signalée jusqu'à correction ou réinitialisation.
6. Une complétion incorrecte n'est jamais affichée.
7. Une panne de stockage local ne bloque jamais le parcours.
8. Aucun texte métier n'est codé en dur dans les vues.

---

## 4. Cartographie des vues

| Vue | `ViewId` | Rôle | Opérations | États principaux |
|---|---|---|---|---|
| E01 | `goal-selection` | Identité, proposition de valeur, choix d'objectif, Commencer | `QRY-01`, `CMD-01` | initial, sélection valide, sélection absente, catalogue vide/invalide |
| E02 | `journey` | Objectif, étape, progression, préférences, Retour, explications | `QRY-02`, `CMD-02`, `CMD-03`, `CMD-04`, `CMD-05` | étape valide, champ manquant, erreur, adaptation, retour, correction, invalidation |
| E03 | `summary` | Objectif, décisions, explications, complétion, Modifier, Recommencer | `QRY-03`, `CMD-06` | terminé, correction, session nouvelle, incomplet refusé |

**Pages :** les trois vues sont des pages logiques rendues dans une seule application. Aucune route URL n'est nécessaire.

**Données communes :** `Objective`, `Step`, `Preference`, `Explanation`, `SessionState`, `JourneyPlan`, `Progress`, `Summary`.

---

## 5. Layouts et navigation

### 5.1 Coque applicative

```
AppShell
├── SkipLink
├── AppHeader
│   ├── Identité du projet
│   └── Indicateur de vue / progression (texte)
├── Main
│   ├── E01 | E02 | E03
│   └── LiveRegion
├── StatusBanner (stockage, erreur non bloquante)
└── ErrorBoundary (niveau application)
```

Règles :

- `AppShell` ne contient aucune règle métier.
- Le lien d'évitement mène directement au contenu principal.
- L'en-tête reste minimal : identité, contexte de vue, aucune navigation par menus.
- La zone `main` porte un `h1` unique par vue.
- `LiveRegion` sert aux explications et aux messages non bloquants.
- `StatusBanner` ne remplace jamais une erreur locale.

### 5.2 E01 — disposition

- Une colonne centrée, largeur de lecture maîtrisée.
- Bloc identité / proposition de valeur.
- Groupe de sélection d'objectif.
- Message d'erreur de sélection sous le groupe.
- Action **Commencer** après le groupe, visible sans défilement critique à 320 px.

### 5.3 E02 — disposition

| Région | Desktop | Mobile |
|---|---|---|
| En-tête de parcours | Objectif + progression | Empilé |
| Colonne principale | Étape courante + formulaire | Pleine largeur |
| Colonne secondaire | Préférences + explications | Sous le formulaire |
| Actions | Action principale + Retour | Action principale et Retour visibles |

- En desktop, deux colonnes à partir de 768 px.
- En mobile, une seule colonne ; les explications restent visibles et ne sont pas cachées dans un survol.
- L'action principale reste accessible au clavier et ne dépend pas d'un défilement horizontal.

### 5.4 E03 — disposition

- Une colonne lisible.
- En-tête : objectif et état de complétion.
- Liste des décisions.
- Liste des explications significatives.
- Actions **Modifier** et **Recommencer**.

### 5.5 Navigation

- Navigation interne par `ViewId` : `goal-selection`, `journey`, `summary`.
- `src/platform/navigation.ts` reçoit la vue à afficher ; il ne contient aucune règle métier.
- Aucune route URL n'est implémentée dans le MVP.
- Si des routes sont introduites plus tard : rafraîchissement, accès direct, absence de données sensibles et tests obligatoires.
- Le changement de vue place le focus sur le `h1` de la nouvelle vue.

### 5.6 Règles de navigation

1. E01 ne mène à E02 qu'après `CMD-01` réussi.
2. E02 ne mène à E03 qu'après complétion vérifiée par le domaine.
3. E03 → E02 conserve `SessionState`.
4. E03 → E01 exige `CMD-06` avec confirmation.
5. Aucune navigation ne doit être provoquée par une erreur de stockage.

---

## 6. E01 — Accueil / objectif

### 6.1 But

Permettre de comprendre le parti pris, de choisir un objectif et de démarrer le parcours.

### 6.2 Contenu

| Emplacement | Source | Statut |
|---|---|---|
| Identité du projet | `ressources/` / cahier | Partiel : « Le Chemin Vivant » connu |
| Proposition de valeur courte | `ressources/` | **À fournir** |
| Liste des objectifs | `QRY-01` → `Objective[]` | Structure prête, contenu absent |
| Titre et description d'objectif | `Objective.titre`, `Objective.description` | Contenu absent |
| Action **Commencer** | Cahier E01 | Libellé connu |
| Message de sélection absente | Copie d'interface | À rédiger avec le contenu |
| État vide | Copie d'interface | À rédiger |

### 6.3 Structure

```
E01
├── Identité
├── Proposition de valeur
├── fieldset / legend : objectifs
│   ├── ObjectiveCard (radio)
│   └── message de sélection
├── PrimaryAction « Commencer »
└── LiveRegion
```

### 6.4 États

| État | Déclencheur | Affichage | Action |
|---|---|---|---|
| Initial | Aucun objectif sélectionné | Liste, aucune progression | Commencer bloqué avec explication |
| Sélection valide | Objectif choisi | Carte sélectionnée, action active | `CMD-01` puis E02 |
| Sélection absente | Commencer sans choix | Message près du groupe | Focus sur le groupe |
| Catalogue vide | `QRY-01` retourne `[]` | EmptyState | Aucun démarrage |
| Catalogue invalide | `CATALOG_INVALID` | ErrorState plein écran | Recharger / contacter l'équipe |
| Erreur inattendue | Exception récupérable | ErrorState | Réessayer |

### 6.5 Interactions

- Sélection par clic ou clavier sur une carte radio.
- `Entrée` / `Espace` sélectionne.
- `Commencer` déclenche `CMD-01` avec l'identifiant choisi.
- Le double clic ne déclenche pas deux commandes.
- Aucune progression avant succès de `CMD-01`.

### 6.6 Validation et erreurs

- `OBJECTIVE_REQUIRED` : message près du groupe, `aria-invalid`, focus sur le premier objectif.
- `OBJECTIVE_NOT_FOUND` : message d'état, rafraîchir la liste ; ne pas démarrer.
- `CATALOG_INVALID` : état d'application, aucun parcours partiel.
- `RULE_CONFLICT` : état d'application, aucun parcours partiel.
- `UNEXPECTED_ERROR` : ErrorBoundary, aucune page blanche.

### 6.7 Accessibilité

- `fieldset` + `legend` pour le groupe d'objectifs.
- Cartes cliquables rendues comme boutons radio natifs ou avec rôles ARIA complets.
- Focus visible sur chaque carte.
- Description d'objectif associée au contrôle.
- Message d'erreur lié par `aria-describedby`.
- Le `h1` porte l'identité ou l'objectif de la vue.

### 6.8 Critères d'acceptation

- Aucun démarrage sans objectif.
- `QRY-01` est la seule source de la liste.
- Aucun contenu d'objectif n'est codé en dur.
- Le clavier permet de choisir et de démarrer.
- 320 / 768 / 1440 px sans débordement critique.

---

## 7. E02 — Parcours

### 7.1 But

Afficher l'objectif, l'étape courante, la progression, les préférences et les explications ; permettre de valider, revenir, réviser et corriger.

### 7.2 Contenu

| Emplacement | Source | Statut |
|---|---|---|
| Objectif | `SessionView.objective` | Contenu absent |
| Étape courante | `SessionView.activeStep` | Contenu absent |
| Progression | `SessionView.progress` | Structure prête |
| Préférences | `SessionView.preferences` | Contenu absent |
| Réponses | `SessionView.answers` | Structure prête |
| Explications | `SessionView.explanations` | Contenu absent |
| Erreurs locales | `SessionView.issues` | Structure prête |
| Action principale | Copie d'interface / `ressources/` | **À fournir** |
| **Retour** | Cahier E02 | Libellé connu |
| « Étape X sur Y » | Cahier F03 | Format connu |

### 7.3 Régions

| Région | Contenu | Contrat |
|---|---|---|
| En-tête | Titre d'objectif, progression textuelle | `QRY-02` |
| Étape | Titre, contenu, champs requis | `StepView` |
| Formulaire | Champs de réponse + action principale | `CMD-03` |
| Préférences | Contrôles de présentation | `CMD-02` |
| Explications | Raison + changement observable | `ExplanationPanel` |
| Invalidations | Réponses devenues incompatibles | `InvalidatedAnswerNotice` |
| Retour | Bouton Retour | `CMD-04` |
| Révision | Accès à une réponse antérieure | `CMD-05` |

### 7.4 Formulaire d'étape

- Le formulaire est rendu à partir du contenu de l'étape, jamais d'un schéma inventé.
- Les champs requis sont identifiés par le contenu / contrat ; leur type exact reste une Open Question tant que `ressources/` est absent.
- Le formulaire ne contient qu'un seul bouton d'action principale.
- La soumission appelle `CMD-03` avec `stepId` et `answer`.
- Les erreurs de validation proviennent de `SessionView.issues` et/ou de `ContractResult`.
- Aucune validation métier n'est dupliquée dans le composant.

### 7.5 Préférences

- Chaque préférence est rendue par un contrôle accessible (groupe radio ou sélection native).
- La valeur sélectionnée vient de `PreferenceView.selectedValue`.
- Un changement appelle `CMD-02` avec `preferenceId` et `value`.
- Le changement ne doit pas être appliqué visuellement avant le succès de la commande.
- En cas d'échec, l'ancienne valeur reste affichée et l'erreur est locale.
- Un changement sans différence réelle ne produit aucun panneau d'explication.

### 7.6 Explications

- `ExplanationPanel` affiche `Explanation.reason` et les changements réels.
- Le panneau est placé près de la préférence ou de l'étape concernée.
- Il est annoncé via `aria-live="polite"`.
- Il ne s'affiche pas si `explanations` est vide.
- Aucun texte métier n'est généré par le composant.

### 7.7 Retour, révision et invalidation

- **Retour** appelle `CMD-04` ; à la première étape, l'action est désactivée avec explication.
- **Réviser** permet de modifier une réponse antérieure via `CMD-05`.
- Les réponses valides non concernées restent visibles.
- Les réponses invalidées restent affichées et sont marquées avec `reason`.
- Une invalidation ne supprime jamais la valeur de l'état.
- La correction d'une réponse invalide passe par le formulaire ou la révision.

### 7.8 États

| État | Déclencheur | Affichage | Action |
|---|---|---|---|
| Étape valide | Session active, étape courante | Étape + formulaire | Action principale |
| Champ manquant | `ANSWER_REQUIRED` | Erreur locale | Focus sur le champ |
| Réponse invalide | `ANSWER_INVALID` | Erreur locale | Correction sans reset |
| Adaptation | `CMD-02` réussi avec changement | Explication + changement | Poursuivre |
| Aucun changement | `CMD-02` sans diff | Aucun panneau | Poursuivre |
| Retour | `CMD-04` | Étape antérieure | Données conservées |
| Révision | `CMD-05` | Plan recalculé | Invalidations signalées |
| Conflit de règles | `RULE_CONFLICT` | ErrorState | Aucun parcours partiel |
| Étape requise retirée | `REQUIRED_STEP_REMOVED` | ErrorState | Aucun parcours partiel |
| Session absente | `SESSION_REQUIRED` | Retour E01 avec message | Recommencer |
| Stockage indisponible | `STORAGE_UNAVAILABLE` | Bandeau non bloquant | Poursuivre |

### 7.9 Accessibilité

- Chaque champ possède un `label` explicite.
- Les erreurs sont liées au champ par `aria-describedby`.
- Le premier champ invalide reçoit le focus après échec de soumission.
- La progression textuelle est lisible et ne dépend pas de la couleur.
- Les explications sont annoncées sans voler le focus.
- `Retour` est un bouton natif, désactivé avec une explication à la première étape.
- Les contrôles de préférence sont utilisables au clavier.
- Aucun contenu n'est accessible uniquement au survol.

### 7.10 Critères d'acceptation

- Le parcours peut être terminé au clavier.
- Une préférence produit une explication uniquement en cas de changement réel.
- Aucune étape requise n'est supprimée après adaptation.
- Un retour ne perd aucune réponse.
- Une réponse invalidée est signalée et conservée.
- Une erreur locale ne réinitialise pas le parcours.
- 320 / 768 / 1440 px sans débordement critique.

---

## 8. E03 — Synthèse

### 8.1 But

Présenter une synthèse fidèle de l'objectif, des décisions et des explications, avec un état de complétion exact et des actions de correction ou de redémarrage.

### 8.2 Contenu

| Emplacement | Source | Statut |
|---|---|---|
| Objectif | `Summary.objective` | Contenu absent |
| Préférences | `Summary.preferences` | Contenu absent |
| Décisions | `Summary.decisions` | Structure prête |
| Explications significatives | `Summary.explanations` | Contenu absent |
| Complétion | `Summary.completion` | Structure prête |
| **Modifier** | Cahier E03 | Libellé connu |
| **Recommencer** | Cahier E03 | Libellé connu |

### 8.3 Structure

```
E03
├── En-tête : objectif + état de complétion
├── SummaryView
│   ├── DecisionList
│   └── ExplanationPanel
├── CompletionStatus
├── PrimaryAction « Modifier »
└── SecondaryAction « Recommencer »
```

### 8.4 États

| État | Déclencheur | Affichage | Action |
|---|---|---|---|
| Terminé | Toutes les étapes requises validées | Synthèse complète | Modifier / Recommencer |
| Correction | Modifier | Retour E02 avec état conservé | Poursuivre |
| Nouvelle session | Recommencer confirmé | E01 vierge | Nouveau parcours |
| Incomplet | `JOURNEY_INCOMPLETE` | Refus explicite, aucune complétion | Retour E02 |
| Session absente | `SESSION_REQUIRED` | Retour E01 avec message | Recommencer |
| Erreur inattendue | Exception | ErrorState | Réessayer |

### 8.5 Complétion

- `completion.completed` est affiché tel quel.
- `requiredCompleted` et `requiredTotal` sont affichés sans recalcul côté UI.
- Une synthèse incomplète n'est jamais présentée comme terminée.
- Aucun pourcentage inventé, aucune estimation.

### 8.6 Modifier et Recommencer

- **Modifier** navigue vers E02 sans perdre `SessionState`.
- **Recommencer** ouvre une modale de confirmation.
- La modale explique que la session sera réinitialisée.
- `Confirmer` appelle `CMD-06` avec `confirm: true`.
- `Annuler` ferme la modale sans effet.
- Une erreur `CONFIRMATION_REQUIRED` rouvre la modale ou affiche l'erreur sans effacer la session.

### 8.7 Accessibilité

- La synthèse est structurée par titres et listes.
- Chaque décision associe une étape et sa réponse.
- Le focus est placé sur le `h1` après navigation.
- La modale piège le focus, se ferme avec `Échap` et restaure le focus.
- L'état de complétion est annoncé textuellement.

### 8.8 Critères d'acceptation

- Une synthèse incomplète est refusée.
- Les décisions correspondent aux réponses réelles.
- Les explications affichées sont réelles.
- Modifier conserve l'état.
- Recommencer exige une confirmation.
- Aucun contenu métier n'est inventé.

---

## 9. Composants

| Composant | Responsabilité | Données / contrat | Vues | Accessibilité |
|---|---|---|---|---|
| `AppShell` | Landmarks, en-tête, contenu, bandeau | Aucune règle métier | Toutes | `header`, `main`, `skip-link` |
| `SkipLink` | Aller au contenu | Aucune | Toutes | Premier élément focusable |
| `AppHeader` | Identité et contexte | Copie d'interface | Toutes | `header`, texte lisible |
| `ObjectiveSelector` | Groupe de sélection | `ObjectiveView[]` | E01 | `fieldset` / `legend`, radios |
| `ObjectiveCard` | Présenter un objectif | `Objective`, `selected` | E01 | Contrôle natif, focus visible |
| `PrimaryAction` | Action principale | Libellé fourni | E01, E02, E03 | Bouton natif, état disabled |
| `ProgressIndicator` | « Étape X sur Y » | `Progress` | E02 | Texte + alternative |
| `StepView` | Titre, contenu, formulaire | `Step` | E02 | `h2`, labels, erreurs liées |
| `AnswerForm` | Champs de réponse | `Step`, `ValidationIssue[]` | E02 | `form`, focus premier invalide |
| `PreferenceControl` | Modifier une préférence | `PreferenceView` | E02 | Groupe radio / select natif |
| `ExplanationPanel` | Raison et changement | `Explanation[]` | E02, E03 | `aria-live="polite"` |
| `ValidationMessage` | Erreur locale | `ValidationIssue` | E01, E02 | `role="alert"` / `aria-describedby` |
| `InvalidatedAnswerNotice` | Signaler une réponse invalidée | `InvalidatedAnswer[]` | E02 | Texte + liste, non couleur seule |
| `DecisionList` | Décisions de synthèse | `DecisionView[]` | E03 | Liste sémantique |
| `SummaryView` | Synthèse complète | `Summary` | E03 | Titres, listes |
| `CompletionStatus` | État de complétion | `Summary.completion` | E03 | Texte explicite |
| `ConfirmDialog` | Confirmer le redémarrage | `CMD-06` | E03 | `dialog`, focus trap, `Échap` |
| `EmptyState` | Catalogue vide / aucune donnée | Copie d'interface | E01, E02 | Titre, texte, action |
| `ErrorState` | Erreur bloquante | Code d'erreur | E01, E02, E03 | `role="alert"`, action de reprise |
| `StatusBanner` | Stockage ou erreur non bloquante | Message technique | Toutes | `aria-live="polite"` |
| `LiveRegion` | Annonces non bloquantes | Message | Toutes | `aria-live` |

### 9.1 Règles de composants

- Les composants ne contiennent aucune règle métier.
- Ils ne calculent ni plan, ni complétion, ni invalidation.
- Ils reçoivent des données déjà dérivées.
- Les libellés métier proviennent du catalogue ou de `ressources/`.
- Les libellés d'interface sont centralisés et identifiables.
- Aucun composant ne fait d'appel réseau.
- Aucun composant ne lit directement `localStorage`.
- Aucun composant n'utilise `dangerouslySetInnerHTML`.

---

## 10. Formulaires, tableaux, dashboards et modales

### 10.1 Formulaires

| Formulaire | Champs | Validation | Soumission |
|---|---|---|---|
| Sélection d'objectif | Un objectif (radio) | Objectif requis | `CMD-01` |
| Réponse d'étape | Champs déclarés par l'étape | Requis / valeurs déclarées | `CMD-03` |
| Préférence | Une valeur déclarée | Valeur déclarée | `CMD-02` |
| Révision | Réponse antérieure | Requis / valeurs déclarées | `CMD-05` |

Règles :

- Pas de formulaire d'authentification.
- Pas de formulaire d'administration.
- Pas de champ inventé.
- Les erreurs sont locales et liées au champ.
- Le formulaire ne soumet pas au réseau.

### 10.2 Tableaux

Aucun tableau de données n'est requis. Les décisions de synthèse sont une liste, pas un tableau paginé, trié ou filtrable.

### 10.3 Dashboards

Aucun dashboard n'est requis. La synthèse E03 n'est pas un dashboard : elle ne contient ni graphique, ni métrique analytique, ni filtre.

### 10.4 Modales

Une seule modale est prévue : la confirmation de **Recommencer**. Aucune modale de suppression, d'édition ou d'administration n'est nécessaire.

---

## 11. Gestion d'état

### 11.1 Principes

- Pas de bibliothèque de state management globale pour le MVP.
- L'état métier reste dans `SessionState` et les structures dérivées du contrat.
- L'état d'interface reste local aux vues et à la coque.
- Les sélecteurs dérivent les vues ; les vues ne recalculent rien.
- Les commandes sont atomiques : en cas d'échec, l'état précédent reste intact.
- La persistance est un effet de bord facultatif, jamais une dépendance.

### 11.2 Couches d'état

| Couche | Contenu | Propriétaire |
|---|---|---|
| État de session | `SessionState`, plan, réponses | Application / domaine |
| Vue dérivée | `SessionView`, `Summary` | `selectors` |
| État de coque | Vue active, boot, erreur globale | `app/` |
| État de formulaire | Brouillon local, champ touché, focus | Vue |
| État de feedback | Explications, invalidations, message live | Vue / coque |
| État de persistance | Disponible, restauré, absent, invalide | `platform/persistence` |

### 11.3 État d'interface

| État | Valeurs | Usage |
|---|---|---|
| `bootStatus` | `loading`, `ready`, `catalog-invalid` | Démarrage |
| `activeView` | `goal-selection`, `journey`, `summary` | Navigation |
| `selectedObjectiveId` | `Id` / `null` | E01 avant `CMD-01` |
| `answerDrafts` | `Record<Id, AnswerValue>` | Saisie locale |
| `touchedFields` | `Record<string, boolean>` | Affichage des erreurs |
| `liveMessage` | `string` / `null` | Annonces |
| `restartDialog` | `closed`, `open` | Confirmation |
| `storageStatus` | `available`, `unavailable`, `restored`, `invalid` | Bandeau |

### 11.4 Flux de données

```
Démarrage
  → chargement du catalogue local
  → validation du catalogue
  → QRY-01
  → PERSIST-LOAD (facultatif)
  → SessionState valide ou session neuve
  → vue initiale

Action utilisateur
  → commande CMD-*
  → ContractResult
  → succès : sélecteurs → nouvelle vue
  → échec : message local, état inchangé
```

### 11.5 Persistance

- `PERSIST-LOAD` est tenté au démarrage.
- Une session restaurée est revalidée par le domaine.
- Une session invalide démarre une session neuve sans planter.
- `PERSIST-SAVE` est appelé après une transition significative, en best effort.
- `PERSIST-CLEAR` est appelé lors d'un redémarrage confirmé.
- Une erreur de stockage affiche un bandeau non bloquant.
- Aucun état métier n'est dupliqué dans un store parallèle.

### 11.6 Règles d'état

1. Aucun plan n'est stocké dans l'état d'interface.
2. Aucune réponse n'est supprimée par une erreur.
3. Une réponse invalidée reste dans `SessionState`.
4. Une vue ne mute jamais directement `SessionState`.
5. Un sélecteur ne produit jamais d'effet de bord.
6. Une commande échouée ne change pas la vue.

---

## 12. Intégration au contrat

### 12.1 Opérations

| Opération | Déclencheur UI | Sortie utilisée | Erreurs affichées |
|---|---|---|---|
| `QRY-01` | Chargement E01 | `ObjectiveView[]` | `CATALOG_INVALID` |
| `QRY-02` | Rendu E02 | `SessionView` | `SESSION_REQUIRED`, `OBJECTIVE_REQUIRED`, `CATALOG_INVALID` |
| `QRY-03` | Rendu E03 | `Summary` | `SESSION_REQUIRED`, `JOURNEY_INCOMPLETE`, `CATALOG_INVALID` |
| `CMD-01` | Commencer | `SessionState`, plan, explications | `OBJECTIVE_REQUIRED`, `OBJECTIVE_NOT_FOUND`, `CATALOG_INVALID`, `RULE_CONFLICT` |
| `CMD-02` | Préférence | Plan, explications, invalidations | `SESSION_REQUIRED`, `PREFERENCE_*`, `CATALOG_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` |
| `CMD-03` | Action principale | Progression, complétion, `issues` | `SESSION_REQUIRED`, `STEP_*`, `ANSWER_*` |
| `CMD-04` | Retour | Étape antérieure, progression | `SESSION_REQUIRED`, `FIRST_STEP`, `STEP_NOT_FOUND`, `OBJECTIVE_REQUIRED` |
| `CMD-05` | Révision | Plan, explications, invalidations, `issues` | `SESSION_REQUIRED`, `STEP_*`, `ANSWER_*`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED` |
| `CMD-06` | Recommencer confirmé | Session vierge | `SESSION_REQUIRED`, `CONFIRMATION_REQUIRED` |
| `PERSIST-LOAD` | Démarrage | Session restaurée / `null` | `STORED_SESSION_INVALID`, `STORAGE_UNAVAILABLE` |
| `PERSIST-SAVE` | Après transition | Succès / échec non bloquant | `STORAGE_UNAVAILABLE` |
| `PERSIST-CLEAR` | Après redémarrage | Succès / échec non bloquant | `STORAGE_UNAVAILABLE` |

### 12.2 Règles d'intégration

- Aucun `fetch`, `XMLHttpRequest`, WebSocket ou API externe.
- Aucun endpoint HTTP n'est créé.
- Les vues appellent `session-controller` et `selectors`, jamais le domaine directement pour recalculer.
- Les résultats suivent `ContractResult<T>`.
- Les erreurs ne sont jamais avalées.
- Un code d'erreur inconnu est traité comme `UNEXPECTED_ERROR` sans page blanche.
- Aucun champ de contrat n'est renommé ou simplifié dans l'UI.
- Aucun mock réseau n'est créé : les données sont locales et déclaratives.

### 12.3 Cache et récupération de données

- Aucun cache HTTP.
- Le catalogue est chargé une fois au démarrage.
- Aucune invalidation de cache réseau.
- Les sélecteurs peuvent être mémoïsés localement si nécessaire, sans changer la sémantique.
- La persistance ne met en cache que `SessionState` et `schemaVersion`.
- Le catalogue n'est jamais dupliqué dans la sauvegarde.

---

## 13. États de chargement, vide et erreur

| Vue / situation | État | Affichage | Action |
|---|---|---|---|
| Démarrage | Chargement local | `aria-busy`, coque stable | Aucun clignotement artificiel |
| E01 | Catalogue vide | EmptyState | Aucun démarrage |
| E01 | Catalogue invalide | ErrorState | Recharger |
| E01 | Aucun objectif sélectionné | Message local | Focus groupe |
| E02 | Session absente | Retour E01 avec message | Recommencer |
| E02 | Étape introuvable | ErrorState | Revenir / recharger |
| E02 | Aucune préférence | Région omise | Aucun empty state artificiel |
| E02 | Aucune explication | Panneau omis | Aucun message fictif |
| E02 | Aucune réponse invalidée | Avis omis | Aucun message fictif |
| E03 | Parcours incomplet | Refus explicite | Retour E02 |
| E03 | Synthèse vide | ErrorState | Revenir E02 |
| Global | Stockage indisponible | Bandeau non bloquant | Poursuivre |
| Global | Sauvegarde invalide | Bandeau + session neuve | Poursuivre |
| Global | Exception | ErrorBoundary | Réessayer |

**Règle :** un état vide ne doit jamais être utilisé pour masquer une erreur métier. Une erreur de configuration est un `ErrorState`, pas un empty state.

---

## 14. Validation et correspondance des erreurs

### 14.1 Principes

- La validation métier appartient au domaine.
- L'interface affiche les `ValidationIssue` et les `ContractError`.
- L'interface ne réimplémente pas les règles de progression.
- Les erreurs sont locales quand elles concernent un champ.
- Les erreurs de configuration sont globales.
- Aucune erreur n'efface une autre réponse.
- Aucun message ne prétend à un contenu métier absent.

### 14.2 Correspondance

| Code | Contexte UI | Emplacement | Comportement |
|---|---|---|---|
| `OBJECTIVE_REQUIRED` | E01 | Groupe d'objectifs | Bloque Commencer, focus groupe |
| `OBJECTIVE_NOT_FOUND` | E01 | Message d'état | Rafraîchit la liste, ne démarre pas |
| `PREFERENCE_NOT_FOUND` | E02 | Contrôle de préférence | Ancienne valeur conservée |
| `PREFERENCE_VALUE_INVALID` | E02 | Contrôle de préférence | Valeur refusée, message local |
| `STEP_NOT_FOUND` | E02 | Zone d'étape | ErrorState, aucune progression |
| `STEP_NOT_IN_OBJECTIVE` | E02 | Zone d'étape | ErrorState, aucune progression |
| `STEP_NOT_ACTIVE` | E02 | Formulaire | Message local, étape rechargée |
| `SESSION_REQUIRED` | E02/E03 | Message d'état | Retour E01 |
| `ANSWER_REQUIRED` | E02 | Champ concerné | `aria-invalid`, focus champ |
| `ANSWER_INVALID` | E02 | Champ concerné | Message local, correction possible |
| `FIRST_STEP` | E02 | Bouton Retour | Bouton désactivé / message |
| `JOURNEY_INCOMPLETE` | E03 | Zone de synthèse | Refus explicite, retour E02 |
| `RULE_CONFLICT` | E02/E03 | ErrorState | Aucun parcours partiel |
| `REQUIRED_STEP_REMOVED` | E02/E03 | ErrorState | Aucun parcours partiel |
| `CONFIRMATION_REQUIRED` | E03 | Modale | Aucun effacement, confirmation requise |
| `STORAGE_UNAVAILABLE` | Global | Bandeau | Poursuite normale |
| `STORED_SESSION_INVALID` | Global | Bandeau | Session neuve, pas de crash |
| `UNEXPECTED_ERROR` | Global | ErrorBoundary | Reprise, pas de page blanche |

### 14.3 Messages

- Les messages techniques peuvent être génériques.
- Les messages métier proviennent du catalogue/règles.
- Les clés de copie sont centralisées dans `ui/` (fichier à définir à l'implémentation).
- Aucun message ne nomme une entité métier inexistante.
- Aucun message ne promet une action non réalisée.

---

## 15. Liaison au contenu de `ressources/`

### 15.1 Principe

Chaque emplacement visible est relié à une source :

1. une entité du catalogue (`Objective`, `Step`, `Preference`) ;
2. une structure dérivée (`Explanation`, `Summary`) ;
3. un libellé du cahier ;
4. une copie d'interface générique, sans contenu métier ;
5. `ressources/` pour tout texte réel.

`ressources/` est absent. Aucun texte réel n'est donc disponible.

### 15.2 Matrice de liaison

| Vue | Emplacement | Source attendue | État |
|---|---|---|---|
| E01 | Identité | `ressources/` + cahier | Partiel |
| E01 | Proposition de valeur | `ressources/` | À fournir |
| E01 | Objectifs | `Objective[]` via `QRY-01` | Structure prête |
| E01 | Titre / description | `Objective.titre`, `Objective.description` | À fournir |
| E01 | Commencer | Cahier E01 | Connu |
| E01 | Message sélection absente | Copie UI | À rédiger |
| E02 | Objectif | `SessionView.objective` | À fournir |
| E02 | Étape | `Step.titre`, `Step.contenu` | À fournir |
| E02 | Progression | `Progress.current`, `Progress.total` | Structure prête |
| E02 | Préférences | `Preference` + `PreferenceView` | À fournir |
| E02 | Action principale | Copie UI / `ressources/` | À fournir |
| E02 | Retour | Cahier E02 | Connu |
| E02 | Explication | `Explanation.reason` | À fournir |
| E02 | Invalidations | `InvalidatedAnswer.reason` | À fournir |
| E02 | Erreurs | `ValidationIssue.message` / copie UI | À fournir |
| E03 | Objectif | `Summary.objective` | À fournir |
| E03 | Décisions | `Summary.decisions` | Structure prête |
| E03 | Explications | `Summary.explanations` | À fournir |
| E03 | Complétion | `Summary.completion` | Structure prête |
| E03 | Modifier | Cahier E03 | Connu |
| E03 | Recommencer | Cahier E03 | Connu |

### 15.3 Règles de contenu

1. Aucun nom de service, d'étape, de préférence ou de règle n'est inventé.
2. Aucun texte marketing n'est écrit sans `ressources/`.
3. Les libellés du cahier (« Commencer », « Retour », « Modifier », « Recommencer », « Étape X sur Y ») peuvent être utilisés.
4. Les libellés d'interface génériques sont identifiés comme tels.
5. Toute information absente reste une Open Question.
6. Les fixtures de test restent neutres et techniques.
7. Aucun contenu d'un projet antérieur n'est importé.

---

## 16. Responsive et comportement mobile/desktop

### 16.1 Breakpoints

| Largeur | Comportement |
|---|---|
| 320 px | Une colonne, actions visibles, pas de débordement horizontal |
| 768 px | E02 peut passer en deux colonnes ; contrôles confortables |
| 1440 px | Largeur de lecture maîtrisée, pas d'étirement excessif |

### 16.2 Règles

- Aucun défilement horizontal critique.
- Les actions principales restent visibles sans zoom.
- Les cibles tactiles sont suffisamment grandes.
- Les textes ne sont pas tronqués de façon critique.
- Le zoom 200 % reste utilisable.
- Les colonnes se réorganisent sans perdre l'ordre de lecture.
- Les explications ne sont jamais cachées derrière un survol.
- Le clavier reste équivalent au tactile.
- Aucune information ne dépend de la couleur seule.

### 16.3 Mobile / desktop

| Élément | Mobile | Desktop |
|---|---|---|
| E01 | Colonne unique | Colonne centrée |
| E02 | Étape puis préférences puis explications | Étape à gauche, préférences/explications à droite |
| E03 | Colonne unique | Colonne lisible |
| Retour | Visible près de l'action | Visible près de l'action |
| Modale | Plein écran ou proche | Boîte centrée |

---

## 17. Accessibilité

### 17.1 Structure

- Un seul `h1` par vue.
- Hiérarchie de titres cohérente.
- Landmarks `header`, `main`, `nav` si nécessaire.
- Lien d'évitement.
- Langue `fr` déclarée.

### 17.2 Clavier

- Tous les contrôles sont natifs ou accessibles au clavier.
- Ordre de tabulation logique.
- Focus visible, jamais supprimé.
- `Entrée` / `Espace` activent les boutons et radios.
- `Échap` ferme la modale.
- Aucun piège de focus hors modale.

### 17.3 Formulaires

- `label` associé à chaque champ.
- `fieldset` / `legend` pour les groupes.
- `aria-invalid` sur les champs en erreur.
- `aria-describedby` vers le message.
- Focus sur le premier champ invalide après échec.
- Les erreurs ne reposent pas uniquement sur la couleur.

### 17.4 Annonces et focus

- Explications : `aria-live="polite"`.
- Erreurs bloquantes : `role="alert"`.
- Changement de vue : focus sur le `h1`.
- Modale : focus trap, focus initial, restauration.
- Progression : texte lisible et annoncé si nécessaire.

### 17.5 Mouvement et perception

- `prefers-reduced-motion` respecté.
- Animations non essentielles.
- Contraste suffisant.
- Information jamais portée uniquement par la couleur.
- Zoom et texte redimensionné supportés.
- Aucune conformité WCAG complète revendiquée.

### 17.6 Critères

- A09 : parcours principal au clavier.
- A10 : 320 / 768 / 1440 px.
- A11 : animations réduites, information accessible.
- N03 : navigation clavier et focus.
- N05 : mouvement réduit.

---

## 18. Feedback, animation et performance

### 18.1 Feedback

| Situation | Feedback |
|---|---|
| Objectif absent | Message près du groupe, Commencer bloqué |
| Préférence modifiée | Panneau d'explication + changement visible |
| Aucun changement | Aucun panneau |
| Réponse invalidée | Avis explicite, réponse conservée |
| Champ invalide | Erreur locale |
| Retour | Étape antérieure, données conservées |
| Synthèse incomplète | Refus explicite |
| Stockage indisponible | Bandeau non bloquant |
| Erreur inattendue | ErrorBoundary |

### 18.2 Animation

- CSS transitions discrètes uniquement.
- Aucune bibliothèque d'animation lourde.
- `prefers-reduced-motion` désactive les transitions non essentielles.
- Aucune animation ne porte une information indispensable.
- Aucun défilement automatique non demandé.

### 18.3 Performance

- Aucun réseau requis après le build.
- Catalogue local chargé une fois.
- Sélecteurs simples ; mémoïsation seulement si nécessaire.
- Chargement paresseux des vues seulement si le bundle le justifie.
- Aucune dépendance UI lourde sans nécessité.
- Aucune page blanche pendant le démarrage.
- Le stockage ne bloque jamais le rendu.

---

## 19. Sécurité et confidentialité

| Sujet | Décision |
|---|---|
| Authentification | Aucune |
| Autorisation | Aucune permission par rôle |
| Rôles | Aucun rôle serveur |
| Secrets | Aucun secret côté client |
| Variables d'environnement | Aucune valeur secrète |
| Données personnelles | Aucune ; données synthétiques uniquement |
| Stockage local | `SessionState` non sensible, effaçable |
| Injection | Rendu React échappé ; pas de `dangerouslySetInnerHTML` |
| Contenu distant | Aucun CDN ou service externe dans le chemin critique |
| URL | Aucune donnée sensible |
| Analytics | Aucun tracking |

Le frontend ne crée ni compte, ni session serveur, ni jeton, ni écran d'administration.

---

## 20. Plan d'implémentation incrémental

L'ordre est obligatoire : chaque étape ne commence que lorsque la précédente est terminée et vérifiée.

### Étape 0 — Gel du contrat et inventaire du contenu

**Objectif :** préparer l'interface sans inventer de contenu.

**Tâches :**

- Lire `cahier_charge.md`, `architecture.md`, `api-contract.md`, `backend-plan.md`.
- Vérifier la disponibilité de `ressources/` ; documenter son absence.
- Figer les opérations `QRY-*`, `CMD-*`, `PERSIST-*`.
- Établir la matrice des emplacements de contenu.
- Identifier les libellés connus du cahier et les libellés à fournir.
- Ne créer aucun texte métier.

**Dépendances :** Phase 3 livrée.

**Sortie :** inventaire de contenu et liste d'Open Questions.

**Critères de fin :**

- Aucun texte métier inventé.
- Les opérations utilisées existent dans le contrat.
- Les lacunes de contenu sont explicites.

### Étape 1 — Coque, tokens et navigation

**Objectif :** disposer d'une application vide mais navigable.

**Tâches :**

- Configurer React + TypeScript + Vite si la stack est confirmée.
- Créer `AppShell`, `SkipLink`, `AppHeader`, `ErrorBoundary`.
- Créer les Design Tokens (couleurs, espacements, typographie, focus, états).
- Créer la navigation interne `ViewId`.
- Créer `EmptyState`, `ErrorState`, `StatusBanner`, `LiveRegion`.
- Vérifier le focus après changement de vue.

**Dépendances :** étape 0.

**Sortie :** coque accessible avec trois vues vides.

**Critères de fin :**

- Navigation E01/E02/E03 sans route URL.
- Aucun débordement à 320 px.
- Focus visible et skip link fonctionnel.
- Aucun appel réseau.

### Étape 2 — E01

**Objectif :** permettre la sélection d'objectif et le démarrage.

**Tâches :**

- Brancher `QRY-01`.
- Créer `ObjectiveSelector`, `ObjectiveCard`, `PrimaryAction`.
- Gérer sélection, absence de sélection et catalogue vide.
- Brancher `CMD-01`.
- Afficher les erreurs `OBJECTIVE_*`, `CATALOG_INVALID`, `RULE_CONFLICT`.
- Naviguer vers E02 après succès.

**Dépendances :** étape 1.

**Sortie :** E01 fonctionnelle avec contenu de test neutre.

**Critères de fin :**

- Aucun démarrage sans objectif.
- Aucun contenu métier en dur.
- Clavier complet.
- Aucun scroll horizontal à 320 px.

### Étape 3 — E02 noyau

**Objectif :** afficher une étape et avancer.

**Tâches :**

- Brancher `QRY-02`.
- Créer `ProgressIndicator`, `StepView`, `AnswerForm`.
- Brancher `CMD-03`.
- Afficher `AnswerRequired` / `AnswerInvalid` localement.
- Gérer la complétion et la navigation vers E03.
- Gérer `SESSION_REQUIRED`, `STEP_*`.
- Ne pas encore implémenter les préférences.

**Dépendances :** étape 2.

**Sortie :** parcours linéaire E01 → E02 → E03.

**Critères de fin :**

- Progression exacte « Étape X sur Y ».
- Erreurs locales sans reset.
- Aucune perte de réponse.
- Parcours clavier.

### Étape 4 — Préférences et explications

**Objectif :** permettre une adaptation expliquée.

**Tâches :**

- Créer `PreferenceControl`.
- Brancher `CMD-02`.
- Créer `ExplanationPanel`.
- Afficher les explications uniquement si changement réel.
- Annoncer via `aria-live`.
- Gérer `PREFERENCE_*`, `CATALOG_INVALID`, `RULE_CONFLICT`, `REQUIRED_STEP_REMOVED`.
- Vérifier A08.

**Dépendances :** étape 3.

**Sortie :** préférences et explications fonctionnelles.

**Critères de fin :**

- Aucun panneau sans changement.
- Aucune étape requise supprimée.
- Changement visible et annoncé.
- Ancienne valeur conservée en cas d'échec.

### Étape 5 — Retour, révision et invalidation

**Objectif :** garantir la réversibilité.

**Tâches :**

- Brancher `CMD-04`.
- Brancher `CMD-05`.
- Créer `InvalidatedAnswerNotice`.
- Désactiver Retour à la première étape avec explication.
- Conserver les réponses valides.
- Signaler les réponses invalidées.
- Gérer `FIRST_STEP`, `STEP_*`, `ANSWER_*`.

**Dépendances :** étapes 3–4.

**Sortie :** retour et révision utilisables.

**Critères de fin :**

- Aucune perte silencieuse.
- Aucune étape inexistante.
- Réponses invalidées conservées et visibles.
- Focus correct après retour.

### Étape 6 — E03

**Objectif :** afficher une synthèse fidèle.

**Tâches :**

- Brancher `QRY-03`.
- Créer `SummaryView`, `DecisionList`, `CompletionStatus`.
- Afficher objectif, préférences, décisions, explications et complétion.
- Brancher Modifier → E02.
- Créer `ConfirmDialog` et brancher `CMD-06`.
- Gérer `JOURNEY_INCOMPLETE`, `SESSION_REQUIRED`, `CONFIRMATION_REQUIRED`.

**Dépendances :** étapes 3–5.

**Sortie :** E03 fonctionnelle.

**Critères de fin :**

- Aucune complétion incorrecte.
- Décisions fidèles.
- Modifier conserve l'état.
- Recommencer exige une confirmation.
- Modale accessible.

### Étape 7 — Persistance facultative

**Objectif :** reprendre une session sans dépendance obligatoire.

**Tâches :**

- Brancher `PERSIST-LOAD` au démarrage.
- Brancher `PERSIST-SAVE` après transition.
- Brancher `PERSIST-CLEAR` après redémarrage.
- Gérer `STORED_SESSION_INVALID` et `STORAGE_UNAVAILABLE`.
- Afficher un bandeau non bloquant.
- Vérifier le fonctionnement sans stockage.

**Dépendances :** étapes 3–6.

**Sortie :** reprise optionnelle.

**Critères de fin :**

- Aucun blocage si stockage absent.
- Sauvegarde invalide → session neuve.
- Aucune donnée personnelle.
- Aucun impact sur le parcours nominal.

### Étape 8 — Responsive, accessibilité et mouvement

**Objectif :** rendre l'interface utilisable dans les conditions du cahier.

**Tâches :**

- Vérifier 320 / 768 / 1440 px.
- Vérifier clavier seul.
- Vérifier focus et annonces.
- Vérifier `prefers-reduced-motion`.
- Vérifier zoom 200 %.
- Vérifier contrastes et information non portée par la couleur.
- Vérifier la modale et le retour de focus.

**Dépendances :** étapes 1–7.

**Sortie :** interface responsive et accessible.

**Critères de fin :**

- Aucun débordement critique.
- Parcours clavier complet.
- Aucune information dépendante de la couleur.
- Animations réduites respectées.

### Étape 9 — Tests et durcissement

**Objectif :** stabiliser avant la Phase 5.

**Tâches :**

- Compléter les tests de composants.
- Compléter les tests E2E Playwright.
- Exécuter la grille manuelle.
- Exécuter lint, typecheck, build.
- Vérifier l'absence de réseau et de secrets.
- Vérifier la neutralité des fixtures.
- Produire la note de handoff.

**Dépendances :** étapes 0–8.

**Sortie :** interface prête pour le déploiement.

**Critères de fin :**

- Definition of Done satisfaite.
- Aucun contenu métier inventé.
- Aucun backend, aucune route HTTP, aucune auth.
- Aucune régression critique.

---

## 21. Stratégie de tests

### 21.1 Tests de composants

| Sujet | Cas | Trace |
|---|---|---|
| ObjectiveSelector | Sélection, absence, clavier | F01, N03 |
| AnswerForm | Champ requis, invalide, focus | F08, A06 |
| PreferenceControl | Valeur, échec, conservation | F04 |
| ExplanationPanel | Affichage réel, absence de changement | F05, A04 |
| InvalidatedAnswerNotice | Réponse conservée et signalée | F07, A05 |
| SummaryView | Décisions, complétion | F09, A07 |
| ConfirmDialog | Confirmation, annulation, focus | F10 |
| ErrorState | Codes et reprise | N07 |

### 21.2 Tests E2E

| Scénario | Attendu | Trace |
|---|---|---|
| E01 → E02 → E03 | Synthèse atteinte | A01 |
| Modifier une préférence | Adaptation + explication | A03, A04 |
| Revenir | Réponses conservées | A05 |
| Réviser une réponse | Invalidations signalées | A05 |
| Valeur invalide | Erreur locale, correction | A06 |
| Synthèse | Décisions fidèles | A07 |
| Préférence liée aux étapes | Aucune étape requise supprimée | A08 |
| Clavier seul | Parcours complet | A09 |
| 320 / 768 / 1440 px | Pas de blocage | A10 |
| Mouvement réduit | Information accessible | A11 |
| Cas critiques | Pas d'erreur bloquante | A12 |
| Stockage absent/invalide | Parcours normal | F11 |
| Redémarrage | Session vierge | F10 |

### 21.3 Tests manuels

- Parcours clavier sans souris.
- Zoom 200 %.
- Contraste et focus.
- Lecture des explications.
- Modale au clavier.
- Absence de débordement horizontal.
- Absence de page blanche en cas d'erreur.
- Vérification des libellés avec `ressources/` lorsqu'il sera fourni.

### 21.4 Règles

- Aucun test ne dépend du réseau.
- Aucun test ne dépend d'une horloge ou d'un aléatoire.
- Les fixtures restent neutres.
- Les tests de règles restent dans le domaine, pas dans l'UI.
- Chaque code d'erreur affiché a au moins un test.
- Aucun contenu non fourni n'est présenté comme définitif.

---

## 22. Definition of Done

L'interface est terminée lorsque :

1. les trois vues E01–E03 sont présentes et navigables ;
2. chaque vue utilise les opérations du contrat ;
3. aucun endpoint, backend, auth, rôle ou base de données n'est introduit ;
4. les états de chargement, vide, erreur et stockage sont traités ;
5. les erreurs de validation sont locales et n'effacent aucune réponse ;
6. les explications n'apparaissent que pour un changement réel ;
7. les réponses invalidées sont conservées et signalées ;
8. la synthèse ne déclare jamais une complétion incorrecte ;
9. le parcours est utilisable au clavier ;
10. 320 / 768 / 1440 px sont vérifiés ;
11. `prefers-reduced-motion` est respecté ;
12. aucun contenu métier n'est inventé ;
13. les libellés réels proviennent de `ressources/` ou du cahier ;
14. les tests E2E critiques passent ;
15. `npm run lint`, `npm run typecheck` et `npm run build` passent ;
16. une note de handoff est fournie à la Phase 5.

---

## 23. Traçabilité

### 23.1 Exigences fonctionnelles

| Exigence | Vue / composant | Opération |
|---|---|---|
| F01 Sélectionner un objectif | E01, `ObjectiveSelector` | `QRY-01`, `CMD-01` |
| F02 Initialiser le parcours | E01 → E02 | `CMD-01` |
| F03 Montrer la progression | E02, `ProgressIndicator` | `QRY-02` |
| F04 Modifier une préférence | E02, `PreferenceControl` | `CMD-02` |
| F05 Expliquer l'adaptation | E02, `ExplanationPanel` | `CMD-02`, `QRY-02` |
| F06 Revenir | E02, bouton Retour | `CMD-04` |
| F07 Réviser un choix | E02, formulaire de révision | `CMD-05` |
| F08 Valider une étape | E02, `AnswerForm` | `CMD-03` |
| F09 Afficher la synthèse | E03, `SummaryView` | `QRY-03` |
| F10 Recommencer | E03, `ConfirmDialog` | `CMD-06` |
| F11 Sauvegarde locale | Coque, bandeau | `PERSIST-*` |
| F12 Démonstration reproductible | E01–E03, catalogue local | `QRY-01` |

### 23.2 Exigences non fonctionnelles

| Exigence | Couverture |
|---|---|
| N01 Responsive | Section 16, tests 320/768/1440 |
| N02 Lisibilité | Hiérarchie, labels, messages |
| N03 Accessibilité | Section 17, A09 |
| N04 Feedback | Section 18, explications et erreurs |
| N05 Animation | Section 18, mouvement réduit |
| N06 Performance | Section 18, local sans réseau |
| N07 Stabilité | ErrorBoundary, états d'erreur |
| N08 Cohérence visuelle | Design Tokens, composants unifiés |
| N09 Confidentialité | Section 19, données synthétiques |

### 23.3 Preuves

| Preuve | Couverture frontend | Statut |
|---|---|---|
| A01 Parcours complet | E2E E01 → E02 → E03 | À produire |
| A02 Expliquer le parti pris | Explications + README | Partiel |
| A03 Modifier une préférence | E2E préférence | À produire |
| A04 Justification d'une adaptation | `ExplanationPanel` | À produire |
| A05 Revenir / modifier | E2E retour/révision | À produire |
| A06 Valeur invalide | Test formulaire | À produire |
| A07 Finir le parcours | E2E synthèse | À produire |
| A08 Étapes obligatoires préservées | Test préférence | À produire |
| A09 Clavier | Grille manuelle | À produire |
| A10 Responsive | Captures 320/768/1440 | À produire |
| A11 Mouvement réduit | Contrôle manuel | À produire |
| A12 Cas critiques | Tests E2E | À produire |
| A13 Note ergonomique | README | Phase 6 |
| A14 Dépôt GitHub | Livraison | Phase 5/6 |
| A15 URL publique | Déploiement | Phase 5 |
| A16 Comparaison | Étude | Phase 6 |

### 23.4 Exigences du défi

| Exigence | Couverture |
|---|---|
| R01 Navigation par objectif | E01 → E02 |
| R02 Parcours fluide et crédible | Flux E01–E03, feedback |
| R03 Pas de mini-jeu | Aucun jeu |
| R04 Module démontrable | Trois vues |
| R05 Justification | `ExplanationPanel` + README |
| R06 Style libre | Design Tokens neutres |
| R07 Note ergonomique | README |
| R08 GitHub + rendu | Phase 5/6 |

---

## 24. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| `ressources/` absent | Élevé | Emplacements de contenu, OQ, aucun texte inventé |
| Contenu métier codé en dur | Élevé | Revue systématique, clés de copie |
| Règles métier dupliquées dans l'UI | Élevé | Les vues appellent le contrôleur et les sélecteurs |
| Perte de focus après navigation | Moyen | Focus sur le `h1`, tests clavier |
| Débordement mobile | Moyen | Tests 320 px, layout fluide |
| Explications fictives | Élevé | Panneau conditionné aux explications réelles |
| Réponses effacées par une erreur | Élevé | État atomique, aucune mutation locale |
| Stockage bloquant | Moyen | Bandeau non bloquant, best effort |
| Surcharge de composants | Moyen | Inventaire minimal, pas de dashboard |
| Animation excessive | Moyen | CSS discret, mouvement réduit |
| Dépendances lourdes | Moyen | Aucune librairie non nécessaire |
| Stack React non confirmée | Élevé | Domaine portable, fallback JS possible |

---

## 25. Hypothèses et questions ouvertes

### 25.1 Hypothèses

| ID | Hypothèse | Source |
|---|---|---|
| FE-A1 | Trois vues logiques E01–E03 | Cahier section 5 ; architecture AD03 |
| FE-A2 | Aucun backend, auth, rôle ou base de données | Cahier section 2 ; architecture AD01 |
| FE-A3 | Navigation interne sans route URL | Cahier section 5 ; contrat section 9 |
| FE-A4 | Le contenu réel sera fourni par `ressources/` | Cahier section 9 ; architecture OQ-A1 |
| FE-A5 | React + TypeScript + Vite est conditionnel | Cahier section 8 ; H04 |
| FE-A6 | Le redémarrage exige une confirmation | Cahier F10 ; contrat CMD-06 |
| FE-A7 | Une explication n'apparaît que pour un changement réel | Cahier F05 ; contrat V09 |
| FE-A8 | La reprise d'une session restaurée reprend la vue correspondant à son état | Proposition à confirmer (OQ-F5) |

### 25.2 Questions ouvertes

| ID | Question | Impact |
|---|---|---|
| OQ-F1 | `ressources/` absent : aucun contenu réel | Tous les textes métier restent à fournir |
| OQ-F2 | Identité et proposition de valeur non fournies | E01 incomplet |
| OQ-F3 | Libellés exacts de l'action principale et des messages | Copie d'interface à finaliser |
| OQ-F4 | Types exacts des champs de réponse par étape | Formulaire générique seulement |
| OQ-F5 | Vue de reprise après restauration | Comportement à confirmer |
| OQ-F6 | Routes URL optionnelles | Non retenues pour le MVP |
| OQ-F7 | Nombre et forme des valeurs de préférence | Contrôle à finaliser |
| OQ-F8 | Contenu des explications et des invalidations | Panneaux sans texte réel |

Les hypothèses H01–H10 du cahier restent ouvertes. Le frontend ne les transforme jamais en exigences métier.

---

## 26. Handoff vers la Phase 5

La Phase 5 (Infra) peut s'appuyer sur :

- une application statique React + TypeScript + Vite si la stack est confirmée ;
- un build sans backend et sans variable d'environnement secrète ;
- des assets locaux, sans CDN critique ;
- une navigation interne sans serveur ;
- un stockage local facultatif, non bloquant ;
- des tests E2E exécutables localement ;
- une URL de prévisualisation statique.

Éléments à transmettre :

- commandes de développement, test et build ;
- arborescence finale ;
- dépendances ajoutées et justification ;
- résultats des tests ;
- limites de contenu et Open Questions ;
- checklist responsive/accessibilité ;
- points restant à vérifier avec `ressources/`.

**Interdit :** ajouter un backend, une base de données, une authentification, un service externe ou une variable secrète pour faciliter le déploiement.

---

**Fin du plan frontend — Le Chemin Vivant, Phase 4.**
