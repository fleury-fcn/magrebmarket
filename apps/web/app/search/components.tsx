import Image from 'next/image';
import Link from 'next/link';
import { useState, type Dispatch, type MouseEvent, type ReactNode } from 'react';

import { CATEGORIES, CONDITIONS, LBC, RADIUS_OPTIONS } from './data';
import type { Ad, Condition, SearchFilters } from './types';

const formatPrice = (price: number | null): string => {
  if (price === null || price === 0) return 'Gratuit';
  return `${price.toLocaleString('fr-FR')} €`;
};

const timeAgo = (date: Date): string => {
  const diff = (Date.now() - date.getTime()) / 1000;
  if (diff < 3600) return `Il y a ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Il y a ${Math.floor(diff / 3600)} h`;
  if (diff < 86400 * 2) return 'Hier';
  return `Il y a ${Math.floor(diff / 86400)} j`;
};

const getConditionInfo = (id: Condition) => CONDITIONS.find(item => item.id === id) ?? CONDITIONS[2];

export function Navbar({ query, onQueryChange, onSearch, isMobile = false }: Readonly<{ query: string; onQueryChange: Dispatch<string>; onSearch: () => void; isMobile?: boolean }>) {
  const handleHover = (event: MouseEvent<HTMLButtonElement>, hovering: boolean) => {
    event.currentTarget.style.background = hovering ? LBC.orangeHover : LBC.orange;
  };

  return (
    <header
      style={{
        background: LBC.white,
        borderBottom: `2px solid ${LBC.orange}`,
        position: 'sticky',
        top: 0,
        zIndex: 200,
        boxShadow: '0 1px 4px rgba(0,0,0,0.08)',
      }}
    >
      <div
        style={{
          maxWidth: 1200,
          margin: '0 auto',
          padding: isMobile ? '0 10px' : '0 16px',
          height: isMobile ? 56 : 60,
          display: 'flex',
          alignItems: 'center',
          gap: isMobile ? 8 : 16,
        }}
      >
        <Link
          href="/"
          style={{
            fontFamily: "'Nunito', 'Arial Rounded MT Bold', sans-serif",
            fontWeight: 900,
            fontSize: isMobile ? 18 : 22,
            color: LBC.orange,
            textDecoration: 'none',
            letterSpacing: -0.5,
            flexShrink: 0,
          }}
        >
          leboncoin
        </Link>

        <div style={{ flex: 1, display: 'flex', gap: 0, maxWidth: isMobile ? '100%' : 700 }}>
          <input
            type="text"
            value={query}
            onChange={event => onQueryChange(event.target.value)}
            onKeyDown={event => {
              if (event.key === 'Enter') onSearch();
            }}
            placeholder="Rechercher sur leboncoin..."
            style={{
              flex: 1,
              padding: isMobile ? '8px 10px' : '9px 16px',
              border: `1.5px solid ${LBC.orange}`,
              borderRight: 'none',
              borderRadius: '6px 0 0 6px',
              fontSize: isMobile ? 13 : 14,
              outline: 'none',
              fontFamily: 'inherit',
            }}
          />
          <button
            onClick={onSearch}
            style={{
              background: LBC.orange,
              color: LBC.white,
              border: 'none',
              borderRadius: '0 6px 6px 0',
              padding: isMobile ? '0 14px' : '0 20px',
              cursor: 'pointer',
              fontSize: 16,
              fontWeight: 700,
              transition: 'background 0.15s',
            }}
            onMouseEnter={event => handleHover(event, true)}
            onMouseLeave={event => handleHover(event, false)}
          >
            🔍
          </button>
        </div>

        <div style={{ display: isMobile ? 'none' : 'flex', gap: 12, flexShrink: 0 }}>
          <button
            type="button"
            style={{
              background: 'none',
              border: `1px solid ${LBC.gray300}`,
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              color: LBC.gray700,
            }}
          >
            Se connecter
          </button>
          <button
            type="button"
            style={{
              background: LBC.orange,
              color: LBC.white,
              border: 'none',
              borderRadius: 6,
              padding: '8px 14px',
              fontSize: 13,
              fontWeight: 700,
              cursor: 'pointer',
            }}
          >
            Déposer une annonce
          </button>
        </div>
      </div>
    </header>
  );
}

