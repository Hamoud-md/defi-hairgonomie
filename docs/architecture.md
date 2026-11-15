# Le Chemin Vivant — Architecture

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version du document :** 1.0  
**Statut :** Architecture du MVP, fondée sur `cahier_charge.md` v1.0 provisoire  
**Portée :** Phase 1 — Architecture. Ce document est la référence architecturale des phases suivantes.

> **Rappel de séparation des sources**
>
> - `cahier_charge.md` définit le **quoi** et l'**organisation** : objectifs, parcours, pages logiques, exigences fonctionnelles, exigences non fonctionnelles, contraintes, données conceptuelles.
> - `ressources/` doit fournir le **contenu réel** (données de démonstration, libellés, étapes, règles). Ce dossier **n'existe pas encore** dans le projet à la date de rédaction.
> - `fichiers principales/` n'est qu'une référence méthodologique. Aucun élément de ShopManager (authentification, POS, stock, dettes, employés, base de données, API, notifications, rôles admin/employé) n'est repris.
>
> En conséquence, cette architecture reste **volontairement agnostique au domaine métier**. Aucun nom de service, aucune étape métier, aucun contenu utilisateur n'est inventé. Les contenus absents sont traités comme des questions ouvertes (section 24).

---

## 1. Vue d'ensemble

### 1.1 Nature du système

**Le Chemin Vivant** est une **application web statique, exécutée entièrement côté client**, qui démontre un parti pris ergonomique : la navigation par objectif.

L'utilisateur choisit ce qu'il veut accomplir, reçoit un parcours d'étapes, peut modifier une préférence de présentation et voit, en langage clair, pourquoi le parcours affiché change. Il peut revenir, corriger une réponse et consulter une synthèse cohérente.

Le système est :

- **client-only** : aucun backend, aucune base de données, aucune API externe obligatoire ;
- **data-driven** : le parcours est produit par des règles déterministes appliquées à un jeu de données local ;
- **explicable** : chaque adaptation significative produit une explication vérifiable ;
- **réversible** : le retour et la révision d'un choix préservent les données encore valides ;
- **démonstratif** : il doit être utilisable sans compte et reproductible depuis une URL publique.

### 1.2 Objectifs architecturaux

| Objectif | Traduction architecturale |
|---|---|
| Navigation par intention | Entrée unique par la sélection d'un objectif, avant toute exposition de la structure |
| Parti pris justifié | Explications et données de traçabilité reliées aux exigences R01–R08 |
| Adaptation crédible | Moteur de règles pur, déterministe et testable, sans IA générative |
| Aucune étape obligatoire supprimée | Invariant structurel vérifié avant toute publication d'un parcours |
| Retour et correction | État de session explicite et transitions réversibles |
| Synthèse fiable | Vue calculée à partir de l'état réel, jamais d'un résultat simulé |
| Accessibilité | Composants sémantiques, clavier, focus visible, messages annoncés |
| Faible complexité | Pas de backend, pas de dépendance lourde, build statique |

### 1.3 Périmètre fonctionnel du MVP

Le MVP couvre les exigences Must et le socle des exigences Should :

- E01 sélection d'objectif ;
- E02 parcours, préférences, adaptation expliquée, retour ;
- E03 synthèse, modification, redémarrage ;
- validation locale des étapes ;
- jeu de démonstration reproductible ;
- responsive, clavier, états d'erreur ;
- tests critiques.

La sauvegarde locale, les objectifs multiples, les transitions discrètes et la vidéo restent facultatifs (Could). Le fallback « Commencer par la Fin » est prévu comme variante de repli (section 14).

---

## 2. Principes architecturaux

| Principe | Décision | Justification | Conséquence |
|---|---|---|---|
| Client-only | Toute la logique s'exécute dans le navigateur | Le cahier exclut backend, base de données et API payante sans besoin prouvé | Aucun serveur applicatif, aucun secret, aucun endpoint réseau |
| Data-driven | Le parcours dépend de données locales déclaratives | Les règles doivent être déterministes et explicables | Séparer catalogue, règles et moteur |
| Déterminisme | Mêmes entrées ⇒ mêmes étapes, mêmes explications | Exigence F02 et A08 | Fonctions pures, ordre stable, pas d'aléatoire |
| Explicabilité | Toute adaptation significative produit une raison | Exigences F05, N04, R05 | Service d'explication obligatoire |
| Préservation du requis | Une étape obligatoire ne peut jamais disparaître | Section 4 du cahier, A08 | Invariant bloquant avant affichage |
| Réversibilité | Retour et révision sans perte silencieuse | F06, F07, A05 | État de session complet et transitions explicites |
| Validation locale | Erreur affichée près du contrôle concerné | F08, A06 | Validation par étape, messages associés au champ |
| Accessibilité native | Sémantique HTML, clavier, focus, annonces | N03, A09 | Pas de composant interactif non accessible |
| Sobriété technique | React + TypeScript + Vite ; CSS/Design Tokens ; Tailwind facultatif | D03/D04 conditionnels, H04 | Aucune dépendance ajoutée sans besoin démontré |

