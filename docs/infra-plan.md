# Le Chemin Vivant — Plan d'infrastructure

**Projet :** Le Chemin Vivant  
**Défi :** Hair'gonomie (2025)  
**Version :** 1.0  
**Statut :** Phase 5 — Plan d'infrastructure  
**Documents de référence :** `cahier_charge.md`, `new files/architecture.md`, `new files/backend-plan.md`, `new files/api-contract.md`, `new files/frontend-plan.md`

> **Décision préalable :** Le Chemin Vivant est une **application web statique** exécutée entièrement côté client. Le cahier des charges exclut backend, base de données et API externe dans le MVP. L'infrastructure se limite donc à :
>
> 1. un **build statique** produit par Vite (React + TypeScript si la stack est confirmée) ;
> 2. un **hébergement statique** servant des fichiers et fournissant une URL publique ;
> 3. un **dépôt GitHub** contenant les sources et le `README` argumenté ;
> 4. le `localStorage` du navigateur, **facultatif**, pour la reprise de session.
>
> Aucun serveur applicatif, aucune base de données, aucun cache serveur, aucune file d'attente, aucun worker, aucun service externe et aucun secret d'infrastructure ne sont nécessaires. Les éléments non applicables sont explicitement listés avec leur justification afin de ne pas importer une infrastructure d'un autre projet.
>
> `ressources/` est absent : l'infrastructure ne dépend pas du contenu métier. Le catalogue de démonstration restera un fichier local livré avec le build ; son contenu sera fourni ultérieurement sans changer la topologie décrite ici.

---

## Table des matières

1. Objet et sources
2. Principes d'infrastructure
3. Périmètre et composants non applicables
4. Applications et composants déployés
5. Topologie d'exécution
6. Déploiement frontend
7. Environnements
8. Configuration et variables d'environnement
9. Réseau, ports et domaines
10. Stratégie de déploiement
11. Intégration continue et livraison (CI/CD)
12. Supervision et journalisation
13. Sauvegardes et reprise
14. Sécurité
15. Mise à l'échelle et disponibilité
16. Performance et distribution des fichiers
17. Règles de changement d'infrastructure
18. Checklist de mise en production
19. Risques et mitigations
20. Hypothèses et questions ouvertes
21. Traçabilité
22. Handoff vers la Phase 6

---

## 1. Objet et sources

### 1.1 Objet

Ce plan décrit l'infrastructure minimale et reproductible permettant de :

- développer l'application localement ;
- produire un build statique vérifié ;
- prévisualiser le build avant publication ;
- publier une URL publique consultable par le jury ;
- reprendre une session via le stockage local du navigateur, sans dépendance serveur ;
- garantir que l'application fonctionne sans backend, sans base de données et sans secret.

Le plan ne traite ni du contenu métier, ni de la logique de domaine, ni des composants d'interface, qui appartiennent aux Phases 1 à 4. Il prépare la Phase 6 (plan directeur) et la livraison des preuves A14/A15.

### 1.2 Sources

| Source | Usage |
|---|---|
| `cahier_charge.md` | Contraintes (section 2), stack conditionnelle (section 8), parcours (section 5), N01–N09, livrables (section 12), H06–H07 |
| `ressources/` | Contenu réel (**absent**) ; sans impact sur la topologie |
| `new files/architecture.md` | AD01 client-only, AD03 vues logiques, AD06 persistance facultative, section 19 (déploiement) |
| `new files/backend-plan.md` | Cœur local, `platform/persistence`, absence de backend serveur |
| `new files/api-contract.md` | Absence d'API HTTP, contrat de persistance locale |
| `new files/frontend-plan.md` | Handoff Phase 4 : build statique, assets locaux, tests locaux |
| `principales files/infra-plan.md` | Méthodologie de structuration uniquement |

### 1.3 Hiérarchie en cas de conflit

1. `cahier_charge.md` — structure, contraintes, exigences.
2. `ressources/` — contenu réel (absent).
3. `new files/architecture.md` — décisions architecturales.
4. `new files/backend-plan.md` et `new files/api-contract.md` — cœur local et contrat.
5. `new files/frontend-plan.md` — build et intégration.
6. `principales files/infra-plan.md` — méthode uniquement.

### 1.4 Limites documentaires

