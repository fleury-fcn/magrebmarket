'use client';

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Nunito_Sans } from "next/font/google";
import { useAuth } from "./auth/hooks/useAuth";
import { COUNTRY_OPTIONS, type CountryCode } from "./auth/utils/geography";
import { useLanguage } from "./i18n/LanguageProvider";
import { LANGUAGE_OPTIONS, type SupportedLanguage } from "./i18n/languages";
import { getHomeContent, type AdCard } from "./homeContent";
import { apiFetch } from "../lib/api";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"]
});

const fallbackCountry = COUNTRY_OPTIONS[0] ?? { value: "MA", label: "Maroc", flag: "🇲🇦" };

const ensureCountryCode = (value?: string | null): CountryCode | null => {
  if (!value) return null;
  const normalized = value.toUpperCase();
  return COUNTRY_OPTIONS.some(option => option.value === normalized) ? (normalized as CountryCode) : null;
};

const FALLBACK_NAMES: Record<SupportedLanguage, string> = {
  fr: "vous",
  en: "you",
  ar: "أنت",
};

type HomeApiCategory = { slug: string; title: string; description?: string };
type HomeSearchListing = { cover_image: string | null; photos: string[] };
type HomeSearchResponse = { total_results?: number; results?: HomeSearchListing[] };
type LiveCategoryCard = {
  slug: string;
  name: string;
  icon: string;
  count: number;
  images: string[];
};

const CATEGORY_ICON_BY_SLUG: Record<string, string> = {
  immobilier: "🏠",
  vehicules: "🚗",
  emploi: "💼",
  services: "🛠️",
  market: "🛍️",
};

const normalizeImageUrl = (url: string): string => {
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  if (url.startsWith("/")) return `http://localhost:4000${url}`;
  return `http://localhost:4000/${url}`;
};

const extractListingImages = (results: HomeSearchListing[]): string[] => {
  const images: string[] = [];
  for (const listing of results) {
    const photos = Array.isArray(listing.photos) ? listing.photos : [];
    const firstPhoto = photos[0] || listing.cover_image;
    if (firstPhoto) {
      images.push(normalizeImageUrl(firstPhoto));
    }
    if (images.length >= 8) {
      break;
    }
  }
  return images;
};

const fetchLiveCategoryCard = async (category: HomeApiCategory): Promise<LiveCategoryCard> => {
  const response = await apiFetch<HomeSearchResponse>(`listings/search/?category=${encodeURIComponent(category.slug)}&page_size=8&sort=date_desc`);
  const results = Array.isArray(response.results) ? response.results : [];
  return {
    slug: category.slug,
    name: category.title,
    icon: CATEGORY_ICON_BY_SLUG[category.slug] ?? "✨",
    count: response.total_results ?? results.length,
    images: extractListingImages(results),
  };
};

type LiveListing = {
  id: string | number;
  slug: string;
  title: string;
  price: string;
  currency: string;
  category: string;
  region: string;
  city: string;
  country: string;
  cover_image: string | null;
  photos: string[];
  promotion_type: string;
  is_featured: boolean;
  published_at: string | null;
};

const TRENDING_SEARCHES = ["Voiture", "Appartement", "Téléphone", "Moto", "Villa", "Emploi", "Meublé", "4x4"];

const POPULAR_CITIES = [
  { name: "Casablanca", flag: "🇲🇦", country: "MA" },
  { name: "Rabat",       flag: "🇲🇦", country: "MA" },
  { name: "Alger",       flag: "🇩🇿", country: "DZ" },
  { name: "Oran",        flag: "🇩🇿", country: "DZ" },
  { name: "Tunis",       flag: "🇹🇳", country: "TN" },
  { name: "Sfax",        flag: "🇹🇳", country: "TN" },
  { name: "Tripoli",     flag: "🇱🇾", country: "LY" },
  { name: "Nouakchott",  flag: "🇲🇷", country: "MR" },
];

const resolveCoverImage = (ad: LiveListing): string | null => {
  const raw = (Array.isArray(ad.photos) && ad.photos[0]) || ad.cover_image;
  if (!raw) return null;
  return normalizeImageUrl(raw);
};

const fetchLiveListings = async (params: string): Promise<{ results: LiveListing[]; total_results: number }> => {
  const data = await apiFetch<{ results?: LiveListing[]; total_results?: number }>(`listings/search/?${params}`);
  return {
    results: Array.isArray(data.results) ? data.results : [],
    total_results: data.total_results ?? 0,
  };
};