**Contrainte de style :** le cahier (R06) n'impose aucun style visuel. L'architecture ne fixe qu'un système de Design Tokens et des états cohérents ; l'esthétique finale reste une décision de conception justifiée.

---

## 3. Acteurs, rôles et permissions

Le cahier ne définit **aucune authentification** et exclut celle-ci du périmètre. Les « rôles » ci-dessous sont des **contextes d'usage**, pas des comptes ni des autorisations serveur.

| Acteur | Contexte | Accès fonctionnel | Création de compte |
|---|---|---|---|
| Utilisateur novice | Découvre le parcours sans connaître la structure | E01, E02, E03 ; peut revenir et modifier | Aucune |
| Utilisateur autonome | Veut des étapes directes et des explications à la demande | E01, E02, E03 ; peut consulter les justifications | Aucune |
| Évaluateur | Teste le parti pris et vérifie les preuves | Ensemble du parcours, explications, synthèse, démonstration reproductible | Aucune |

### 3.1 Règles d'accès

- Aucune inscription, connexion, session authentifiée ou gestion de compte.
- Aucune permission basée sur un rôle : tous les acteurs peuvent parcourir la démonstration.
- Les seules restrictions sont des **règles de progression** : impossible d'avancer sans sélection d'objectif valide (F01), validation d'étape requise (F08), saisie invalide bloquée localement.
- Les données sont synthétiques et ne doivent contenir aucune donnée personnelle réelle (N09).

---

## 4. Frontières du système

```
┌─────────────────────────────────────────────────────────┐
│                     NAVIGATEUR (client)                 │
│                                                         │
│  Application React statique                             │
│  ├── Vues E01 / E02 / E03                               │
│  ├── Moteur de parcours déterministe                    │
│  ├── État de session                                    │
│  ├── Service d'explication                              │
│  └── Catalogue de démonstration local                   │
│                                                         │
│  APIs navigateur : localStorage (facultatif), historique│
└─────────────────────────────────────────────────────────┘
              │                              │
              │ build statique               │ URL publique
              ▼                              ▼
     Hébergeur statique                 Dépôt GitHub
     (Netlify ou autre)                 (sources + README)
```

### 4.1 À l'intérieur du système

- présentation et navigation entre les trois vues logiques ;
- état de session et transitions ;
- moteur de règles et d'adaptation ;
- génération d'explications ;
- validation des réponses ;
- catalogue de données de démonstration ;
- persistance locale facultative.

### 4.2 À l'extérieur du système

| Élément | Rôle | Intégration runtime |
|---|---|---|
| Hébergeur statique | Publier le build et fournir l'URL de consultation | Aucune API ; fichiers statiques |
| Dépôt GitHub | Fournir sources et justifications (R08) | Hors application |
| `localStorage` | Sauvegarde/reprise facultative (F11) | API navigateur, encapsulée |
| Polices/assets | Rendu visuel | Fichiers locaux de préférence |

**Non intégrés :** backend, base de données, API distante, authentification, paiement, service d'IA, chatbot, analytics tiers. Leur absence est une contrainte du cahier, pas un oubli.

---

## 5. Architecture en couches

```
┌────────────────────────────────────────────────────────────┐
│ COUCHE PRÉSENTATION                                         │
│ Vues E01 / E02 / E03, composants UI, Design Tokens          │
│ Responsive, clavier, focus, états de chargement/erreur      │
├────────────────────────────────────────────────────────────┤
│ COUCHE APPLICATION / ORCHESTRATION                          │
│ Contrôleurs de vue, actions utilisateur, sélecteurs         │
│ Traduction des intentions en commandes de session           │
├────────────────────────────────────────────────────────────┤
│ COUCHE DOMAINE                                              │
│ Moteur de parcours, règles de transition, validation,       │
│ explication, invariants, modèles                            │
├────────────────────────────────────────────────────────────┤
│ COUCHE DONNÉES                                              │
│ Catalogue local : objectifs, étapes, préférences, règles    │
│ Jeu de démonstration synthétique                            │
├────────────────────────────────────────────────────────────┤
│ COUCHE PLATEFORME                                           │
│ React, TypeScript, Vite, routing facultatif, localStorage   │
└────────────────────────────────────────────────────────────┘
```