- L'hébergeur précis n'est pas confirmé (H06) ; le plan reste compatible avec tout hébergement statique.
- L'accès GitHub et l'URL publique ne sont pas garantis (H07) ; A14/A15 restent à produire.
- La stack React + TypeScript + Vite reste conditionnelle aux compétences de l'équipe (H04).
- Aucune conformité WCAG/RGAA, aucun SLA et aucune promesse de disponibilité ne sont revendiqués.
- Aucune donnée métier réelle n'est disponible ; aucune décision d'infrastructure n'en dépend.

---

## 2. Principes d'infrastructure

| Principe | Décision | Justification |
|---|---|---|
| Static-first | Le livrable est un ensemble de fichiers statiques | Cahier section 8 ; architecture AD01 |
| Zéro serveur applicatif | Aucun processus backend à héberger ni à superviser | Aucun besoin prouvé ; exclusion du cahier |
| Zéro base de données | Aucun stockage serveur ; le contenu est un fichier local | Cahier section 9 ; D05 |
| Zéro secret | Aucune clé, aucun jeton, aucun service payant | N09 ; architecture section 17 |
| Reproductibilité | Même commit ⇒ même build ⇒ même démonstration | F02, F12, A01 |
| Sobriété | Pas de conteneur, pas d'orchestrateur, pas de file, pas de cache serveur | Complexité injustifiée |
| Portabilité | Tout hébergeur statique compatible suffit | D04, H06 |
| Sécurité par absence | Pas de surface serveur à attaquer | Architecture section 17 |
| Fonctionnement hors stockage | L'absence de `localStorage` ne bloque jamais l'application | F11 ; contrat section 10 |

**Contrainte de style :** aucune infrastructure n'impose de choix visuel. Le plan ne fixe que l'hébergement et l'outillage.

---

## 3. Périmètre et composants non applicables

Chaque composant est évalué ; ceux qui ne sont pas requis sont explicitement écartés pour éviter tout copier-coller d'un projet antérieur.

| Composant | Décision | Justification |
|---|---|---|
| Applications | **Une** application web statique (SPA client-only) | Cahier sections 2 et 8 |
| Backend services | **Aucun** | Exclusion du cahier ; architecture AD01 |
| API HTTP / REST / GraphQL | **Aucune** | Contrat §2 : opérations locales uniquement |
| Base de données | **Aucune** | Cahier section 8 ; D05 |
| ORM / migrations | **Aucun** | Aucun stockage serveur |
| Stockage serveur de fichiers | **Aucun** | Aucun upload utilisateur |
| Cache serveur (Redis, etc.) | **Aucun** | Aucune donnée distante à mettre en cache |
| Files d'attente / message broker | **Aucune** | Aucune tâche asynchrone serveur |
| Background workers / cron | **Aucun** | Aucune tâche différée |
| WebSocket / temps réel | **Aucun** | Application locale mono-utilisateur |
| Services externes (paiement, IA, e-mail, push) | **Aucun** | Hors périmètre du cahier |
| Analytics / tracking | **Aucun** | N09 ; architecture section 17 |
| Authentification / SSO | **Aucune** | Exclusion du cahier |
| CDN tiers dans le chemin critique | **Aucun** | Architecture sections 16–17 ; assets locaux |
| Conteneurs / orchestration | **Non nécessaires** | Aucun service à exécuter ; build statique suffisant |
| Serveur web dédié (Nginx, etc.) | **Non nécessaire** | L'hébergeur statique sert les fichiers |
| Registre d'images | **Aucun** | Aucune image à publier |

**Règle :** l'absence de ces composants est une décision de périmètre, pas un oubli. Réintroduire l'un d'eux exige une mise à jour documentée de `cahier_charge.md`, `architecture.md` et du présent plan.

---

## 4. Applications et composants déployés

### 4.1 Application unique

| Élément | Description |
|---|---|
| Nom | `le-chemin-vivant` |
| Type | Application web statique (SPA) |
| Stack | React + TypeScript + Vite (**conditionnelle**, H04) |
| Sortie de build | Répertoire `dist/` (HTML, JS, CSS, assets) |
| Exécution | 100 % navigateur, après chargement des fichiers |
| Backend requis | Aucun |
| Réseau requis après chargement | Aucun |
| Persistance | `localStorage` facultatif, côté navigateur |

### 4.2 Composants internes concernés par le déploiement

