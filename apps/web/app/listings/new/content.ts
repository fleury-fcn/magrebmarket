import type { SupportedLanguage } from "../../i18n/languages";

export type Step = 1 | 2 | 3 | 4;

export interface SubCategoryContent {
  id: string;
  label: string;
}

export interface CategoryContent {
  id: string;
  icon: string;
  label: string;
  subcategories: SubCategoryContent[];
}

export interface ConditionOption {
  id: string;
  label: string;
}

type PromotionTier = "standard" | "urgent" | "premium";

interface PromotionOption {
  id: PromotionTier;
  title: string;
  badge: string;
  description: string;
}

interface StepOneContent {
  title: string;
  description: string;
  subcategoryTitle: string;
}

interface StepTwoContent {
  title: string;
  description: string;
  dropTitle: string;
  dropSubtitle: string;
  dropButton: string;
  dropNote: string;
  primaryBadge: string;
  reorderLabel: string;
  addTileLabel: string;
  counterSingular: string;
  counterPlural: string;
}

interface StepThreeContent {
  title: string;
  description: string;
  titleLabel: string;
  titlePlaceholder: string;
  titleTooShort: string;
  conditionLabel: string;
  descriptionLabel: string;
  descriptionPlaceholder: string;
  descriptionHelper: string;
  descriptionTooShort: string;
  tipsTitle: string;
  tips: string[];
}

interface StepFourContent {
  title: string;
  description: string;
  priceSection: string;
  pricePlaceholder: string;
  currencyLabel: string;
  currencySuffix: string;
  negotiableLabel: string;
  freeTag: string;
  locationSection: string;
  countryLabel: string;
  countryPlaceholder: string;
  regionLabel: string;
  regionPlaceholder: string;
  cityLabel: string;
  cityPlaceholder: string;
  zipLabel: string;
  zipPlaceholder: string;
  contactSection: string;
  emailLabel: string;
  emailPlaceholder: string;
  phoneSection: string;
  phoneDescription: string;
  phonePlaceholder: string;
  phonePrefix: string;
  whatsappLabel: string;
  whatsappPlaceholder: string;
  promotionSection: string;
  promotionDisclaimer: string;
  promotionOptions: PromotionOption[];
}

interface SummaryContent {
  title: string;
  freeLabel: string;
  negotiableLabel: string;
  locationPrefix: string;
}

interface SuccessContent {
  title: string;
  description: string;
  primaryCta: string;
  secondaryCta: string;
}

interface ButtonsContent {
  back: string;
  next: string;
  publish: string;
  publishing: string;
  skip: string;
}

interface NavbarContent {
  brand: string;
  cancel: string;
}

interface ErrorsContent {
  heading: string;
}

interface ValidationMessages {
  categoryRequired: string;
  subcategoryRequired: string;
  photoRequired: string;
  titleMin: string;
  conditionRequired: string;
  descriptionMin: string;
  countryRequired: string;
  regionRequired: string;
  cityRequired: string;
  zipRequired: string;
  emailRequired: string;
}

export interface PostAdContent {
  navbar: NavbarContent;
  steps: Array<{ num: Step; label: string }>;
  step1: StepOneContent;
  step2: StepTwoContent;
  step3: StepThreeContent;
  step4: StepFourContent;
  summary: SummaryContent;
  success: SuccessContent;
  buttons: ButtonsContent;
  errors: ErrorsContent;
  validations: ValidationMessages;
  categories: CategoryContent[];
  conditions: ConditionOption[];
}

const CATEGORY_BASE = [
  {
    id: "vehicules",
    icon: "🚗",
    subcategories: ["voitures", "motos", "utilitaires", "caravaning", "nautisme"],
  },
  {
    id: "immobilier",
    icon: "🏠",
    subcategories: ["ventes-immobilieres", "locations", "colocations", "bureaux-commerces"],
  },
  {
    id: "multimedia",
    icon: "💻",
    subcategories: ["informatique", "telephonie", "consoles-jeux", "photo-audio-video"],
  },
  {
    id: "mode",
    icon: "👗",
    subcategories: ["vetements", "chaussures", "accessoires", "montres-bijoux"],
  },
  {
    id: "maison",
    icon: "🪴",
    subcategories: ["ameublement", "electromenager", "arts-table", "decoration", "bricolage", "jardinage"],
  },
  {
    id: "loisirs",
    icon: "🎸",
    subcategories: ["sports-hobbies", "instruments-musique", "collection", "jeux-jouets", "livres", "vins-gastronomie"],
  },
  {
    id: "animaux",
    icon: "🐾",
    subcategories: ["chiens", "chats", "autres-animaux", "accessoires-animaux"],
  },
  {
    id: "emploi",
    icon: "💼",
    subcategories: ["offres-emploi", "formations"],
  },
  {
    id: "services",
    icon: "🛠️",
    subcategories: ["services-aux-particuliers", "services-aux-entreprises", "billetterie", "co-voiturage"],
  },
] as const;