### 5.1 Règles de dépendance

- La présentation dépend de l'application et du domaine, jamais l'inverse.
- Le domaine ne dépend ni de React ni du DOM ni de `localStorage`.
- Les données ne contiennent pas de logique ; les règles sont déclaratives et interprétées par le domaine.
- La plateforme est isolée derrière des adaptateurs (persistance, navigation), remplaçables.
- Aucun appel réseau dans le chemin critique.

---

## 6. Composants et modules

### 6.1 Modules applicatifs

| Module | Responsabilité | Dépend de |
|---|---|---|
| `app/shell` | Point d'entrée, providers, layout global, gestion des erreurs | Vues, plateforme |
| `views/goal-selection` (E01) | Identité, proposition de valeur, sélecteur d'objectifs, action Commencer | Domaine, catalogue |
| `views/journey` (E02) | Étapes, progression, préférences, retour, justifications, erreurs | Domaine, application |
| `views/summary` (E03) | Objectif, choix, explications, complétion, Modifier/Recommencer | Domaine |
| `application/session-controller` | Expose les commandes : choisir, valider, revenir, réviser, recommencer | Domaine, persistance |
| `application/selectors` | Dérive l'état affichable : étape courante, progression, plan, explications | Domaine |
| `domain/journey-engine` | Initialise et recalcule le parcours à partir de l'objectif et des préférences | Règles, modèles |
| `domain/rule-evaluator` | Évalue les règles de transition de façon ordonnée | Modèles |
| `domain/validation` | Valide objectif, préférences, champs d'étape, conflits | Modèles |
| `domain/explanation` | Produit les explications des changements réels | Modèles, résultats de règles |
| `domain/session` | Modèle et transitions de session, invalidation contrôlée | Modèles |
| `domain/invariants` | Vérifie l'absence de suppression d'étape requise, la cohérence des IDs | Modèles |
| `data/catalog` | Charge le jeu de démonstration local | Modèles |
| `platform/persistence` | Adaptateur de sauvegarde facultative, tolérant aux erreurs | Domaine (types) |
| `platform/navigation` | Navigation interne, routing facultatif | Vues |
| `ui/*` | Boutons, champs, messages, progression, cartes, alertes | Design Tokens |

### 6.2 Relations principales

```
E01 ──choisir objectif──► SessionController ──► JourneyEngine
                                              │
E02 ◄──plan + explications────────────────────┘
 │
 ├──modifier préférence──► JourneyEngine ──► RuleEvaluator
 │                                   └────► Validation
 ├──valider étape────────► Validation
 ├──revenir──────────────► Session
 └──réviser réponse──────► JourneyEngine ──► invalidation contrôlée
                                              │
E03 ◄──synthèse calculée──────────────────────┘
```

### 6.3 Frontières des modules

- Les vues ne calculent jamais le parcours ; elles affichent les sélecteurs.
- Le moteur ne lit ni n'écrit le DOM, le stockage ou l'URL.
- Le service d'explication ne crée pas de contenu métier : il formule des raisons à partir de libellés fournis par les données.
- La persistance ne valide pas les règles : elle restaure un état, que le domaine revérifie.
- Le routage est facultatif et ne doit pas devenir une dépendance du domaine.

---

## 7. Modèle de données conceptuel

Les entités proviennent de la section 9 du cahier. Les champs listés sont **conceptuels** ; leur schéma exact sera fixé en Phase 2/3 sans inventer de contenu métier.

| Entité | Champs conceptuels | Responsabilité |
|---|---|---|
| `Objective` | `id`, `titre`, `description` | Définir un but sélectionnable |
| `Step` | `id`, `objectiveId`, `ordre`, `titre`, `contenu`, `requis` | Décrire une étape du parcours |
| `Preference` | `id`, `valeur`, `description` | Décrire un choix de présentation |
| `TransitionRule` | `condition`, `étapesConcernées`, `explication` | Déterminer une adaptation |
| `SessionState` | `objectif`, `préférences`, `étapeActive`, `réponses` | Contexte de l'utilisateur |
| `Explanation` | `événement`, `raison`, `changement` | Feedback explicatif |

### 7.1 Invariants du modèle

1. Chaque entité possède un identifiant unique dans son catalogue.
2. Chaque étape référence un objectif existant.
3. Toute étape marquée `requis: true` doit apparaître dans tout plan produit pour son objectif.
4. Une préférence ne peut prendre qu'une valeur déclarée.
5. Une règle ne peut référencer que des étapes, préférences et valeurs existantes.
6. Toute `Explanation` doit correspondre à un changement effectif ; aucune adaptation fictive n'est permise (F05).
7. Un état restauré depuis le stockage est revalidé avant utilisation.
8. Le catalogue de démonstration reste synthétique, sans données personnelles réelles.

