'use client';

import Link from 'next/link';
import { type CSSProperties, type FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';
import { useAuth } from '../../auth/hooks/useAuth';

type SellerProfile = {
  id: number;
  first_name: string;
  last_name: string;
  avatar?: string;
  country?: string;
  city?: string;
  date_joined: string;
  listings_count?: number;
  avg_rating?: number | null;
  ratings_count?: number;
};

type SellerListing = {
  slug: string;
  title: string;
  price: string | null;
  cover_image: string | null;
  photos: string[];
};

type Rating = {
  id: number;
  score: number;
  comment: string;
  created_at: string;
  reviewer_name: string;
  reviewer_avatar?: string;
};

const normalizeImage = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'}${url}`;
};

const Stars = ({ score, size = 18 }: { score: number; size?: number }) => (
  <span aria-label={`${score} étoiles sur 5`}>
    {[1, 2, 3, 4, 5].map(i => (
      <span key={i} style={{ fontSize: size, color: i <= score ? '#f59e0b' : '#d1d5db' }}>★</span>
    ))}
  </span>
);

const StarPicker = ({ value, onChange }: { value: number; onChange: (_v: number) => void }) => {
  const [hovered, setHovered] = useState(0);
  return (
    <span>
      {[1, 2, 3, 4, 5].map(i => (
        <button
          key={i}
          type="button"
          onMouseEnter={() => setHovered(i)}
          onMouseLeave={() => setHovered(0)}
          onClick={() => onChange(i)}
          style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 28, color: i <= (hovered || value) ? '#f59e0b' : '#d1d5db', padding: '0 2px' }}
          aria-label={`${i} étoile${i > 1 ? 's' : ''}`}
        >
          ★
        </button>
      ))}
    </span>
  );
};

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [ratings, setRatings] = useState<Rating[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Form state
  const [myScore, setMyScore] = useState(0);
  const [myComment, setMyComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const loadData = () => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiFetch<SellerProfile>(`users/${id}/`).catch(() => null),
      apiFetch<{ results?: SellerListing[] }>(`listings/search/?seller=${id}&status=published&page_size=12`).catch(() => ({ results: [] })),
      apiFetch<Rating[]>(`users/${id}/ratings/`).catch(() => []),
    ]).then(([sellerData, listingsData, ratingsData]) => {
      if (!sellerData) { setError('Vendeur introuvable.'); setLoading(false); return; }
      setSeller(sellerData);
      setListings(listingsData?.results ?? []);
      setRatings(Array.isArray(ratingsData) ? ratingsData : []);
    }).catch(() => setError('Erreur lors du chargement.')).finally(() => setLoading(false));
  };

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(loadData, [id]);

  const handleSubmitRating = async (e: FormEvent) => {
    e.preventDefault();
    if (!myScore) { setSubmitError('Veuillez choisir une note.'); return; }
    setSubmitting(true);
    setSubmitError(null);
    try {
      await apiFetch(`users/${id}/ratings/`, { method: 'POST', body: JSON.stringify({ score: myScore, comment: myComment }) });
      setSubmitSuccess(true);
      setMyScore(0);
      setMyComment('');
      loadData();
    } catch {
      setSubmitError('Impossible de soumettre votre avis.');
    } finally {
      setSubmitting(false);
    }
  };

  const memberSince = seller ? new Date(seller.date_joined).getFullYear() : null;
  const displayName = seller
    ? [seller.first_name, seller.last_name].filter(Boolean).join(' ') || `Vendeur #${seller.id}`
    : '';
  const isOwnProfile = user && seller && String(user.id) === String(seller.id);

  const s: Record<string, CSSProperties> = {
    page: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px', fontFamily: 'Nunito Sans, sans-serif' },
    back: { display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, color: '#666', fontSize: 14, cursor: 'pointer', background: 'none', border: 'none' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24, flexWrap: 'wrap' },
    avatar: { width: 80, height: 80, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', fontWeight: 700, flexShrink: 0 },
    name: { fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 },
    meta: { fontSize: 13, color: '#888', marginBottom: 8 },
    msgBtn: { padding: '8px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'none', display: 'inline-block' },
    sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 16, marginTop: 32 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
    adCard: { background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden', cursor: 'pointer' },
    adImg: { width: '100%', height: 130, objectFit: 'cover', background: '#f5f5f5', display: 'block' },
    adBody: { padding: '10px 12px' },
    adTitle: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    adPrice: { fontSize: 15, fontWeight: 700, color: '#f97316' },
    ratingCard: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '16px 20px', marginBottom: 12 },
    form: { background: '#fff', border: '1px solid #eee', borderRadius: 10, padding: '20px 24px', marginBottom: 24 },
    textarea: { width: '100%', minHeight: 80, padding: '10px 12px', border: '1px solid #ddd', borderRadius: 8, fontSize: 14, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' },
    submitBtn: { marginTop: 12, padding: '10px 24px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
  };

  if (loading) return <div style={s.page}><p style={{ color: '#888' }}>Chargement...</p></div>;
  if (error || !seller) return <div style={s.page}><p style={{ color: '#e30613' }}>{error ?? 'Vendeur introuvable.'}</p></div>;

  return (
    <div style={s.page}>
      <button style={s.back} type="button" onClick={() => router.back()}>← Retour</button>

      {/* Seller card */}
      <div style={s.card}>
        <div style={s.avatar}>
          {seller.avatar
            ? <img src={normalizeImage(seller.avatar) ?? ''} alt={displayName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
            : displayName.charAt(0).toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={s.name}>{displayName}</div>
          <div style={s.meta}>
            Membre depuis {memberSince}
            {seller.city ? ` · ${seller.city}` : ''}
            {seller.country ? ` · ${seller.country}` : ''}
            {seller.listings_count != null ? ` · ${seller.listings_count} annonce${seller.listings_count > 1 ? 's' : ''}` : ''}
          </div>
          {seller.avg_rating != null && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <Stars score={Math.round(seller.avg_rating)} />
              <span style={{ fontSize: 14, color: '#666' }}>
                {seller.avg_rating.toFixed(1)} / 5 ({seller.ratings_count} avis)
              </span>
            </div>
          )}
          {!isOwnProfile && (
            <Link href={`/messages?seller=${seller.id}`} style={s.msgBtn}>✉️ Contacter</Link>
          )}
        </div>
      </div>

      {/* Listings */}
      <div style={s.sectionTitle}>Annonces de {displayName}</div>
      {listings.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Aucune annonce publiée.</p>
      ) : (
        <div style={s.grid}>
          {listings.map(listing => {
            const img = normalizeImage(listing.cover_image ?? (listing.photos?.[0] ?? null));
            return (
              <Link key={listing.slug} href={`/annonce/${listing.slug}`} style={{ textDecoration: 'none' }}>
                <div style={s.adCard}>
                  {img
                    ? <img src={img} alt={listing.title} style={s.adImg} /> // eslint-disable-line @next/next/no-img-element
                    : <div style={{ ...s.adImg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📦</div>
                  }
                  <div style={s.adBody}>
                    <div style={s.adTitle}>{listing.title}</div>
                    {listing.price && <div style={s.adPrice}>{listing.price} €</div>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Ratings */}
      <div style={s.sectionTitle}>Avis ({ratings.length})</div>

      {/* Submit form */}
      {user && !isOwnProfile && (
        <div style={s.form}>
          <div style={{ fontWeight: 700, marginBottom: 12 }}>Laisser un avis</div>
          {submitSuccess && <p style={{ color: '#16a34a', marginBottom: 8 }}>✅ Votre avis a été publié !</p>}
          {submitError && <p style={{ color: '#e30613', marginBottom: 8 }}>{submitError}</p>}
          <form onSubmit={handleSubmitRating}>
            <StarPicker value={myScore} onChange={setMyScore} />
            <div style={{ marginTop: 12 }}>
              <textarea
                style={s.textarea}
                placeholder="Commentaire (optionnel)"
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                maxLength={500}
              />
            </div>
            <button style={s.submitBtn} type="submit" disabled={submitting}>
              {submitting ? 'Envoi...' : 'Publier mon avis'}
            </button>
          </form>
        </div>
      )}

      {ratings.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Aucun avis pour l&apos;instant.</p>
      ) : (
        ratings.map(r => (
          <div key={r.id} style={s.ratingCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 700, fontSize: 14, flexShrink: 0 }}>
                {r.reviewer_name.charAt(0).toUpperCase()}
              </div>
              <div>
                <span style={{ fontWeight: 600, fontSize: 14 }}>{r.reviewer_name}</span>
                <span style={{ fontSize: 12, color: '#aaa', marginLeft: 8 }}>{new Date(r.created_at).toLocaleDateString('fr-FR')}</span>
              </div>
              <div style={{ marginLeft: 'auto' }}>
                <Stars score={r.score} size={16} />
              </div>
            </div>
            {r.comment && <p style={{ fontSize: 14, color: '#444', margin: 0 }}>{r.comment}</p>}
          </div>
        ))
      )}
    </div>
  );
}