export function Breadcrumb({ category, subcategory, query }: Readonly<{ category: string; subcategory: string; query: string }>) {
  const cat = CATEGORIES.find(item => item.id === category);
  const sub = cat?.subcategories.find(item => item.id === subcategory);

  return (
    <nav
      style={{
        fontSize: 13,
        color: LBC.gray600,
        display: 'flex',
        alignItems: 'center',
        gap: 6,
        flexWrap: 'wrap',
      }}
    >
      <Link href="/" style={{ color: LBC.orange, textDecoration: 'none' }}>
        Accueil
      </Link>
      {cat && (
        <>
          <span style={{ color: LBC.gray300 }}>›</span>
          <span style={{ color: sub ? LBC.orange : LBC.gray900 }}>{cat.label}</span>
        </>
      )}
      {sub && (
        <>
          <span style={{ color: LBC.gray300 }}>›</span>
          <span style={{ color: LBC.gray900 }}>{sub.label}</span>
        </>
      )}
      {query && !cat && (
        <>
          <span style={{ color: LBC.gray300 }}>›</span>
          <span style={{ color: LBC.gray900 }}>« {query} »</span>
        </>
      )}
    </nav>
  );
}

export function Sidebar({ filters, onChange, onReset, totalActive, isMobile = false }: Readonly<{ filters: SearchFilters; onChange: Dispatch<Partial<SearchFilters>>; onReset: () => void; totalActive: number; isMobile?: boolean }>) {
  const [expandedCat, setExpandedCat] = useState<string | null>(filters.category || null);

  const toggleCondition = (id: Condition) => {
    const next = filters.conditions.includes(id)
      ? filters.conditions.filter(item => item !== id)
      : [...filters.conditions, id];
    onChange({ conditions: next, page: 1 });
  };

  return (
    <aside style={{ width: isMobile ? '100%' : 260, flexShrink: 0, display: 'flex', flexDirection: 'column', gap: 0 }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 14,
        }}
      >
        <span style={{ fontWeight: 700, fontSize: 15, color: LBC.gray900 }}>
          Filtrer
          {totalActive > 0 && (
            <span
              style={{
                background: LBC.orange,
                color: LBC.white,
                borderRadius: 10,
                fontSize: 11,
                fontWeight: 700,
                padding: '1px 7px',
                marginLeft: 8,
              }}
            >
              {totalActive}
            </span>
          )}
        </span>
        {totalActive > 0 && (
          <button
            type="button"
            onClick={onReset}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              fontSize: 13,
              color: LBC.orange,
              fontWeight: 600,
              textDecoration: 'underline',
              padding: 0,
            }}
          >
            Réinitialiser
          </button>
        )}
      </div>

      <FilterSection title="Catégorie">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
          {CATEGORIES.map(category => {
            const isSelected = filters.category === category.id;
            const isExpanded = expandedCat === category.id;
            return (
              <div key={category.id}>
                <button
                  type="button"
                  onClick={() => {
                    onChange({
                      category: isSelected ? '' : category.id,
                      subcategory: '',
                      page: 1,
                    });
                    setExpandedCat(isExpanded ? null : category.id);
                  }}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '7px 10px',
                    border: 'none',
                    borderRadius: 6,
                    background: isSelected ? LBC.orangeLight : 'transparent',
                    cursor: 'pointer',
                    fontSize: 13,
                    color: isSelected ? LBC.orange : LBC.gray900,
                    fontWeight: isSelected ? 700 : 400,
                    textAlign: 'left',
                  }}
                >
                  <span>
                    {category.icon} {category.label}
                  </span>
                  <span style={{ color: LBC.gray400, fontSize: 12 }}>
                    {isExpanded && category.subcategories.length > 0 ? '▲' : '▶'}
                  </span>
                </button>
                {(isExpanded || isSelected) && category.subcategories.length > 0 && (
                  <div
                    style={{
                      marginLeft: 16,
                      borderLeft: `2px solid ${LBC.gray200}`,
                      paddingLeft: 8,
                      marginBottom: 4,
                    }}
                  >
                    {category.subcategories.map(sub => {
                      const subSelected = filters.subcategory === sub.id;
                      return (
                        <button
                          key={sub.id}
                          type="button"
                          onClick={() =>
                            onChange({
                              category: category.id,
                              subcategory: subSelected ? '' : sub.id,
                              page: 1,
                            })
                          }
                          style={{
                            width: '100%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '5px 8px',
                            border: 'none',
                            borderRadius: 4,
                            background: subSelected ? LBC.orangeLight : 'transparent',
                            cursor: 'pointer',
                            fontSize: 12,
                            color: subSelected ? LBC.orange : LBC.gray700,
                            fontWeight: subSelected ? 700 : 400,
                            textAlign: 'left',
                          }}
                        >
                          <span>{sub.label}</span>
                          <span style={{ color: LBC.gray400, fontSize: 11 }}>
                            {sub.count.toLocaleString('fr-FR')}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Prix">
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <input
            type="number"
            placeholder="Min"
            value={filters.priceMin}
            onChange={event => onChange({ priceMin: event.target.value, page: 1 })}
            min="0"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: `1px solid ${LBC.gray200}`,
              borderRadius: 6,
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ color: LBC.gray400, fontSize: 13 }}>–</span>
          <input
            type="number"
            placeholder="Max"
            value={filters.priceMax}
            onChange={event => onChange({ priceMax: event.target.value, page: 1 })}
            min="0"
            style={{
              flex: 1,
              padding: '8px 10px',
              border: `1px solid ${LBC.gray200}`,
              borderRadius: 6,
              fontSize: 13,
              outline: 'none',
              fontFamily: 'inherit',
              boxSizing: 'border-box',
            }}
          />
          <span style={{ color: LBC.gray600, fontSize: 13 }}>€</span>
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5, marginTop: 8 }}>
          {[
            { label: '< 50 €', max: '50' },
            { label: '< 200 €', max: '200' },
            { label: '< 500 €', max: '500' },
            { label: '< 1 000 €', max: '1000' },
          ].map(shortcut => (
            <button
              key={shortcut.max}
              type="button"
              onClick={() => onChange({ priceMax: shortcut.max, priceMin: '', page: 1 })}
              style={{
                border: `1px solid ${filters.priceMax === shortcut.max ? LBC.orange : LBC.gray200}`,
                borderRadius: 12,
                padding: '3px 10px',
                fontSize: 11,
                background: filters.priceMax === shortcut.max ? LBC.orangeLight : LBC.white,
                color: filters.priceMax === shortcut.max ? LBC.orange : LBC.gray700,
                cursor: 'pointer',
                fontWeight: filters.priceMax === shortcut.max ? 700 : 400,
              }}
            >
              {shortcut.label}
            </button>
          ))}
        </div>
      </FilterSection>

      <FilterSection title="Localisation">
        <input
          type="text"
          placeholder="Ville, département, code postal"
          value={filters.location}
          onChange={event => onChange({ location: event.target.value, page: 1 })}
          style={{
            width: '100%',
            padding: '8px 12px',
            border: `1px solid ${LBC.gray200}`,
            borderRadius: 6,
            fontSize: 13,
            outline: 'none',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            marginBottom: 10,
          }}
        />
        <div>
          <div style={{ fontSize: 12, color: LBC.gray600, marginBottom: 5, fontWeight: 600 }}>
            Rayon de recherche
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 5 }}>
            {RADIUS_OPTIONS.map(option => (
              <button
                key={option.value}
                type="button"
                onClick={() => onChange({ radius: option.value, page: 1 })}
                style={{
                  border: `1px solid ${filters.radius === option.value ? LBC.orange : LBC.gray200}`,
                  borderRadius: 12,
                  padding: '4px 10px',
                  fontSize: 11,
                  background: filters.radius === option.value ? LBC.orangeLight : LBC.white,
                  color: filters.radius === option.value ? LBC.orange : LBC.gray700,
                  cursor: 'pointer',
                  fontWeight: filters.radius === option.value ? 700 : 400,
                }}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
      </FilterSection>

      <FilterSection title="État">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {CONDITIONS.map(condition => {
            const checked = filters.conditions.includes(condition.id);
            return (
              <label
                key={condition.id}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  cursor: 'pointer',
                  fontSize: 13,
                  color: LBC.gray900,
                  userSelect: 'none',
                  padding: '3px 0',
                }}
              >
                <button
                  type="button"
                  onClick={() => toggleCondition(condition.id)}
                  aria-pressed={checked}
                  style={{
                    width: 18,
                    height: 18,
                    border: `2px solid ${checked ? LBC.orange : LBC.gray300}`,
                    borderRadius: 4,
                    background: checked ? LBC.orange : LBC.white,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                    outline: 'none',
                    backgroundClip: 'padding-box',
                  }}
                >
                  {checked && <span style={{ color: LBC.white, fontSize: 12, fontWeight: 700 }}>✓</span>}
                </button>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: condition.color, flexShrink: 0 }} />
                {condition.label}
              </label>
            );
          })}
        </div>
      </FilterSection>

      <FilterSection title="Options">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          <ToggleRow label="Avec photo uniquement" checked={filters.withPhoto} onChange={value => onChange({ withPhoto: value, page: 1 })} />
          <ToggleRow label="Annonces urgentes" checked={!!filters.isUrgent} onChange={value => onChange({ isUrgent: value || null, page: 1 })} />
          <div>
            <div style={{ fontSize: 12, color: LBC.gray600, marginBottom: 6, fontWeight: 600 }}>Type d&apos;annonceur</div>
            <div style={{ display: 'flex', gap: 6 }}>
              {[
                { val: null, label: 'Tous' },
                { val: false, label: 'Particuliers' },
                { val: true, label: 'Pros' },
              ].map(option => (
                <button
                  key={String(option.val)}
                  type="button"
                  onClick={() => onChange({ isPro: option.val, page: 1 })}
                  style={{
                    flex: 1,
                    padding: '6px 4px',
                    border: `1.5px solid ${filters.isPro === option.val ? LBC.orange : LBC.gray200}`,
                    borderRadius: 6,
                    fontSize: 11,
                    fontWeight: filters.isPro === option.val ? 700 : 400,
                    background: filters.isPro === option.val ? LBC.orangeLight : LBC.white,
                    color: filters.isPro === option.val ? LBC.orange : LBC.gray700,
                    cursor: 'pointer',
                  }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </FilterSection>
    </aside>
  );
}

function FilterSection({ title, children }: Readonly<{ title: string; children: ReactNode }>) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ borderBottom: `1px solid ${LBC.gray200}`, paddingBottom: 14, marginBottom: 14 }}>
      <button
        type="button"
        onClick={() => setOpen(prev => !prev)}
        style={{
          width: '100%',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: 'none',
          border: 'none',
          padding: '0 0 10px 0',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 700,
          color: LBC.gray900,
          textAlign: 'left',
        }}
      >
        {title}
        <span style={{ color: LBC.gray400, fontSize: 12 }}>{open ? '▲' : '▼'}</span>
      </button>
      {open && children}
    </div>
  );
}