### 7.2 Structures internes dérivées (non métier)

| Structure | Rôle |
|---|---|
| `JourneyPlan` | Liste ordonnée des étapes applicables + étapes requises garanties |
| `RuleEvaluation` | Règles appliquées, ordre, effets, explications produites |
| `ValidationResult` | Erreurs par champ, conflits, champs invalidés |
| `Summary` | Objectif, décisions, explications, état de complétion |

Ces structures sont des sorties calculées, jamais des données éditables.

---

## 8. Moteur de parcours et d'adaptation

### 8.1 Pipeline déterministe

```
Entrée : objectif + préférences + catalogue
  1. Charger l'objectif et ses étapes
  2. Conserver toutes les étapes requises
  3. Évaluer les règles applicables dans un ordre stable (id de règle croissant)
  4. Appliquer uniquement les effets compatibles avec les invariants
  5. Calculer le plan ordonné
  6. Comparer avec l'état précédent
  7. Produire une explication pour chaque changement significatif
  8. Retourner plan + explications + éventuelles invalidations
Sortie : JourneyPlan, Explanation[], ValidationResult
```

### 8.2 Règles d'adaptation

- Une adaptation agit sur la **présentation** (affichage, ordre, mise en avant, regroupement) ou sur les explications.
- Une règle ne peut jamais retirer une étape requise ni contourner une validation.
- Les étapes facultatives peuvent varier uniquement si le modèle le déclare explicitement.
- Toute variation significative est expliquée ; sans changement réel, aucune explication n'est affichée (F05).
- En cas de conflit entre règles, l'ordre déterministe et les invariants prévalent ; le conflit est signalé comme erreur de configuration, pas masqué.

### 8.3 Révision d'un choix

```
Réviser(stepId ou preferenceId, nouvelleValeur)
  1. Enregistrer la nouvelle valeur
  2. Recalculer le plan
  3. Identifier les réponses devenues incompatibles
  4. Conserver toutes les réponses encore valides
  5. Marquer explicitement les réponses invalidées
  6. Produire l'explication de l'invalidation
```

Aucune réponse ne doit être supprimée silencieusement (F06, F07).

---

## 9. Flux de données

### 9.1 Sélection d'objectif (E01)

```
Utilisateur → carte d'objectif → SessionController.chooseObjective(id)
            → Validation (objectif existant)
            → SessionState.objectif
            → JourneyEngine.initialize(objectif, préférences par défaut)
            → JourneyPlan + explications
            → E02
```

- Sans sélection valide, la progression est refusée avec un message clair (F01).
- L'objectif et sa description proviennent du catalogue local.

### 9.2 Parcours et étape (E02)

```
Utilisateur → saisit/choisit une réponse → Validation.validateStep
   ├── invalide → erreur locale, données conservées
   └── valide → SessionState.réponses → étape suivante
                → sélecteurs (progression textuelle « Étape X sur Y »)
```

- La progression est toujours textuelle et exacte (F03).
- Les erreurs restent près du contrôle concerné (F08).

### 9.3 Changement de préférence

```
Utilisateur → préférence → JourneyEngine.applyPreference
            → RuleEvaluator → Validation → nouveau plan
            → comparer ancien/nouveau
            → Explanation (si changement réel)
            → mise à jour de E02
```

### 9.4 Retour

```
Utilisateur → Retour → SessionController.back
   ├── première étape → action désactivée/expliquée
   └── sinon → étape antérieure + réponses encore valides
```

Aucune étape inexistante, aucune perte silencieuse (F06).

### 9.5 Synthèse et redémarrage (E03)

```
Parcours terminé → SummarySelector
   → objectif + décisions + explications significatives + complétion
   → Modifier → E02 (état préservé)
   → Recommencer → Reset explicite → nouvelle session vierge
```

- La complétion n'est annoncée que si toutes les étapes requises sont validées (F09).
- Recommencer exige une action explicite (F10).

### 9.6 Persistance facultative

```
Chargement → PersistenceAdapter.load()
   ├── absent / erreur / version inconnue → session neuve
   └── présent → Validation → SessionState restauré ou rejeté
Après transition significative → save(session) (best effort)
```

L'application doit fonctionner intégralement si le stockage est indisponible (F11).

---

## 10. Flux utilisateur et pages logiques

### 10.1 E01 — Accueil / objectif