const CATEGORY_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    vehicules: "Véhicules",
    immobilier: "Immobilier",
    multimedia: "Multimédia",
    mode: "Mode",
    maison: "Maison & jardin",
    loisirs: "Loisirs",
    animaux: "Animaux",
    emploi: "Emploi",
    services: "Services",
  },
  en: {
    vehicules: "Vehicles",
    immobilier: "Real estate",
    multimedia: "Electronics",
    mode: "Fashion",
    maison: "Home & garden",
    loisirs: "Leisure",
    animaux: "Animals",
    emploi: "Jobs",
    services: "Services",
  },
  ar: {
    vehicules: "مركبات",
    immobilier: "عقارات",
    multimedia: "إلكترونيات",
    mode: "موضة",
    maison: "منزل وحديقة",
    loisirs: "هوايات",
    animaux: "حيوانات",
    emploi: "وظائف",
    services: "خدمات",
  },
};

const SUBCATEGORY_LABELS: Record<SupportedLanguage, Record<string, string>> = {
  fr: {
    voitures: "Voitures",
    motos: "Motos",
    utilitaires: "Utilitaires",
    caravaning: "Caravaning",
    nautisme: "Nautisme",
    "ventes-immobilieres": "Ventes immobilières",
    locations: "Locations",
    colocations: "Colocations",
    "bureaux-commerces": "Bureaux & commerces",
    informatique: "Informatique",
    telephonie: "Téléphonie",
    "consoles-jeux": "Consoles & jeux vidéo",
    "photo-audio-video": "Photo, audio, vidéo",
    vetements: "Vêtements",
    chaussures: "Chaussures",
    accessoires: "Accessoires & bagages",
    "montres-bijoux": "Montres & bijoux",
    ameublement: "Ameublement",
    electromenager: "Électroménager",
    "arts-table": "Arts de la table",
    decoration: "Décoration",
    bricolage: "Bricolage",
    jardinage: "Jardinage",
    "sports-hobbies": "Sports & hobbies",
    "instruments-musique": "Instruments de musique",
    collection: "Collection",
    "jeux-jouets": "Jeux & jouets",
    livres: "Livres, BD, revues",
    "vins-gastronomie": "Vins & gastronomie",
    chiens: "Chiens",
    chats: "Chats",
    "autres-animaux": "Autres animaux",
    "accessoires-animaux": "Accessoires & alimentation",
    "offres-emploi": "Offres d'emploi",
    formations: "Formations",
    "services-aux-particuliers": "Services aux particuliers",
    "services-aux-entreprises": "Services aux entreprises",
    billetterie: "Billetterie",
    "co-voiturage": "Covoiturage",
  },
  en: {
    voitures: "Cars",
    motos: "Motorbikes",
    utilitaires: "Utility vehicles",
    caravaning: "RVs & campers",
    nautisme: "Boating",
    "ventes-immobilieres": "Property sales",
    locations: "Rentals",
    colocations: "Flatmates",
    "bureaux-commerces": "Offices & shops",
    informatique: "Computers",
    telephonie: "Phones",
    "consoles-jeux": "Gaming",
    "photo-audio-video": "Photo / audio / video",
    vetements: "Clothing",
    chaussures: "Shoes",
    accessoires: "Accessories & luggage",
    "montres-bijoux": "Watches & jewelry",
    ameublement: "Furniture",
    electromenager: "Appliances",
    "arts-table": "Tableware",
    decoration: "Decor",
    bricolage: "DIY",
    jardinage: "Gardening",
    "sports-hobbies": "Sports & hobbies",
    "instruments-musique": "Musical instruments",
    collection: "Collectibles",
    "jeux-jouets": "Games & toys",
    livres: "Books & comics",
    "vins-gastronomie": "Wine & gastronomy",
    chiens: "Dogs",
    chats: "Cats",
    "autres-animaux": "Other animals",
    "accessoires-animaux": "Pet accessories & food",
    "offres-emploi": "Job offers",
    formations: "Training",
    "services-aux-particuliers": "Services for individuals",
    "services-aux-entreprises": "Business services",
    billetterie: "Ticketing",
    "co-voiturage": "Carpooling",
  },
  ar: {
    voitures: "سيارات",
    motos: "دراجات نارية",
    utilitaires: "مركبات نفعية",
    caravaning: "تخييم وقوافل",
    nautisme: "قوارب",
    "ventes-immobilieres": "بيع العقارات",
    locations: "إيجارات",
    colocations: "سكن مشترك",
    "bureaux-commerces": "مكاتب ومحلات",
    informatique: "حواسيب",
    telephonie: "هواتف",
    "consoles-jeux": "ألعاب إلكترونية",
    "photo-audio-video": "صوت وصورة",
    vetements: "ملابس",
    chaussures: "أحذية",
    accessoires: "إكسسوارات وحقائب",
    "montres-bijoux": "ساعات ومجوهرات",
    ameublement: "أثاث",
    electromenager: "أجهزة منزلية",
    "arts-table": "أدوات مائدة",
    decoration: "ديكور",
    bricolage: "أدوات صيانة",
    jardinage: "حدائق",
    "sports-hobbies": "رياضة وهوايات",
    "instruments-musique": "آلات موسيقية",
    collection: "مقتنيات",
    "jeux-jouets": "ألعاب",
    livres: "كتب ومجلات",
    "vins-gastronomie": "مذاقات راقية",
    chiens: "كلاب",
    chats: "قطط",
    "autres-animaux": "حيوانات أخرى",
    "accessoires-animaux": "مستلزمات الحيوانات",
    "offres-emploi": "عروض عمل",
    formations: "تكوينات",
    "services-aux-particuliers": "خدمات للأفراد",
    "services-aux-entreprises": "خدمات للشركات",
    billetterie: "تذاكر",
    "co-voiturage": "مشاركة السيارات",
  },
};