function ToggleRow({ label, checked, onChange }: Readonly<{ label: string; checked: boolean; onChange: Dispatch<boolean> }>) {
  return (
    <label
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        userSelect: 'none',
        fontSize: 13,
        color: LBC.gray900,
      }}
    >
      {label}
      <button
        type="button"
        onClick={() => onChange(!checked)}
        aria-pressed={checked}
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: checked ? LBC.orange : LBC.gray200,
          position: 'relative',
          cursor: 'pointer',
          transition: 'background 0.2s',
          border: 'none',
          outline: 'none',
          padding: 0,
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: 3,
            left: checked ? 21 : 3,
            width: 16,
            height: 16,
            borderRadius: '50%',
            background: LBC.white,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }}
        />
      </button>
    </label>
  );
}

export function AdCard({ ad, onToggleFavorite }: Readonly<{ ad: Ad; onToggleFavorite: Dispatch<string> }>) {
  const cond = getConditionInfo(ad.condition);

  return (
    <article
      style={{
        border: `1px solid ${LBC.gray200}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: LBC.white,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s, transform 0.1s',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={event => {
        const target = event.currentTarget as HTMLElement;
        target.style.boxShadow = '0 4px 16px rgba(0,0,0,0.12)';
        target.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={event => {
        const target = event.currentTarget as HTMLElement;
        target.style.boxShadow = 'none';
        target.style.transform = 'translateY(0)';
      }}
    >
      <div style={{ position: 'relative', aspectRatio: '4/3', background: LBC.gray100, overflow: 'hidden' }}>
        {ad.photos.length > 0 ? (
          <Image
            src={ad.photos[0]}
            alt={ad.title}
            width={600}
            height={450}
            sizes="(max-width: 600px) 100vw, (max-width: 1200px) 33vw, 25vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div
            style={{
              width: '100%',
              height: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 36,
              color: LBC.gray300,
            }}
          >
            📷
          </div>
        )}

        <div style={{ position: 'absolute', top: 8, left: 8, display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {ad.isUrgent && (
            <span style={{ background: LBC.urgent, color: LBC.white, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
              Urgent
            </span>
          )}
          {ad.isPro && (
            <span style={{ background: LBC.pro, color: LBC.white, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
              Pro
            </span>
          )}
        </div>

        {ad.photos.length > 1 && (
          <span
            style={{
              position: 'absolute',
              bottom: 8,
              right: 8,
              background: 'rgba(0,0,0,0.55)',
              color: LBC.white,
              fontSize: 11,
              padding: '2px 7px',
              borderRadius: 10,
            }}
          >
            📷 {ad.photos.length}
          </span>
        )}

        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onToggleFavorite(ad.id);
          }}
          style={{
            position: 'absolute',
            top: 8,
            right: 8,
            background: 'rgba(255,255,255,0.9)',
            border: 'none',
            borderRadius: '50%',
            width: 32,
            height: 32,
            cursor: 'pointer',
            fontSize: 16,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
          }}
        >
          {ad.isFavorite ? '❤️' : '🤍'}
        </button>
      </div>

      <div style={{ padding: '10px 12px 12px', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginBottom: 4 }}>
          <span style={{ fontSize: 18, fontWeight: 700, color: ad.price ? LBC.gray900 : LBC.green }}>{formatPrice(ad.price)}</span>
          {ad.negotiable && <span style={{ fontSize: 11, color: LBC.gray600, fontWeight: 600 }}>Négociable</span>}
        </div>
        <div
          style={{
            fontSize: 13,
            fontWeight: 500,
            color: LBC.gray900,
            lineHeight: 1.4,
            marginBottom: 8,
            flex: 1,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {ad.title}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 11, color: cond.color, fontWeight: 600 }}>
            <span style={{ width: 7, height: 7, borderRadius: '50%', background: cond.color }} />
            {cond.label}
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 11, color: LBC.gray400 }}>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📍 {ad.city} ({ad.zipCode.slice(0, 2)})
          </span>
          <span style={{ flexShrink: 0, marginLeft: 6 }}>{timeAgo(ad.postedAt)}</span>
        </div>
      </div>
    </article>
  );
}

export function AdRow({ ad, onToggleFavorite, isMobile = false }: Readonly<{ ad: Ad; onToggleFavorite: Dispatch<string>; isMobile?: boolean }>) {
  const cond = getConditionInfo(ad.condition);

  return (
    <article
      style={{
        display: 'flex',
        flexDirection: isMobile ? 'column' : 'row',
        border: `1px solid ${LBC.gray200}`,
        borderRadius: 8,
        overflow: 'hidden',
        background: LBC.white,
        cursor: 'pointer',
        transition: 'box-shadow 0.15s',
        position: 'relative',
      }}
      onMouseEnter={event => {
        const target = event.currentTarget as HTMLElement;
        target.style.boxShadow = '0 3px 12px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={event => {
        const target = event.currentTarget as HTMLElement;
        target.style.boxShadow = 'none';
      }}
    >
      <div style={{ width: isMobile ? '100%' : 170, flexShrink: 0, background: LBC.gray100, position: 'relative', overflow: 'hidden', aspectRatio: isMobile ? '16/9' : '4/3' }}>
        {ad.photos.length > 0 ? (
          <Image
            src={ad.photos[0]}
            alt={ad.title}
            width={400}
            height={300}
            sizes="(max-width: 768px) 50vw, 25vw"
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 30, color: LBC.gray300 }}>
            📷
          </div>
        )}
        {ad.isUrgent && (
          <span style={{ position: 'absolute', top: 8, left: 8, background: LBC.urgent, color: LBC.white, fontSize: 10, fontWeight: 700, padding: '2px 6px', borderRadius: 3 }}>
            Urgent
          </span>
        )}
      </div>
      <div style={{ flex: 1, padding: '12px 16px', minWidth: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: LBC.gray900, marginBottom: 4, lineHeight: 1.3 }}>{ad.title}</div>
            <div style={{ fontSize: 12, color: LBC.gray600, marginBottom: 8, lineHeight: 1.5, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
              {ad.description}
            </div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: cond.color, fontWeight: 600 }}>
                <span style={{ width: 7, height: 7, borderRadius: '50%', background: cond.color }} />
                {cond.label}
              </span>
              {ad.isPro && <span style={{ background: LBC.pro, color: LBC.white, fontSize: 10, fontWeight: 700, padding: '1px 6px', borderRadius: 3 }}>Pro</span>}
              <span style={{ fontSize: 11, color: LBC.gray400 }}>👁 {ad.views}</span>
            </div>
          </div>
          <div style={{ flexShrink: 0, textAlign: 'right' }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: LBC.gray900, marginBottom: 4 }}>{formatPrice(ad.price)}</div>
            {ad.negotiable && <div style={{ fontSize: 11, color: LBC.gray600 }}>Négociable</div>}
          </div>
        </div>
      </div>
      <div style={{ width: isMobile ? '100%' : 120, flexShrink: 0, borderLeft: isMobile ? 'none' : `1px solid ${LBC.gray100}`, borderTop: isMobile ? `1px solid ${LBC.gray100}` : 'none', display: 'flex', flexDirection: isMobile ? 'row' : 'column', justifyContent: 'space-between', padding: '12px', alignItems: 'center', background: LBC.gray50 }}>
        <button
          type="button"
          onClick={event => {
            event.stopPropagation();
            onToggleFavorite(ad.id);
          }}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 20 }}
        >
          {ad.isFavorite ? '❤️' : '🤍'}
        </button>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 11, color: LBC.gray400, marginBottom: 2 }}>📍 {ad.city}</div>
          <div style={{ fontSize: 11, color: LBC.gray400 }}>{timeAgo(ad.postedAt)}</div>
        </div>
      </div>
    </article>
  );
}

const PAGINATION_DOTS = {
  START: 'dots-start',
  END: 'dots-end',
} as const;

type PaginationDots = (typeof PAGINATION_DOTS)[keyof typeof PAGINATION_DOTS];

export function Pagination({ current, total, onChange }: Readonly<{ current: number; total: number; onChange: Dispatch<number> }>) {
  if (total <= 1) return null;

  const pages: Array<number | PaginationDots> = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i += 1) pages.push(i);
  } else {
    pages.push(1);
    if (current > 3) pages.push(PAGINATION_DOTS.START);
    for (let i = Math.max(2, current - 1); i <= Math.min(total - 1, current + 1); i += 1) {
      pages.push(i);
    }
    if (current < total - 2) pages.push(PAGINATION_DOTS.END);
    pages.push(total);
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 4, marginTop: 32, paddingBottom: 24 }}>
      <button
        type="button"
        disabled={current === 1}
        onClick={() => onChange(current - 1)}
        style={{
          padding: '8px 14px',
          border: `1px solid ${LBC.gray200}`,
          borderRadius: 6,
          background: LBC.white,
          cursor: current === 1 ? 'not-allowed' : 'pointer',
          opacity: current === 1 ? 0.4 : 1,
          fontSize: 13,
          color: LBC.gray900,
        }}
      >
        ← Précédent
      </button>
      {pages.map(page =>
        page === PAGINATION_DOTS.START || page === PAGINATION_DOTS.END
          ? (
            <span key={page} style={{ padding: '0 6px', color: LBC.gray400 }}>
              …
            </span>
          )
          : (
            <button
              key={page}
              type="button"
              onClick={() => onChange(page)}
              style={{
                width: 38,
                height: 38,
                border: `1px solid ${current === page ? LBC.orange : LBC.gray200}`,
                borderRadius: 6,
                background: current === page ? LBC.orange : LBC.white,
                color: current === page ? LBC.white : LBC.gray900,
                fontWeight: current === page ? 700 : 400,
                cursor: 'pointer',
                fontSize: 13,
              }}
            >
              {page}
            </button>
          )
      )}
      <button
        type="button"
        disabled={current === total}
        onClick={() => onChange(current + 1)}
        style={{
          padding: '8px 14px',
          border: `1px solid ${LBC.gray200}`,
          borderRadius: 6,
          background: LBC.white,
          cursor: current === total ? 'not-allowed' : 'pointer',
          opacity: current === total ? 0.4 : 1,
          fontSize: 13,
          color: LBC.gray900,
        }}
      >
        Suivant →
      </button>
    </div>
  );
}

export function ActiveFilters({ filters, onChange }: Readonly<{ filters: SearchFilters; onChange: Dispatch<Partial<SearchFilters>> }>) {
  const tags: Array<{ id: string; label: string; onRemove: () => void }> = [];

  if (filters.category) {
    const cat = CATEGORIES.find(item => item.id === filters.category);
    if (cat) tags.push({ id: 'category', label: cat.label, onRemove: () => onChange({ category: '', subcategory: '', page: 1 }) });
  }
  if (filters.subcategory) {
    const cat = CATEGORIES.find(item => item.id === filters.category);
    const sub = cat?.subcategories.find(item => item.id === filters.subcategory);
    if (sub) tags.push({ id: 'subcategory', label: sub.label, onRemove: () => onChange({ subcategory: '', page: 1 }) });
  }
  if (filters.priceMin)
    tags.push({ id: 'price-min', label: `Min ${filters.priceMin} €`, onRemove: () => onChange({ priceMin: '', page: 1 }) });
  if (filters.priceMax)
    tags.push({ id: 'price-max', label: `Max ${filters.priceMax} €`, onRemove: () => onChange({ priceMax: '', page: 1 }) });
  if (filters.location)
    tags.push({ id: 'location', label: `📍 ${filters.location}`, onRemove: () => onChange({ location: '', page: 1 }) });
  filters.conditions.forEach(conditionId => {
    const condition = CONDITIONS.find(item => item.id === conditionId);
    if (condition) {
      tags.push({
        id: `condition-${conditionId}`,
        label: condition.label,
        onRemove: () => onChange({ conditions: filters.conditions.filter(item => item !== conditionId), page: 1 }),
      });
    }
  });
  if (filters.withPhoto) tags.push({ id: 'with-photo', label: 'Avec photo', onRemove: () => onChange({ withPhoto: false, page: 1 }) });
  if (filters.isUrgent) tags.push({ id: 'urgent', label: 'Urgent', onRemove: () => onChange({ isUrgent: null, page: 1 }) });
  if (filters.isPro !== null)
    tags.push({
      id: 'is-pro',
      label: filters.isPro ? 'Professionnels' : 'Particuliers',
      onRemove: () => onChange({ isPro: null, page: 1 }),
    });

  if (tags.length === 0) return null;

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 }}>
      {tags.map(tag => (
        <span
          key={tag.id}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            background: LBC.orangeLight,
            border: `1px solid ${LBC.orangeBorder}`,
            color: LBC.orange,
            borderRadius: 14,
            padding: '4px 10px',
            fontSize: 12,
            fontWeight: 600,
          }}
        >
          {tag.label}
          <button
            type="button"
            onClick={tag.onRemove}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: LBC.orange, padding: 0, fontSize: 14, lineHeight: 1, fontWeight: 700 }}
          >
            ✕
          </button>
        </span>
      ))}
    </div>
  );
}

export function EmptyState({ onReset }: Readonly<{ onReset: () => void }>) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: LBC.gray600 }}>
      <div style={{ fontSize: 48, marginBottom: 16 }}>🔍</div>
      <div style={{ fontSize: 18, fontWeight: 700, color: LBC.gray900, marginBottom: 8 }}>Aucune annonce trouvée</div>
      <div style={{ fontSize: 14, marginBottom: 20 }}>Essayez de modifier vos filtres ou d&apos;élargir votre recherche.</div>
      <button
        type="button"
        onClick={onReset}
        style={{
          background: LBC.orange,
          color: LBC.white,
          border: 'none',
          borderRadius: 6,
          padding: '10px 20px',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Réinitialiser les filtres
      </button>
    </div>
  );
}

export function LoadingState() {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: LBC.gray600 }}>
      <div style={{ fontSize: 32, marginBottom: 12 }}>⏳</div>
      <div style={{ fontSize: 15, fontWeight: 600 }}>Chargement des annonces...</div>
    </div>
  );
}

export function ErrorState({ message, onRetry }: Readonly<{ message: string; onRetry: () => void }>) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 24px', color: LBC.gray600 }}>
      <div style={{ fontSize: 40, marginBottom: 12 }}>⚠️</div>
      <div style={{ fontSize: 16, fontWeight: 700, color: LBC.gray900, marginBottom: 8 }}>Impossible de charger les annonces</div>
      <div style={{ fontSize: 14, marginBottom: 20 }}>{message}</div>
      <button
        type="button"
        onClick={onRetry}
        style={{
          background: LBC.orange,
          color: LBC.white,
          border: 'none',
          borderRadius: 6,
          padding: '10px 18px',
          fontSize: 14,
          fontWeight: 700,
          cursor: 'pointer',
        }}
      >
        Réessayer
      </button>
    </div>
  );
}
