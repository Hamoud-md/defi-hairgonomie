import type { AnswerFields } from "../data/demo-fields"
import type { ErrorCode, JourneyCatalog, Objective, Preference, Step, TransitionRule } from "../domain/models"
import type { Labels } from "./copy"

export type SupportedLanguage = "fr" | "en" | "ar"

const STORAGE_LANG_KEY = "le-chemin-vivant.lang"

let currentLanguage: SupportedLanguage = "fr"
const listeners = new Set<(lang: SupportedLanguage) => void>()

export function getLanguage(): SupportedLanguage {
  return currentLanguage
}

export function setLanguage(lang: SupportedLanguage): void {
  if (lang !== "fr" && lang !== "en" && lang !== "ar") return
  if (currentLanguage === lang) return
  currentLanguage = lang
  try {
    localStorage.setItem(STORAGE_LANG_KEY, lang)
  } catch {
    // Ignore storage issues
  }
  updateDocumentDirection(lang)
  for (const listener of listeners) {
    try {
      listener(lang)
    } catch {
      // Ignore listener error
    }
  }
}

export function onLanguageChange(listener: (lang: SupportedLanguage) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

export function initLanguage(): SupportedLanguage {
  try {
    const saved = localStorage.getItem(STORAGE_LANG_KEY)
    if (saved === "en" || saved === "ar" || saved === "fr") {
      currentLanguage = saved
    }
  } catch {
    currentLanguage = "fr"
  }
  updateDocumentDirection(currentLanguage)
  return currentLanguage
}

function updateDocumentDirection(lang: SupportedLanguage): void {
  if (typeof document === "undefined") return
  document.documentElement.lang = lang
  document.documentElement.dir = lang === "ar" ? "rtl" : "ltr"
}

export interface CopyContent {
  readonly brand: string
  readonly eyebrow: string
  readonly skip: string
  readonly goal: string
  readonly goalIntro: string
  readonly objectiveLegend: string
  readonly start: string
  readonly journey: string
  readonly summary: string
  readonly emptyTitle: string
  readonly emptyBody: string
  readonly emptyTag: string
  readonly emptyHint: string
  readonly errorTitle: string
  readonly retry: string
  readonly back: string
  readonly firstStep: string
  readonly continue: string
  readonly preferences: string
  readonly preference: string
  readonly step: string
  readonly required: string
  readonly missingFields: string
  readonly missingFieldsBody: string
  readonly updated: string
  readonly adaptations: string
  readonly history: string
  readonly invalidated: string
  readonly savedAnswers: string
  readonly revise: string
  readonly revision: string
  readonly save: string
  readonly cancel: string
  readonly modify: string
  readonly restart: string
  readonly confirm: string
  readonly dialogTitle: string
  readonly dialogBody: string
  readonly complete: string
  readonly decisions: string
  readonly viewSummary: string
  readonly sessionNote: string
  readonly noDecisions: string
  readonly restoring: string
  readonly restoringBody: string
  readonly restored: string
  readonly invalidSaved: string
  readonly storageUnavailable: string
  readonly pendingSave: string
  readonly initialTitle: string
  readonly views: Record<"goal-selection" | "journey" | "summary", string>
  readonly changes: Record<"step_order" | "step_visibility" | "answer_invalidated", string>
  readonly visible: string
  readonly hidden: string
  readonly from: string
  readonly to: string
  readonly demoNote: string
  readonly viewStepsLabel: string
  readonly pathAriaLabel: string
  readonly pathCalloutAriaLabel: string
  readonly openStep: string
  readonly stepAdded: string
  readonly stepRemoved: string
  readonly viewStep: string
  readonly undoReturnTo: string
  readonly currentAnswer: string
  readonly statusDone: string
  readonly statusCurrent: string
  readonly statusTodo: string
  readonly statusRequired: string
  readonly statusOptional: string
  readonly statusAdded: string
  readonly statusRevising: string
  formatStepProgress: (current: number, total: number) => string
  formatPathCount: (done: number, required: number, total: number) => string
  formatPreviewMeta: (required: number, optional: number) => string
  formatSummaryCompletion: (completed: number, total: number) => string
}

export const translations: Record<SupportedLanguage, CopyContent> = {
  fr: {
    brand: "Le Chemin Vivant",
    eyebrow: "Navigation par objectif",
    skip: "Aller au contenu",
    goal: "Choisissez votre objectif",
    goalIntro: "Sélectionnez un objectif pour commencer votre parcours.",
    objectiveLegend: "Quel est votre objectif ?",
    start: "Commencer",
    journey: "Votre parcours",
    summary: "Votre synthèse",
    emptyTitle: "Aucun objectif disponible",
    emptyBody: "Le catalogue est vide pour le moment. Aucun parcours ne peut encore être démarré.",
    emptyTag: "Catalogue en attente",
    emptyHint: "Les objectifs et leurs étapes apparaîtront ici lorsque le contenu sera fourni.",
    errorTitle: "Le parcours ne peut pas être affiché",
    retry: "Réessayer",
    back: "Retour",
    firstStep: "Vous êtes à la première étape.",
    continue: "Continuer",
    preferences: "Préférences",
    preference: "Préférence",
    step: "Étape",
    required: "Étape requise",
    missingFields: "Les champs de cette étape ne sont pas encore définis.",
    missingFieldsBody: "Le contenu de réponse doit être fourni pour poursuivre cette étape.",
    updated: "Réponse mise à jour.",
    adaptations: "Ce qui a changé",
    history: "Historique des adaptations",
    invalidated: "Réponses à corriger",
    savedAnswers: "Vos réponses enregistrées",
    revise: "Modifier cette réponse",
    revision: "Corriger une réponse",
    save: "Enregistrer la correction",
    cancel: "Annuler",
    modify: "Modifier",
    restart: "Recommencer",
    confirm: "Confirmer et recommencer",
    dialogTitle: "Recommencer le parcours ?",
    dialogBody: "Vos réponses et préférences seront effacées. Vous pourrez ensuite choisir un nouvel objectif.",
    complete: "Parcours terminé",
    decisions: "Vos décisions",
    viewSummary: "Voir la synthèse",
    sessionNote: "Sans compte · reprise locale facultative.",
    noDecisions: "Aucune réponse à présenter.",
    restoring: "Reprise de la session",
    restoringBody: "Vérification de la sauvegarde locale.",
    restored: "Votre session a été reprise sur cet appareil.",
    invalidSaved: "La sauvegarde ne peut pas être reprise. Vous pouvez démarrer un nouveau parcours.",
    storageUnavailable: "La sauvegarde locale est indisponible. Vous pouvez poursuivre dans cet onglet.",
    pendingSave: "Des réponses restent à corriger. La reprise locale sera disponible après correction ; votre parcours reste dans cet onglet.",
    initialTitle: "Le Chemin Vivant",
    views: {
      "goal-selection": "Objectif",
      journey: "Parcours",
      summary: "Synthèse",
    },
    changes: {
      step_order: "Ordre",
      step_visibility: "Visibilité",
      answer_invalidated: "Réponse à corriger",
    },
    visible: "Visible",
    hidden: "Masquée",
    from: "Avant",
    to: "Après",
    demoNote: "Démonstration : terminer ce parcours n’effectue aucune inscription ni réservation, et aucune donnée n’est envoyée.",
    viewStepsLabel: "Vues du parcours",
    pathAriaLabel: "Votre chemin",
    pathCalloutAriaLabel: "Ce qui a changé sur votre chemin",
    openStep: "Ouvrir l'étape",
    stepAdded: "Étape ajoutée",
    stepRemoved: "Étape retirée",
    viewStep: "Consulter",
    undoReturnTo: "Annuler : revenir à",
    currentAnswer: "Réponse actuelle",
    statusDone: "validée",
    statusCurrent: "en cours",
    statusTodo: "à faire",
    statusRequired: "requise",
    statusOptional: "facultative",
    statusAdded: "ajoutée",
    statusRevising: "en révision",
    formatStepProgress: (current, total) => `Étape ${current} sur ${total}`,
    formatPathCount: (done, required, total) => `${done} / ${required} étapes requises validées · ${total} étapes au total`,
    formatPreviewMeta: (required, optional) =>
      `${required} étapes essentielles${optional > 0 ? ` · +${optional} branche guidée facultative` : ""}`,
    formatSummaryCompletion: (completed, total) => `${completed} / ${total} étapes requises validées`,
  },

  en: {
    brand: "The Living Path",
    eyebrow: "Goal-driven navigation",
    skip: "Skip to content",
    goal: "Choose your goal",
    goalIntro: "Select a goal to start your journey.",
    objectiveLegend: "What is your goal?",
    start: "Start",
    journey: "Your journey",
    summary: "Your summary",
    emptyTitle: "No goals available",
    emptyBody: "The catalog is currently empty. No journey can be started yet.",
    emptyTag: "Catalog pending",
    emptyHint: "Goals and their steps will appear here once content is provided.",
    errorTitle: "The journey cannot be displayed",
    retry: "Retry",
    back: "Back",
    firstStep: "You are at the first step.",
    continue: "Continue",
    preferences: "Preferences",
    preference: "Preference",
    step: "Step",
    required: "Required step",
    missingFields: "Fields for this step are not yet defined.",
    missingFieldsBody: "Answer content must be provided to continue this step.",
    updated: "Answer updated.",
    adaptations: "What changed",
    history: "Adaptation history",
    invalidated: "Answers to correct",
    savedAnswers: "Your saved answers",
    revise: "Edit this answer",
    revision: "Correct an answer",
    save: "Save correction",
    cancel: "Cancel",
    modify: "Edit",
    restart: "Restart",
    confirm: "Confirm and restart",
    dialogTitle: "Restart the journey?",
    dialogBody: "Your answers and preferences will be cleared. You can then choose a new goal.",
    complete: "Journey completed",
    decisions: "Your decisions",
    viewSummary: "View summary",
    sessionNote: "No account required · optional local resume.",
    noDecisions: "No answers to display.",
    restoring: "Resuming session",
    restoringBody: "Checking local backup.",
    restored: "Your session was resumed on this device.",
    invalidSaved: "Backup cannot be resumed. You can start a new journey.",
    storageUnavailable: "Local storage is unavailable. You can continue in this tab.",
    pendingSave: "Some answers still need correction. Local resume will be available after correction; your journey continues in this tab.",
    initialTitle: "The Living Path",
    views: {
      "goal-selection": "Goal",
      journey: "Journey",
      summary: "Summary",
    },
    changes: {
      step_order: "Order",
      step_visibility: "Visibility",
      answer_invalidated: "Answer to correct",
    },
    visible: "Visible",
    hidden: "Hidden",
    from: "Before",
    to: "After",
    demoNote: "Demonstration: completing this journey does not perform any booking or registration, and no data is sent.",
    viewStepsLabel: "Journey views",
    pathAriaLabel: "Your path",
    pathCalloutAriaLabel: "What changed on your path",
    openStep: "Open step",
    stepAdded: "Step added",
    stepRemoved: "Step removed",
    viewStep: "View",
    undoReturnTo: "Undo: return to",
    currentAnswer: "Current answer",
    statusDone: "completed",
    statusCurrent: "in progress",
    statusTodo: "to do",
    statusRequired: "required",
    statusOptional: "optional",
    statusAdded: "added",
    statusRevising: "in revision",
    formatStepProgress: (current, total) => `Step ${current} of ${total}`,
    formatPathCount: (done, required, total) => `${done} / ${required} required steps completed · ${total} steps in total`,
    formatPreviewMeta: (required, optional) =>
      `${required} essential steps${optional > 0 ? ` · +${optional} optional guided branch` : ""}`,
    formatSummaryCompletion: (completed, total) => `${completed} / ${total} required steps completed`,
  },

  ar: {
    brand: "المسار الحي",
    eyebrow: "التنقل الموجَّه بالهدف",
    skip: "الانتقال إلى المحتوى",
    goal: "اختر هدفك",
    goalIntro: "حدد هدفاً لبدء مسارك الشخصي.",
    objectiveLegend: "ما هو هدفك؟",
    start: "ابدأ المسار",
    journey: "مسارك",
    summary: "ملخصك",
    emptyTitle: "لا توجد أهداف متاحة",
    emptyBody: "الكتالوج فارغ حالياً. لا يمكن بدء أي مسار في الوقت الحالي.",
    emptyTag: "الكتالوج قيد الانتظار",
    emptyHint: "ستظهر الأهداف وخطواتها هنا فور توفر المحتوى.",
    errorTitle: "تعذر عرض المسار",
    retry: "إعادة المحاولة",
    back: "رجوع",
    firstStep: "أنت في الخطوة الأولى.",
    continue: "متابعة",
    preferences: "التفضيلات",
    preference: "تفضيل",
    step: "الخطوة",
    required: "خطوة مطلوبة",
    missingFields: "حقول هذه الخطوة غير محددة بعد.",
    missingFieldsBody: "يجب تقديم نموذج الإجابة لمتابعة هذه الخطوة.",
    updated: "تم تحديث الإجابة.",
    adaptations: "ما الذي تغير",
    history: "سجل التكيفات",
    invalidated: "إجابات تحتاج إلى تصحيح",
    savedAnswers: "إجاباتك المحفوظة",
    revise: "تعديل هذه الإجابة",
    revision: "تصحيح إجابة",
    save: "حفظ التصحيح",
    cancel: "إلغاء",
    modify: "تعديل",
    restart: "إعادة البدء",
    confirm: "تأكيد وإعادة البدء",
    dialogTitle: "إعادة بدء المسار؟",
    dialogBody: "سيتم مسح إجاباتك وتفضيلاتك الحالية. ستتمكن بعدها من اختيار هدف جديد.",
    complete: "اكتمل المسار",
    decisions: "قراراتك",
    viewSummary: "عرض الملخص",
    sessionNote: "بدون حساب · استئناف محلي اختياري.",
    noDecisions: "لا توجد إجابات لعرضها.",
    restoring: "استئناف الجلسة",
    restoringBody: "جاري التحقق من النسخة المحلية المحفوظة.",
    restored: "تم استئناف جلستك السابقة على هذا الجهاز.",
    invalidSaved: "تعذر استئناف النسخة المحفوظة. يمكنك بدء مسار جديد.",
    storageUnavailable: "التخزين المحلي غير متاح. يمكنك متابعة العمل في هذا التبويب.",
    pendingSave: "توجد إجابات بحاجة لتصحيح. سيكون الحفظ المحلي متاحاً بعد التصحيح؛ ويستمر مسارك في هذا التبويب.",
    initialTitle: "المسار الحي",
    views: {
      "goal-selection": "الهدف",
      journey: "المسار",
      summary: "الملخص",
    },
    changes: {
      step_order: "الترتيب",
      step_visibility: "الظهور",
      answer_invalidated: "إجابة للتصحيح",
    },
    visible: "ظاهرة",
    hidden: "مخفية",
    from: "قبل",
    to: "بعد",
    demoNote: "عرض تجريبي: إكمال هذا المسار لا يُجري أي تسجيل أو حجز، ولا يتم إرسال أي بيانات خارجية.",
    viewStepsLabel: "مراحل المسار",
    pathAriaLabel: "مسارك التفاعلي",
    pathCalloutAriaLabel: "ما الذي تغير في مسارك",
    openStep: "فتح الخطوة",
    stepAdded: "خطوة مضافة",
    stepRemoved: "خطوة محذوفة",
    viewStep: "معاينة",
    undoReturnTo: "تراجع: العودة إلى",
    currentAnswer: "الإجابة الحالية",
    statusDone: "مكتملة",
    statusCurrent: "قيد الإنجاز",
    statusTodo: "متبقية",
    statusRequired: "مطلوبة",
    statusOptional: "اختيارية",
    statusAdded: "أُضيفت",
    statusRevising: "قيد التعديل",
    formatStepProgress: (current, total) => `الخطوة ${current} من ${total}`,
    formatPathCount: (done, required, total) => `${done} / ${required} خطوات مطلوبة مكتملة · ${total} خطوات إجمالاً`,
    formatPreviewMeta: (required, optional) =>
      `${required} خطوات أساسية${optional > 0 ? ` · +${optional} مسار إرشادي اختياري` : ""}`,
    formatSummaryCompletion: (completed, total) => `${completed} / ${total} خطوات مطلوبة مكتملة`,
  },
}

export const errorTranslations: Record<SupportedLanguage, Record<ErrorCode, string>> = {
  fr: {
    CATALOG_INVALID: "Le catalogue ne permet pas de démarrer ou de poursuivre un parcours cohérent.",
    OBJECTIVE_REQUIRED: "Choisissez un objectif avant de commencer.",
    OBJECTIVE_NOT_FOUND: "Cet objectif n’est plus disponible. Choisissez-en un autre.",
    PREFERENCE_NOT_FOUND: "Cette préférence n’est pas disponible.",
    PREFERENCE_VALUE_INVALID: "Cette valeur de préférence n’est pas autorisée.",
    STEP_NOT_FOUND: "Cette étape n’est pas disponible.",
    STEP_NOT_IN_OBJECTIVE: "Cette étape ne fait pas partie du parcours en cours.",
    STEP_NOT_ACTIVE: "Cette étape n’est pas l’étape active. Vérifiez l’étape affichée.",
    SESSION_REQUIRED: "Choisissez un objectif pour démarrer une session.",
    ANSWER_REQUIRED: "Renseignez une réponse avant de continuer.",
    ANSWER_INVALID: "La réponse n’est pas valide. Vérifiez-la puis réessayez.",
    FIRST_STEP: "Vous êtes à la première étape du parcours.",
    JOURNEY_INCOMPLETE: "Des réponses requises restent à valider avant la synthèse.",
    RULE_CONFLICT: "Des règles du catalogue sont incompatibles. Votre session a été conservée.",
    REQUIRED_STEP_REMOVED: "Une règle tente de masquer une étape requise. Votre session a été conservée.",
    CONFIRMATION_REQUIRED: "Confirmez le redémarrage pour effacer la session.",
    STORAGE_UNAVAILABLE: "Le stockage est indisponible.",
    STORED_SESSION_INVALID: "La session sauvegardée ne peut pas être reprise.",
    UNEXPECTED_ERROR: "Une erreur inattendue est survenue. Votre session n’a pas été réinitialisée.",
  },
  en: {
    CATALOG_INVALID: "The catalog does not allow starting or continuing a consistent journey.",
    OBJECTIVE_REQUIRED: "Choose a goal before starting.",
    OBJECTIVE_NOT_FOUND: "This goal is no longer available. Please choose another one.",
    PREFERENCE_NOT_FOUND: "This preference is not available.",
    PREFERENCE_VALUE_INVALID: "This preference value is not permitted.",
    STEP_NOT_FOUND: "This step is not available.",
    STEP_NOT_IN_OBJECTIVE: "This step is not part of the active journey.",
    STEP_NOT_ACTIVE: "This step is not the active step. Please verify the displayed step.",
    SESSION_REQUIRED: "Choose a goal to start a session.",
    ANSWER_REQUIRED: "Please provide an answer before continuing.",
    ANSWER_INVALID: "The answer is invalid. Please verify and try again.",
    FIRST_STEP: "You are at the first step of the journey.",
    JOURNEY_INCOMPLETE: "Required answers must be validated before viewing the summary.",
    RULE_CONFLICT: "Catalog rules are in conflict. Your session has been preserved.",
    REQUIRED_STEP_REMOVED: "A rule attempts to hide a required step. Your session has been preserved.",
    CONFIRMATION_REQUIRED: "Confirm restart to clear the session.",
    STORAGE_UNAVAILABLE: "Storage is unavailable.",
    STORED_SESSION_INVALID: "The saved session cannot be resumed.",
    UNEXPECTED_ERROR: "An unexpected error occurred. Your session was not reset.",
  },
  ar: {
    CATALOG_INVALID: "الكتالوج لا يسمح ببدء أو استكمال مسار متسق.",
    OBJECTIVE_REQUIRED: "يرجى اختيار هدف قبل البدء.",
    OBJECTIVE_NOT_FOUND: "هذا الهدف لم يعد متاحاً. يرجى اختيار هدف آخر.",
    PREFERENCE_NOT_FOUND: "هذا التفضيل غير متاح.",
    PREFERENCE_VALUE_INVALID: "قيمة التفضيل هذه غير مسموح بها.",
    STEP_NOT_FOUND: "هذه الخطوة غير متاحة.",
    STEP_NOT_IN_OBJECTIVE: "هذه الخطوة ليست جزءاً من المسار الحالي.",
    STEP_NOT_ACTIVE: "هذه الخطوة ليست الخطوة النشطة حالياً. يرجى مراجعة الخطوة المعروضة.",
    SESSION_REQUIRED: "اختر هدفاً لبدء جلسة جديدة.",
    ANSWER_REQUIRED: "يرجى تقديم إجابة قبل المتابعة.",
    ANSWER_INVALID: "الإجابة غير صالحة. يرجى التحقق وإعادة المحاولة.",
    FIRST_STEP: "أنت في الخطوة الأولى من المسار.",
    JOURNEY_INCOMPLETE: "توجد إجابات مطلوبة يجب تأكيدها قبل عرض الملخص.",
    RULE_CONFLICT: "توجد قواعد متعارضة في الكتالوج. تم الاحتفاظ بجلستك.",
    REQUIRED_STEP_REMOVED: "تحاول إحدى القواعد إخفاء خطوة مطلوبة. تم الاحتفاظ بجلستك.",
    CONFIRMATION_REQUIRED: "يرجى تأكيد إعادة البدء لمسح الجلسة.",
    STORAGE_UNAVAILABLE: "التخزين المحلي غير متاح.",
    STORED_SESSION_INVALID: "تعذر استئناف الجلسة المحفوظة.",
    UNEXPECTED_ERROR: "حدث خطأ غير متوقع. لم تتم إعادة تعيين جلستك.",
  },
}

export function getErrorMessage(code: string, lang = currentLanguage): string {
  const dict = errorTranslations[lang] ?? errorTranslations.fr
  const key = code as ErrorCode
  return Object.hasOwn(dict, key) ? dict[key] : (dict.UNEXPECTED_ERROR ?? "An unexpected error occurred")
}

// Localized Demo Catalog Content
export const catalogTranslations: Record<
  SupportedLanguage,
  {
    objectives: Record<string, { titre: string; description: string }>
    steps: Record<string, { titre: string; contenu: string }>
    preferences: Record<string, { description: string }>
    rules: Record<string, { explication: string }>
  }
> = {
  fr: {
    objectives: {
      "atelier-preparation": {
        titre: "Préparer ma participation à un atelier numérique",
        description: "Organiser les informations utiles avant un atelier fictif de découverte numérique.",
      },
    },
    steps: {
      niveau: {
        titre: "Mon niveau",
        contenu:
          "Choisissez votre aisance numérique actuelle. Elle sert uniquement à rédiger votre synthèse ; vous pourrez la corriger à tout moment.",
      },
      conseils: {
        titre: "Conseils complémentaires",
        contenu:
          "Indications générales fictives : si vous débutez, notez à l'avance vos questions et prévoyez quelques minutes pour vous installer ; si vous êtes autonome, vérifiez simplement que votre appareil est chargé et à jour. Étape facultative, visible en accompagnement « guidé ».",
      },
      support: {
        titre: "Mon support de travail",
        contenu: "Indiquez l'appareil que vous comptez utiliser pendant l'atelier.",
      },
      verification: {
        titre: "Ma checklist",
        contenu:
          "Vérifiez la préparation de base : appareil chargé, identifiants nécessaires à portée de main, questions éventuelles notées.",
      },
    },
    preferences: {
      accompagnement: {
        description: "Quantité d'explications souhaitée",
      },
    },
    rules: {
      "masquer-conseils-en-mode-essentiel": {
        explication:
          "Vous avez choisi le parcours essentiel : les conseils complémentaires sont masqués, mais toutes les étapes nécessaires restent disponibles.",
      },
      "afficher-conseils-en-mode-guide": {
        explication:
          "Vous avez choisi le parcours guidé : l'étape facultative « Conseils complémentaires » est ajoutée au parcours, juste après « Mon niveau ». Toutes vos réponses sont conservées.",
      },
    },
  },

  en: {
    objectives: {
      "atelier-preparation": {
        titre: "Prepare my participation in a digital workshop",
        description: "Organize useful information before a mock digital discovery workshop.",
      },
    },
    steps: {
      niveau: {
        titre: "My level",
        contenu:
          "Choose your current digital comfort level. It is only used to draft your summary; you can modify it at any time.",
      },
      conseils: {
        titre: "Additional guidance",
        contenu:
          "General mock guidance: if you are a beginner, write down your questions beforehand and allow a few minutes to settle in; if you are autonomous, simply make sure your device is charged and up to date. Optional step, visible in \"guided\" mode.",
      },
      support: {
        titre: "My working device",
        contenu: "Indicate the device you plan to use during the workshop.",
      },
      verification: {
        titre: "My checklist",
        contenu:
          "Check the basic preparation: device charged, required credentials at hand, potential questions noted.",
      },
    },
    preferences: {
      accompagnement: {
        description: "Desired level of detail",
      },
    },
    rules: {
      "masquer-conseils-en-mode-essentiel": {
        explication:
          "You chose the essential path: additional guidance is hidden, but all required steps remain available.",
      },
      "afficher-conseils-en-mode-guide": {
        explication:
          "You chose the guided path: the optional step \"Additional guidance\" has been added to the path right after \"My level\". All your answers are preserved.",
      },
    },
  },

  ar: {
    objectives: {
      "atelier-preparation": {
        titre: "التحضير لمشاركتي في ورشة رقمية",
        description: "تنظيم المعلومات المفيدة قبل ورشة تجريبية لاكتشاف الأدوات الرقمية.",
      },
    },
    steps: {
      niveau: {
        titre: "مستواي",
        contenu:
          "اختر مدى ارتياحك للأدوات الرقمية حالياً. يُستخدم هذا فقط في صياغة ملخصك؛ ويمكنك تعديله في أي وقت.",
      },
      conseils: {
        titre: "نصائح تكميلية",
        contenu:
          "إرشادات عامة تجريبية: إذا كنت مبتدئاً، دوّن أسئلتك مسبقاً وخصص بضع دقائق للاستعداد؛ وإذا كنت مستقلاً، تأكد ببساطة من شحن جهازك وتحديثه. خطوة اختيارية، تظهر في مسار المرافقة «الموجّه».",
      },
      support: {
        titre: "وسيلة العمل",
        contenu: "حدد الجهاز الذي تخطط لاستخدامه أثناء الورشة.",
      },
      verification: {
        titre: "قائمة التحقق الخاصة بي",
        contenu:
          "تحقق من الاستعدادات الأساسية: جهاز مشحون، بيانات الاعتماد اللازمة في متناول اليد، والأسئلة المحتملة مدوّنة.",
      },
    },
    preferences: {
      accompagnement: {
        description: "كمية التوضيحات المرغوبة",
      },
    },
    rules: {
      "masquer-conseils-en-mode-essentiel": {
        explication:
          "اخترت المسار الموجز: تم إخفاء النصائح التكميلية، ولكن جميع الخطوات الضرورية تظل متاحة.",
      },
      "afficher-conseils-en-mode-guide": {
        explication:
          "اخترت المسار الموجّه: أُضيفت الخطوة الاختيارية «نصائح تكميلية» إلى المسار مباشرة بعد «مستواي». تم الاحتفاظ بجميع إجاباتك.",
      },
    },
  },
}

export const fieldsTranslations: Record<SupportedLanguage, AnswerFields> = {
  fr: {
    niveau: {
      kind: "single",
      legend: "Mon aisance numérique",
      options: [
        { value: "debutant", label: "Débutant — je découvre les outils numériques" },
        { value: "autonome", label: "Autonome — je me débrouille seul la plupart du temps" },
      ],
    },
    conseils: {
      kind: "confirm",
      legend: "Lecture des conseils",
      options: [{ value: "lus", label: "J'ai lu ces conseils" }],
    },
    support: {
      kind: "single",
      legend: "Appareil utilisé",
      options: [
        { value: "ordinateur", label: "Ordinateur" },
        { value: "mobile", label: "Mobile ou tablette" },
      ],
    },
    verification: {
      kind: "single",
      legend: "État de ma préparation",
      options: [
        { value: "pret", label: "Je suis prêt" },
        { value: "a_revoir", label: "Des points restent à revoir" },
      ],
    },
  },

  en: {
    niveau: {
      kind: "single",
      legend: "My digital comfort",
      options: [
        { value: "debutant", label: "Beginner — I am discovering digital tools" },
        { value: "autonome", label: "Autonomous — I manage on my own most of the time" },
      ],
    },
    conseils: {
      kind: "confirm",
      legend: "Guidance review",
      options: [{ value: "lus", label: "I have read these tips" }],
    },
    support: {
      kind: "single",
      legend: "Device used",
      options: [
        { value: "ordinateur", label: "Computer" },
        { value: "mobile", label: "Smartphone or tablet" },
      ],
    },
    verification: {
      kind: "single",
      legend: "Preparation status",
      options: [
        { value: "pret", label: "I am ready" },
        { value: "a_revoir", label: "Some points need review" },
      ],
    },
  },

  ar: {
    niveau: {
      kind: "single",
      legend: "مدى ارتياحي للأدوات الرقمية",
      options: [
        { value: "debutant", label: "مبتدئ — أكتشف الأدوات الرقمية لأول مرة" },
        { value: "autonome", label: "مستقل — أتدبر أمري بنفسي في معظم الأوقات" },
      ],
    },
    conseils: {
      kind: "confirm",
      legend: "الاطلاع على النصائح",
      options: [{ value: "lus", label: "قرأت هذه النصائح التكميلية" }],
    },
    support: {
      kind: "single",
      legend: "الجهاز المستخدم",
      options: [
        { value: "ordinateur", label: "حاسوب" },
        { value: "mobile", label: "هاتف أو جهاز لوحي" },
      ],
    },
    verification: {
      kind: "single",
      legend: "حالة استعدادي",
      options: [
        { value: "pret", label: "أنا مستعد تماماً" },
        { value: "a_revoir", label: "هناك نقاط تحتاج إلى مراجعة" },
      ],
    },
  },
}

export const preferenceLabelsTranslations: Record<SupportedLanguage, Record<string, Record<string, string>>> = {
  fr: {
    accompagnement: {
      essentiel: "Essentiel — explications courtes",
      guide: "Guidé — conseils complémentaires",
    },
  },
  en: {
    accompagnement: {
      essentiel: "Essential — concise guidance",
      guide: "Guided — additional tips",
    },
  },
  ar: {
    accompagnement: {
      essentiel: "موجز — توضيحات قصيرة",
      guide: "موجّه — نصائح تكميلية",
    },
  },
}

export function getLocalizedCatalog(catalog: JourneyCatalog, lang = currentLanguage): JourneyCatalog {
  const trans = catalogTranslations[lang] ?? catalogTranslations.fr

  const localizeObjective = (obj: Objective | null): Objective | null => {
    if (!obj) return null
    const t = trans.objectives[obj.id]
    return t ? { ...obj, titre: t.titre, description: t.description } : obj
  }

  const localizeStep = (step: Step | null): Step | null => {
    if (!step) return null
    const t = trans.steps[step.id]
    return t ? { ...step, titre: t.titre, contenu: t.contenu } : step
  }

  const localizePreference = (pref: Preference | null): Preference | null => {
    if (!pref) return null
    const t = trans.preferences[pref.id]
    return t ? { ...pref, description: t.description } : pref
  }

  const localizeRule = (rule: TransitionRule): TransitionRule => {
    const t = trans.rules[rule.id]
    return t ? { ...rule, explication: t.explication } : rule
  }

  return {
    getObjectives: () => catalog.getObjectives().map((o) => localizeObjective(o)!),
    getObjective: (id) => localizeObjective(catalog.getObjective(id)),
    getSteps: (objId) => catalog.getSteps(objId).map((s) => localizeStep(s)!),
    getStep: (id) => localizeStep(catalog.getStep(id)),
    getPreferences: () => catalog.getPreferences().map((p) => localizePreference(p)!),
    getPreference: (id) => localizePreference(catalog.getPreference(id)),
    getRules: () => catalog.getRules().map(localizeRule),
  }
}

export function getLocalizedFields(lang = currentLanguage): AnswerFields {
  return fieldsTranslations[lang] ?? fieldsTranslations.fr
}

export function getLocalizedPreferenceLabels(lang = currentLanguage): Record<string, Record<string, string>> {
  return preferenceLabelsTranslations[lang] ?? preferenceLabelsTranslations.fr
}

export function getLocalizedLabels(catalog: JourneyCatalog, lang = currentLanguage): Labels {
  const fields = getLocalizedFields(lang)
  const prefLabels = getLocalizedPreferenceLabels(lang)
  const localizedCatalog = getLocalizedCatalog(catalog, lang)

  const optionLabel = (stepId: string, value: string) =>
    (Object.hasOwn(fields, stepId) ? fields[stepId].options.find((opt) => opt.value === value)?.label : undefined) ??
    value

  return {
    step: (stepId) => localizedCatalog.getStep(stepId)?.titre ?? "",
    answer: (stepId, answer) =>
      Array.isArray(answer)
        ? answer.map((v) => optionLabel(stepId, v)).join(" · ")
        : optionLabel(stepId, answer),
    preference: (preferenceId, value) =>
      (Object.hasOwn(prefLabels, preferenceId) ? prefLabels[preferenceId][value] : undefined) ?? value,
  }
}