| Composant | Rôle à l'exécution | Nature |
|---|---|---|
| `app/shell` | Coque, error boundary | Code inclus dans le bundle |
| `views/*` | E01–E03 | Code inclus dans le bundle |
| `domain/*`, `application/*` | Domaine et orchestration | Code inclus dans le bundle |
| `data/catalog`, `data/demo-data` | Catalogue local | Fichier(s) livré(s) avec le build |
| `platform/persistence` | Reprise via `localStorage` | API navigateur, facultative |
| `platform/navigation` | Navigation interne | Code inclus dans le bundle |

Aucun de ces composants n'est déployé comme service distinct. Ils font tous partie d'un seul artefact statique.

### 4.3 Artefact livré

```
dist/
├── index.html
├── assets/
│   ├── *.js
│   ├── *.css
│   └── (polices/images locales si présentes)
└── (catalogue local compilé dans le bundle ou fichier local)
```

- Le build ne produit aucun serveur, aucune fonction serverless, aucun conteneur.
- Les assets critiques sont locaux ; aucun CDN tiers n'est requis.
- Le catalogue de démonstration est inclus localement, sans appel réseau.

---

## 5. Topologie d'exécution

### 5.1 Développement local

```
Navigateur → Vite dev server (http://localhost:5173)
             └── React + TypeScript + domaine local
             └── localStorage (facultatif)
```

- Aucun autre processus n'est nécessaire.
- Aucun port de base de données, aucun port API, aucun port temps réel.

### 5.2 Prévisualisation du build

```
Navigateur → vite preview (http://localhost:4173 par défaut)
             └── fichiers statiques du répertoire dist/
```

- Sert à vérifier le build de production avant publication.
- Aucun backend n'est démarré.

### 5.3 Production

```
Navigateur → HTTPS → Hébergeur statique (fichiers dist/)
                        └── seul le stockage local du navigateur est utilisé
```

- Aucune communication serveur-à-serveur.
- Aucun port applicatif exposé.
- Aucune base de données, aucun cache, aucun worker.

### 5.4 Relation entre services

Il n'y a **qu'un seul service déployé** : l'hébergement statique. La seule interface externe observable est le `localStorage` du navigateur, qui n'est pas un service réseau.

---

## 6. Déploiement frontend

### 6.1 Chaîne de build

1. `npm ci` (installation reproductible).
2. `npm run lint` (si configuré).
3. `npm run typecheck`.
4. `npm run test` (tests de domaine et composants, si configurés).
5. `npm run build` → génère `dist/`.
6. Publication du contenu de `dist/` sur l'hébergement statique.

### 6.2 Règles de build

- Le build doit réussir sans variable d'environnement secrète.
- Le build ne doit effectuer aucun appel réseau.
- Les assets doivent être référencés localement.
- Le chemin de base (`base`) de Vite doit correspondre au domaine/sous-chemin de publication.
- Aucun fallback serveur complexe n'est requis, car **le MVP n'utilise pas de routes URL** (contrat §9). Si des routes sont introduites ultérieurement, un fallback vers `index.html` devra être configuré et testé.

### 6.3 Critères de build

- `dist/index.html` présent.
- Aucun fichier source (`src/`) ni carte de source exposée en production (sauf décision explicite).
- Aucune erreur bloquante au chargement.
- L'application fonctionne sans connexion après chargement initial.

---

## 7. Environnements

| Environnement | Usage | Configuration | Données |
|---|---|---|---|
| **Local** | Développement et vérification | Vite dev server, `npm run dev`, build non optimisé | Catalogue local ; `localStorage` local |
| **Prévisualisation (staging)** | Vérifier le build statique avant publication | `npm run build` + `vite preview` ou URL de prévisualisation de l'hébergeur | Données synthétiques ; aucune donnée réelle |
| **Production** | URL publique pour le jury (A15) | HTTPS, fichiers statiques, domaine public | Données synthétiques ; aucune donnée réelle |

### 7.1 Règles d'environnement

