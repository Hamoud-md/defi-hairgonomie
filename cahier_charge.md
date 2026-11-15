# CARD 04 — Le Chemin Vivant / Hair'gonomie

**Cahier des charges fonctionnel, créatif et technique — V3.0 (proposition de référence)**  
**Équipe :** trois membres — La Nuit de l'Info  
**Défi secondaire étudié :** Hair'gonomie (archive 2025)  
**Défi Principal :** non communiqué ; aucune intégration supposée  
**Statut :** `CONDITIONALLY READY — APPROVAL REQUIRED` pour une spécification de démonstrateur ; voir les conditions et les blocages éventuels en fin de document  
**Sources :** `Defi_Hairgonomie_2025(1).pdf` p.1, `tous_les_defis_2012_2025(2).json` → 2025 → `Hair'gonomie`, `Cahier_des_charges_Hairgonomie_v2_source_de_verite.md`, `Cahier_des_charges_Le_Chemin_Vivant_Hairgonomie.md`, archive `defi-1-train.zip` (état de cet instantané, et non de toute version ultérieure), cartes 01–03 telles que discutées dans la conversation, enregistrement du parcours transmis le 15 novembre 2026 (observation visuelle, pas audit technique).  
**Convention :** OFFICIAL = formulation issue du défi ; APPROVED = décision explicitement retenue dans la conversation ; PROPOSED = spécification à faire approuver ; OPTIONAL = ajout supprimable ; UNKNOWN = non documenté ou non testé. Les exigences internes sont notées `INTERNAL` et ne sont jamais présentées comme officielles.

---

# PARTIE A — التحليل والقرار الإبداعي والتقني (بالعربية)

## A1. الأدلة والالتزامات

