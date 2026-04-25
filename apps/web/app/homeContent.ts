import type { SupportedLanguage } from "./i18n/languages";

export interface NavCategory {
  icon: string;
  label: string;
}

export interface CategoryCard {
  icon: string;
  name: string;
  count: string;
}

export interface AdCard {
  id: string;
  icon: string;
  price: string;
  title: string;
  location: string;
  time: string;
  variant: string;
  badge?: "pro" | "urgent" | "particulier";
}

interface HomeContent {
  navCategories: NavCategory[];
  categories: CategoryCard[];
  sections: {
    categoriesTitle: string;
    recentAdsTitle: string;
    realEstateTitle: string;
    allListingsLink: string;
    allRealEstateLink: string;
    promoTitle: string;
    promoText: string;
    promoCta: string;
  };
  topbar: {
    help: string;
    login: string;
    register: string;
    mySpace: string;
    logout: string;
    welcomePrefix: string;
    languageLabel: string;
  };
  header: {
    searchPlaceholder: string;
    searchButton: string;
    depositButton: string;
    loginButton: string;
    mySpaceButton: string;
    locationAria: string;
  };
  general: {
    lockedHint: string;
    favoritesHint: string;
  };
  badges: Record<"pro" | "urgent" | "particulier", string>;
  ads: {
    recent: AdCard[];
    immobilier: AdCard[];
  };
}