- Aucun environnement n'utilise de base de données ni de backend.
- La prévisualisation et la production servent le **même artefact statique**, à la configuration de domaine près.
- Aucune donnée personnelle réelle n'est présente dans aucun environnement (N09).
- Les environnements ne diffèrent pas par des secrets (il n'y en a pas).
- Aucune migration de données n'est nécessaire entre environnements.

---

## 8. Configuration et variables d'environnement

### 8.1 Principe

Le MVP ne nécessite **aucune variable d'environnement obligatoire**. Si des variables publiques sont un jour introduites, elles doivent être strictement limitées au préfixe `VITE_` et ne jamais contenir de secret.

| Variable | Statut | Contenu |
|---|---|---|
| Secrets serveur | **Aucun** | Aucune clé, aucun jeton |
| Identifiants de base de données | **Aucun** | Aucune base |
| `VITE_*` | **Facultatif et public** | Uniquement des valeurs sûres à exposer au navigateur |
| `.env.example` | **Recommandé si variables** | Placeholders non secrets |
| `.env.local` | **Ignoré par Git** | Surcharges locales |

### 8.2 Règles

- Aucun fichier `.env` contenant un secret ne doit être commité.
- Aucune valeur secrète ne doit être placée dans le bundle.
- La configuration de domaine et de `base` peut être fixée dans `vite.config.ts`, sans secret.
- Aucune rotation de secret n'est nécessaire, faute de secret.

---

## 9. Réseau, ports et domaines

### 9.1 Ports locaux

| Service | Port | Usage |
|---|---|---|
| Vite dev server | `5173` | Développement local |
| Vite preview | `4173` | Prévisualisation du build |
| Autres | **Aucun** | Aucune base, aucune API, aucun WebSocket |

### 9.2 Réseau

- Aucune connexion sortante requise pour le fonctionnement après chargement.
- Aucune connexion serveur-à-serveur.
- Les assets sont servis par le même hôte statique.
- HTTPS obligatoire en production ; HTTP local toléré en développement.

### 9.3 Domaines

| Environnement | Domaine |
|---|---|
| Local | `http://localhost:5173` |
| Prévisualisation | URL fournie par l'hébergeur (sous-domaine de prévisualisation) |
| Production | Domaine public **à confirmer** (H06/H07) |

### 9.4 Règles

- Aucune IP privée ni URL de fournisseur n'est codée en dur.
- Le sous-chemin de publication doit correspondre à la configuration `base` de Vite.
- Aucune donnée sensible dans l'URL (architecture section 17).
- Le domaine de production doit être testé depuis un autre navigateur/machine (A15).

---

## 10. Stratégie de déploiement

### 10.1 Modèle

- **Publication par artefact statique** : un build validé est publié tel quel.
- **Déploiements atomiques** : l'hébergeur bascule vers la nouvelle version sans fichiers partiels (si disponible).
- **Rollback** : redéploiement du commit précédent ou de la version précédente conservée par l'hébergeur.
- **Aucune fenêtre de maintenance** : le service reste disponible pendant la publication, puisque les fichiers sont statiques.

### 10.2 Plateformes compatibles

Tout hébergement statique convient. Exemples non contraignants :

- Netlify (si maîtrisé, D04) ;
- Vercel ;
- GitHub Pages ;
- Cloudflare Pages ;
- tout serveur statique compatible HTTPS.

**Décision :** le choix final de l'hébergeur est une question ouverte (H06) ; la topologie reste identique quel que soit l'hébergeur.

### 10.3 Promotion

```
Local → Prévisualisation → Production
```

- Chaque promotion reprend le même artefact validé.
- La production requiert une vérification manuelle de l'URL (A15) avant annonce.
- Aucune migration de base de données à exécuter.

### 10.4 Livrables de déploiement

- URL publique consultable (R08, F12, A15).
- Dépôt GitHub accessible avec sources et `README` (R08, A14).
- Note de handoff du build (commandes, arborescence, dépendances).

---

## 11. Intégration continue et livraison (CI/CD)

### 11.1 Statut

La CI n'est **pas exigée** par le cahier. Elle est recommandée pour fiabiliser la publication, sans devenir une dépendance du projet.

### 11.2 Pipeline recommandé (si activé)

1. Lint.
2. Typecheck.
3. Tests unitaires (domaine) et tests de composants.
4. Build (`npm run build`).
5. Vérifications de sécurité simples : absence de secret, absence d'appel réseau dans le domaine, dépendances raisonnables.
6. Tests E2E Playwright sur le build statique (recommandé).

### 11.3 Règles

- Les jobs de validation et de déploiement restent séparés.
- Le déploiement en production peut exiger une approbation manuelle.
- La CI ne doit introduire ni backend, ni base, ni secret.
- Aucun déploiement ne doit dépendre d'un test instable ou d'une horloge.
- Une CI absente ne bloque pas la livraison manuelle reproductible.

---

## 12. Supervision et journalisation

### 12.1 Journalisation

- Aucun journal serveur : il n'y a pas de serveur.
- En développement, la console navigateur peut servir aux diagnostics, sans données personnelles.
- Aucune télémétrie, aucun tracking, aucun cookie analytique (N09).
- Les erreurs d'exécution sont captées par l'`ErrorBoundary` applicatif et présentées à l'utilisateur, sans page blanche (N07).

### 12.2 Supervision

| Élément | Décision |
|---|---|
| Métriques serveur | **Aucune** (pas de serveur) |
| Métriques navigateur | **Aucune collecte** en production |
| Uptime de l'URL | Vérification manuelle ou sonde externe optionnelle, sans script embarqué |
| Surveillance des erreurs | `ErrorBoundary` local ; pas de service tiers |
| Alertes | Aucune alerte automatique requise |

### 12.3 Règles

- Aucune supervision ne doit introduire de collecte de données personnelles.
- La vérification de disponibilité de l'URL peut être manuelle (A15).
- Un échec de chargement côté hébergeur se diagnostique via les outils de l'hébergeur, pas via un service embarqué.

---

## 13. Sauvegardes et reprise

### 13.1 Ce qui doit être conservé

| Élément | Sauvegarde | Justification |
|---|---|---|
| Code source | Dépôt GitHub (R08, A14) | Source de vérité reproductible |
| Configuration de build | Versionnée dans le dépôt | Reproductibilité |
| Artefact `dist/` | Reconstructible depuis un commit | Pas de sauvegarde durable nécessaire |
| Catalogue local | Versionné avec le code | Source de contenu de démonstration |
| `localStorage` | **Non sauvegardé** | Données locales éphémères, non critiques |

### 13.2 Reprise

- Un artefact perdu se reconstruit à partir du dépôt (`npm ci` + `npm run build`).
- Un déploiement défaillant se corrige par rollback vers la version précédente.
- Une session locale perdue se recrée par un nouveau parcours ; aucune donnée critique n'est perdue.
- Aucune sauvegarde de base de données n'est nécessaire (il n'y a pas de base).