**OFFICIAL — Hair'gonomie:** يطلب `parti pris ergonomique innovant` متماسكًا وقابلًا للتبرير، وشرح المشكلة التي يحلها وكيف يحسن تجربة المستخدم، و`courte note` تشمل الأولويات والتنازلات والإلهام، وإتاحة وصول GitHub ورابط عرض المشروع والتبريرات في `READ.ME`. مصدر هذه العبارات: ملف PDF المرفق، الصفحة 1، أقسام `Description du défi` و`Critères d'évaluation / Éléments attendus` و`Mode de restitution`؛ نسخها الحرفية في القسم الفرنسي 3.

**ليس شرطًا رسميًا مثبتًا:** 3D، React، مستوى رقمي معين في WCAG، فيديو، عدد Animations محدد، Database، أو إلزام دمج Défi Principal. **قواعد التسجيل في سنة أخرى UNKNOWN**، ولا نعتبر هذا الأرشيف دعوة مشاركة حالية.

**APPROVED — من الحوار:** تحدي Hair'gonomie كمرجع، مفهوم `Le Chemin Vivant` بوصفه تنقلًا موجّهًا بالهدف ويُظهر أثر الاختيارات ويمكن التراجع عنه، ضرورة وجود جماليات Premium وAnimations وMicro-interactions ذات أثر، وعدم مهاجرة Framework بلا مبرر. **PROPOSED:** مثال «Préparer ma participation à un atelier numérique» والهوية البصرية التفصيلية الواردة هنا؛ اختيار هذا السيناريو لم يُعتمد صراحة بوصفه موضوعًا نهائيًا للفريق. المهارات الدقيقة لكل فرد UNKNOWN.

## A2. ما الذي سيفعله المستخدم؟

**المشكلة الافتراضية المحددة:** شخص يريد التحضير لورشة رقمية افتراضية، لكنه لا يعرف الخطوات اللازمة أو مدى التفصيل المناسب لمستواه؛ نموذج تقليدي ثابت يعرض المراحل نفسها للجميع ولا يوضح أثر التفضيلات.

**سيناريو end-to-end — PROPOSED:** يفتح المستخدم التطبيق، يختار هدف «Préparer ma participation à un atelier numérique»، يحدد `Débutant` أو `Autonome`، ثم `Essentiel` أو `Guidé`، ويلاحظ أن مسار `Guidé` يكشف «Conseils complémentaires» الاختيارية. توضح واجهة بصرية **ما الذي تغير ولماذا** (قبل/بعد واضحان نصيًا)، ويمكنه تعديل الخيار، ثم يحدد وسيلة العمل ويؤكد Checklist، ليصل إلى Synthèse صادقة لمدخلاته. لا يُفترض وجود ورشة حقيقية أو تسجيل خارجي.

**الميزة التي يجب ألا تضيع:** عندما يغير المستخدم التفضيل، لا يكفي أن يتغير عدد البطاقات بصمت؛ يجب أن يرى رابط السبب بالنتيجة، والمرحلة المضافة/المخفاة، ورسالة تفسيرية، وزرًا يتيح التصحيح أو الرجوع. هذه هي `signature interaction` المقترحة للتجسيد المرئي لفكرة Card 03.

## A3. محتوى التشغيل

يُحدد القسم 12 جدولًا تشغيليًا كاملًا من `Objective + 4 Steps + Preference + TransitionRule + answers + Summary`، مع أرقام هوية وقيم ووظائف إدخال ورسائل محددة. البيانات **synthetic demonstration content — PROPOSED**؛ ليست معلومات عن ورشة واقعية. يجب أن تُعتمد قبل وصف تطبيق الإنتاج بأنه مكتمل بالمحتوى. لا يجوز ترك `objectives: []` في نسخة يُفترض اختبار رحلة المستخدم عليها، ولا يكفي تعبئة البيانات إن كانت حقول `AnswerRenderer` غير مربوطة.

## A4. التوجيه الفني (CDR-001 — PROPOSED)

**هوية:** «مسار تحضير حيّ» بلغة بصرية Editorial / Premium هادئة ومميزة، بخلفية ivory، وأخضر داكن، ونحاسيّ محدود للإبراز، وأرقام كبيرة ذات تسلسل واضح، وخط/أشكال مسار تتغير استجابة لخيارات المستخدم. الجماليات ليست غاية منفصلة؛ التكوين واللون والحركة يحكون انتقال المستخدم من عدم اليقين إلى الوضوح.

**معيار الإبداع:** شعور مرئي بأن الواجهة «تشرح نفسها» عند تغيير الهدف أو التفضيل؛ ليس Page Wizard عاديًا يعرض Step 1/2/3 فقط. دون تقليد المشروع الفائز `NIRD Quiz` أو نقل آلية تدهور واجهته.

| CDR | القرار | قيمة المستخدم | صلته بالتحكيم | الأولوية | الحالة/الاختبار |
|---|---|---|---|---|---|
| CDR-01 | استعارة المسار الناطق: خط تقدّم يتشكل بحسب الحالات | تصور الخطوات والتغييرات | R01–R05 | Core creative | PROPOSED؛ A07/A12 |
| CDR-02 | Editorial premium: ivory + deep green + warm copper | وضوح واتساق وتمايز | R02/R06 | Core polish | PROPOSED؛ A13 |
| CDR-03 | إظهار «avant → après» مع تفسير أي تبدل | فهم السبب والأثر | R05 | Essential interaction | PROPOSED؛ A07 |
| CDR-04 | إشارات Focus/Hover/Selected/Error متميزة | تقليل الالتباس | R02 | Core polish | PROPOSED؛ A14 |
| CDR-05 | Transition سلسة لا تعطل المهمة | إدراك التغيّر دون ضياع التركيز | R02/R03 | Core polish | PROPOSED؛ A12/A15 |
| CDR-06 | نسخة `prefers-reduced-motion` مفهومة بالكامل | إتاحة استعمال دون حركة | هدف جودة داخلي | Must internal | PROPOSED؛ A15 |

## A5. سياسة الحركة والتفاعل

- **Essential:** عند تغيير `Essentiel` إلى `Guidé`: إظهار المرحلة الاختيارية، تحديث الرسم والعدد، وإظهار تفسير نصي متصل بصريًا مع العنصر الذي تغيّر؛ العودة عكسية وواضحة.
- **Core polish:** انتقالات Page/Step، حالة Selection، Feedback للأخطاء والنجاح، عناصر Hover/Focus؛ قيم زمنية مبدئية 120–300ms، لا تفرض تأخيرًا.
- **Optional:** زخارف دقيقة في الخط/الحدود أو تنقل Scroll قصصي *إذا* لم يعطل سرعة إنجاز المهمة.
- **مرفوض:** كاميرا 3D دون دافع، حركات عشوائية، Parallax متطرف، Progress وهمي، إخفاء معلومات لازمة، حركة تجبر المستخدم على الانتظار.

## A6. مقارنة تقنية مقتضبة

| الطبقة | Approach A — الاحتفاظ بالموجود | Approach B — بديل مشروط | المبرر |
|---|---|---|---|
| Frontend | **TypeScript + Vite + DOM natif** | React + TypeScript + Vite فقط في مشروع جديد وبعد اعتماد صريح | ZIP يحتوي مشروع DOM فعلي؛ الهجرة ليست علاجًا للبيانات الناقصة |
| Design System | CSS + tokens.css | نفس النظام أو CSS Modules | tokens موجودة؛ الاتساق لا يستلزم مكتبة |
| Motion | CSS transitions/keyframes + Web Animations API عند ضرورة فعلية | Motion/GSAP فقط إن أثبت Prototype عدم كفاية CSS | حركة ذات حالة منضبطة وتكلفة أقل |
| State | `SessionState` + `JourneyCatalog` + `TransitionRule` | React state فقط لو أُقر الترحيل | عقود موجودة في `src/domain/models.ts` |
| Content | Catalog محلي + AnswerRenderer معتمد | API فقط إذا احتاج المنتج بيانات حقيقية | لا حاجة Backend في السيناريو المقترح |
| Testing | TypeScript, Vitest, Playwright + manual UX/a11y | نفس الاختبارات | سلوك قابل للتكرار |
| Deployment | Static hosting عند التسليم | Static hosting آخر بحسب خبرة الفريق | R08 يتطلب URL قابلًا للعرض، لا منصة بعينها |

**TDR-001 — PROPOSED:** ترجيح Approach A والمحافظة على DOM + TypeScript + Vite + CSS/Design Tokens. توجيه Animations مع CSS أولًا. لا Backend ولا Database ولا AI agent ولا Three.js. يجب اعتماد الفريق للـTDR والتحقق من قابلية دمج `AnswerRenderer` وبيانات السيناريو بالـschema الحالي. **معلومة تحقق:** `package.json` في ZIP يحتوي `vite`, `typescript`, `vitest`, `@playwright/test` وليس React؛ `src/domain/models.ts` يحدد `RuleCondition`, `RuleEffect`, `JourneyPlan`; `src/ui/components/answer-form.ts` يتطلب `renderer` لحقول قابلة للعمل.

## A7. Creative Traceability — Card 03 → Card 04

| Creative idea | Original user value | Required interaction | Visual expression | Functional requirement | Motion/interaction ID | Acceptance test |
|---|---|---|---|---|---|---|
| Le Chemin Vivant | العثور على طريق ملائم دون معرفة بنية الموقع | اختيار هدف → عرض الخطوات | خريطة/خط مسار مُفسَّر | F01/F02/F03 | M01 | A01/A03 |
| Cause → Effect | فهم أثر تفضيل المستخدم | تغيير `Essentiel/Guidé` | مرحلة تظهر/تختفي مع «avant/après» وسبب مكتوب | F04/F05 | **M02** | **A07** |
| Réversibilité | تغيير القرار دون عقاب | Retour/Modifier | رجوع متسق وحفظ خيارات صحيحة | F06/F07 | M03 | A08 |
| Commencer par la Fin — fallback | تقليل تعقيد التنقل | اختيار الهدف ثم خطوات ثابتة مع شرح | عرض موجّه دون تغيير قواعد | F01/F02/F09 | M04 | A11 |

**قاعدة فشل واضحة:** إذا كان تغيير التفضيل لا ينتج **تغيرًا محسوسًا ومفسرًا وقابلًا للعكس** في تجربة المستخدم، فلا يجوز وصف التنفيذ بأنه جسّد مفهوم Card 03، حتى إن نجحت اختبارات وحدة المحرك.

## A8. Readiness gates — التقييم الحالي

| Gate | الحالة | الدليل / المانع |
|---|---|---|
| G01 متطلبات رسمية موثقة | PASS (specification) | نص PDF p.1 في القسم 3 |
| G02 مشكلة مستخدم قابلة للتجربة | PROPOSED | الورشة الرقمية سيناريو مصطنع لم يعتمده الفريق صراحة |
| G03 المفهوم محفوظ | PASS (specification) | Le Chemin Vivant من Card 03 |
| G04 رحلة كاملة محددة | PASS (specification) | القسم 7، مع بقاء اعتماد المجال |
| G05 بيانات قابلة للتشغيل معتمدة | UNKNOWN | Dataset محدد أدناه ولكنه PROPOSED |
| G06 Creative Direction محدد | PASS (specification) | CDR-001، الموافقة النهائية UNKNOWN |
| G07 Motion الأساسي محدد | PASS (specification) | M01–M09، التنفيذ غير مختبر |
| G08 Stack متسق ومعتمد | UNKNOWN | TDR-001 متسق مع ZIP لكنه PROPOSED |
| G09 مهارات الفريق مثبتة | UNKNOWN | عدد الأعضاء 3، لا توزيع مهارات موثق |
| G10 معايير قبول الوظائف | PASS (specification) | A01–A20، لا نتائج تنفيذ مدعاة |
| G11 معايير قبول تصميم/حركة | PASS (specification) | A07/A12–A16 |
| G12 متطلبات التسليم | PASS (specification) | R08 وL01–L04 |
| G13 التبعيات الحاسمة محلولة | UNKNOWN | موافقة dataset/TDR والمهمة الحقيقية |

**الحكم المسبق:** الوثيقة قابلة لمراجعة واعتماد الفريق، لكنها ليست شهادة عمل التطبيق. تصبح جاهزة للتنفيذ النهائي بعد اعتماد موضوع السيناريو والـdataset والـTDR، وتأكيد أن المهارات تسمح بهذا النطاق. لا نشترط تنفيذ مراحل نشر مؤجلة من أجل الاختبار المحلي؛ ولا نعد توقفها المؤقت خطأ.

---

# PARTIE B — CAHIER DES CHARGES PROFESSIONNEL (FRANÇAIS)

## 1. Présentation du projet

### 1.1. Identification et contexte

**Nom :** Le Chemin Vivant. **Domaine :** expérience web de navigation adaptative, démontrée sur un scénario de préparation à un atelier numérique fictif (**PROPOSED**). **Équipe :** trois participants. **Défi Secondaire :** Hair'gonomie (2025, archive). **Défi Principal :** texte non fourni ; compatibilité et éventuelles obligations d'intégration **UNKNOWN**. Le défi historique ne constitue pas une confirmation d'inscription à une nouvelle édition.

Le défi invite à concevoir une prise de position ergonomique audacieuse mais crédible. Le Chemin Vivant interroge la convention selon laquelle un visiteur devrait d'abord comprendre les menus d'un site avant de réaliser sa tâche.

### 1.2. Problème et solution

**Problème hypothétique :** une personne peu familière avec les ateliers numériques ne connaît pas nécessairement l'ordre des préparatifs, le détail nécessaire ni les conséquences de ses préférences. Un parcours fixe peut proposer trop peu ou trop d'explications.

**Solution :** l'utilisateur commence par un objectif explicite. Le système lui présente des étapes indispensables et, selon sa préférence d'accompagnement, des conseils facultatifs. Une évolution du parcours entraîne un retour d'information immédiat, une explication lisible et une possibilité de révision.

**Personas de conception (non validés par enquête) :** P01 « Débutant », qui veut comprendre sans jargon ; P02 « Autonome », qui veut aller à l'essentiel ; P03 « Juré », qui évalue la pertinence de l'innovation et rejoue la démonstration.

**Résultat observé attendu :** le parcours se termine avec trois étapes requises réellement validées, une éventuelle étape facultative, un récapitulatif fidèle des réponses et une explication vérifiable de l'adaptation choisie. Aucun service réel n'est réservé.

### 1.3. Objectifs de projet

- Réduire l'incertitude quant à la prochaine action.
- Rendre visible le rapport entre préférence et chemin présenté.
- Permettre de revenir sur une décision sans perte silencieuse d'informations valides.
- Offrir une direction artistique identifiable, soignée et en accord avec le sens de la navigation vivante.
- Démontrer une interaction-signature intelligible en moins d'une minute d'utilisation.
- Documenter un argument ergonomique avec hypothèses, compromis et preuves réellement collectées.

### 1.4. Sources et limites

Le document intitulé `Defi_Hairgonomie_2025(1).pdf` est une **transcription fidèle produite à partir de l'archive**, et non un PDF officiel distribué directement par l'organisateur. Les formulations françaises ci-dessous en reprennent le contenu. Aucun résultat de test ni approbation de scénario n'est inventé.

## 2. Périmètre et priorités

| Catégorie | Inclusions / exclusions | Origine et condition |
|---|---|---|
| **Must — OFFICIAL** | Parti pris innovant, cohérent et justifié ; note ergonomique ; dépôt GitHub accessible ; lien de rendu ; justifications dans `READ.ME` | R01–R08 |
| **Must — INTERNAL / PROPOSED** | Un objectif exploitable ; formulaire réel ; parcours ; progression ; adaptation visible et expliquée ; retour ; synthèse ; moteur et données cohérents | F01–F11 ; sous réserve d'approbation du scénario |
| **Must — INTERNAL / design signature** | Interaction `Cause → Effect` observable au changement de préférence ; explication textuelle ; réversibilité | CDR-01/03 ; M02 ; A07 |
| **Should** | Identité premium complète, transitions cohérentes, responsive, navigation clavier, états accessibles, tests automatisés et manuels | Qualité interne et différenciation |
| **Could** | Deuxième scénario ; variante de parcours supplémentaire ; conservation locale ; capture vidéo courte volontaire | Si la qualité du minimum est préservée |
| **Won't** | Comptes ; paiements ; vraie réservation ; gamification ; chatbot ; stockage distant ; 3D décorative ; API payantes ; effets arbitraires | Hors besoin démontré |

Le minimum fini n'est **pas** une page d'accueil statique, un catalogue vide, une maquette, un ensemble de tests sur fixtures isolées ou un formulaire sans réaction visible. Il doit contenir un scénario complet accessible via le lancement normal de l'application.

## 3. Exigences officielles et traçabilité

**Source commune :** `Defi_Hairgonomie_2025(1).pdf`, **page 1**. Les retours à la ligne sont normalisés pour la lecture sans changer les mots du texte original. Les IDs sont créés pour cette spécification ; aucun barème chiffré officiel n'est publié.

| ID | Exigence originale (français) | Source | Réponse prévue | Priorité | Critère de validation |
|---|---|---|---|---|---|
| R01 | Inviter les équipes à repenser l’ergonomie d’une interface comme si aucune convention n’existait. | p.1, Description du défi | Navigation orientée objectif et adaptative | OFFICIAL — intention | Interaction alternative identifiable, démontrée et argumentée |
| R02 | L’objectif : proposer une expérience vraiment fluide, surprenante, mais crédible, en s’autorisant à casser certains standards tout en justifiant leurs choix. | p.1, Description du défi | Transitions expliquées, progression et retour fiables | OFFICIAL — intention | Tâche terminée sans rupture ; nouveauté reliée à un problème |
| R03 | Le défi ne demande pas une interface “magique” ou un mini-jeu. Il demande une prise de position ergonomique forte, assumée, cohérente. | p.1, Description du défi | Aucun mini-jeu ; mouvement au service du sens | OFFICIAL — limite | La mécanique améliore la compréhension, pas un spectacle autonome |
| R04 | Concevoir l'interface ou une partie de l'application (ou site) qui adopte un parti pris ergonomique innovant. | p.1, Critères d'évaluation / Éléments attendus | Module de chemin adaptatif utilisable | OFFICIAL — attendu | Parcours original manipulable par le jury |
| R05 | Le parti pris doit être expliqué : pourquoi ce choix, quel problème utilisateur il résout, et en quoi il améliore concrètement l’expérience. | p.1, Critères d'évaluation / Éléments attendus | README : problème, hypothèse, justification, observations et limites | OFFICIAL — attendu | Argument complet sans affirmer des résultats non mesurés |
| R06 | Aucun style imposé : minimaliste, responsive créatif, navigation alternative… tout est possible, tant que c’est justifié. | p.1, Critères d'évaluation / Éléments attendus | Direction artistique et mouvement expliqués | OFFICIAL — liberté avec justification | Aucun style déclaré obligatoire ; choix documentés |
| R07 | Fournir une courte note qui défend la vision ergonomique : les priorités, leurs compromis et leurs inspirations. | p.1, Critères d'évaluation / Éléments attendus | Note dédiée dans README ou fichier lié | **Must — OFFICIAL** | Priorités, compromis, inspirations présents et concrets |
| R08 | Accès au github du projet et un lien pour consulter le rendu. Les justifications sont attendus dans le READ.ME du projet. | p.1, Mode de restitution | GitHub + URL publique + README argumenté | **Must — OFFICIAL** | Liens testés depuis une session indépendante et contenu consultable |

**Limites :** ni vidéo obligatoire, ni technologie imposée, ni seuil officiel d'accessibilité mesuré, ni poids de critères /100 ne figurent dans la source. L'éligibilité à une autre édition est inconnue.

## 4. Concept créatif retenu et traçabilité Card 03 → Card 04

### 4.1. Définition

**Le Chemin Vivant** est une navigation orientée vers l'objectif, dont les étapes se réorganisent ou s'enrichissent de manière explicite selon les préférences pertinentes de l'utilisateur. La signature est la transformation **visible, expliquée et réversible** du chemin à la suite d'un choix.

**Épreuve de compréhension :** lorsque l'utilisateur active `Guidé`, il doit être capable d'indiquer **quelle étape est apparue, pourquoi elle est apparue, et comment revenir au parcours précédent**. Une animation seule ne satisfait pas ce besoin.

### 4.2. Métaphore et lien au sujet

La ligne de progression représente un itinéraire dans la préparation : les étapes indispensables forment l'ossature du parcours, les conseils facultatifs constituent un embranchement révélé à la demande. La métaphore correspond à la tâche ; ce n'est pas une carte géographique et elle n'a pas besoin de 3D.

**Parti pris :** présenter d'abord le résultat recherché, puis rendre visible le chemin vers ce résultat. Lors d'un changement, afficher *ce qui change*, *pourquoi* et *comment annuler*.

### 4.3. Tableau de transmission créative

| Creative idea | Original user value | Required interaction | Visual expression | Functional requirement ID | Motion/interaction ID | Acceptance test ID |
|---|---|---|---|---|---|---|
| Le Chemin Vivant | Comprendre un trajet de tâche | Choisir l'objectif et voir le plan | Ligne de parcours et cartes d'étapes reliées | F01–F03 | M01 | A01/A03 |
| Cause & effect | Comprendre les conséquences d'un réglage | Basculer `Essentiel` ↔ `Guidé` | Étape `Conseils` révélée/masquée, nombre d'étapes recalculé, message associé | F04/F05 | **M02** | **A07** |
| Révision sans perte | Garder le contrôle | Retour, puis changement de réponse | Déplacement de focus, maintien des réponses valides, changements signalés | F06/F07 | M03 | A08/A09 |
| Commencer par la Fin (fallback) | Démarrer sans connaître les menus | Sélectionner un objectif puis suivre des étapes fixes | Parcours sobre et objectif explicite | F01/F02 | M04 | A11 |

### 4.4. Compromis et fallback

Le système ne modifie pas secrètement les étapes requises. L'animation peut être réduite ; l'explication demeure. La personnalisation est volontairement limitée à une préférence claire pour garder la logique testable.

**Fallback fonctionnel :** `Commencer par la Fin` maintient l'accès par objectif, un parcours fixe, le retour et la synthèse, mais ne démontre pas intégralement la signature adaptative. Une bascule vers ce fallback constitue donc un **changement créatif à approuver** et nécessite d'actualiser le présent cahier, la note ergonomique et les tests ; elle n'autorise pas à déclarer l'adaptation réalisée.

## 5. Direction artistique et identité visuelle

**CDR-001 — PROPOSED, soumis à validation de l'équipe.** La direction ci-dessous est suffisamment précise pour guider une réalisation cohérente sans imposer un template générique.

### 5.1. Positionnement

**Univers :** atelier éditorial contemporain ; calme, élégant, curieux, lisible. **Motif dominant :** le chemin, ses nœuds, bifurcations et annotations explicatives. **Effet recherché :** compréhension immédiate et singularité visuelle modérée, non sur-stimulation.

### 5.2. Palette et Design Tokens proposés

| Rôle | Token conceptuel | Valeur indicative | Usage |
|---|---|---|---|
| Fond principal | `surface.canvas` | `#F7F6F1` | Toile ivoire de lecture |
| Surface élevée | `surface.card` | `#FFFFFF` | Contenus et choix |
| Texte principal | `text.primary` | `#20392F` | Titres et actions lisibles |
| Texte secondaire | `text.secondary` | `#5C6A64` | Aide et précisions |
| Action dominante | `action.primary` | `#225441` | CTA et progression active |
| Accent narratif | `accent.copper` | `#B65F37` | Bifurcation nouvelle, annotations ponctuelles |
| Ligne neutre | `border.soft` | `#D8DDD5` | Contours et étapes inactives |
| Erreur | `state.error` | `#A53432` | Message d'erreur et association au contrôle |
| Succès | `state.success` | `#226848` | Validation confirmée |