const CONDITION_ORDER = ["new", "like_new", "used", "refurbished"] as const;

type ConditionId = (typeof CONDITION_ORDER)[number];

const CONDITION_LABELS: Record<SupportedLanguage, Record<ConditionId, string>> = {
  fr: {
    new: "Neuf",
    like_new: "Comme neuf",
    used: "Occasion",
    refurbished: "Reconditionné",
  },
  en: {
    new: "New",
    like_new: "Like new",
    used: "Used",
    refurbished: "Refurbished",
  },
  ar: {
    new: "جديد",
    like_new: "شبه جديد",
    used: "مستعمل",
    refurbished: "معاد تجديده",
  },
};

const buildCategories = (language: SupportedLanguage): CategoryContent[] =>
  CATEGORY_BASE.map(category => ({
    id: category.id,
    icon: category.icon,
    label: CATEGORY_LABELS[language][category.id] ?? category.id,
    subcategories: category.subcategories.map(subId => ({
      id: subId,
      label: SUBCATEGORY_LABELS[language][subId] ?? subId,
    })),
  }));

const buildConditions = (language: SupportedLanguage): ConditionOption[] =>
  CONDITION_ORDER.map(condition => ({
    id: condition,
    label: CONDITION_LABELS[language][condition],
  }));

const pick = <T>(language: SupportedLanguage, frValue: T, enValue: T, arValue: T): T => {
  if (language === "fr") return frValue;
  if (language === "en") return enValue;
  return arValue;
};

