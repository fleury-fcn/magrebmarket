'use client';

import Link from 'next/link';
import { type CSSProperties, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apiFetch } from '../../../lib/api';

type SellerProfile = {
  id: number;
  username: string;
  first_name: string;
  last_name: string;
  avatar?: string;
  country?: string;
  date_joined: string;
  listings_count?: number;
};

type SellerListing = {
  slug: string;
  title: string;
  price: string | null;
  cover_image: string | null;
  photos: string[];
  status: string;
};

const normalizeImage = (url: string | null): string | null => {
  if (!url) return null;
  if (url.startsWith('http')) return url;
  return `${process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:8000'}${url}`;
};

export default function SellerProfilePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [seller, setSeller] = useState<SellerProfile | null>(null);
  const [listings, setListings] = useState<SellerListing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    Promise.all([
      apiFetch<SellerProfile>(`users/${id}/`).catch(() => null),
      apiFetch<{ results?: SellerListing[] }>(`listings/search/?seller=${id}&status=published&page_size=12`).catch(() => ({ results: [] })),
    ]).then(([sellerData, listingsData]) => {
      if (!sellerData) { setError('Vendeur introuvable.'); setLoading(false); return; }
      setSeller(sellerData);
      setListings(listingsData?.results ?? []);
    }).catch(() => setError('Erreur lors du chargement.')).finally(() => setLoading(false));
  }, [id]);

  const memberSince = seller ? new Date(seller.date_joined).getFullYear() : null;
  const displayName = seller
    ? [seller.first_name, seller.last_name].filter(Boolean).join(' ') || seller.username
    : '';

  const styles: Record<string, CSSProperties> = {
    page: { maxWidth: 1100, margin: '0 auto', padding: '28px 16px 48px', fontFamily: 'Nunito Sans, sans-serif' },
    back: { display: 'inline-flex', alignItems: 'center', gap: 6, marginBottom: 24, color: '#666', fontSize: 14, cursor: 'pointer', background: 'none', border: 'none' },
    card: { background: '#fff', borderRadius: 12, border: '1px solid #eee', padding: '28px 32px', marginBottom: 28, display: 'flex', alignItems: 'center', gap: 24 },
    avatar: { width: 80, height: 80, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, color: '#fff', fontWeight: 700, flexShrink: 0 },
    name: { fontSize: 22, fontWeight: 700, color: '#1a1a1a', marginBottom: 4 },
    meta: { fontSize: 13, color: '#888', marginBottom: 8 },
    msgBtn: { padding: '8px 20px', background: '#f97316', color: '#fff', border: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14, cursor: 'pointer' },
    sectionTitle: { fontSize: 18, fontWeight: 700, color: '#1a1a1a', marginBottom: 16 },
    grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 },
    adCard: { background: '#fff', borderRadius: 10, border: '1px solid #eee', overflow: 'hidden', cursor: 'pointer', transition: 'box-shadow 0.15s' },
    adImg: { width: '100%', height: 130, objectFit: 'cover', background: '#f5f5f5', display: 'block' },
    adBody: { padding: '10px 12px' },
    adTitle: { fontSize: 13, fontWeight: 600, color: '#1a1a1a', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
    adPrice: { fontSize: 15, fontWeight: 700, color: '#f97316' },
  };

  if (loading) return <div style={styles.page}><p style={{ color: '#888' }}>Chargement...</p></div>;
  if (error || !seller) return <div style={styles.page}><p style={{ color: '#e30613' }}>{error ?? 'Vendeur introuvable.'}</p></div>;

  return (
    <div style={styles.page}>
      <button style={styles.back} type="button" onClick={() => router.back()}>
        ← Retour
      </button>

      {/* Seller card */}
      <div style={styles.card}>
        <div style={styles.avatar}>
          {seller.avatar
            ? <img src={normalizeImage(seller.avatar) ?? ''} alt={displayName} style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} /> // eslint-disable-line @next/next/no-img-element
            : displayName.charAt(0).toUpperCase()
          }
        </div>
        <div style={{ flex: 1 }}>
          <div style={styles.name}>{displayName}</div>
          <div style={styles.meta}>
            Membre depuis {memberSince}
            {seller.country ? ` · ${seller.country}` : ''}
            {seller.listings_count != null ? ` · ${seller.listings_count} annonce${seller.listings_count > 1 ? 's' : ''}` : ''}
          </div>
          <Link
            href={`/messages?seller=${seller.id}`}
            style={{ ...styles.msgBtn, textDecoration: 'none', display: 'inline-block' }}
          >
            ✉️ Contacter
          </Link>
        </div>
      </div>

      {/* Listings */}
      <div style={styles.sectionTitle}>Annonces de {displayName}</div>
      {listings.length === 0 ? (
        <p style={{ color: '#888', fontSize: 14 }}>Aucune annonce publiée.</p>
      ) : (
        <div style={styles.grid}>
          {listings.map(listing => {
            const img = normalizeImage(listing.cover_image ?? (listing.photos?.[0] ?? null));
            return (
              <Link key={listing.slug} href={`/annonce/${listing.slug}`} style={{ textDecoration: 'none' }}>
                <div style={styles.adCard}>
                  {img
                    ? <img src={img} alt={listing.title} style={styles.adImg} /> // eslint-disable-line @next/next/no-img-element
                    : <div style={{ ...styles.adImg, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>📦</div>
                  }
                  <div style={styles.adBody}>
                    <div style={styles.adTitle}>{listing.title}</div>
                    {listing.price && <div style={styles.adPrice}>{listing.price} €</div>}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