| Élément | Architecture |
|---|---|
| Contenu | Identité, proposition de valeur courte, choix d'objectif, descriptions, action Commencer |
| États | Initial ; sélection valide ; sélection absente + message |
| Navigation | Progression uniquement après choix valide |
| Données | `Objective[]` du catalogue |
| Accessibilité | Cartes ou boutons radio accessibles, focus visible, message lié |

### 10.2 E02 — Parcours

| Élément | Architecture |
|---|---|
| Contenu | Objectif, étape courante, progression textuelle, préférences, action principale, Retour, justification des adaptations |
| États | Étape valide ; entrée manquante ; erreur de validation ; adaptation effectuée ; retour/correction |
| Règle | Préserver les réponses valides lors d'une modification ; signaler les incompatibles |
| Données | `Step[]`, `Preference[]`, `TransitionRule[]`, `SessionState`, `Explanation[]` |
| Accessibilité | Champs étiquetés, erreurs liées, annonces `aria-live` pour adaptations et erreurs |

### 10.3 E03 — Synthèse

| Élément | Architecture |
|---|---|
| Contenu | Objectif, choix, explications significatives, état de complétion, Modifier, Recommencer |
| États | Parcours terminé ; correction d'une décision ; nouvelle session |
| Données | `Summary` calculé |
| Accessibilité | Structure de titres, listes de décisions, focus géré après navigation |

### 10.4 Transitions autorisées

| Depuis | Action | Vers | Condition |
|---|---|---|---|
| E01 | Commencer | E02 | Objectif sélectionné |
| E02 | Continuer | E02 / E03 | Étape courante valide ; E03 si parcours complet |
| E02 | Retour | E02 | Étape > 1 |
| E02 | Modifier préférence | E02 | Valeur valide |
| E03 | Modifier | E02 | État de session disponible |
| E03 | Recommencer | E01 | Action explicite |

**Flux nominal :** E01 → objectif → E02 → étapes/adaptation → E03.  
**Flux de correction :** E03 → Modifier → E02 → mise à jour cohérente → E03.  
**Flux d'erreur :** erreur locale, données conservées, correction sans redémarrage.

---

## 11. Navigation et routage

- Trois **vues logiques** E01, E02, E03. Le cahier n'exige pas trois routes URL indépendantes.
- La navigation interne suffit pour le MVP.
- Si des routes sont introduites, elles doivent : refléter la vue active, supporter le rafraîchissement, supporter l'accès direct, et être testées (section 5 du cahier).
- Aucune donnée sensible ne doit être placée dans l'URL.
- Le routage ne doit pas être une dépendance du domaine.

---

## 12. Présentation, Design Tokens et composants

### 12.1 Organisation

| Bloc | Rôle |
|---|---|
| Layout global | En-tête minimal, zone principale, lien d'évitement |
| Sélecteur d'objectif (présentation au choix) | Présente un objectif et son état sélectionné |
| `StepView` | Affiche titre, contenu, champs requis et action principale |
| `ProgressIndicator` | Affiche « Étape X sur Y », avec alternative textuelle |
| `PreferenceControl` | Modifie une préférence et déclenche l'explication |
| `ExplanationPanel` | Affiche la raison et le changement |
| `ValidationMessage` | Erreur locale liée au champ |
| `SummaryView` | Objectif, décisions, explications, complétion |
| `EmptyState` / `ErrorState` | Catalogue indisponible, état incohérent, exception récupérable |
| Action de redémarrage | Confirmation explicite de réinitialisation, présentation au choix |

### 12.2 Design Tokens

- Couleurs, espacements, typographie, rayons, focus et états définis centralement.
- Aucun style n'est imposé par le cahier : les tokens servent la cohérence (N08), pas un parti esthétique particulier.
- Tailwind CSS est **facultatif** et conditionné à la maîtrise de l'équipe ; CSS Variables / CSS Modules restent des alternatives valides.
- Le focus visible ne doit jamais être supprimé.
- Les informations ne dépendent pas uniquement de la couleur (N03).

---

## 13. Explication et feedback

### 13.1 Principe

Une explication est produite **uniquement** lorsqu'un changement réel intervient. Elle contient :

- l'événement déclencheur (préférence modifiée, réponse révisée, retour, invalidation) ;
- la raison compréhensible, issue de la règle concernée ;
- le changement observable (étape ajoutée/mise en avant, réponses invalidées, etc.).

Les libellés viennent du catalogue ; le moteur ne fabrique pas de contenu métier.

### 13.2 Canaux de feedback