const HOME_CONTENT: Record<SupportedLanguage, HomeContent> = {
  fr: {
    navCategories: [
      { icon: "🏠", label: "Immobilier" },
      { icon: "🚗", label: "Véhicules" },
      { icon: "💼", label: "Offres d'emploi" },
      { icon: "🛍️", label: "Mode" },
      { icon: "🌿", label: "Maison & Jardin" },
      { icon: "📱", label: "Multimédia" },
      { icon: "🎾", label: "Sports & Loisirs" },
      { icon: "👶", label: "Enfants" },
      { icon: "🐾", label: "Animaux" },
      { icon: "✈️", label: "Voyages" },
      { icon: "🛠️", label: "Services" },
      { icon: "📚", label: "Livres" },
    ],
    categories: [
      { icon: "🏠", name: "Immobilier", count: "45K annonces" },
      { icon: "🚗", name: "Véhicules", count: "58K annonces" },
      { icon: "💼", name: "Emploi", count: "12K annonces" },
      { icon: "🛍️", name: "Mode", count: "33K annonces" },
      { icon: "🛋️", name: "Maison & Déco", count: "29K annonces" },
      { icon: "📱", name: "Multimédia", count: "22K annonces" },
      { icon: "⚽", name: "Sports & Loisirs", count: "17K annonces" },
      { icon: "👶", name: "Enfants", count: "9K annonces" },
      { icon: "🐪", name: "Animaux", count: "5K annonces" },
      { icon: "✈️", name: "Voyages", count: "4K annonces" },
      { icon: "🛠️", name: "Services", count: "26K annonces" },
      { icon: "📚", name: "Culture", count: "14K annonces" },
    ],
    sections: {
      categoriesTitle: "Toutes les catégories",
      recentAdsTitle: "Annonces récentes",
      realEstateTitle: "Immobilier récent",
      allListingsLink: "Voir toutes les annonces →",
      allRealEstateLink: "Voir tout l'immobilier →",
      promoTitle: "📣 Déposez votre annonce gratuitement",
      promoText: "Des millions d’acheteurs maghrébins vous attendent. Exportez partout en zone UMA.",
      promoCta: "Déposer une annonce",
    },
    topbar: {
      help: "Assistance",
      login: "Connexion",
      register: "Créer un compte",
      mySpace: "Mon espace",
      logout: "Déconnexion",
      welcomePrefix: "Bonjour",
      languageLabel: "Langue",
    },
    header: {
      searchPlaceholder: "Rechercher sur Maghreb Market...",
      searchButton: "Rechercher",
      depositButton: "Déposer une annonce",
      loginButton: "Connexion",
      mySpaceButton: "Mon espace",
      locationAria: "Choisir un pays",
    },
    general: {
      lockedHint: "Disponible après connexion",
      favoritesHint: "Ajouter aux favoris",
    },
    badges: {
      pro: "Pro",
      urgent: "Urgent",
      particulier: "Particulier",
    },
    ads: {
      recent: [
        {
          id: "immobilier-nkc",
          icon: "🏠",
          price: "15 800 000 MRU",
          title: "Villa T4 avec patio et terrasse panoramique",
          location: "Nouakchott, Mauritanie",
          time: "Il y a 2h",
          variant: "ph1",
          badge: "particulier",
        },
        {
          id: "pick-up",
          icon: "🚗",
          price: "3 200 000 DZD",
          title: "Toyota Hilux 2.4D 2021 – Carnet d'entretien complet",
          location: "Oran, Algérie",
          time: "Il y a 3h",
          variant: "ph2",
          badge: "pro",
        },
        {
          id: "macbook-casa",
          icon: "💻",
          price: "9 500 MAD",
          title: "MacBook Air M2 – 16 Go RAM, 512 Go SSD",
          location: "Casablanca, Maroc",
          time: "Il y a 5h",
          variant: "ph3",
        },
        {
          id: "canape-tunis",
          icon: "🛋️",
          price: "2 200 TND",
          title: "Canapé d'angle tissu premium – Livraison Tunis incluse",
          location: "Tunis, Tunisie",
          time: "Il y a 1h",
          variant: "ph4",
          badge: "urgent",
        },
        {
          id: "mode-rabat",
          icon: "👗",
          price: "750 MAD",
          title: "Caftan brodé main – Collection 2025",
          location: "Rabat, Maroc",
          time: "Il y a 30 min",
          variant: "ph5",
        },
        {
          id: "velo-alger",
          icon: "🚲",
          price: "190 000 DZD",
          title: "Vélo électrique urbain – Batterie neuve 80 km",
          location: "Alger, Algérie",
          time: "Il y a 6h",
          variant: "ph6",
        },
        {
          id: "chiots-sfax",
          icon: "🐶",
          price: "2 400 TND",
          title: "Chiots Berger Atlas LOF – Vaccinés",
          location: "Sfax, Tunisie",
          time: "Il y a 8h",
          variant: "ph7",
          badge: "particulier",
        },
        {
          id: "camera-tripoli",
          icon: "📷",
          price: "5 800 LYD",
          title: "Appareil photo hybride Canon EOS R10 + kit vlog",
          location: "Tripoli, Libye",
          time: "Il y a 4h",
          variant: "ph8",
        },
      ],
      immobilier: [
        {
          id: "villa-casa",
          icon: "🏡",
          price: "3 250 000 MAD",
          title: "Villa 5 pièces avec patio et rooftop Anfa",
          location: "Casablanca, Maroc",
          time: "Il y a 1j",
          variant: "ph1",
          badge: "pro",
        },
        {
          id: "studio-algiers",
          icon: "🏢",
          price: "92 000 DZD / mois",
          title: "Studio meublé Hydra – Fibre + Conciergerie",
          location: "Alger, Algérie",
          time: "Il y a 2j",
          variant: "ph3",
        },
        {
          id: "riad-marrakech",
          icon: "🏠",
          price: "1 980 000 MAD",
          title: "Riad rénové Médina – Licence maison d'hôtes",
          location: "Marrakech, Maroc",
          time: "Il y a 3j",
          variant: "ph4",
        },
        {
          id: "terrain-tunis",
          icon: "🏗️",
          price: "680 000 TND",
          title: "Terrain constructible La Marsa – 420 m²",
          location: "Tunis, Tunisie",
          time: "Il y a 2j",
          variant: "ph5",
          badge: "pro",
        },
      ],
    },
  },
  en: {
    navCategories: [
      { icon: "🏠", label: "Real Estate" },
      { icon: "🚗", label: "Vehicles" },
      { icon: "💼", label: "Jobs" },
      { icon: "🛍️", label: "Fashion" },
      { icon: "🌿", label: "Home & Garden" },
      { icon: "📱", label: "Electronics" },
      { icon: "🎾", label: "Sports & Leisure" },
      { icon: "👶", label: "Kids" },
      { icon: "🐾", label: "Pets" },
      { icon: "✈️", label: "Travel" },
      { icon: "🛠️", label: "Services" },
      { icon: "📚", label: "Books" },
    ],
    categories: [
      { icon: "🏠", name: "Real Estate", count: "45K listings" },
      { icon: "🚗", name: "Vehicles", count: "58K listings" },
      { icon: "💼", name: "Jobs", count: "12K listings" },
      { icon: "🛍️", name: "Fashion", count: "33K listings" },
      { icon: "🛋️", name: "Home & Decor", count: "29K listings" },
      { icon: "📱", name: "Electronics", count: "22K listings" },
      { icon: "⚽", name: "Sports & Leisure", count: "17K listings" },
      { icon: "👶", name: "Kids", count: "9K listings" },
      { icon: "🐪", name: "Pets", count: "5K listings" },
      { icon: "✈️", name: "Travel", count: "4K listings" },
      { icon: "🛠️", name: "Services", count: "26K listings" },
      { icon: "📚", name: "Culture", count: "14K listings" },
    ],
    sections: {
      categoriesTitle: "All categories",
      recentAdsTitle: "Recent listings",
      realEstateTitle: "Latest real estate",
      allListingsLink: "See all listings →",
      allRealEstateLink: "See all real-estate →",
      promoTitle: "📣 Post your ad for free",
      promoText: "Millions of Maghreb buyers are waiting. Export across the UMA region.",
      promoCta: "Post an ad",
    },
    topbar: {
      help: "Help",
      login: "Sign in",
      register: "Create account",
      mySpace: "My space",
      logout: "Sign out",
      welcomePrefix: "Hello",
      languageLabel: "Language",
    },
    header: {
      searchPlaceholder: "Search on Maghreb Market...",
      searchButton: "Search",
      depositButton: "Post an ad",
      loginButton: "Sign in",
      mySpaceButton: "My space",
      locationAria: "Choose a country",
    },
    general: {
      lockedHint: "Available after login",
      favoritesHint: "Add to favorites",
    },
    badges: {
      pro: "Pro",
      urgent: "Urgent",
      particulier: "Individual",
    },
    ads: {
      recent: [
        {
          id: "immobilier-nkc",
          icon: "🏠",
          price: "15,800,000 MRU",
          title: "T4 villa with patio and panoramic rooftop",
          location: "Nouakchott, Mauritania",
          time: "2h ago",
          variant: "ph1",
          badge: "particulier",
        },
        {
          id: "pick-up",
          icon: "🚗",
          price: "3,200,000 DZD",
          title: "Toyota Hilux 2.4D 2021 – full service history",
          location: "Oran, Algeria",
          time: "3h ago",
          variant: "ph2",
          badge: "pro",
        },
        {
          id: "macbook-casa",
          icon: "💻",
          price: "9,500 MAD",
          title: "MacBook Air M2 – 16 GB RAM, 512 GB SSD",
          location: "Casablanca, Morocco",
          time: "5h ago",
          variant: "ph3",
        },
        {
          id: "canape-tunis",
          icon: "🛋️",
          price: "2,200 TND",
          title: "Premium corner sofa – delivery in Tunis included",
          location: "Tunis, Tunisia",
          time: "1h ago",
          variant: "ph4",
          badge: "urgent",
        },
        {
          id: "mode-rabat",
          icon: "👗",
          price: "750 MAD",
          title: "Hand-embroidered kaftan – 2025 collection",
          location: "Rabat, Morocco",
          time: "30 min ago",
          variant: "ph5",
        },
        {
          id: "velo-alger",
          icon: "🚲",
          price: "190,000 DZD",
          title: "City e-bike – new 80 km battery",
          location: "Algiers, Algeria",
          time: "6h ago",
          variant: "ph6",
        },
        {
          id: "chiots-sfax",
          icon: "🐶",
          price: "2,400 TND",
          title: "Atlas Shepherd puppies – vaccinated",
          location: "Sfax, Tunisia",
          time: "8h ago",
          variant: "ph7",
          badge: "particulier",
        },
        {
          id: "camera-tripoli",
          icon: "📷",
          price: "5,800 LYD",
          title: "Canon EOS R10 hybrid camera + vlog kit",
          location: "Tripoli, Libya",
          time: "4h ago",
          variant: "ph8",
        },
      ],
      immobilier: [
        {
          id: "villa-casa",
          icon: "🏡",
          price: "3,250,000 MAD",
          title: "5-bedroom villa with patio & rooftop in Anfa",
          location: "Casablanca, Morocco",
          time: "1 day ago",
          variant: "ph1",
          badge: "pro",
        },
        {
          id: "studio-algiers",
          icon: "🏢",
          price: "92,000 DZD / month",
          title: "Furnished Hydra studio – fiber + concierge",
          location: "Algiers, Algeria",
          time: "2 days ago",
          variant: "ph3",
        },
        {
          id: "riad-marrakech",
          icon: "🏠",
          price: "1,980,000 MAD",
          title: "Renovated medina riad – guest house license",
          location: "Marrakesh, Morocco",
          time: "3 days ago",
          variant: "ph4",
        },
        {
          id: "terrain-tunis",
          icon: "🏗️",
          price: "680,000 TND",
          title: "Buildable plot in La Marsa – 420 m²",
          location: "Tunis, Tunisia",
          time: "2 days ago",
          variant: "ph5",
          badge: "pro",
        },
      ],
    },
  },
  ar: {
    navCategories: [
      { icon: "🏠", label: "عقارات" },
      { icon: "🚗", label: "مركبات" },
      { icon: "💼", label: "وظائف" },
      { icon: "🛍️", label: "موضة" },
      { icon: "🌿", label: "منزل وحديقة" },
      { icon: "📱", label: "إلكترونيات" },
      { icon: "🎾", label: "رياضة وترفيه" },
      { icon: "👶", label: "أطفال" },
      { icon: "🐾", label: "حيوانات أليفة" },
      { icon: "✈️", label: "سفر" },
      { icon: "🛠️", label: "خدمات" },
      { icon: "📚", label: "كتب" },
    ],
    categories: [
      { icon: "🏠", name: "عقارات", count: "٤٥ ألف إعلان" },
      { icon: "🚗", name: "مركبات", count: "٥٨ ألف إعلان" },
      { icon: "💼", name: "وظائف", count: "١٢ ألف إعلان" },
      { icon: "🛍️", name: "موضة", count: "٣٣ ألف إعلان" },
      { icon: "🛋️", name: "منزل وديكور", count: "٢٩ ألف إعلان" },
      { icon: "📱", name: "إلكترونيات", count: "٢٢ ألف إعلان" },
      { icon: "⚽", name: "رياضة وترفيه", count: "١٧ ألف إعلان" },
      { icon: "👶", name: "أطفال", count: "٩ آلاف إعلان" },
      { icon: "🐪", name: "حيوانات", count: "٥ آلاف إعلان" },
      { icon: "✈️", name: "سفر", count: "٤ آلاف إعلان" },
      { icon: "🛠️", name: "خدمات", count: "٢٦ ألف إعلان" },
      { icon: "📚", name: "ثقافة", count: "١٤ ألف إعلان" },
    ],
    sections: {
      categoriesTitle: "جميع الفئات",
      recentAdsTitle: "الإعلانات الحديثة",
      realEstateTitle: "العقارات المضافة مؤخرًا",
      allListingsLink: "عرض كل الإعلانات →",
      allRealEstateLink: "عرض كل العقارات →",
      promoTitle: "📣 انشر إعلانك مجاناً",
      promoText: "ملايين المشترين في المغرب العربي بانتظارك. صدّر داخل اتحاد المغرب العربي.",
      promoCta: "انشر إعلاناً",
    },
    topbar: {
      help: "مساعدة",
      login: "تسجيل الدخول",
      register: "إنشاء حساب",
      mySpace: "مساحتي",
      logout: "تسجيل الخروج",
      welcomePrefix: "مرحبا",
      languageLabel: "اللغة",
    },
    header: {
      searchPlaceholder: "ابحث في مغرب ماركت...",
      searchButton: "ابحث",
      depositButton: "انشر إعلان",
      loginButton: "تسجيل الدخول",
      mySpaceButton: "مساحتي",
      locationAria: "اختر دولة",
    },
    general: {
      lockedHint: "متاح بعد تسجيل الدخول",
      favoritesHint: "أضف إلى المفضلة",
    },
    badges: {
      pro: "محترف",
      urgent: "عاجل",
      particulier: "فردي",
    },
    ads: {
      recent: [
        {
          id: "immobilier-nkc",
          icon: "🏠",
          price: "15 800 000 MRU",
          title: "فيلا T4 مع فناء وشرفة بانورامية",
          location: "نواكشوط، موريتانيا",
          time: "منذ ساعتين",
          variant: "ph1",
          badge: "particulier",
        },
        {
          id: "pick-up",
          icon: "🚗",
          price: "3 200 000 DZD",
          title: "تويوتا هايلوكس 2021 مع سجل صيانة كامل",
          location: "وهران، الجزائر",
          time: "منذ 3 ساعات",
          variant: "ph2",
          badge: "pro",
        },
        {
          id: "macbook-casa",
          icon: "💻",
          price: "9 500 MAD",
          title: "ماك بوك إير M2 – ‎16‎ جيغابايت و‎512‎ جيغابايت",
          location: "الدار البيضاء، المغرب",
          time: "منذ 5 ساعات",
          variant: "ph3",
        },
        {
          id: "canape-tunis",
          icon: "🛋️",
          price: "2 200 TND",
          title: "أريكة زاوية فاخرة – توصيل داخل تونس",
          location: "تونس، تونس",
          time: "منذ ساعة",
          variant: "ph4",
          badge: "urgent",
        },
        {
          id: "mode-rabat",
          icon: "👗",
          price: "750 MAD",
          title: "قفطان مطرز يدوياً – إصدار 2025",
          location: "الرباط، المغرب",
          time: "منذ 30 دقيقة",
          variant: "ph5",
        },
        {
          id: "velo-alger",
          icon: "🚲",
          price: "190 000 DZD",
          title: "دراجة كهربائية حضرية – بطارية جديدة 80 كم",
          location: "الجزائر العاصمة، الجزائر",
          time: "منذ 6 ساعات",
          variant: "ph6",
        },
        {
          id: "chiots-sfax",
          icon: "🐶",
          price: "2 400 TND",
          title: "جراء راعي الأطلس مع تطعيمات كاملة",
          location: "صفاقس، تونس",
          time: "منذ 8 ساعات",
          variant: "ph7",
          badge: "particulier",
        },
        {
          id: "camera-tripoli",
          icon: "📷",
          price: "5 800 LYD",
          title: "كاميرا Canon EOS R10 مع عدة تصوير للمدونات",
          location: "طرابلس، ليبيا",
          time: "منذ 4 ساعات",
          variant: "ph8",
        },
      ],
      immobilier: [
        {
          id: "villa-casa",
          icon: "🏡",
          price: "3 250 000 MAD",
          title: "فيلا 5 غرف مع فناء وسطح في أنفا",
          location: "الدار البيضاء، المغرب",
          time: "منذ يوم",
          variant: "ph1",
          badge: "pro",
        },
        {
          id: "studio-algiers",
          icon: "🏢",
          price: "92 000 DZD / شهر",
          title: "استوديو مفروش في حيدرة – ألياف وخدمة بواب",
          location: "الجزائر العاصمة، الجزائر",
          time: "منذ يومين",
          variant: "ph3",
        },
        {
          id: "riad-marrakech",
          icon: "🏠",
          price: "1 980 000 MAD",
          title: "رياض مجدد في المدينة – رخصة دار ضيافة",
          location: "مراكش، المغرب",
          time: "منذ 3 أيام",
          variant: "ph4",
        },
        {
          id: "terrain-tunis",
          icon: "🏗️",
          price: "680 000 TND",
          title: "قطعة أرض قابلة للبناء في المرسى – 420 م²",
          location: "تونس، تونس",
          time: "منذ يومين",
          variant: "ph5",
          badge: "pro",
        },
      ],
    },
  },
};

export const getHomeContent = (language: SupportedLanguage): HomeContent =>
  HOME_CONTENT[language] ?? HOME_CONTENT.fr;