### 13.3 Objectifs

- Les objectifs RPO/RTO propres à un backend ne s'appliquent pas.
- Le seul impératif est la disponibilité des **sources** (GitHub) et la possibilité de **redéployer**.
- Aucune restauration de données utilisateur n'est requise.

---

## 14. Sécurité

| Sujet | Décision |
|---|---|
| Transport | HTTPS obligatoire en production |
| Secrets | Aucun secret côté client ni côté hébergement |
| Authentification | Aucune |
| Autorisation | Aucune ; seules les gardes de progression fonctionnelles |
| Données personnelles | Aucune ; données synthétiques (N09) |
| Cookies / sessions serveur | Aucun |
| Stockage local | `SessionState` non sensible, effaçable par l'utilisateur |
| Injection | Rendu React échappé ; pas de `dangerouslySetInnerHTML` |
| Dépendances | Limitées ; pas de CDN ou service tiers dans le chemin critique |
| En-têtes de sécurité | Recommandés si l'hébergeur le permet (HSTS, `X-Content-Type-Options`, CSP adaptée) |
| URL | Aucune donnée sensible |
| Analyse / tracking | Aucun |

### 14.1 Règles

- La sécurité repose sur l'**absence de surface serveur**.
- Aucun service tiers ne doit recevoir de données d'usage.
- Les en-têtes de sécurité sont un bonus d'hébergeur, non une exigence bloquante.
- Aucune clé d'API, aucun jeton, aucun compte de service.

---

## 15. Mise à l'échelle et disponibilité

### 15.1 Mise à l'échelle

| Aspect | Décision |
|---|---|
| Scalabilité applicative | Assurée par l'hébergement statique/CDN |
| Instances serveur | Aucune |
| Base de données | Aucune |
| Cache | Aucun |
| Workers | Aucun |
| Pics de charge | Absorbés par la distribution statique |

- L'application n'a pas d'état serveur à mettre à l'échelle.
- Chaque utilisateur exécute sa propre instance côté navigateur.