Valeurs indicatives **PROPOSED**, à contrôler avec contraste mesuré ; ne pas supposer qu'une combinaison passe WCAG avant audit. Le mode sombre est **OPTIONAL** et ne doit pas remplacer la qualité du mode principal.

### 5.3. Typographie, composition et rythme

- Titres éditoriaux de grande taille, contraste de police permis si les polices sont disponibles légalement ; fallback système déterministe et performant.
- Texte de corps sans-serif lisible ; échelle typographique interne cohérente ; taille de corps cible ≈16px, zoom à 200% vérifié.
- Desktop : colonne de tâche dominante et représentation du chemin lisible adjacente **si** cela sert la compréhension ; mobile : un seul flux, chemin vertical compact non bloquant.
- Maximum visuel d'une action principale par écran ; actions secondaires identifiées clairement.
- Espacements, rayons et ombres gérés par tokens ; pas de variations arbitraires entre pages.
- Ne pas simuler une carte géographique : la bifurcation est un repère causal, pas une décoration de fond.

### 5.4. Composants et états

Composants nécessaires : `GoalCard`, `StepNode`, `PreferenceToggle`, `ChangeExplanation`, `StepForm`, `Progress`, `SummaryItem`, `ActionButton`, `InlineError`. Ces noms sont conceptuels ; ils n'imposent pas un framework de composants.

