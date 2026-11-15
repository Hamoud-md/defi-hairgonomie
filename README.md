# Le Chemin Vivant

> Défi d'entraînement **Hair'gonomie** (archive 2025) — prise de position ergonomique : **naviguer par objectif, pas par menu**.

| Lien | Statut |
|---|---|
| Dépôt GitHub | _À renseigner par l'équipe après publication (aucune URL inventée)_ |
| Rendu consultable | _À renseigner après déploiement statique (voir « Déployer »)_ |

Démonstration **autonome** : aucun compte, aucun serveur, aucune API, aucune donnée envoyée. Le contenu (« Préparer ma participation à un atelier numérique ») est **synthétique et fictif** : aucun atelier réel, aucune inscription, aucune place n'est promise.

---

## 1. Note ergonomique (R07)

### Le parti pris
Le point d'entrée n'est pas un menu d'outils mais **la tâche de l'utilisateur**. On choisit un objectif ; le parcours se construit à partir de lui, reste **visible** (« Étape 2 sur 3 »), **s'adapte** aux préférences en **expliquant** ce qui change, et reste **réversible** : revenir en arrière ou corriger une réponse ne fait rien disparaître en silence.

### Le problème utilisateur visé (hypothèse)
Dans une préparation en plusieurs étapes, un novice ne sait pas où commencer, comprend mal les conséquences de ses choix et perd le fil quand il les modifie. Les interfaces classiques (menus, formulaires longs, options cachées) l'obligent à reconstruire seul la logique de la tâche.

### En quoi cela améliore l'expérience
- **Moins d'hésitation au départ** : une seule question — « quel est votre objectif ? ».
- **Adaptations compréhensibles** : passer l'accompagnement de « Essentiel » à « Guidé » révèle l'étape facultative *Conseils complémentaires* et un panneau « Ce qui a changé » dit pourquoi.
- **Droit à l'erreur** : chaque réponse est relisible et corrigeable ; la synthèse est recalculée ; une réponse devenue incohérente est signalée, jamais validée en douce.
- **Intégrité** : une étape requise n'est jamais masquée ; la synthèse n'affiche « Parcours terminé » que si toutes les étapes requises sont validées.

### Priorités
1. Intégrité du parcours (requis toujours présents, aucune complétion fictive).
2. Compréhension (progression textuelle, explication de chaque adaptation).
3. Réversibilité (retour, correction, recommencer avec confirmation).
4. Accessibilité et robustesse (clavier, focus, erreurs liées aux champs, 320 px → 1440 px, aucun écran blanc).

### Compromis assumés
- **Standard cassé** : pas de menu ni d'arborescence de pages ; en contrepartie, la progression et l'objectif restent toujours affichés pour ne pas désorienter.
- **Personnalisation limitée et déclarative** : une seule préférence et une seule règle, testées, plutôt qu'une « magie » imprévisible. Le plan ne change jamais sans explication.
- **Le curseur ne saute pas** : quand une étape facultative apparaît *avant* l'étape courante, l'utilisateur n'est pas déplacé de force ; elle est atteignable par « Retour » et la progression (« Étape 3 sur 4 ») l'indique.
- **Mode essentiel** : il masque les conseils facultatifs mais **jamais** une information obligatoire.
- **Sauvegarde locale facultative** : utile pour reprendre, mais l'application fonctionne entièrement en mémoire si le stockage est refusé, et le dit honnêtement.
- **Pas d'animation décorative, pas de mini-jeu** (R03) : l'originalité est dans l'interaction, pas dans l'effet.