### 15.2 Disponibilité

- La disponibilité dépend de l'hébergeur statique et du dépôt GitHub, non d'un serveur applicatif.
- Aucune promesse de SLA n'est revendiquée (cahier).
- Aucun point de défaillance applicatif unique n'est introduit.
- L'application reste utilisable après chargement même sans réseau.

---

## 16. Performance et distribution des fichiers

- Le build doit être servi efficacement (compression et cache HTTP gérés par l'hébergeur statique si disponible).
- Les assets critiques restent locaux ; aucun CDN tiers n'est requis.
- Le chargement paresseux des vues est possible si le bundle le justifie (frontend §18.3).
- Aucune donnée distante n'est chargée au runtime.
- Le catalogue local est chargé une fois.
- Aucun service de polices externe obligatoire ; préférer des polices locales ou système.
- Les performances observables respectent N06 : aucune attente réseau après chargement, aucun blocage perceptible.

---

## 17. Règles de changement d'infrastructure

1. Tout changement d'hébergement, de domaine, de port ou de configuration de build doit être documenté.
2. Chaque changement précise : ce qui change, l'impact local/prévisualisation/production, et le plan de rollback.
3. Aucun changement ne doit introduire de backend, de base de données, de secret ou de service externe sans mise à jour explicite du cahier, de l'architecture et du présent plan.
4. Aucun changement ne doit casser la reproductibilité du build.
5. Aucun changement ne doit rendre le stockage local obligatoire.
6. Toute introduction de route URL impose un fallback statique testé.
7. Les changements d'infrastructure sont petits et réversibles.

---

## 18. Checklist de mise en production

Avant d'annoncer l'URL publique, vérifier :

- [ ] Le build `dist/` est produit à partir d'un commit identifié.
- [ ] `npm run lint`, `npm run typecheck`, `npm run build` passent.
- [ ] Le build ne contient aucun secret ni clé d'API.
- [ ] Aucun appel réseau n'est nécessaire au fonctionnement après chargement.
- [ ] L'hébergement sert les fichiers en HTTPS.
- [ ] Le chemin `base` de Vite correspond au domaine de publication.
- [ ] L'URL fonctionne depuis un autre navigateur/machine (A15).
- [ ] L'application fonctionne sans `localStorage` (F11).
- [ ] L'application fonctionne sans backend (aucune requête API).
- [ ] Le dépôt GitHub est accessible (A14).
- [ ] Le `README` contient les justifications attendues (R05, R07, R08) — préparé en Phase 6.
- [ ] Un rollback vers la version précédente est possible.
- [ ] Aucune donnée personnelle réelle n'est présente.
- [ ] Le catalogue de démonstration est soit fourni, soit explicitement signalé comme absent.

---

## 19. Risques et mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| Hébergeur non choisi (H06) | Moyen | Topologie indépendante de l'hébergeur ; tout hébergement statique convient |
| URL inaccessible (A15) | Critique | Test obligatoire hors machine locale avant annonce |
| Build avec mauvais `base` | Moyen | Vérifier le sous-chemin avant publication |
| Dépendance réseau accidentelle | Élevé | Revue du bundle ; aucun CDN critique |
| Secret exposé dans le bundle | Critique | Aucun secret ; revue `VITE_*` |
| Stack React non confirmée (H04) | Élevé | Fallback JS possible avec même build statique |
| Contenu absent (`ressources/`) | Élevé | Catalogue local comme emplacement ; aucune dépendance infra |
| Rollback impossible | Moyen | Conserver la version précédente chez l'hébergeur |
| Route URL introduite sans fallback | Moyen | Configurer et tester un fallback avant adoption |
| GitHub indisponible (H07) | Critique | Vérifier l'accès et le dépôt avant livraison |

---

## 20. Hypothèses et questions ouvertes

### 20.1 Hypothèses

| ID | Hypothèse | Source |
|---|---|---|
| INF-A1 | Une application statique client-only suffit | Cahier section 8 ; architecture AD01 |
| INF-A2 | Aucun backend, base, cache, file ou worker n'est requis | Cahier section 2 ; architecture section 23 |
| INF-A3 | Un hébergement statique avec HTTPS suffit | Cahier section 8 ; D04 |
| INF-A4 | Le `localStorage` est facultatif et non bloquant | Cahier F11 ; contrat section 10 |
| INF-A5 | Aucun secret d'infrastructure n'est nécessaire | Architecture section 17 ; N09 |
| INF-A6 | Le build statique est reproductible depuis un commit | F02, F12, A01 |

### 20.2 Questions ouvertes

| ID | Question | Impact |
|---|---|---|
| OQ-I1 | Quel hébergeur statique l'équipe maîtrise-t-elle ? (H06) | Plateforme de publication |
| OQ-I2 | Quel domaine public sera utilisé ? (H07) | URL de consultation (A15) |
| OQ-I3 | GitHub et accès publics sont-ils disponibles ? (H07) | Livraison R08, A14 |
| OQ-I4 | La CI doit-elle être activée ? | Automatisation de la publication |
| OQ-I5 | Des routes URL seront-elles introduites ? | Fallback statique à prévoir |
| OQ-I6 | La stack React + TypeScript + Vite est-elle confirmée ? (H04) | Chaîne de build |
| OQ-I7 | Le catalogue de démonstration sera-t-il fourni avant livraison ? | Contenu de la démonstration |

Les hypothèses H01–H10 du cahier restent ouvertes. Ce plan ne les transforme pas en exigences.

---

## 21. Traçabilité

### 21.1 Contraintes et décisions

| Élément | Couverture infrastructure |
|---|---|
| D04 (hébergement statique) | Sections 4, 6, 10 |
| D05 (données locales, pas de backend) | Sections 3, 8, 13 |
| AD01 (client-only) | Sections 2, 4, 5 |
| AD03 (vues logiques, routes facultatives) | Sections 6.2, 9, 20 (OQ-I5) |
| AD06 (persistance facultative) | Sections 3, 13, 14 |

### 21.2 Exigences fonctionnelles

| Exigence | Couverture infrastructure |
|---|---|
| F11 Sauvegarde locale facultative | Sections 8, 13, 14 ; `localStorage` |
| F12 Démonstration reproductible | Sections 6, 10, 18 ; URL publique |

### 21.3 Exigences non fonctionnelles

| Exigence | Couverture |
|---|---|
| N01 Responsive | Aucune dépendance infra ; le build sert le viewport (frontend §16) |
| N02 Lisibilité | Sans objet infra |
| N03 Accessibilité | Aucune dépendance infra |
| N04 Feedback | Sans objet infra |
| N05 Animation | Sans objet infra |
| N06 Performance | Section 16 ; assets locaux, pas de réseau obligatoire |
| N07 Stabilité | Sections 12, 18 ; ErrorBoundary, reproductibilité |
| N08 Cohérence | Sans objet infra |
| N09 Confidentialité | Sections 12, 14 ; aucun tracking, aucune donnée personnelle |

### 21.4 Preuves et livrables

| Preuve | Couverture infrastructure | Statut |
|---|---|---|
| A14 Dépôt GitHub accessible | Section 10.4 | À produire |
| A15 URL publique depuis autre navigateur | Sections 9.4, 10.4, 18 | À produire |
| R08 GitHub + rendu | Sections 10.4, 18 | À produire |

---

## 22. Handoff vers la Phase 6

La Phase 6 (Master Plan) peut s'appuyer sur :

- une **application statique unique** publiée sur un hébergement statique ;
- **aucun backend, base, cache, file, worker ni service externe** ;
- un build reproductible (`npm ci` → `lint`/`typecheck`/`test` → `build` → `dist/`) ;
- des environnements local, prévisualisation et production servant le même artefact ;
- **aucune variable d'environnement secrète** ;
- HTTPS et domaine de production à confirmer (H06/H07) ;
- un `localStorage` facultatif et non bloquant ;
- une checklist de mise en production (section 18).

Éléments à transmettre :

- commandes de développement, test, build et prévisualisation ;
- arborescence de `dist/` et configuration `base` ;
- liste des environnements et leurs URLs ;
- procédure de publication et de rollback ;
- résultats de la checklist de production ;
- questions ouvertes OQ-I1 à OQ-I7.

**Interdit :** ajouter un backend, une base de données, une authentification, un cache serveur, une file, un worker, un conteneur obligatoire ou un secret d'infrastructure pour faciliter la publication.

---

**Fin du plan d'infrastructure — Le Chemin Vivant, Phase 5.**
