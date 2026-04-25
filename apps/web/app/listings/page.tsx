'use client';

import Link from "next/link";
import { useMemo, useState } from "react";
import { Nunito_Sans } from "next/font/google";
import { useLanguage } from "../i18n/LanguageProvider";
import { COUNTRY_OPTIONS, type CountryCode } from "../auth/utils/geography";
import { getListingsContent, type ListingCardData, type SortKey } from "./content";

const nunito = Nunito_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const formatResultsLabel = (template: string, count: number): string => template.replace("{count}", count.toString());

const ListingsPage = () => {
  const { language, isRTL } = useLanguage();
  const content = useMemo(() => getListingsContent(language), [language]);
  const { hero, stats, filters, sorting, cta, badges, noResults, mockListings } = content;

  const categoryOptions = useMemo(() => {
    const entries = new Map<string, string>();
    mockListings.forEach(listing => {
      if (!entries.has(listing.categoryValue)) {
        entries.set(listing.categoryValue, listing.categoryLabel);
      }
    });
    return Array.from(entries.entries()).map(([value, label]) => ({ value, label }));
  }, [mockListings]);

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedCountry, setSelectedCountry] = useState<"all" | CountryCode>("all");
  const [minPrice, setMinPrice] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [sortBy, setSortBy] = useState<SortKey>(sorting.options[0]?.value ?? "recent");

  const filteredListings = useMemo(() => {
    const search = query.trim().toLowerCase();
    const min = minPrice ? Number(minPrice) : null;
    const max = maxPrice ? Number(maxPrice) : null;

    return mockListings.filter(listing => {
      const matchesQuery =
        !search ||
        listing.title.toLowerCase().includes(search) ||
        listing.subtitle.toLowerCase().includes(search) ||
        listing.location.toLowerCase().includes(search);

      const matchesCategory = selectedCategory === "all" || listing.categoryValue === selectedCategory;
      const matchesCountry = selectedCountry === "all" || listing.country === selectedCountry;
      const matchesMin = min === null || listing.priceValue >= min;
      const matchesMax = max === null || listing.priceValue <= max;

      return matchesQuery && matchesCategory && matchesCountry && matchesMin && matchesMax;
    });
  }, [mockListings, query, selectedCategory, selectedCountry, minPrice, maxPrice]);

  const sortedListings = useMemo(() => {
    const copy = [...filteredListings];
    return copy.sort((a, b) => {
      if (sortBy === "priceAsc") return a.priceValue - b.priceValue;
      if (sortBy === "priceDesc") return b.priceValue - a.priceValue;
      return a.listedHoursAgo - b.listedHoursAgo;
    });
  }, [filteredListings, sortBy]);

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedCountry("all");
    setMinPrice("");
    setMaxPrice("");
    setSortBy(sorting.options[0]?.value ?? "recent");
  };

  const resultsLabel = formatResultsLabel(filters.resultsLabel, sortedListings.length);

  const renderCard = (listing: ListingCardData) => (
    <article key={listing.id} className="listing-card">
      <div className="card-header">
        <div className="card-cover" aria-hidden="true">
          <span>{listing.cover}</span>
        </div>
        <div className="card-meta">
          <p className="card-category">{listing.categoryLabel}</p>
          <h3>{listing.title}</h3>
          <p className="card-subtitle">{listing.subtitle}</p>
        </div>
        {listing.badge && <span className={`listing-badge ${listing.badge}`}>{badges[listing.badge]}</span>}
      </div>
      <div className="card-body">
        <div className="card-price">{listing.priceLabel}</div>
        <p className="card-location">{listing.location}</p>
        <div className="card-highlights">
          {listing.highlights.map(point => (
            <span key={point}>{point}</span>
          ))}
        </div>
      </div>
      <div className="card-footer">
        <span className="card-time">≈ {listing.listedHoursAgo}h</span>
        <Link href={`/listings/${listing.slug}`} className="card-link">
          {cta.viewDetails}
        </Link>
      </div>
    </article>
  );

  return (
    <div className={`listings-page ${nunito.className} ${isRTL ? "rtl" : ""}`}>
      <section className="hero">
        <p className="hero-pill">{hero.eyebrow}</p>
        <h1>{hero.title}</h1>
        <p className="hero-subtitle">{hero.subtitle}</p>
        <div className="hero-stats">
          {stats.map(stat => (
            <div key={stat.label} className="hero-stat">
              <span className="stat-value">{stat.value}</span>
              <span className="stat-label">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="filters-card">
        <div className="filters-row">
          <label className="sr-only" htmlFor="listings-search">
            {filters.searchPlaceholder}
          </label>
          <input
            id="listings-search"
            type="search"
            value={query}
            onChange={event => setQuery(event.target.value)}
            placeholder={filters.searchPlaceholder}
          />
          <select value={selectedCategory} onChange={event => setSelectedCategory(event.target.value)}>
            <option value="all">{filters.categoryAll}</option>
            {categoryOptions.map(option => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <select
            value={selectedCountry}
            onChange={event => setSelectedCountry(event.target.value as CountryCode | "all")}
          >
            <option value="all">{filters.countryAll}</option>
            {COUNTRY_OPTIONS.map(country => (
              <option key={country.value} value={country.value}>
                {country.label}
              </option>
            ))}
          </select>
        </div>
        <div className="filters-row budget-row">
          <div className="budget-input">
            <span>{filters.priceLabel}</span>
            <div className="budget-fields">
              <input
                type="number"
                min="0"
                placeholder={filters.minPlaceholder}
                value={minPrice}
                onChange={event => setMinPrice(event.target.value)}
                aria-label={filters.minPlaceholder}
              />
              <span className="budget-sep">-</span>
              <input
                type="number"
                min="0"
                placeholder={filters.maxPlaceholder}
                value={maxPrice}
                onChange={event => setMaxPrice(event.target.value)}
                aria-label={filters.maxPlaceholder}
              />
            </div>
          </div>
          <div className="sort-select">
            <label htmlFor="listings-sort">{sorting.label}</label>
            <select
              id="listings-sort"
              value={sortBy}
              onChange={event => setSortBy(event.target.value as SortKey)}
            >
              {sorting.options.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <button type="button" className="reset-btn" onClick={resetFilters}>
            {filters.resetLabel}
          </button>
        </div>
      </section>

      <section className="results">
        <div className="results-head">
          <p>{resultsLabel}</p>
        </div>
        {sortedListings.length > 0 ? (
          <div className="listing-grid">{sortedListings.map(renderCard)}</div>
        ) : (
          <div className="empty-state">
            <h3>{noResults.title}</h3>
            <p>{noResults.description}</p>
            <button type="button" onClick={resetFilters}>
              {filters.resetLabel}
            </button>
          </div>
        )}
      </section>

      <section className="cta-section">
        <div>
          <p className="hero-pill">{hero.pill}</p>
          <h2>{cta.title}</h2>
          <p className="cta-subtitle">{cta.subtitle}</p>
        </div>
        <Link href={cta.href} className="cta-button">
          {cta.button}
        </Link>
      </section>

      <style jsx>{`
        .listings-page {
          --orange: #ff6e14;
          --dark: #0f172a;
          --gray: #6b7280;
          --border: #e2e8f0;
          background: linear-gradient(180deg, #fef8f3 0%, #f7f7fb 30%, #fefefe 100%);
          min-height: 100vh;
          padding-bottom: 80px;
        }

        .listings-page.rtl {
          direction: rtl;
        }

        .hero {
          max-width: 1100px;
          margin: 0 auto;
          padding: 64px 24px 24px;
          text-align: center;
        }

        .hero-pill {
          display: inline-flex;
          padding: 6px 16px;
          border-radius: 999px;
          background: rgba(15, 23, 42, 0.08);
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }

        .hero h1 {
          margin-top: 16px;
          font-size: clamp(2rem, 4vw, 3.25rem);
          font-weight: 800;
          color: var(--dark);
        }

        .hero-subtitle {
          margin: 12px auto 28px;
          max-width: 760px;
          color: var(--gray);
          font-size: 1.05rem;
        }

        .hero-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 16px;
        }

        .hero-stat {
          background: #fff;
          border-radius: 18px;
          padding: 20px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
        }

        .stat-value {
          display: block;
          font-size: 1.75rem;
          font-weight: 800;
          color: var(--orange);
        }

        .stat-label {
          color: var(--gray);
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
        }

        .filters-card {
          max-width: 1100px;
          margin: 24px auto;
          background: #fff;
          border-radius: 20px;
          padding: 24px;
          box-shadow: 0 20px 60px rgba(15, 23, 42, 0.08);
          border: 1px solid #fff;
        }

        .filters-row {
          display: grid;
          gap: 16px;
        }

        .filters-row select,
        .filters-row input[type="search"] {
          border: 1px solid var(--border);
          border-radius: 12px;
          padding: 12px 14px;
          font-size: 0.95rem;
          background: #fdfdfd;
        }

        .filters-row select:focus,
        .filters-row input:focus,
        .budget-fields input:focus {
          outline: 2px solid rgba(255, 110, 20, 0.3);
          border-color: var(--orange);
        }

        .filters-row + .filters-row {
          margin-top: 18px;
        }

        .budget-row {
          grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
          align-items: center;
        }

        .budget-input span {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--gray);
        }

        .budget-fields {
          margin-top: 8px;
          display: flex;
          gap: 8px;
          align-items: center;
        }

        .budget-fields input {
          flex: 1;
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 10px 12px;
        }

        .budget-sep {
          color: var(--gray);
          font-weight: 700;
        }

        .sort-select {
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .sort-select label {
          font-weight: 700;
          font-size: 0.9rem;
          color: var(--gray);
        }

        .sort-select select {
          border-radius: 12px;
          border: 1px solid var(--border);
          padding: 12px 14px;
        }

        .reset-btn {
          justify-self: end;
          border: none;
          background: #fff3ec;
          color: var(--orange);
          font-weight: 700;
          padding: 12px 20px;
          border-radius: 999px;
          cursor: pointer;
        }

        .results {
          max-width: 1100px;
          margin: 0 auto;
          padding: 24px;
        }

        .results-head {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 16px;
          color: var(--gray);
          font-weight: 600;
        }

        .listing-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 18px;
        }

        .listing-card {
          background: #fff;
          border-radius: 18px;
          border: 1px solid rgba(15, 23, 42, 0.08);
          box-shadow: 0 12px 40px rgba(15, 23, 42, 0.08);
          padding: 20px;
          display: flex;
          flex-direction: column;
          gap: 16px;
          position: relative;
        }

        .card-header {
          display: flex;
          gap: 16px;
        }

        .card-cover {
          width: 64px;
          height: 64px;
          border-radius: 16px;
          background: #fff3ec;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 28px;
        }

        .card-meta h3 {
          margin: 2px 0;
          font-size: 1.1rem;
          color: var(--dark);
        }

        .card-category {
          font-size: 0.85rem;
          text-transform: uppercase;
          letter-spacing: 0.08em;
          color: var(--gray);
        }

        .card-subtitle {
          margin: 0;
          color: var(--gray);
          font-size: 0.95rem;
        }

        .listing-badge {
          position: absolute;
          top: 16px;
          right: 16px;
          border-radius: 999px;
          padding: 6px 14px;
          font-size: 0.75rem;
          font-weight: 700;
          color: #fff;
        }

        .listing-badge.pro {
          background: #0f172a;
        }

        .listing-badge.urgent {
          background: #f97316;
        }

        .listing-badge.new {
          background: #0ea5e9;
        }

        .card-price {
          font-size: 1.35rem;
          font-weight: 800;
          color: var(--orange);
        }

        .card-location {
          color: var(--gray);
          margin: 4px 0 12px;
        }

        .card-highlights {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }

        .card-highlights span {
          padding: 4px 10px;
          border-radius: 999px;
          background: #f1f5f9;
          font-size: 0.8rem;
          font-weight: 600;
        }

        .card-footer {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .card-time {
          color: var(--gray);
          font-size: 0.85rem;
        }

        .card-link {
          color: #fff;
          background: var(--orange);
          border-radius: 999px;
          padding: 10px 16px;
          font-weight: 700;
        }

        .empty-state {
          text-align: center;
          padding: 60px 20px;
          border-radius: 18px;
          background: #fff;
          border: 1px dashed var(--border);
        }

        .empty-state button {
          margin-top: 16px;
          border: none;
          background: var(--orange);
          color: #fff;
          padding: 12px 20px;
          border-radius: 999px;
          cursor: pointer;
          font-weight: 700;
        }

        .cta-section {
          max-width: 1100px;
          margin: 40px auto 0;
          padding: 32px;
          border-radius: 24px;
          background: linear-gradient(120deg, #0f172a, #1f3a8a);
          color: #fff;
          display: flex;
          flex-wrap: wrap;
          justify-content: space-between;
          gap: 24px;
          align-items: center;
        }

        .cta-section h2 {
          margin: 12px 0;
          font-size: 2rem;
        }

        .cta-subtitle {
          color: rgba(255, 255, 255, 0.8);
          max-width: 520px;
        }

        .cta-button {
          background: #fff;
          color: #0f172a;
          padding: 14px 28px;
          border-radius: 999px;
          font-weight: 800;
        }

        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }

        @media (max-width: 768px) {
          .filters-card {
            padding: 20px;
          }

          .filters-row {
            grid-template-columns: 1fr;
          }

          .reset-btn {
            justify-self: stretch;
          }

          .card-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .listing-card {
            gap: 12px;
          }

          .card-footer {
            flex-direction: column;
            align-items: flex-start;
            gap: 8px;
          }

          .hero {
            padding-top: 48px;
          }
        }
      `}</style>
    </div>
  );
};

export default ListingsPage;