### Inspirations (principes, pas modèles copiés)
- Nielsen Norman Group — [10 Usability Heuristics](https://www.nngroup.com/articles/ten-usability-heuristics/) : visibilité de l'état du système, contrôle et liberté de l'utilisateur, prévention et récupération des erreurs.
- GOV.UK Design System — [Summary list](https://design-system.service.gov.uk/components/summary-list/) : synthèse relisible avec action « Modifier » par réponse.
- Logique « une chose par page » des services publics numériques, appliquée ici à un parcours qui se recompose.

### Limites (honnêteté des preuves)
- Le bénéfice UX est une **hypothèse** : aucune mesure de temps ou d'erreurs n'est revendiquée.
- Personas hypothétiques ; le test de compréhension A17 (3 participants novices) **reste à mener** par l'équipe.
- Aucun audit WCAG/RGAA complet, aucun test lecteur d'écran vocal n'est revendiqué.
- Scénario et jeu de données synthétiques **à faire approuver** par l'équipe (cahier H03/H04).

---

## 2. Scénario de démonstration (S01)

1. Choisir **« Préparer ma participation à un atelier numérique »** → *Commencer*.
2. *Mon niveau* : Débutant / Autonome (essayer *Continuer* sans réponse : l'erreur s'affiche près du champ).
3. Dans **Préférences**, passer *Quantité d'explications souhaitée* de **Essentiel** à **Guidé** → l'étape *Conseils complémentaires* apparaît et « Ce qui a changé » l'explique.
4. *Retour* pour lire les conseils (facultatif), puis *Mon support de travail* et *Ma checklist*.
5. **Synthèse** : objectif, réponses, préférence, historique des adaptations, état de complétion.
6. *Modifier* → *Modifier cette réponse* sur le niveau → la synthèse est ajustée. *Recommencer* demande confirmation.

## 3. Données et règle (catalogue de démonstration)

| Étape | Ordre | Requise | Réponses possibles |
|---|---:|---|---|
| Mon niveau (`niveau`) | 10 | oui | `debutant`, `autonome` |
| Conseils complémentaires (`conseils`) | 20 | non | `lus` (confirmation) |
| Mon support de travail (`support`) | 30 | oui | `ordinateur`, `mobile` |
| Ma checklist (`verification`) | 40 | oui | `pret`, `a_revoir` |

Préférence `accompagnement` : `essentiel` (défaut) ou `guide`. Règle `masquer-conseils-en-mode-essentiel` : si `accompagnement = essentiel`, l'étape `conseils` est masquée. Aucune règle ne masque une étape requise (vérifié par `validatePlan` et les tests).

Fichiers : [`src/data/demo-data.ts`](src/data/demo-data.ts) (catalogue), [`src/data/demo-fields.ts`](src/data/demo-fields.ts) (contrat de champs typé par ID d'étape), [`src/ui/components/choice-renderer.ts`](src/ui/components/choice-renderer.ts) (rendu des champs).

## 4. Architecture (TDR-001)

TypeScript + Vite + DOM natif + CSS (design tokens). Pas de React, pas de Backend, pas de base de données : rien dans le scénario ne les justifie.

```
src/domain/        modèles, moteur de règles, invariants, validation (pur, testé)
src/application/   contrôleur de session, sélecteurs, restauration
src/data/          catalogue de démonstration, contrat de champs, libellés
src/platform/      navigation interne, persistance localStorage facultative
src/ui/ src/views/ composants DOM accessibles, écrans E01 Objectif / E02 Parcours / E03 Synthèse
```

## 5. Lancer, tester, déployer

```bash
npm install
npm run dev            # développement
npm run lint && npm run typecheck && npm test
npm run build          # sortie statique dans dist/
npm run test:browser   # scénarios navigateur (harness technique)
npm run test:preview   # S01 de bout en bout sur le build de production
```

**Déployer** : `dist/` est un site statique (HTML/CSS/JS, chemins relatifs à la racine). Il peut être publié sur GitHub Pages, Netlify ou Vercel sans configuration serveur. Une fois en ligne, renseigner l'URL dans le tableau en haut de ce fichier.

## 6. Preuves

Captures produites automatiquement par `npm run test:preview` sur le build de production : [`docs/qa/`](docs/qa/) (`s01-e01-objectif.png`, `s01-e02-avant-adaptation.png`, `s01-e02-apres-adaptation.png`, `s01-e03-synthese.png`, `s01-mobile-320.png`). Suivi détaillé : [`docs/tasks.md`](docs/tasks.md). Spécification : [`cahier_charge.md`](cahier_charge.md).