const Home = () => {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { language, setLanguage, isRTL } = useLanguage();
  const content = useMemo(() => getHomeContent(language), [language]);
  const { navCategories, categories, sections, topbar, header, general, badges, ads } = content;
  const { recent: recentAds } = ads;
  const isAuthenticated = Boolean(user);
  const loginHref = "/auth/login?next=/";
  const registerHref = "/auth/register?next=/";
  const greetingName = (user?.first_name?.trim() || user?.email?.split("@")[0] || FALLBACK_NAMES[language]).trim();
  const lockedHint = general.lockedHint;
  const [activeNav, setActiveNav] = useState(() => navCategories[0]?.label ?? "");
  const [favorites, setFavorites] = useState<Record<string, boolean>>({});
  const [locationCountry, setLocationCountry] = useState<CountryCode>(() => COUNTRY_OPTIONS[1]?.value ?? "MA");
  const [liveCategories, setLiveCategories] = useState<LiveCategoryCard[]>([]);
  const [categorySlides, setCategorySlides] = useState<Record<string, number>>({});
  const [liveRecentAds, setLiveRecentAds] = useState<LiveListing[]>([]);
  const [liveFeaturedAds, setLiveFeaturedAds] = useState<LiveListing[]>([]);
  const [totalListingsCount, setTotalListingsCount] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const activeCountry = COUNTRY_OPTIONS.find(country => country.value === locationCountry) ?? fallbackCountry;

  const formatCategoryCount = (count: number) => {
    if (language === "en") return `${count} listing${count > 1 ? "s" : ""}`;
    if (language === "ar") return `${count} إعلان`;
    return `${count} annonce${count > 1 ? "s" : ""}`;
  };

  useEffect(() => {
    setActiveNav(navCategories[0]?.label ?? "");
  }, [language, navCategories]);

  useEffect(() => {
    const matchedCountry = ensureCountryCode(user?.country ?? null);
    if (matchedCountry && matchedCountry !== locationCountry) {
      setLocationCountry(matchedCountry);
    }
  }, [user?.country, locationCountry]);

  useEffect(() => {
    let mounted = true;
    const loadListings = async () => {
      try {
        const [recent, featured, stats] = await Promise.all([
          fetchLiveListings('page_size=8&sort=date_desc'),
          fetchLiveListings('page_size=6&promotion_type=premium'),
          apiFetch<{ active_listings: number }>('meta/stats/'),
        ]);
        if (!mounted) return;
        setLiveRecentAds(recent.results);
        setTotalListingsCount(stats.active_listings);
        setLiveFeaturedAds(featured.results);
      } catch (err) {
        console.error('Failed to load live listings', err);
      }
    };
    void loadListings();
    return () => { mounted = false; };
  }, []);

  useEffect(() => {
    let mounted = true;

    const loadLiveCategories = async () => {
      try {
        const categoriesApi = await apiFetch<HomeApiCategory[]>("meta/categories/");
        const cards = await Promise.all(categoriesApi.map(category => fetchLiveCategoryCard(category)));

        if (!mounted) return;
        setLiveCategories(cards);
        setCategorySlides(
          cards.reduce<Record<string, number>>((acc, category) => {
            acc[category.slug] = 0;
            return acc;
          }, {})
        );
      } catch (error) {
        console.error("Failed to load live categories", error);
      }
    };

    void loadLiveCategories();

    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    if (liveCategories.length === 0) return;
    const interval = globalThis.setInterval(() => {
      setCategorySlides(prev => {
        const next = { ...prev };
        for (const category of liveCategories) {
          if (category.images.length > 1) {
            next[category.slug] = ((prev[category.slug] ?? 0) + 1) % category.images.length;
          }
        }
        return next;
      });
    }, 2600);
    return () => globalThis.clearInterval(interval);
  }, [liveCategories]);

  const handleLogout = () => {
    void logout();
    router.push("/");
  };

  const goToDashboard = () => router.push("/dashboard");
  const handleDepositClick = () => router.push("/listings/new");

  const toggleFavorite = (id: string) => {
    if (!isAuthenticated) return;
    setFavorites(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const renderLiveAd = (ad: LiveListing) => {
    const coverImg = resolveCoverImage(ad);
    const isUrgent = ad.promotion_type === 'urgent';
    const isPremium = ad.promotion_type === 'premium';
    return (
      <Link
        key={`live-${ad.id}`}
        href={`/annonce/${ad.slug}`}
        className="ad-card live-ad-card"
      >
        <div className="ad-img-wrapper">
          {coverImg ? (
            <Image
              src={coverImg}
              alt={ad.title}
              fill
              sizes="(max-width: 768px) 50vw, 25vw"
              style={{ objectFit: 'cover' }}
            />
          ) : (
            <div className="ad-img-no-cover">
              {CATEGORY_ICON_BY_SLUG[ad.category] ?? '📦'}
            </div>
          )}
          {isUrgent && <span className="ad-badge urgent">Urgent</span>}
          {isPremium && <span className="ad-badge pro">Premium</span>}
        </div>
        <div className="ad-body">
          <div className="ad-price">{Number(ad.price).toLocaleString('fr-FR')} {ad.currency}</div>
          <div className="ad-title">{ad.title}</div>
          <div className="ad-meta">
            <span className="ad-location">📍 {ad.city || ad.region}</span>
            <span>{ad.published_at ? new Date(ad.published_at).toLocaleDateString('fr-FR') : ''}</span>
          </div>
        </div>
      </Link>
    );
  };

  const renderAds = (ads: AdCard[]) => (
    <div className="ads-grid">
      {ads.map((ad) => (
        <article className="ad-card" key={ad.id}>
          <div className={`ad-img-placeholder ${ad.variant}`}>{ad.icon}</div>
          {ad.badge && (
            <div className={`ad-badge ${ad.badge}`}>
              {badges[ad.badge]}
            </div>
          )}
          <button
            type="button"
            className="fav-btn"
            onClick={() => toggleFavorite(ad.id)}
            disabled={!isAuthenticated}
            title={isAuthenticated ? general.favoritesHint : lockedHint}
          >
            {favorites[ad.id] ? "❤️" : "🤍"}
          </button>
          <div className="ad-body">
            <div className="ad-price">{ad.price}</div>
            <div className="ad-title">{ad.title}</div>
            <div className="ad-meta">
              <span className="ad-location">📍 {ad.location}</span>
              <span>{ad.time}</span>
            </div>
          </div>
        </article>
      ))}
    </div>
  );

  return (
    <div className={`legacy-home ${isRTL ? "rtl" : ""} ${nunito.className}`}>
      <div className="topbar">
        <div className="topbar-inner">
          <div className="topbar-left">
            <span className="language-label">{topbar.languageLabel}</span>
            <div className="language-switcher" aria-label={topbar.languageLabel}>
              {LANGUAGE_OPTIONS.map(option => (
                <button
                  type="button"
                  key={option.value}
                  className={`language-btn ${option.value === language ? "active" : ""}`}
                  onClick={() => setLanguage(option.value)}
                  aria-pressed={option.value === language}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
          <div className="topbar-right">
            <Link href="/help">{topbar.help}</Link>
            {isAuthenticated ? (
              <>
                <span className="topbar-welcome">
                  {topbar.welcomePrefix} {greetingName}
                </span>
                <button type="button" className="topbar-link-btn" onClick={goToDashboard}>
                  {topbar.mySpace}
                </button>
                <button type="button" className="topbar-link-btn" onClick={handleLogout}>
                  {topbar.logout}
                </button>
              </>
            ) : (
              <>
                <Link href={loginHref}>{topbar.login}</Link>
                <Link href={registerHref}>{topbar.register}</Link>
              </>
            )}
          </div>
        </div>
      </div>

      <header>
        <div className="header-inner">
          <div className="logo" aria-label="Maghreb Market logo">
            <div className="logo-box">mm</div>
            <strong>Maghreb Market</strong>
          </div>
          <div className="search-bar">
            <input
              type="text"
              placeholder={header.searchPlaceholder}
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') router.push(`/search?q=${encodeURIComponent(searchQuery)}`); }}
            />
            <div className="search-divider" />
            <div className="search-location">
              <svg viewBox="0 0 24 24">
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
              <div className="location-chip">
                <span className="location-flag" role="img" aria-hidden="true">
                  {activeCountry.flag}
                </span>
                <span className="location-label">{activeCountry.label}</span>
              </div>
              <select
                className="location-select"
                aria-label={header.locationAria}
                value={locationCountry}
                onChange={event => setLocationCountry(event.target.value as CountryCode)}
              >
                {COUNTRY_OPTIONS.map(country => (
                  <option key={country.value} value={country.value}>
                    {country.flag} {country.label}
                  </option>
                ))}
              </select>
            </div>
            <button type="button" className="search-btn" onClick={() => router.push(`/search?q=${encodeURIComponent(searchQuery)}`)}>
              <svg width="16" height="16" viewBox="0 0 24 24">
                <path
                  d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  stroke="white"
                  strokeWidth="2.5"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              {header.searchButton}
            </button>
          </div>
          <div className="header-actions">
            {isAuthenticated ? (
              <button type="button" className="btn-outline" onClick={goToDashboard}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {header.mySpaceButton}
              </button>
            ) : (
              <Link href={loginHref} className="btn-outline">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
                {header.loginButton}
              </Link>
            )}
            <button
              type="button"
              className="btn-orange"
              onClick={handleDepositClick}
              title={header.depositButton}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {header.depositButton}
            </button>
          </div>
        </div>
      </header>

      <nav className="categories-nav">
        <div className="categories-nav-inner">
          {navCategories.map((item) => (
            <button
              type="button"
              key={item.label}
              className={`cat-nav-item ${activeNav === item.label ? "active" : ""}`}
              onClick={() => setActiveNav(item.label)}
            >
              <span aria-hidden>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </div>
      </nav>

      <main className="main">
        <div className="hero-strip">
          {totalListingsCount !== null && totalListingsCount > 0 && (
            <span className="stat-pill">
              📊 <strong>{totalListingsCount.toLocaleString('fr-FR')}</strong> annonces actives
            </span>
          )}
          <div className="trending-row">
            <span className="trending-label">🔍 Tendances&nbsp;:</span>
            {TRENDING_SEARCHES.map(term => (
              <button
                key={term}
                type="button"
                className="trending-chip"
                onClick={() => router.push(`/search?q=${encodeURIComponent(term)}`)}
              >
                {term}
              </button>
            ))}
          </div>
        </div>

        <section className="section-header">
          <h2 className="section-title">{sections.categoriesTitle}</h2>
        </section>

        <div className="categories-grid">
          {(liveCategories.length > 0 ? liveCategories : categories.map((category, index) => ({
            slug: `fallback-${index}`,
            name: category.name,
            icon: category.icon,
            count: 0,
            images: [],
          }))).map((category) => {
            const currentImage = category.images[categorySlides[category.slug] ?? 0];
            const isLiveCategory = !category.slug.startsWith("fallback-");
            return (
              <button
                type="button"
                className={`category-card ${currentImage ? "has-photo" : ""}`}
                key={category.slug}
                onClick={() => {
                  if (!isLiveCategory) return;
                  router.push(`/search?category=${encodeURIComponent(category.slug)}`);
                }}
                disabled={!isLiveCategory}
              >
                {currentImage ? (
                  <div className="category-media">
                    <Image src={currentImage} alt={category.name} className="category-photo" fill sizes="(max-width: 768px) 50vw, 240px" />
                    <div className="category-photo-overlay" />
                    <div className="category-icon photo-icon">{category.icon}</div>
                  </div>
                ) : (
                  <div className="category-icon">{category.icon}</div>
                )}
                <div className="category-name">{category.name}</div>
                <div className="category-count">{formatCategoryCount(category.count)}</div>
              </button>
            );
          })}
        </div>

        {liveFeaturedAds.length > 0 && (
          <>
            <section className="section-header">
              <h2 className="section-title">⭐ Annonces à la une</h2>
              <Link href="/search?promotion_type=premium" className="section-link">Voir tout →</Link>
            </section>
            <div className="featured-carousel">
              {liveFeaturedAds.map(ad => renderLiveAd(ad))}
            </div>
          </>
        )}

        <section className="section-header">
          <h2 className="section-title">{sections.recentAdsTitle}</h2>
          <Link href="/search" className="section-link">
            {sections.allListingsLink}
          </Link>
        </section>
        {liveRecentAds.length > 0 ? (
          <div className="ads-grid">{liveRecentAds.map(ad => renderLiveAd(ad))}</div>
        ) : (
          renderAds(recentAds)
        )}

        <div className="promo-banner">
          <div className="promo-text">
            <h3>{sections.promoTitle}</h3>
            <p>{sections.promoText}</p>
          </div>
          <button
            type="button"
            className="btn-white"
            onClick={handleDepositClick}
            title={header.depositButton}
          >
            {sections.promoCta}
          </button>
        </div>

        <section className="how-it-works">
          <h2 className="section-title how-title">Comment ca marche ?</h2>
          <div className="steps-grid">
            <div className="step-card">
              <div className="step-icon">📸</div>
              <h3>Déposez votre annonce</h3>
              <p>Gratuit et en moins de 2 minutes. Photos, description, prix : tout y est.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">💬</div>
              <h3>Échangez avec les acheteurs</h3>
              <p>Recevez des messages directement et négociez en toute confiance.</p>
            </div>
            <div className="step-card">
              <div className="step-icon">🤝</div>
              <h3>Concluez la vente</h3>
              <p>Rencontrez-vous ou faites livrer. C&rsquo;est aussi simple que ça.</p>
            </div>
          </div>
        </section>

        <section className="section-header" style={{ marginTop: 32 }}>
          <h2 className="section-title">🏙️ Villes populaires</h2>
        </section>
        <div className="cities-grid">
          {POPULAR_CITIES.map(city => (
            <button
              key={city.name}
              type="button"
              className="city-chip"
              onClick={() => router.push(`/search?city=${encodeURIComponent(city.name)}&country=${city.country}`)}
            >
              <span>{city.flag}</span>
              <span>{city.name}</span>
            </button>
          ))}
        </div>
      </main>

      <footer>
        <div className="footer-inner">
          <div className="footer-col">
            <h4>Maghreb Market</h4>
            <Link href="/about">À propos</Link>
            <Link href="/partners">Partenariats</Link>
            <Link href="/press">Presse</Link>
            <Link href="/careers">Carrières</Link>
          </div>
          <div className="footer-col">
            <h4>Aide & Contact</h4>
            <Link href="/help">Centre d&rsquo;aide</Link>
            <Link href="/security">Sécurité</Link>
            <Link href="/report">Signaler une annonce</Link>
            <Link href="/sellers">Support vendeurs</Link>
          </div>
          <div className="footer-col">
            <h4>Nos services</h4>
            <Link href="/services/boost">Boost premium</Link>
            <Link href="/services/payments">Paiement sécurisé</Link>
            <Link href="/services/shipping">Livraison inter-pays</Link>
            <Link href="/services/pro">Maghreb Market Pro</Link>
          </div>
          <div className="footer-col">
            <h4>Légal</h4>
            <Link href="/legal/terms">CGU</Link>
            <Link href="/legal/privacy">Politique de confidentialité</Link>
            <Link href="/legal/cookies">Cookies</Link>
            <Link href="/legal/accessibility">Accessibilité</Link>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} Maghreb Market — Plateforme d&rsquo;annonces pour la Mauritanie, le Maroc, l&rsquo;Algérie, la Tunisie et la Libye.</span>
          <a
            href="https://github.com/halalopenfoodfacts-server/magrebmarket"
            target="_blank"
            rel="noopener noreferrer"
            className="github-link"
            aria-label="Code source sur GitHub"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            Code source
          </a>
        </div>
      </footer>

      <style jsx global>{`
        .legacy-home {
          --orange: #ff6e14;
          --orange-dark: #e55c00;
          --blue: #1c2b5e;
          --gray-bg: #f5f5f5;
          --gray-border: #e0e0e0;
          --gray-text: #717171;
          --white: #ffffff;
          --text: #1a1a1a;
          background: var(--gray-bg);
          color: var(--text);
          min-height: 100vh;
        }

        .legacy-home.rtl {
          direction: rtl;
        }

        .legacy-home *,
        .legacy-home *::before,
        .legacy-home *::after {
          box-sizing: border-box;
        }

        .legacy-home a {
          text-decoration: none;
          color: inherit;
        }

        .legacy-home button {
          font-family: inherit;
        }

        .legacy-home .topbar {
          background: var(--blue);
          color: #fff;
          font-size: 12px;
          padding: 6px 0;
        }

        .legacy-home .topbar-inner,
        .legacy-home .header-inner,
        .legacy-home .categories-nav-inner,
        .legacy-home .main,
        .legacy-home .footer-inner,
        .legacy-home .footer-bottom {
          max-width: 1200px;
          margin: 0 auto;
          padding: 0 16px;
        }

        .legacy-home .topbar-inner {
          display: flex;
          justify-content: space-between;
          gap: 16px;
          align-items: center;
          flex-wrap: wrap;
        }

        .legacy-home .topbar-left,
        .legacy-home .topbar-right {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
        }

        .legacy-home .language-label {
          font-weight: 700;
          letter-spacing: 0.4px;
          text-transform: uppercase;
        }

        .legacy-home .language-switcher {
          display: flex;
          gap: 6px;
          padding: 2px;
          border-radius: 999px;
          border: 1px solid rgba(255, 255, 255, 0.4);
          background: rgba(0, 0, 0, 0.15);
        }

        .legacy-home .language-btn {
          border: none;
          background: transparent;
          color: inherit;
          font-size: 11px;
          font-weight: 700;
          padding: 4px 12px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.2s ease, color 0.2s ease;
        }

        .legacy-home .language-btn.active {
          background: #fff;
          color: var(--blue);
        }

        .legacy-home .language-btn:not(.active):hover {
          background: rgba(255, 255, 255, 0.15);
        }

        .legacy-home .topbar-link-btn {
          background: none;
          border: none;
          color: inherit;
          font: inherit;
          cursor: pointer;
          padding: 0;
        }

        .legacy-home .topbar-link-btn:hover {
          text-decoration: underline;
        }

        .legacy-home .topbar-welcome {
          font-weight: 600;
        }

        .legacy-home header {
          background: var(--white);
          border-bottom: 1px solid var(--gray-border);
          position: sticky;
          top: 0;
          z-index: 20;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
        }

        .legacy-home .header-inner {
          display: flex;
          align-items: center;
          gap: 16px;
          padding: 10px 16px;
        }

        .legacy-home .logo {
          display: flex;
          align-items: center;
          gap: 8px;
        }

        .legacy-home .logo-box {
          background: var(--orange);
          color: #fff;
          font-size: 20px;
          font-weight: 800;
          padding: 4px 10px;
          border-radius: 6px;
          letter-spacing: -0.5px;
        }

        .legacy-home .search-bar {
          flex: 1;
          display: flex;
          border: 2px solid var(--orange);
          border-radius: 8px;
          overflow: hidden;
          height: 44px;
        }

        .legacy-home .search-bar input {
          flex: 1;
          border: none;
          outline: none;
          padding: 0 14px;
          font-size: 14px;
          background: transparent;
        }

        .legacy-home .search-divider {
          width: 1px;
          background: var(--gray-border);
          margin: 8px 0;
        }

        .legacy-home .search-location {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 0 12px;
          color: var(--gray-text);
          background: transparent;
          cursor: pointer;
          font-size: 13px;
          font-weight: 600;
        }

        .legacy-home .location-chip {
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legacy-home .location-flag {
          font-size: 16px;
        }

        .legacy-home .location-label {
          white-space: nowrap;
        }

        .legacy-home .location-select {
          position: absolute;
          inset: 0;
          opacity: 0;
          border: none;
          cursor: pointer;
          appearance: none;
          width: 100%;
          height: 100%;
        }

        .legacy-home .search-btn {
          border: none;
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
        }

        .legacy-home .search-location svg {
          width: 16px;
          height: 16px;
          fill: var(--orange);
        }

        .legacy-home .search-btn {
          background: var(--orange);
          color: #fff;
          padding: 0 20px;
          font-size: 15px;
          font-weight: 700;
        }

        .legacy-home .search-btn:hover {
          background: var(--orange-dark);
        }

        .legacy-home .header-actions {
          display: flex;
          gap: 8px;
          flex-shrink: 0;
        }

        .legacy-home .btn-outline,
        .legacy-home .btn-orange {
          border-radius: 8px;
          padding: 8px 14px;
          font-size: 13px;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legacy-home .btn-outline {
          border: 2px solid var(--gray-border);
          background: #fff;
        }

        .legacy-home .btn-outline:hover {
          border-color: var(--orange);
          color: var(--orange);
        }

        .legacy-home .btn-orange {
          border: 2px solid var(--orange);
          background: var(--orange);
          color: #fff;
        }

        .legacy-home .btn-orange:hover {
          background: var(--orange-dark);
          border-color: var(--orange-dark);
        }

        .legacy-home .btn-orange:disabled,
        .legacy-home .btn-white:disabled {
          opacity: 0.45;
          cursor: not-allowed;
          border-color: var(--gray-border);
          background: #f5f5f5;
          color: var(--gray-text);
        }

        .legacy-home .categories-nav {
          background: #fff;
          border-bottom: 1px solid var(--gray-border);
        }

        .legacy-home .categories-nav-inner {
          display: flex;
          overflow-x: auto;
          scrollbar-width: none;
        }

        .legacy-home .categories-nav-inner::-webkit-scrollbar {
          display: none;
        }

        .legacy-home .cat-nav-item {
          padding: 12px 16px;
          font-size: 13px;
          font-weight: 700;
          background: transparent;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          white-space: nowrap;
          display: flex;
          align-items: center;
          gap: 6px;
        }

        .legacy-home .cat-nav-item.active,
        .legacy-home .cat-nav-item:hover {
          color: var(--orange);
          border-bottom-color: var(--orange);
        }

        .legacy-home .main {
          padding: 24px 16px 48px;
        }

        .legacy-home .section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
        }

        .legacy-home .section-title {
          font-size: 18px;
          font-weight: 800;
        }

        .legacy-home .section-link {
          font-size: 13px;
          color: var(--orange);
          font-weight: 700;
        }

        .legacy-home .section-link:hover {
          text-decoration: underline;
        }

        .legacy-home .categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
          gap: 10px;
          margin-bottom: 32px;
        }

        .legacy-home .category-card {
          background: #fff;
          border-radius: 10px;
          padding: 12px 10px;
          text-align: center;
          border: 2px solid transparent;
          display: flex;
          flex-direction: column;
          gap: 8px;
          cursor: pointer;
          transition: all 0.2s ease;
          overflow: hidden;
          width: 100%;
          appearance: none;
          font: inherit;
        }

        .legacy-home .category-card:disabled {
          cursor: default;
        }

        .legacy-home .category-card:hover {
          border-color: var(--orange);
          transform: translateY(-2px);
          box-shadow: 0 4px 16px rgba(255, 110, 20, 0.15);
        }

        .legacy-home .category-icon {
          font-size: 28px;
          width: 52px;
          height: 52px;
          margin: 0 auto;
          border-radius: 50%;
          background: #fff3ec;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .legacy-home .category-media {
          width: calc(100% + 20px);
          margin: -12px -10px 4px;
          height: 96px;
          position: relative;
          overflow: hidden;
          background: #f4f4f4;
        }

        .legacy-home .category-photo {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }

        .legacy-home .category-card:hover .category-photo {
          transform: scale(1.05);
        }

        .legacy-home .category-photo-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(to top, rgba(0, 0, 0, 0.35), rgba(0, 0, 0, 0.05));
        }

        .legacy-home .category-icon.photo-icon {
          position: absolute;
          left: 50%;
          bottom: 8px;
          transform: translateX(-50%);
          width: 42px;
          height: 42px;
          font-size: 22px;
          background: rgba(255, 255, 255, 0.95);
        }

        .legacy-home .category-name {
          font-size: 12px;
          font-weight: 700;
        }

        .legacy-home .category-count {
          font-size: 11px;
          color: var(--gray-text);
        }

        .legacy-home .ads-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          gap: 12px;
          margin-bottom: 32px;
        }

        .legacy-home .ad-card {
          background: #fff;
          border-radius: 10px;
          border: 1px solid var(--gray-border);
          position: relative;
          overflow: hidden;
        }

        .legacy-home .ad-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .legacy-home .ad-img-placeholder {
          width: 100%;
          aspect-ratio: 4/3;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
        }

        .legacy-home .ad-badge {
          position: absolute;
          top: 8px;
          left: 8px;
          background: var(--orange);
          color: #fff;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 7px;
          border-radius: 4px;
          text-transform: uppercase;
        }

        .legacy-home .ad-badge.pro {
          background: var(--blue);
        }

        .legacy-home .ad-badge.urgent {
          background: #e84046;
        }

        .legacy-home .fav-btn {
          position: absolute;
          top: 8px;
          right: 8px;
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.9);
          border: none;
          font-size: 16px;
          cursor: pointer;
        }

        .legacy-home .fav-btn:disabled {
          opacity: 0.4;
          cursor: not-allowed;
        }

        .legacy-home .ad-body {
          padding: 10px 12px 12px;
        }

        .legacy-home .ad-price {
          font-size: 16px;
          font-weight: 800;
          margin-bottom: 4px;
        }

        .legacy-home .ad-title {
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 6px;
        }

        .legacy-home .ad-meta {
          display: flex;
          justify-content: space-between;
          font-size: 11px;
          color: var(--gray-text);
        }

        .legacy-home .promo-banner {
          background: linear-gradient(135deg, var(--orange) 0%, #ff8c42 100%);
          color: #fff;
          border-radius: 12px;
          padding: 24px 28px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          gap: 16px;
        }

        .legacy-home .btn-white {
          background: #fff;
          color: var(--orange);
          border: none;
          padding: 10px 22px;
          border-radius: 8px;
          font-weight: 800;
          cursor: pointer;
        }

        .legacy-home footer {
          background: #fff;
          border-top: 1px solid var(--gray-border);
          margin-top: 40px;
        }

        .legacy-home .footer-inner {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
          gap: 32px;
          padding: 32px 16px;
        }

        .legacy-home .footer-col h4 {
          font-size: 13px;
          font-weight: 800;
          margin-bottom: 12px;
          text-transform: uppercase;
        }

        .legacy-home .footer-col a {
          display: block;
          font-size: 13px;
          color: var(--gray-text);
          margin-bottom: 8px;
        }

        .legacy-home .footer-col a:hover {
          color: var(--orange);
        }

        .legacy-home .footer-bottom {
          border-top: 1px solid var(--gray-border);
          padding: 16px;
          font-size: 12px;
          color: var(--gray-text);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 16px;
          flex-wrap: wrap;
        }

        .legacy-home .github-link {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 14px;
          background: #24292f;
          color: #fff;
          border-radius: 8px;
          font-size: 12px;
          font-weight: 700;
          text-decoration: none;
          transition: background 0.18s, transform 0.12s;
          white-space: nowrap;
        }

        .legacy-home .github-link:hover {
          background: #1a1f24;
          transform: translateY(-1px);
        }

        .legacy-home .github-link svg {
          flex-shrink: 0;
        }

        /* ── HERO STRIP ── */
        .legacy-home .hero-strip {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          padding: 10px 0 4px;
          margin-bottom: 18px;
        }

        .legacy-home .stat-pill {
          background: #fff3ec;
          color: var(--orange);
          border-radius: 999px;
          padding: 6px 16px;
          font-size: 13px;
          font-weight: 700;
          white-space: nowrap;
          border: 1px solid rgba(255, 110, 20, 0.25);
        }

        .legacy-home .trending-row {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-wrap: wrap;
        }

        .legacy-home .trending-label {
          font-size: 12px;
          color: var(--gray-text);
          font-weight: 700;
          white-space: nowrap;
        }

        .legacy-home .trending-chip {
          background: #fff;
          border: 1px solid var(--gray-border);
          border-radius: 999px;
          padding: 5px 13px;
          font-size: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.18s;
          font: inherit;
        }

        .legacy-home .trending-chip:hover {
          border-color: var(--orange);
          color: var(--orange);
          background: #fff3ec;
        }

        /* ── FEATURED CAROUSEL ── */
        .legacy-home .featured-carousel {
          display: flex;
          gap: 12px;
          overflow-x: auto;
          scrollbar-width: thin;
          scrollbar-color: var(--gray-border) transparent;
          padding-bottom: 8px;
          margin-bottom: 32px;
        }

        .legacy-home .featured-carousel .ad-card {
          flex: 0 0 220px;
          min-width: 0;
        }

        /* ── LIVE AD CARD ── */
        .legacy-home .live-ad-card {
          display: block;
          color: inherit;
          text-decoration: none;
        }

        .legacy-home .live-ad-card:hover {
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.12);
        }

        .legacy-home .ad-img-wrapper {
          width: 100%;
          aspect-ratio: 4 / 3;
          position: relative;
          overflow: hidden;
          background: #f0f0f0;
        }

        .legacy-home .ad-img-no-cover {
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 48px;
          background: #f5f5f5;
        }

        /* ── HOW IT WORKS ── */
        .legacy-home .how-it-works {
          background: #fff;
          border-radius: 16px;
          padding: 28px 24px;
          margin-bottom: 32px;
          border: 1px solid var(--gray-border);
        }

        .legacy-home .how-title {
          text-align: center;
          margin-bottom: 24px;
        }

        .legacy-home .steps-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
        }

        .legacy-home .step-card {
          text-align: center;
          padding: 16px;
        }

        .legacy-home .step-icon {
          font-size: 40px;
          margin-bottom: 12px;
        }

        .legacy-home .step-card h3 {
          font-size: 14px;
          font-weight: 800;
          margin-bottom: 8px;
        }

        .legacy-home .step-card p {
          font-size: 12px;
          color: var(--gray-text);
          line-height: 1.6;
        }

        /* ── POPULAR CITIES ── */
        .legacy-home .cities-grid {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          margin-bottom: 40px;
        }

        .legacy-home .city-chip {
          background: #fff;
          border: 1px solid var(--gray-border);
          border-radius: 8px;
          padding: 8px 16px;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: all 0.18s;
          font: inherit;
        }

        .legacy-home .city-chip:hover {
          border-color: var(--orange);
          color: var(--orange);
          background: #fff3ec;
        }

        @media (max-width: 900px) {
          .legacy-home .header-inner {
            flex-wrap: wrap;
          }
          .legacy-home .steps-grid {
            grid-template-columns: 1fr;
          }
          .legacy-home .hero-strip {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  );
};

export default Home;