Pour chaque composant interactif : Default, Hover (si pointeur), Focus-visible, Selected, Disabled (si justifié), Error et Success. Focus visible distinct de Hover ; erreur décrite par texte, pas seulement rouge ; statut de progression accompagné d'un libellé.

### 5.5. Illustration, iconographie et profondeur

- Une iconographie cohérente pour objectif/étape/conseil/validation ; jamais utilisée sans intitulé si son sens est crucial.
- Motifs filaires SVG sobres pour accompagner le changement de parcours, sans impact sur l'ordre de lecture ou la navigation clavier.
- Pas d'illustrations gratuites stock surdimensionnées ni de 3D coûteuse sans fonction ; images utiles libres de droits ou créations autorisées, avec alternative `alt` pertinente.
- Ombres et profondeur réservées à la hiérarchie et aux couches interactives ; pas de textures entravant la lecture.

### 5.6. Responsive et critères visuels

À **320 / 375 / 768 / 1440px** : aucune action principale inaccessible, pas de défilement horizontal critique, illustration du chemin non superposée aux labels, textes et formes non tronqués, ordre de lecture conservé. Le rendu devra être vérifié à 200% de zoom et avec le contenu de l'état le plus long (explication + erreur).

## 6. Motion Design et micro-interactions

**Les timings sont des spécifications internes proposées**, jamais des exigences officielles. Ne pas retarder artificiellement un clic ou l'affichage du résultat.

| ID | Trigger | Animation / feedback attendu | Utilité UX / créative | Timing indicatif | Priorité | `prefers-reduced-motion` | Test |
|---|---|---|---|---|---|---|---|
| M01 | Choix d'objectif | Passage visuel de « choix » à « chemin » ; nœud initial mis en évidence ; intitulé toujours visible | Rendre le parcours orienté objectif perceptible | 180–260 ms | Core polish | Changement instantané + texte | A03/A12 |
| **M02** | `Essentiel` → `Guidé` | **Apparition du nœud `Conseils complémentaires` et transition de ligne**, compteur recalculé ; encart « Pourquoi ce changement ? » | **Signature cause → effet** ; rendre l'adaptation explicite | 220–300 ms, sans attente bloquante | **Essential** | Nœud et message apparaissent immédiatement, sans animation | **A07/A15** |
| M03 | Retour ou révision | Mise en évidence de l'ancienne décision et nouvel état visible | Réversibilité sans perte de contexte | 120–220 ms | Essential feedback | Mise à jour instantanée | A08/A09 |
| M04 | `Guidé` → `Essentiel` | Retrait expliqué de l'étape facultative ; compteur et chemin corrigés | Éviter les disparitions mystérieuses | 180–260 ms | Essential | Retrait instantané + annonce | A07/A15 |
| M05 | Validation d'étape | Confirmation localisée, changement du nœud en « validé » | Feedback et progression | 120–200 ms | Core polish | Confirmation statique | A10 |
| M06 | Champ invalide | Message textuel à côté du champ + Focus pertinent, sans shake obligatoire | Corriger sans désorienter | Immédiat | Essential feedback | Identique sans mouvement | A06/A14 |
| M07 | Hover / focus | Contraste de bordure ou soulignement et focus ring visible | Affordance et clavier | 100–160 ms | Core polish | Changement instantané | A14 |
| M08 | Ouverture de Synthèse | Mise en évidence stable du résultat et de la capacité `Modifier` | Fermeture narrative du parcours | 180–250 ms | Core polish | Affichage instantané | A10 |
| M09 | Décor de ligne / repères secondaires | Ornement faible amplitude, jamais automatique en boucle infinie | Signature visuelle secondaire | <=250 ms | OPTIONAL | Supprimé | A12/A15 |

**Invariants :** aucune interaction importante exclusivement `hover` ; ne jamais animer le Focus vers un emplacement non pertinent ; pas de mouvement indispensable à la lecture ; ne pas jouer de transitions en boucle ; animation désactivable sans perte de contenu ni de sens. Vérifier sur appareil mobile modeste et en faible débit même si aucune donnée distante n'est nécessaire.

## 7. Parcours utilisateur complet

### 7.1. Scénario cible — démonstration synthétique PROPOSED

**Utilisateur :** personne souhaitant préparer sa participation à un atelier numérique fictif. **Départ :** application accessible localement ou sur URL publiée. **Objectif :** savoir quoi préparer et obtenir une liste de vérification. **Succès :** trois réponses requises validées et une synthèse conforme aux choix.

| Étape | Action utilisateur | Input | Comportement système | Retour visuel | Résultat attendu | Validation |
|---|---|---|---|---|---|---|
| U01 | Ouvrir le produit | — | Charger le catalogue configuré | Accueil avec objectif disponible | Pas de page vide | A01 |
| U02 | Choisir « Préparer ma participation à un atelier numérique » | `atelier-preparation` | Initialiser `SessionState` et `JourneyPlan` | Objectif marqué ; chemin initial visible | Étapes requises disponibles | A02/A03 |
| U03 | Déclarer son niveau | `debutant` | Valider et stocker la réponse | Nœud `niveau` validé | Progression cohérente | A04/A10 |
| U04 | Demander davantage de conseils | `accompagnement=guide` | Réévaluer `TransitionRule` | **Nœud « Conseils » ajouté + explication cause/effet** | Transformation comprise et réversible | **A07** |
| U05 | Parcourir le conseil facultatif | `lus` | Enregistrer la confirmation facultative | Feedback non bloquant | Peut poursuivre | A05 |
| U06 | Définir son support | `ordinateur` | Valider et conserver | Étape `support` validée | État exact | A04 |
| U07 | Vérifier les éléments de préparation | `pret` | Valider l'étape `verification` | Checklist complétée | 3/3 requis validés | A10 |
| U08 | Ouvrir la synthèse | — | Construire `Summary` depuis l'état courant | Liste des décisions, statut et adaptation | Aucune donnée inventée | A10 |
| U09 | Modifier l'accompagnement | `guide` → `essentiel` | Masquer `conseils` facultatif, ajuster le plan, expliquer le retrait | **Ligne raccourcie + changement expliqué** | Recalcul juste, requis conservés | A07/A08 |
| U10 | Revenir sur une réponse | `ordinateur` → `mobile` | Réviser l'étape pertinente | Focus localisé + synthèse mise à jour | Réponses non liées conservées | A09/A10 |