| Situation | Feedback |
|---|---|
| Sélection d'objectif absente | Message près du sélecteur + progression bloquée |
| Préférence modifiée | Panneau d'explication + changement visible |
| Réponse invalidée | Message explicite, réponse marquée, autres réponses conservées |
| Champ invalide | Erreur locale liée au champ |
| Retour | Étape antérieure, données conservées |
| Parcours incomplet vers E03 | Refus explicite, aucune complétion annoncée |
| Stockage indisponible | Fonctionnement normal, aucune erreur bloquante |

---

## 14. Fallback « Commencer par la Fin »

Conformément à la section 4 du cahier, si la logique adaptative s'avère trop risquée :

- conserver la sélection d'objectif ;
- afficher un parcours fixe, clair et réversible ;
- maintenir les exigences R01–R05 : le parti pris doit rester explicité, justifié et testable ;
- ne pas supprimer la synthèse, le retour, les explications ni les preuves.

Le fallback est une **variante de configuration**, pas une architecture différente : le moteur peut fonctionner avec un ensemble de règles réduit.

---

## 15. Accessibilité, responsive et UX

| Exigence | Décision architecturale |
|---|---|
| N01 Responsive | Breakpoints 320 / 768 / 1440 px, layout fluide, actions toujours visibles, pas de débordement horizontal critique |
| N02 Lisibilité | Hiérarchie de titres, labels explicites, textes d'aide, zoom supporté |
| N03 Accessibilité | HTML sémantique, navigation clavier complète, focus visible, erreurs annoncées, information non portée par la couleur seule |
| N04 Feedback | Composant d'explication et messages d'état systématiques |
| N05 Animation | CSS transitions discrètes, désactivées avec `prefers-reduced-motion` |
| N06 Performance | Rendu local, pas de réseau requis, bundle maîtrisé |
| N07 Stabilité | Gestion d'erreurs, états de repli, restauration sûre |
| N08 Cohérence | Design Tokens, composants et états unifiés |
| N09 Confidentialité | Données synthétiques, pas d'identification, pas de tracking |

**Portée de conformité :** aucune conformité WCAG/RGAA complète n'est revendiquée sans audit. Les contrôles restent manuels et partiels, comme indiqué dans le cahier.

---

## 16. Performance et robustesse

- Aucune dépendance réseau au chargement du parcours après le build.
- Évaluation des règles en temps constant sur le jeu de démonstration.
- Séparation des vues pour un chargement paresseux si le bundle le justifie.
- Mémoïsation des sélecteurs dérivés uniquement si nécessaire ; ne pas complexifier le MVP.
- Gestion des erreurs au niveau de l'application : aucune exception non gérée ne doit produire un écran vide (N07).
- Chargement du catalogue avec validation ; catalogue invalide ⇒ état d'erreur explicite, pas de parcours partiel silencieux.
- Le stockage local est encapsulé et ne peut jamais bloquer le parcours.

---

## 17. Sécurité et confidentialité

| Risque | Réponse |
|---|---|
| Données personnelles | Aucune collecte ; jeu synthétique uniquement (N09) |
| Secrets | Aucun secret côté client ; aucune clé d'API |
| Injection de contenu | Contenu local contrôlé ; rendu React échappé par défaut ; éviter `dangerouslySetInnerHTML` |
| Stockage local | Données non sensibles uniquement ; validation à la restauration ; possibilité d'effacement |
| Dépendances | Limiter les paquets ; pas de CDN ou service externe dans le chemin critique |
| URL | Aucune donnée sensible ; si routes, paramètres limités à des identifiants de démonstration |

Le projet n'implémente ni authentification, ni autorisation, ni paiement, ni administration.

---

## 18. Tests

### 18.1 Niveaux

| Niveau | Cible | Outils |
|---|---|---|
| Tests de domaine | Règles, invariants, invalidation, explications, déterminisme | Vitest (recommandé) |
| Tests de composants | Validation locale, messages, clavier | Outil léger facultatif, non imposé |
| Tests E2E | E01 → E02 → E03, retour, préférence, erreur, redémarrage | Playwright recommandé |
| Tests manuels | Clavier seul, 320/768/1440, animations réduites, contraste | Grille de test |

### 18.2 Cas critiques architecturaux

1. Aucune étape requise supprimée après changement de préférence (A08).
2. Explication produite seulement en cas de changement réel (F05).
3. Retour sans perte silencieuse et sans étape inexistante (F06).
4. Révision d'un choix : conservation des réponses valides, signalement des invalides (F07).
5. Validation locale sans redémarrage du parcours (A06).
6. Synthèse fidèle, complétion non annoncée à tort (F09).
7. Déterminisme : mêmes entrées ⇒ même plan (F02).
8. Fonctionnement sans stockage (F11).
9. Parcours clavier complet (A09).