const buildContent = (language: SupportedLanguage): PostAdContent => ({
  navbar: {
    brand: pick(language, "Maghreb Market", "Maghreb Market", "مغرب ماركت"),
    cancel: pick(language, "Annuler", "Cancel", "إلغاء"),
  },
  steps: [
    { num: 1, label: pick(language, "Catégorie", "Category", "الفئة") },
    { num: 2, label: pick(language, "Photos", "Photos", "الصور") },
    { num: 3, label: pick(language, "Description", "Description", "الوصف") },
    { num: 4, label: pick(language, "Prix & lieu", "Price & location", "السعر والموقع") },
  ],
  step1: {
    title: pick(
      language,
      "Quelle est la catégorie de votre annonce ?",
      "Which category fits your listing?",
      "ما هي فئة إعلانك؟"
    ),
    description: pick(
      language,
      "Choisissez la catégorie qui correspond le mieux à votre article.",
      "Choose the category that best matches your item.",
      "اختر الفئة الأنسب لمنتجك."
    ),
    subcategoryTitle: pick(
      language,
      "Sous-catégorie de « {category} »",
      "Sub-category for \"{category}\"",
      "فئة فرعية من « {category} »"
    ),
  },
  step2: {
    title: pick(language, "Ajoutez des photos", "Add your photos", "أضف الصور"),
    description: pick(
      language,
      "La première photo sera la photo principale de votre annonce. Jusqu'à 20 photos acceptées.",
      "Your first photo becomes the hero image. Up to 20 photos accepted.",
      "ستظهر أول صورة كصورة رئيسية لإعلانك. يمكنك رفع 20 صورة كحد أقصى."
    ),
    dropTitle: pick(language, "Glissez vos photos ici", "Drag your photos here", "اسحب الصور إلى هنا"),
    dropSubtitle: pick(
      language,
      "ou cliquez pour sélectionner depuis votre appareil",
      "or click to select them from your device",
      "أو انقر لاختيارها من جهازك"
    ),
    dropButton: pick(language, "Choisir des photos", "Select photos", "اختر الصور"),
    dropNote: pick(
      language,
      "JPG, PNG, WEBP — 10 Mo max par photo",
      "JPG, PNG, WEBP — 10 MB max per photo",
      "‏JPG وPNG وWEBP — 10 ميغابايت كحد أقصى لكل صورة"
    ),
    primaryBadge: pick(language, "Photo principale", "Cover photo", "الصورة الرئيسية"),
    reorderLabel: pick(language, "← Mettre 1ère", "← Make cover", "← اجعلها الأولى"),
    addTileLabel: pick(language, "Ajouter", "Add", "إضافة"),
    counterSingular: pick(language, "photo", "photo", "صورة"),
    counterPlural: pick(language, "photos", "photos", "صور"),
  },
  step3: {
    title: pick(language, "Décrivez votre annonce", "Describe your listing", "وصف الإعلان"),
    description: pick(
      language,
      "Plus votre annonce est détaillée, plus elle a de chances d'aboutir.",
      "The more details you provide, the faster you will sell.",
      "كلما كان الوصف أدق زادت فرص البيع."
    ),
    titleLabel: pick(language, "Titre de l'annonce", "Listing title", "عنوان الإعلان"),
    titlePlaceholder: pick(
      language,
      "Ex : Pickup Isuzu D-Max 3.0, 2023",
      "e.g. Toyota Hilux 2.8D export, 2023",
      "مثال: شاحنة هايلوكس 2.8D للتصدير"
    ),
    titleTooShort: pick(
      language,
      "Titre trop court (min. 5 caractères)",
      "Title must contain at least 5 characters.",
      "يجب أن يحتوي العنوان على 5 أحرف على الأقل."
    ),
    conditionLabel: pick(language, "État de l'article", "Item condition", "حالة المنتج"),
    descriptionLabel: pick(language, "Description", "Description", "الوصف"),
    descriptionPlaceholder: pick(
      language,
      "Décrivez votre article : marque, modèle, dimensions, défauts éventuels, raison de la vente…",
      "Share specs, mileage, dimensions, defects, reason for selling…",
      "اذكر الماركة والطراز والأبعاد والعيوب إن وجدت وسبب البيع..."
    ),
    descriptionHelper: pick(language, "Jusqu'à 4 000 caractères", "Up to 4,000 characters", "حتى 4000 حرف"),
    descriptionTooShort: pick(
      language,
      "Description trop courte (min. 30 caractères)",
      "Description must contain at least 30 characters.",
      "يجب أن يحتوي الوصف على 30 حرفاً على الأقل."
    ),
    tipsTitle: pick(
      language,
      "💡 Conseils pour une annonce efficace",
      "💡 Tips for a standout listing",
      "💡 نصائح لإعلان مميز"
    ),
    tips: pick(
      language,
      [
        "Soyez précis sur l'état et les défauts éventuels",
        "Indiquez les dimensions et caractéristiques techniques",
        "Mentionnez si les accessoires ou documents sont inclus",
        "Évitez les numéros de téléphone dans la description",
      ],
      [
        "Be transparent about condition and defects",
        "Add dimensions and key technical specs",
        "List included accessories or paperwork",
        "Keep phone numbers out of the description",
      ],
      [
        "اذكر حالة المنتج وأي عيوب بوضوح",
        "أضف المقاسات والمواصفات التقنية المهمة",
        "حدد الملحقات أو الوثائق المرفقة",
        "تجنب كتابة رقم الهاتف داخل الوصف",
      ]
    ),
  },
  step4: {
    title: pick(language, "Prix et coordonnées", "Price & location", "السعر والموقع"),
    description: pick(
      language,
      "Définissez votre prix et indiquez où vous vous trouvez.",
      "Set your price and tell buyers where you are.",
      "حدد السعر وأخبر المشترين بمكانك."
    ),
    priceSection: pick(language, "Prix", "Price", "السعر"),
    pricePlaceholder: "0",
    currencyLabel: pick(language, "Devise", "Currency", "العملة"),
    currencySuffix: pick(language, "MAD", "MAD", "د.م"),
    negotiableLabel: pick(language, "Prix négociable", "Price negotiable", "السعر قابل للتفاوض"),
    freeTag: pick(
      language,
      "✓ Votre annonce sera marquée Gratuit",
      "✓ Your listing will appear as Free",
      "✓ سيظهر إعلانك مجاناً"
    ),
    locationSection: pick(language, "Localisation", "Location", "الموقع"),
    countryLabel: pick(language, "Pays", "Country", "البلد"),
    countryPlaceholder: pick(language, "Sélectionnez un pays", "Select a country", "اختر بلداً"),
    regionLabel: pick(language, "Région", "Region", "المنطقة"),
    regionPlaceholder: pick(language, "Choisissez une région", "Pick a region", "اختر منطقة"),
    cityLabel: pick(language, "Ville", "City", "المدينة"),
    cityPlaceholder: pick(
      language,
      "Casablanca, Alger, Tunis…",
      "Casablanca, Algiers, Tunis...",
      "الدار البيضاء، الجزائر، تونس..."
    ),
    zipLabel: pick(language, "Code postal", "Postal code", "الرمز البريدي"),
    zipPlaceholder: pick(language, "20000", "10000", "20000"),
    contactSection: pick(language, "Coordonnées", "Contact details", "معلومات التواصل"),
    emailLabel: pick(language, "Email de contact", "Contact email", "البريد الإلكتروني"),
    emailPlaceholder: "you@example.com",
    phoneSection: pick(language, "Téléphone", "Phone", "الهاتف"),
    phoneDescription: pick(
      language,
      "Votre numéro reste caché et n'est partagé qu'avec les acheteurs intéressés.",
      "Your number stays hidden until you engage with a buyer.",
      "نشارك رقمك فقط مع المشترين الموثوقين."
    ),
    phonePlaceholder: "6 12 34 56 78",
    phonePrefix: "+212",
    whatsappLabel: pick(language, "WhatsApp (optionnel)", "WhatsApp (optional)", "واتساب (اختياري)"),
    whatsappPlaceholder: "6 45 78 90 12",
    promotionSection: pick(language, "Visibilité", "Visibility", "الظهور"),
    promotionDisclaimer: pick(
      language,
      "Vous pourrez changer d'option plus tard dans votre tableau de bord.",
      "You can switch plans later from your dashboard.",
      "يمكنك تغيير الخطة لاحقاً من لوحة التحكم."
    ),
    promotionOptions: [
      {
        id: "standard",
        title: pick(language, "Standard", "Standard", "عادي"),
        badge: pick(language, "Gratuit", "Free", "مجاني"),
        description: pick(
          language,
          "Apparaît dans le flux classique.",
          "Shown in the default feed.",
          "يظهر في القائمة العادية."
        ),
      },
      {
        id: "urgent",
        title: pick(language, "Urgent", "Urgent", "مستعجل"),
        badge: pick(language, "+10 jours", "+10 days", "+10 أيام"),
        description: pick(
          language,
          "Badge Urgent et priorité pendant 10 jours.",
          "Urgent badge plus highlight for 10 days.",
          "شارة مستعجل مع إبراز لمدة 10 أيام."
        ),
      },
      {
        id: "premium",
        title: pick(language, "Premium", "Premium", "ممتاز"),
        badge: pick(language, "+30 jours", "+30 days", "+30 يوماً"),
        description: pick(
          language,
          "Position haute 30 jours et remontées automatiques.",
          "Top placement 30 days with automatic bumps.",
          "أولوية قصوى لمدة 30 يوماً مع إعادة الرفع تلقائياً."
        ),
      },
    ],
  },
  summary: {
    title: pick(language, "Aperçu de votre annonce", "Listing preview", "معاينة إعلانك"),
    freeLabel: pick(language, "Gratuit", "Free", "مجاني"),
    negotiableLabel: pick(language, "Négociable", "Negotiable", "قابل للتفاوض"),
    locationPrefix: "📍",
  },
  success: {
    title: pick(
      language,
      "Annonce publiée avec succès !",
      "Listing submitted successfully!",
      "تم نشر الإعلان بنجاح!"
    ),
    description: pick(
      language,
      "Votre annonce « {title} » est maintenant en ligne.",
      "Your listing \"{title}\" is now online.",
      "إعلانك « {title} » صار متاحاً الآن."
    ),
    primaryCta: pick(language, "Voir mon annonce", "View my listing", "عرض إعلاني"),
    secondaryCta: pick(
      language,
      "Déposer une nouvelle annonce",
      "Post another listing",
      "نشر إعلان آخر"
    ),
  },
  buttons: {
    back: pick(language, "← Retour", "← Back", "← رجوع"),
    next: pick(language, "Continuer", "Continue", "متابعة"),
    publish: pick(language, "Publier l'annonce", "Publish listing", "نشر الإعلان"),
    publishing: pick(language, "Publication...", "Publishing...", "جاري النشر..."),
    skip: pick(language, "Passer cette étape", "Skip this step", "تخطي هذه الخطوة"),
  },
  errors: {
    heading: pick(
      language,
      "Veuillez corriger les erreurs suivantes :",
      "Please fix the following issues:",
      "يرجى تصحيح الأخطاء التالية:"
    ),
  },
  validations: {
    categoryRequired: pick(
      language,
      "Veuillez sélectionner une catégorie.",
      "Please select a category.",
      "يرجى اختيار فئة."
    ),
    subcategoryRequired: pick(
      language,
      "Veuillez sélectionner une sous-catégorie.",
      "Please select a sub-category.",
      "يرجى اختيار فئة فرعية."
    ),
    photoRequired: pick(
      language,
      "Veuillez ajouter au moins une photo (recommandé).",
      "Add at least one photo (recommended).",
      "أضف صورة واحدة على الأقل (مستحسن)."
    ),
    titleMin: pick(
      language,
      "Le titre doit contenir au moins 5 caractères.",
      "Title must contain at least 5 characters.",
      "العنوان يجب أن يحتوي على 5 أحرف على الأقل."
    ),
    conditionRequired: pick(
      language,
      "Veuillez sélectionner l'état de l'article.",
      "Select the item condition.",
      "يرجى تحديد حالة المنتج."
    ),
    descriptionMin: pick(
      language,
      "La description doit contenir au moins 30 caractères.",
      "Description must contain at least 30 characters.",
      "الوصف يجب أن يحتوي على 30 حرفاً على الأقل."
    ),
    countryRequired: pick(
      language,
      "Sélectionnez un pays.",
      "Select a country.",
      "اختر بلداً."
    ),
    regionRequired: pick(
      language,
      "Sélectionnez une région.",
      "Select a region.",
      "اختر منطقة."
    ),
    cityRequired: pick(
      language,
      "Veuillez indiquer votre ville.",
      "Please provide your city.",
      "يرجى كتابة المدينة."
    ),
    zipRequired: pick(
      language,
      "Veuillez indiquer un code postal valide.",
      "Enter a valid postal code.",
      "يرجى إدخال رمز بريدي صالح."
    ),
    emailRequired: pick(
      language,
      "Entrez un email de contact valide.",
      "Enter a valid contact email.",
      "أدخل بريداً إلكترونياً صحيحاً."
    ),
  },
  categories: buildCategories(language),
  conditions: buildConditions(language),
});
const POST_AD_CONTENT: Record<SupportedLanguage, PostAdContent> = {
  fr: buildContent("fr"),
  en: buildContent("en"),
  ar: buildContent("ar"),
};

export const getPostAdContent = (language: SupportedLanguage): PostAdContent =>
  POST_AD_CONTENT[language] ?? POST_AD_CONTENT.fr;