### 7.2. Variantes et récupération

- Aucun objectif : état vide explicatif **uniquement si le catalogue est réellement absent** ; ce cas ne constitue pas la démonstration attendue.
- Valeur invalide : ne pas avancer ; message au contrôle ; les réponses valides restent.
- Préférence inconnue ou règle incohérente : erreur contrôlée, aucune synthèse mensongère.
- Retour en première étape : aucune transition vers une étape inexistante.
- Réponse devenue invalide à la suite d'un changement : invalider explicitement la seule réponse concernée et expliquer pourquoi.
- Actualisation : fonctionnement en mémoire acceptable si la perte de session est explicite ; conservation locale = OPTIONAL, à documenter si réellement activée.

## 8. Pages, navigation et états

| Vue | But et contenu | Contrôles | États obligatoires à examiner | Règles UX |
|---|---|---|---|---|
| E01 `goal-selection` | Titre fort, valeur de l'expérience, objectif sélectionnable, aperçu du parcours | `Choisir`, `Commencer` | Initial, objectif choisi, erreur d'absence, vrai catalogue vide | Objectif compréhensible sans jargon |
| E02 `journey` | Étape, ligne vivante, progression, champ valide, préférence, explication de la modification | Input, Retour, Continuer, choix `Essentiel/Guidé` | Initial, sélection, changement de plan, validation, erreur, révision | **M02 visible en contexte**, étape requise jamais cachée |
| E03 `summary` | Objectif, niveau, support, checklist, accompagnement, statut, modifications | Modifier, Recommencer | Terminé, modification, incomplet protégé, nouvelle session | Fidélité des données, correction possible |

Pas de chargement artificiel pour les données locales. Si une animation donne une impression de chargement, elle ne doit pas simuler un processus absent. Le bouton Retour du navigateur et les liens profonds seront traités conformément au routage réellement retenu, sans promettre de routes qui n'existent pas.

## 9. Exigences fonctionnelles

Les critères ci-dessous sont des **spécifications**, non des rapports de réalisation.

| ID | Fonction et priorité | Entrées → traitement → sortie | Erreurs / dépendances | Critère d'acceptation |
|---|---|---|---|---|
| F01 | **Sélection objectif — Must internal** | Objective ID → initialiser session → plan | Objective absent/inconnu ; Catalogue | Un objectif réel visible dans l'application normale, sélection contrôlée |
| F02 | **Construire le plan — Must** | Objectif + préférences → moteur → étapes ordonnées | Règle incompatible ; Catalog valide | Résultat déterministe ; aucune étape requise masquée |
| F03 | **Afficher chemin/progrès — Must** | Plan + état → ligne, étapes et compteur | État non valide | Les nombres et nœuds correspondent toujours au plan |
| F04 | **Modifier préférence — Must** | `essentiel/guide` → réévaluation → plan mis à jour | Valeur invalide | `conseils` apparaît/disparaît ; requis préservés |
| F05 | **Expliquer effet — Must** | Plan avant/après → différence + raison → texte et mise en évidence | Aucune différence | Ne pas annoncer de changement fictif ; expliquer tout changement important |
| F06 | **Retour — Must** | Action Retour → état précédent → vue appropriée | Première étape | Réponses encore valides conservées ; pas de route cassée |
| F07 | **Révision — Must** | Réponse corrigée → recalcul dépendances → état/synthèse actualisés | Réponses incompatibles | Invalidation ciblée et expliquée ; autres réponses intactes |
| F08 | **Saisie et validation — Must** | Valeur autorisée → `AnswerRenderer` réel → SessionState | Absence de renderer, valeur inconnue, champ vide | Utilisation au clavier/souris ; bouton Continue actif quand valide |
| F09 | **Synthèse — Must** | État valide → Summary → récapitulatif | Session incomplète | Aucun état « terminé » si réponses requises manquantes |
| F10 | **Recommencer — Should** | Action explicite → vider session → E01 | Sauvegarde facultative | Aucune donnée ancienne réutilisée silencieusement |
| F11 | **Démonstration répétable — Must** | Dataset validé → parcours complet accessible | Catalogue vide, construction invalide | Nouvel utilisateur termine sans fixture de test |
| F12 | **Feedback et animation signature — Must internal** | Changement de préférence → M02/M04 | Mouvement réduit | Différence visible, expliquée, réversible avec ou sans animation |
| F13 | **États d'erreur — Must internal** | Erreur → message contextualisé → correction | Valeurs invalides | Pas de crash ni écran blanc, correction possible |
| F14 | **Conservation locale — OPTIONAL** | État → stockage → restitution | Stockage bloqué/corrompu | L'app fonctionne sans stockage ; résilience documentée |
| F15 | **Traces explicatives — Must internal** | Règles appliquées → explications de session | Règle sans motif | Explications conformes au changement réellement appliqué |
| F16 | **Accès au rendu — OFFICIAL delivery** | URL + GitHub + README → jury | Lien privé ou cassé | Contrôle d'accès indépendant réussi |