---

## 19. Déploiement et environnements

| Environnement | Usage | Sortie |
|---|---|---|
| Développement | Vite dev server | Build non optimisé |
| Prévisualisation | Vérification du build statique | `vite preview` |
| Production | URL publique pour le jury | Fichiers statiques sur hébergeur |

- Hébergeur : Netlify si maîtrisé, sinon tout hébergeur statique compatible (D04/H06).
- Aucune variable d'environnement secrète requise.
- Le build doit fonctionner sans backend.
- L'URL publique doit être testée depuis un autre navigateur/machine (A15).
- Le dépôt GitHub et le `README` argumenté font partie des livrables, pas de l'architecture runtime.

---

## 20. Structure de projet proposée

```
le-chemin-vivant/
├── src/
│   ├── app/
│   │   ├── App.tsx
│   │   ├── providers.tsx
│   │   └── error-boundary.tsx
│   ├── views/
│   │   ├── goal-selection/
│   │   ├── journey/
│   │   └── summary/
│   ├── application/
│   │   ├── session-controller.ts
│   │   └── selectors.ts
│   ├── domain/
│   │   ├── models.ts
│   │   ├── journey-engine.ts
│   │   ├── rule-evaluator.ts
│   │   ├── validation.ts
│   │   ├── explanation.ts
│   │   ├── session.ts
│   │   └── invariants.ts
│   ├── data/
│   │   ├── catalog.ts
│   │   └── demo-data.ts
│   ├── platform/
│   │   ├── persistence.ts
│   │   └── navigation.ts
│   ├── ui/
│   │   ├── tokens.css
│   │   └── components/
│   └── main.tsx
├── tests/
│   ├── unit/
│   └── e2e/
├── public/
├── index.html
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

Cette structure est indicative et pourra être ajustée en Phase 4 sans changer les frontières des modules.

---

## 21. Décisions architecturales (ADR)

| ID | Décision | Statut | Trace |
|---|---|---|---|
| AD01 | Application statique client-only, sans backend ni base de données | Retenue | Section 8, D05 du cahier |
| AD02 | Moteur de règles déterministe et pur, séparé de l'UI | Retenue | F02, F05, R02 |
| AD03 | Trois vues logiques, routage URL facultatif | Retenue | Section 5 du cahier |
| AD04 | Explication obligatoire de toute adaptation significative | Retenue | F05, N04, R05 |
| AD05 | Invariant « aucune étape requise supprimée » vérifié avant affichage | Retenue | Section 4, A08 |
| AD06 | Persistance locale facultative derrière un adaptateur | Retenue | F11, D05 |
| AD07 | React + TypeScript + Vite comme choix préféré conditionnel | Conditionnelle | D03, H04 |
| AD08 | Tailwind facultatif ; Design Tokens neutres | Retenue | R06, D04 |
| AD09 | Aucune dépendance d'IA générative, 3D, chatbot ou gamification | Retenue | Out of scope |
| AD10 | Fallback « Commencer par la Fin » configurable | Préparée | Section 4 du cahier |

---

## 22. Risques architecturaux et mitigations

| Risque | Impact | Mitigation architecturale |
|---|---|---|
| Domaine métier inconnu | Critique | Architecture agnostique ; contenu en Open Question ; aucune donnée métier inventée |
| Règles trop nombreuses | Élevé | Un objectif, une adaptation fonctionnelle, règles déclaratives testées |
| Suppression involontaire d'une étape requise | Élevé | Invariant bloquant + tests de non-régression |
| Explications fictives | Élevé | Explication générée uniquement à partir d'un diff réel |
| Perte de réponses au retour | Élevé | État de session conservé + invalidation explicite |
| Défauts clavier/responsive | Élevé | Composants sémantiques + tests manuels 320/768/1440 |
| URL inaccessible | Critique | Build statique testé hors machine locale |
| README incomplet | Critique | Checklist R05, R07, R08 avant livraison |
| Dépendances inutiles | Moyen | Revue de dépendances, aucune librairie lourde sans besoin |

---

## 23. Hors périmètre

Conformément à la section 2 du cahier, l'architecture exclut explicitement :

- authentification, comptes, rôles serveur ;
- paiements ;
- API payante ;
- IA générative, chatbot ;
- 3D ;
- gamification non justifiée ;
- administration ;
- base de données sans besoin prouvé ;
- backend applicatif.

Ces exclusions ne sont pas des dettes techniques mais des contraintes de périmètre.

---

## 24. Hypothèses et questions ouvertes

### 24.1 Questions ouvertes héritées du cahier

| ID | Question | Impact architectural |
|---|---|---|
| H01 | Défi Principal exact | Compatibilité indécidable ; aucune exigence importée |
| H02 | Tâche métier réelle | Contenu et valeur du parcours indéterminés ; architecture agnostique |
| H03 | Approbation formelle du concept | Concept encore conditionnel |
| H04 | Compétences des trois membres | Stack React/TS/Vite non définitivement validée |
| H05 | Durée et équipements | Périmètre à calibrer |
| H06 | Hébergement maîtrisé | Plateforme de déploiement à confirmer |
| H07 | GitHub et accès publics | Livraison R08 à confirmer |
| H08 | Éligibilité du défi | Participation non établie |
| H09 | Obligation de données/API réelles | Pourrait modifier l'architecture |
| H10 | Grille de notation supplémentaire | Critères de comparaison incomplets |

### 24.2 Questions ouvertes propres à cette architecture

| ID | Question | Traitement actuel |
|---|---|---|
| OQ-A1 | `ressources/` est absent : aucun jeu de démonstration, libellé, étape ou règle réelle n'est disponible | Aucun contenu inventé ; les types et contrats sont définis, le contenu reste à fournir |
| OQ-A2 | Le domaine métier et la tâche réelle ne sont pas fournis | Architecture indépendante du domaine ; toute donnée métier sera une Open Question |
| OQ-A3 | La persistance locale est facultative | Adaptateur prévu, non bloquant |
| OQ-A4 | Le routage URL est facultatif | Navigation interne par défaut |
| OQ-A5 | Tailwind est conditionnel | Design Tokens neutres, Tailwind optionnel |

**Assumptions :**

- A-01 : le jeu de démonstration sera entièrement synthétique et local, conformément à la section 9 du cahier.
- A-02 : le MVP peut être démontré avec un seul objectif et une adaptation significative, conformément à la section 2 du cahier.
- A-03 : les ressources de contenu seront ajoutées avant les phases de contenu ; à défaut, les phases concernées resteront bloquées sur OQ-A1.

Ces assumptions ne doivent jamais être transformées en exigences métier.

---

## 25. Traçabilité

### 25.1 Exigences du défi

| ID | Couverture architecturale |
|---|---|
| R01 | Entrée par objectif (section 10) |
| R02 | Parcours déterministe et expliqué (sections 8, 13) |
| R03 | Interaction fonctionnelle, pas de mini-jeu (section 2, 23) |
| R04 | Module E01–E03 démontrable (section 10) |
| R05 | Service d'explication et synthèse (section 13) |
| R06 | Design Tokens sans style imposé (section 12) |
| R07 | Architecture compatible avec une note ergonomique dans le README (sections 19, 24) |
| R08 | Build statique publiable + dépôt GitHub (section 19) |

### 25.2 Exigences fonctionnelles

| ID | Module(s) |
|---|---|
| F01 | E01, validation, session |
| F02 | JourneyEngine, RuleEvaluator |
| F03 | sélecteurs, ProgressIndicator |
| F04 | JourneyEngine, Explanation |
| F05 | Explanation, invariants |
| F06 | Session, E02 |
| F07 | Session, Validation, JourneyEngine |
| F08 | Validation, StepView |
| F09 | SummarySelector |
| F10 | SessionController |
| F11 | PersistenceAdapter |
| F12 | data/catalog, E01–E03 |

### 25.3 Exigences non fonctionnelles

| ID | Couverture |
|---|---|
| N01 | section 15, responsive |
| N02 | section 12, lisibilité |
| N03 | section 15, accessibilité |
| N04 | section 13, feedback |
| N05 | section 15, mouvement réduit |
| N06 | section 16, performance |
| N07 | section 16, robustesse |
| N08 | section 12, Design Tokens |
| N09 | section 17, confidentialité |

---

## 26. Conditions de passage aux phases suivantes

L'architecture est utilisable pour les phases suivantes à condition de respecter :

1. l'absence de backend et d'API réseau dans le MVP ;
2. la séparation stricte domaine / application / présentation / données ;
3. l'invariant de préservation des étapes requises ;
4. la production d'explications uniquement pour des changements réels ;
5. l'absence de contenu métier inventé tant que `ressources/` n'est pas fourni ;
6. le maintien des trois vues E01–E03 telles que définies dans le cahier ;
7. la validation des hypothèses H01–H10 avant toute affirmation de conformité finale.

Toute évolution de cette architecture doit être documentée et vérifiée avant d'être répercutée dans les fichiers des phases suivantes.