**Contrat précis des champs :** `Step` contient des métadonnées métier mais pas de schéma de saisie (constat de l'archive ZIP). Les champs concrets et leur lecture doivent être fournis par un `AnswerRenderer` ou un adaptateur explicitement défini. L'absence de renderer ne doit **jamais** être acceptée comme réussite de F08.

## 10. UX/UI et exigences non fonctionnelles

| ID | Domaine | Critère observable | Priorité et statut |
|---|---|---|---|
| N01 | Responsive | À 320, 375, 768, 1440px, tâches accessibles sans recouvrement/scroll horizontal critique | Should internal |
| N02 | Compréhension | Utilisateur identifie son prochain pas et explique le changement après M02 | Must internal (concept) |
| N03 | Clarté | Un CTA primaire identifiable, étapes titrées, erreurs près des champs | Should internal |
| N04 | Cohérence | Tokens identiques entre E01–E03, états communs et hiérarchie stable | Core polish |
| N05 | Clavier | Sélection, saisie, retour, révision, Synthèse entièrement réalisables sans souris | Should internal |
| N06 | Focus | `:focus-visible` observable et déplacement contrôlé après actualisation des étapes | Should internal |
| N07 | Information | Progression et adaptation compréhensibles sans couleur, animation ou icône seule | Must internal |
| N08 | Motion | `prefers-reduced-motion` n'enlève aucune fonction ni explication | Must internal |
| N09 | Contraste | Contrôles mesurés ; cible interne WCAG AA pour texte ordinaire 4.5:1 et UI non textuelle 3:1 si applicable | Should internal — pas certification |
| N10 | Performance | Pas de réseau indispensable pour la tâche ; pas de gel à chaque transition locale ; mesure avant prétention | Should internal |
| N11 | Stabilité | Erreurs gérées, pas d'écran blanc sur parcours, reset, révision, catalogue invalide | Must internal |
| N12 | Intégrité | Les réponses requises invalides empêchent la complétion et les règles ne cachent aucun requis | Must internal |
| N13 | Compatibilité | Tester au moins Chrome/Firefox mobile ou desktop selon appareils disponibles ; signaler les limites | Should internal |
| N14 | Données | Pas de collecte de données personnelles réelles ; contenu fictif clairement identifié | Must internal |
| N15 | Zoom | À 200% la navigation et le message M02 restent lisibles et manipulables | Should internal |

La source Hair'gonomie n'impose pas explicitement WCAG AA, ces cibles sont des objectifs internes vérifiables. Aucun audit externe ni conformité réglementaire globale ne sera affirmé sans preuve.

## 11. Architecture et choix technologiques

**TDR-001 : PROPOSED — conservation de l'architecture vérifiée dans l'instantané ZIP.**

| Couche | Choix proposé | Pourquoi | Obligation / risque |
|---|---|---|---|
| Application | TypeScript + DOM natif | Compatible avec les vues et contrôleurs de la base existante | Essential pour continuité |
| Dev/build | Vite | Déjà déclaré dans `package.json` | Essential dans projet existant |
| UI styling | CSS + `src/ui/tokens.css` | Centralisation des couleurs, états, layout, animations | Essential ; calibrer tokens au CDR |
| Motion | CSS transitions/animations ; Web Animations API si besoin précis | Réaliser M01–M09 sans surdépendance | Essential pour M02 mais bibliothèque externe non obligatoire |
| Domain | `Objective`, `Step`, `Preference`, `TransitionRule`, `SessionState`, `JourneyPlan` | Contrat typé observé | Essential, préserver invariants |
| Answer input | `AnswerRenderer` fourni à l'application et cohérent avec le contenu | Nécessaire pour F08 | **Dépendance critique** : vérifier câblage réel |
| Data | Catalogue local déterministe | Suffisant pour scénario fictif | Approbation du contenu requise |
| Backend/DB | Aucun | Pas de données partagées ni de comptes | Éviter complexité gratuite |
| Test | Vitest + Playwright + vérifications visuelles/manuelles | Scripts déjà déclarés ; E2E production indispensable | Tests non exécutés dans ce document |
| Deployment | Static hosting compatible Vite | Lien consultable exigé par R08 | Choix exact UNKNOWN |
| Repository | GitHub accessible | Exigence officielle R08 | URL UNKNOWN |

**Rejet de migration automatique** : React/Next.js ne résolvent pas les données absentes, le renderer non fourni ni l'absence d'animation signifiante. Three.js et GSAP ne sont pas des exigences ; les ajouter uniquement après besoin prouvé et décision explicite. **Approche de repli possible** : même stack avec mouvement CSS simplifié, mais M02 doit toujours communiquer la cause et l'effet.

**Vérifications de faisabilité à réaliser, sans prétendre les avoir exécutées :** compilation avec dépendances compatibles, chargement du catalogue approuvé, présence d'AnswerRenderer dans l'application normale, interaction M02 visible et réversible, tests Playwright sur version construite et test clavier.

## 12. Données, contenu et intégrations

### 12.1. Provenance et approbation

**Données métier réelles : UNKNOWN et non nécessaires à la démonstration proposée.** Le contenu ci-après est **SYNTHÉTIQUE / PROPOSED** pour une expérience fictive. Il doit être approuvé explicitement avant d'être traité comme données officielles du produit. Aucune invitation, réservation, certification ou atelier réel n'est annoncé.

### 12.2. Catalogue opérationnel minimal proposé

**Objective**
- `id`: `atelier-preparation`
- `titre`: « Préparer ma participation à un atelier numérique »
- `description`: « Clarifier mes besoins et vérifier ma préparation pour une activité numérique fictive. »

**Preference**
- `id`: `accompagnement`
- `valeur` (défaut): `essentiel`
- `valeurs`: `essentiel`, `guide`
- `description`: « Niveau d'accompagnement dans le parcours »
- Labels UI: `Essentiel — aller à l'essentiel`, `Guidé — afficher aussi des conseils complémentaires`.

**Steps / contenus / réponses**

| `id` | `objectiveId` | `ordre` | `requis` | Titre et contenu affiché | Contrôle d'entrée | Valeurs autorisées |
|---|---|---:|---|---|---|---|
| `niveau` | `atelier-preparation` | 10 | true | « Mon niveau » — « Quel est votre niveau de confiance avec les outils numériques ? » | Radio / select à choix unique | `debutant` (« Débutant »), `autonome` (« Autonome ») |
| `conseils` | `atelier-preparation` | 20 | false | « Conseils complémentaires » — « Prévoyez un espace calme ; vérifiez l'autonomie de votre appareil. » | Case de confirmation non bloquante | `lus` (« J'ai lu ces conseils ») |
| `support` | `atelier-preparation` | 30 | true | « Mon support de travail » — « Quel appareil comptez-vous utiliser ? » | Radio / select à choix unique | `ordinateur` (« Ordinateur »), `mobile` (« Smartphone ») |
| `verification` | `atelier-preparation` | 40 | true | « Ma checklist » — « Avez-vous vérifié votre support et vos informations pratiques ? » | Radio à choix unique | `pret` (« Oui, je suis prêt »), `a_revoir` (« J'ai des éléments à revoir ») |

**TransitionRule**
- `id`: `masquer-conseils-en-mode-essentiel`
- `condition`: `preference_equals` — `preferenceId=accompagnement`, `value=essentiel`.
- `stepIds`: `conseils`.
- `effect`: `step_visibility(false)`.
- `explication`: « Vous avez choisi le parcours essentiel : les conseils complémentaires sont masqués, mais les étapes nécessaires restent accessibles. »
- Lorsque la condition n'est pas satisfaite (`guide`), l'étape facultative `conseils` est visible ; explication UI complémentaire : « Avec le parcours guidé, des conseils complémentaires s'ajoutent pour vous accompagner. » Le moteur existant devra déterminer/commenter ce cas sans attribuer une explication de règle non appliquée ; test A07 obligatoire.

### 12.3. Invariants et résultats attendus

- Trois étapes obligatoires : `niveau`, `support`, `verification`. Elles ne disparaissent jamais.
- `conseils` facultative n'empêche pas de terminer ; elle ne doit pas être comptée parmi les trois étapes requises.
- En mode `essentiel`, liste visible `niveau → support → verification`.
- En mode `guide`, liste visible `niveau → conseils → support → verification`.
- Un changement de mode recalcule l'indicateur sans déclarer invalide une réponse requise indépendante.
- Le résultat `completed` est vrai **seulement si** les trois étapes requises possèdent des réponses autorisées.
- Dans la synthèse : objectif, niveau, support, checklist, préférence, état d'achèvement, explication d'adaptation si applicable ; ne jamais afficher une confirmation d'inscription à un atelier réel.

### 12.4. Exemple de résultat complet attendu

**Entrées de démonstration :** `objectif=atelier-preparation`, `niveau=debutant`, `accompagnement=guide`, `conseils=lus`, `support=ordinateur`, `verification=pret`.

**Sortie attendue :** Synthèse indiquant « Préparer ma participation à un atelier numérique », « Débutant », « Guidé », « Conseils consultés », « Ordinateur », « Prêt », et « 3/3 étapes requises validées ». Le message d'adaptation doit identifier la présence des conseils liée au mode Guidé. Exemple de résultat attendu **non observé/testé ici**.

### 12.5. Relation avec l'architecture existante

Le `Step` existant ne décrit pas le type de contrôle utilisateur. Un **contrat de rendering complémentaire** (configuration typée par Step ID ou équivalent explicitement documenté) est donc nécessaire. Il doit fournir pour chaque champ : label, type, valeurs autorisées, lecture de la valeur, validation, association d'erreurs et reprise d'une réponse. **Ne pas supposer que `AnswerRenderer` déduit ces éléments de `Step.titre`.** L'absence de renderer opérationnel empêche la démonstration même si les tableaux sont remplis.

### 12.6. Stockage et intégrations

Fonctionnement initial en mémoire ; `localStorage` facultatif, avec traitement d'échec et de session corrompue. Aucune API externe, aucun compte, aucune base de données, aucun appel AI obligatoire. L'application doit rester utilisable quand un stockage facultatif est inaccessible.

## 13. Critères d'acceptation et preuves

**Statut initial de tous les tests : NOT RUN.** Ces tests devront être exécutés sur l'application réellement lancée, puis sur sa build et, au stade de soumission, sur son URL publique. Un fixture Playwright seul ne prouve pas la complétude du contenu livré.

| ID | Requirement | Test | Préconditions | Action | Résultat attendu | Preuve à collecter |
|---|---|---|---|---|---|---|
| A01 | F01/F11/R04 | Accueil réellement alimenté | Catalogue proposé approuvé et chargé normalement | Ouvrir l'application sans harness | Objectif présent ; pas « Aucun objectif disponible » | Capture + URL + configuration exacte |
| A02 | F02/N12 | Cohérence du catalogue | Même dataset | Valider objectif et règles | IDs, références et `requis` valides | Résultat validator |
| A03 | F01/F03/M01 | Début d'un parcours | Session neuve | Choisir l'objectif | Le chemin apparaît, position visible, action possible | Vidéo/capture brève |
| A04 | F08 | Vraie saisie | Renderer branché | Choisir `debutant`, avancer | Valeur saisie et conservée, aucune action bloquée | Parcours navigateur normal |
| A05 | F08 | Étape facultative | Mode `guide` | Consulter/ignorer `conseils` | Pas de blocage ; 3 requis restent le dénominateur | Capture + test |
| A06 | F08/F13 | Validation erreur | Champ requis vide/invalide | Cliquer Continuer | Message spécifique et focus approprié, sans perte de saisie | Capture + trace |
| **A07** | **F04/F05/F12/M02/M04/R01–R05** | **Signature créative cause → effet** | Données réelles de démonstration | Passer `essentiel` → `guide` → `essentiel` | **Nœud facultatif et compteur changent, raison visible, retour fonctionnel** ; texte toujours présent sans mouvement | **Enregistrement court + captures avant/après + test réduit-motion** |
| A08 | F02/F06/N12 | Conservation des requis | Les deux modes | Alterner et revenir | 3 requis jamais cachés, progression cohérente | Test invariant |
| A09 | F07 | Modifier réponse | Réponses déjà validées | Changer support puis revenir | Synthèse reflète le nouveau support, autres réponses valides conservées | Test E2E |
| A10 | F09/M05/M08 | Achever la tâche | Trois réponses valides | Ouvrir synthèse | 3/3 requis, données exactes, aucune fausse inscription | Capture synthèse |
| A11 | F01/F02/R04 | Fallback documenté | Variante simplifiée décidée | Suivre trajet fixe | Tâche complète, originalité/écarts explicités | Trace de décision + test |
| A12 | CDR-01/M01/M09 | Narration visuelle | UI en desktop/mobile | Observer progression et changement | Le chemin sert d'indicateur utile, pas d'arrière-plan gratuit | Captures comparables |
| A13 | CDR-02/N04 | Cohérence visuelle | Tokens approuvés | Comparer E01–E03 et états | Palette/typo/composants cohérents et lisibles | Planche de captures, revue |
| A14 | M06/M07/N05/N06/N09 | Clavier/erreur/focus | Navigateur ouvert | Parcours au clavier, invalidation | Focus visible, contrôles accessibles, erreurs lisibles | Checklist clavier + résultats contrastes |
| A15 | M02/N08 | Reduced motion | `prefers-reduced-motion: reduce` | Changer de mode et finir | Aucun sens perdu ; pas de mouvement nécessaire | Capture/vidéo reduced-motion |
| A16 | N01/N15 | Responsive/zoom | Viewports 320,375,768,1440 ; zoom 200% | Parcours + erreur + explication | Pas de contenu/CTA critique masqué | Série de captures |
| A17 | N10/N11 | Robustesse | Build locale et navigateur | Relancer, invalider, recommencer | Pas d'écran blanc, pas de runtime error bloquante | Console + logs + rapport |
| A18 | TDR-001 | Build et tests | Dépendances cohérentes | Typecheck, build, tests pertinents | Résultats effectifs consignés ; erreurs résolues ou déclarées | Logs complets horodatés |
| A19 | R05/R07 | Argumentaire ergonomique | README rédigé | Examiner problème/choix/priorités/compromis/inspirations | Les cinq aspects présents et reliés au résultat réel | Extraits du README |
| A20 | R08/F16 | Rendu final | Publication autorisée | Ouvrir GitHub et URL dans session indépendante | Sources + README accessibles, app utilisable | Liens testés + capture indépendante |

**Évaluation de compréhension interne recommandée :** 3 utilisateurs extérieurs à l'équipe, une tâche identique, sans expliquer au préalable le mécanisme adaptatif. Leur demander « Qu'est-ce qui a changé ? Pourquoi ? Comment revenir ? ». Mesurer réussite et hésitations sans prétention de significativité statistique. Comparer si possible à un parcours conventionnel et publier les observations réelles, y compris négatives. Aucun effet positif n'est promis avant mesure.

## 14. Preuves pour le jury

| Objectif de preuve | Critères associés | Preuve prévue | Précaution |
|---|---|---|---|
| Innovation ergonomique | R01–R04, A07 | Interaction-signature rejouable ; screenshots avant/après ; courte explication | Ne pas confondre beauté et amélioration |
| Valeur utilisateur | R05, A07/A19 | Problème, hypothèse, observations de compréhension | Ne pas inventer métriques |
| Direction artistique | R02/R06, A12/A13 | Identité visuelle, states et cohérence des écrans | Ne pas prétendre que la palette est officielle |
| Motion pertinent | R02/R03, A07/A15 | Trigger, animation fonctionnelle, alternative reduced-motion | Aucun élément important uniquement animé |
| Fonctionnalité | R04, A01–A10 | Parcours utilisable, logs de test et données exactes | Test sur application normale et non fixture seule |
| Responsive et a11y interne | N01/N05/N08, A14–A16 | Contrôles clavier, zoom, captures, résultats accessibles | Pas de certification WCAG implicite |
| Explication ergonomique | R05/R07/R08, A19 | Note : priorités, compromis, inspirations, problèmes et valeur | Texte final reflète le produit réalisé |
| Livraison | R08, A20 | URL de rendu + GitHub + `READ.ME` | URLs à confirmer et tester |

Une vidéo courte peut aider le jury à voir le changement avant/après, mais **elle n'est pas officiellement imposée par le document Hair'gonomie fourni**.

## 15. Risques, compromis et simplifications

| Risque | Impact | Signal d'alerte | Mitigation / simplification | Re-test |
|---|---|---|---|---|
| Domaine fictif peu convaincant | Réduit valeur de l'innovation | Utilisateur ne voit pas l'intérêt | Clarifier contexte ; garder une seule tâche et preuve de causalité | Compréhension utilisateur |
| Effet « simple formulaire » | Faible différenciation Hair'gonomie | Préférence change seulement du texte caché | Rendre visible le nœud, la bifurcation et la justification M02 | A07 |
| Sur-animation | Confusion / lenteur | Utilisateur attend, perd focus ou lit mal | Couper M09, raccourcir transitions ; garder M02 informative | A14/A15 |
| Accessibilité du chemin | Fonction clé inaccessible | Changement visible par couleur seule | Annonce textuelle + structure DOM correcte | A14/A15 |
| Règles incohérentes | Synthèse fausse | Requis masqués ou valeurs perdues | Une règle de visibilité simple ; invariants stricts | A02/A08/A09 |
| Données vides | Produit inutilisable | `Aucun objectif disponible` au lancement normal | Dataset approuvé lié au vrai boot | A01 |
| Champs absents | Bouton Continue désactivé | `AnswerRenderer` non branché | Vérifier rendu des quatre Steps, pas seulement moteurs | A04/A06 |
| Dépendance trop complexe | Délais et régressions | Ajout de framework sans besoin | DOM/TypeScript existants, CSS pour motion | A17/A18 |
| Esthétique incohérente | Perte de crédibilité | Écrans/états sans tokens partagés | CDR et revue visuelle cohérente | A13/A16 |
| Documentation insuffisante | R07/R08 non satisfait | README vide ou générique | Écrire la note sur le parti pris réellement exécuté | A19 |
| Lien privé ou cassé | R08 non satisfait | Juré ne peut ouvrir le rendu | Test depuis session indépendante | A20 |

**Réduction acceptable :** un objectif, une préférence, une règle, quatre Steps maximum, un seul motif de chemin et des animations CSS sobres. **Réduction non acceptable sans changement formel de concept :** supprimer toute cause/effet visible, supprimer les explications, laisser l'interface vide, sacrifier les requis, présenter un simple wizard comme innovation adaptative achevée.

## 16. Livrables

**Obligatoires selon le document Hair'gonomie :**

- **L01 — GitHub :** dépôt du projet accessible au jury.
- **L02 — Lien du rendu :** URL consultable depuis un navigateur indépendant.
- **L03 — `READ.ME` / README :** justifications du parti pris ergonomique, problème et valeur ; référence claire vers le rendu.
- **L04 — Courte note ergonomique :** priorités, compromis, inspirations. Peut être incluse comme section autonome dans README si facilement repérable.

**Recommandés en interne, non exigés explicitement :**

- **L05 — Tests :** rapport de tests (fonctions, Responsive, clavier, reduced motion, build) avec statut réel.
- **L06 — Demonstration evidence :** captures et éventuellement une courte vidéo M02 ; non obligatoire par la source.
- **L07 — CDR/TDR :** décisions approuvées et écarts justifiés pour AI Speaking Driver.

Le fait que l'équipe conserve provisoirement son travail en local ne suffit pas à satisfaire R08 **au moment d'une soumission réelle** ; il ne s'agit pas pour autant d'un échec de sa phase actuelle de test local.

## 17. Hypothèses et décisions ouvertes

| ID | Élément | Statut | Responsable de la décision | Impact | Résolution attendue |
|---|---|---|---|---|---|
| H01 | Scénario atelier numérique comme sujet définitif | **PROPOSED** | Équipe | Valeur et contenu | Approuver ou remplacer par une tâche réelle complète |
| H02 | Dataset synthétique du §12 | **PROPOSED** | Équipe | Parcours fonctionnel | Approuver champs, valeurs, textes, finalité |
| H03 | Le Chemin Vivant comme concept de base | **APPROVED dans l'échange**, détails à valider | Équipe | Signature créative | Conserver et approuver M02/CDR |
| H04 | Direction artistique CDR-001 | **PROPOSED** | Équipe | Identité visuelle | Valider palette, typographie, composition |
| H05 | Stack TDR-001 | **PROPOSED** ; base ZIP vérifiée | Équipe / responsable technique | Mise en œuvre | Approuver continuité TypeScript/DOM/Vite |
| H06 | Détail des compétences et outils des trois personnes | **UNKNOWN** | Équipe | Faisabilité | Établir ce que chacun maîtrise |
| H07 | Texte du Défi Principal / obligation d'intégration éventuelle | **UNKNOWN** | Équipe / organisateur | Éligibilité si applicable | Vérifier avant participation réelle |
| H08 | URL de déploiement et GitHub | **UNKNOWN** | Équipe | Restitution officielle | Fournir et tester au moment approprié |
| H09 | Version actuelle du projet par rapport au ZIP historique | **UNKNOWN** | Équipe | Tests/migration | Ne pas confondre ZIP et modifications ultérieures |
| H10 | Résultats de tests complets sur la version finale | **UNKNOWN** | Équipe / QA | Acceptation | Exécuter A01–A20 et conserver preuves |
| H11 | Autorisation de participer à une édition avec ce défi historique | **UNKNOWN** | Organisateur | Éligibilité | Vérifier si participation officielle envisagée |

**Décisions bloquantes pour déclarer une spécification finale entièrement approuvée :** H01/H02/H05 et éléments de compétence pertinents de H06. Les autres restent à clarifier selon le jalon concerné ; aucune décision inconnue n'est convertie silencieusement en approbation.

## 18. Contrat de transmission vers AI Speaking Driver

**Document de référence :** le présent Cahier des charges V3.0, seulement après validation de ses décisions `PROPOSED`. Aucune version antérieure contradictoire ne prévaut sur une décision explicitement approuvée ; conserver l'historique des écarts.

**Contenu du paquet de transmission :**

1. Version autoritaire du Cahier des charges.
2. R01–R08 et source PDF p.1.
3. Concept Le Chemin Vivant et table de traçabilité Card 03 → Card 04.
4. CDR-001 approuvé (ou adaptations explicites).
5. TDR-001 approuvé et description de l'architecture réellement conservée.
6. Scénario `U01–U10` approuvé.
7. Dataset complet §12 approuvé et contrat `AnswerRenderer`.
8. F01–F16, M01–M09, N01–N15.
9. Tests A01–A20, critères de preuve et statuts **NOT RUN** jusqu'à exécution.
10. Livraison L01–L04, exclusions, risques et décisions ouvertes H01–H11.

**Règles imposées aux agents OpenCode/Codex :**

- Ne pas changer le concept Card 03, CDR, TDR, les IDs de traçabilité ou les conditions officielles sans décision documentée.
- Ne pas confondre travail de style et réalisation de la signature créative M02.
- Ne pas « simplifier » l'identité visuelle approuvée en template générique ou supprimer le mouvement essentiel sans raison UX/a11y expliquée et accord.
- Ne pas inventer de données réelles ; ne pas attribuer une source réelle au dataset synthétique.
- Ne pas déclarer le parcours achevé avec des tableaux de production vides, un `AnswerRenderer` absent ou une Synthèse impossible à atteindre.
- Ne pas considérer des tests sur fixtures comme une preuve de la version réellement démarrée.
- Ne pas annoncer des résultats PASS sans logs et vérification observable.
- Ne pas remplacer la stack par un autre framework en l'absence d'une décision de migration autorisée.
- Ne pas confondre un arrêt temporaire demandé par l'équipe pour tester en local avec une défaillance de livraison ; la planification des phases relève de l'AI Speaking Driver et de l'équipe.
- Ne pas publier, soumettre, changer de phase ou créer des livrables supplémentaires sans les autorisations appropriées de l'équipe.
- Reporter tout écart et toute dépendance critique ; si une approbation est nécessaire, présenter l'option et ses conséquences plutôt que choisir silencieusement.

**Critère de passation :** chaque exigence essentielle possède un propriétaire dans le flux de travail, une preuve attendue et un test identifié. Le flux d'agents peut organiser ses phases indépendamment ; il ne peut ni abaisser les critères ni proclamer une conformité non vérifiée.

---

# الخلاصة العربية للتسليم — 10 أسطر

1. المرجع هو Hair'gonomie ونصه الفرنسي محفوظ بلا تغيير في الالتزامات.
2. المشروع هو Le Chemin Vivant، والمسار المتكيف القابل للفهم هو قلب الفكرة.
3. موضوع الورشة الرقمية مثال تشغيلي مكتمل **مقترح** وليس قرارًا نهائيًا مثبتًا.
4. تم تحديد هدف واحد وأربع خطوات وتفضيل وقاعدة تأثير وSynthèse متسقة.
5. التفاعل المميز M02 يوضح **الاختيار → تغير المسار → السبب → الرجوع**.
6. الهوية المقترحة Premium/Editorial تستخدم ivory وdeep green وcopper بتبرير واضح.
7. الحركات والتفاعلات مكتوبة بالمحفزات والنتائج وبدائل Reduced Motion.
8. التقنية المقترحة تحافظ على TypeScript + DOM + Vite ولا تضيف Backend بلا ضرورة.
9. تم ربط المتطلبات والوظائف والجماليات باختبارات A01–A20 دون اختلاق نتائج.
10. الملف جاهز للمراجعة والاعتماد، لا يعني أن التطبيق بُني أو اختُبر أو نُشر.

# قائمة التحقق العربية

- [x] متطلبات Hair'gonomie الأصلية R01–R08 مع مصدر الصفحة.
- [x] تتبع Card 03 → Card 04 وربط الفكرة الإبداعية بالتفاعل والاختبارات.
- [x] رحلة كاملة وداتا تجريبية مفصلة وقابلة للتنفيذ نظريًا.
- [x] Direction artistique وMotion Design بمعايير قابلة للفحص.
- [x] توافق TDR مع بنية ZIP وعدم فرض Framework جديد.
- [x] توثيق الحالات الفارغة والأخطاء وResponsive وAccessibility.
- [x] تعريف الاختبارات وأدلة التحكيم والتسليم الرسمية.
- [ ] موافقة الفريق الصريحة على السيناريو والداتا والهوية والـTDR.
- [ ] تشغيل A01–A20 على النسخة المعتمدة وإرفاق النتائج الفعلية.
- [ ] التحقق من إتاحة التحدي وروابط التسليم عند المشاركة الفعلية.

**FINAL READINESS STATUS: `CONDITIONALLY READY — APPROVAL REQUIRED`**  
سبب الحالة: المواصفات التشغيلية والتصميمية مكتملة بدرجة تسمح بمراجعة قرار الفريق، لكن H01/H02/H04/H05 تحتاج موافقة، ومهارات الفريق ونسخة التطبيق الحالية لا تزال جزئيًا غير مؤكدة. هذا **حكم على الوثيقة المقترحة**، لا إعلان عن اكتمال مشروع برمجي أو اجتياز اختبارات.
