import Link from 'next/link';
import type { Dispatch, ReactNode } from 'react';
import type { AuthUser } from '../auth/types';
import type { ConversationItem, DashboardStats, DashboardTab, FavoriteItem, ListingItem } from './types';
import { formatPrice, timeAgo } from './services';

export const LBC = {
  orange: '#E85C0D',
  orangeLight: '#FFF4EE',
  orangeHover: '#C44B09',
  gray50: '#F7F7F7',
  gray100: '#F2F2F2',
  gray200: '#E5E5E5',
  gray400: '#AAAAAA',
  gray500: '#888888',
  gray700: '#444444',
  gray900: '#1A1A1A',
  white: '#FFFFFF',
  green: '#1A7A4A',
  greenLight: '#EAFAF1',
  red: '#C0392B',
  redLight: '#FDEDEC',
  blue: '#1A5276',
} as const;

export const DASHBOARD_TABS: Array<[DashboardTab, string]> = [
  ['overview', 'Vue d’ensemble'],
  ['ads', 'Mes annonces'],
  ['messages', 'Messages'],
  ['favorites', 'Mes favoris'],
  ['profile', 'Profil'],
  ['settings', 'Paramètres'],
];

export function Card({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <div style={{ background: LBC.white, border: `1px solid ${LBC.gray200}`, borderRadius: 10 }}>
      {children}
    </div>
  );
}

export function LoginPrompt() {
  return (
    <section style={{ maxWidth: 900, margin: '0 auto', padding: '56px 16px' }}>
      <Card>
        <div style={{ padding: 28, textAlign: 'center' }}>
          <h1 style={{ margin: 0, fontSize: 28, color: LBC.gray900 }}>Mon compte</h1>
          <p style={{ color: LBC.gray700 }}>Connecte-toi pour voir tes annonces, favoris et messages.</p>
          <Link href="/auth/login?next=/dashboard" style={{ color: LBC.orange, fontWeight: 700 }}>
            Aller à la connexion
          </Link>
        </div>
      </Card>
    </section>
  );
}

export function DashboardHeader({ isMobile = false }: Readonly<{ isMobile?: boolean }>) {
  return (
    <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', marginBottom: 16, flexDirection: isMobile ? 'column' : 'row', gap: isMobile ? 10 : 0 }}>
      <div>
        <p style={{ margin: 0, fontSize: 12, color: LBC.gray500, textTransform: 'uppercase', letterSpacing: 1 }}>Mon compte</p>
        <h1 style={{ margin: '4px 0 0', fontSize: 28, color: LBC.gray900 }}>Tableau de bord</h1>
      </div>
      <Link href="/listings/new" style={{ background: LBC.orange, color: LBC.white, padding: '10px 14px', borderRadius: 7, fontWeight: 700, textDecoration: 'none', textAlign: 'center' }}>
        + Déposer une annonce
      </Link>
    </header>
  );
}

export function TabsBar({ tab, onChange, isMobile = false }: Readonly<{ tab: DashboardTab; onChange: Dispatch<DashboardTab>; isMobile?: boolean }>) {
  return (
    <div style={{ display: 'flex', gap: 8, flexWrap: isMobile ? 'nowrap' : 'wrap', overflowX: isMobile ? 'auto' : 'visible', marginBottom: 16, paddingBottom: isMobile ? 4 : 0 }}>
      {DASHBOARD_TABS.map(([key, label]) => (
        <button
          key={key}
          onClick={() => onChange(key)}
          style={{
            border: `1px solid ${tab === key ? LBC.orange : LBC.gray200}`,
            background: tab === key ? LBC.orangeLight : LBC.white,
            color: tab === key ? LBC.orange : LBC.gray700,
            borderRadius: 8,
            padding: '8px 12px',
            fontWeight: 700,
            cursor: 'pointer',
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

export function LoadingError({ loading, error }: Readonly<{ loading: boolean; error: string | null }>) {
  return (
    <>
      {loading && <p style={{ color: LBC.gray700 }}>Chargement de vos données…</p>}
      {error && <p style={{ color: LBC.red, background: LBC.redLight, padding: 10, borderRadius: 8 }}>{error}</p>}
    </>
  );
}

export function OverviewTab({ stats }: Readonly<{ stats: DashboardStats }>) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(220px,1fr))', gap: 12 }}>
      {[
        ['Annonces publiées', stats.published],
        ['En attente', stats.pending],
        ['Brouillons', stats.drafts],
        ['Vues totales', stats.totalViews],
        ['Conversations', stats.conversationsCount],
        ['Favoris', stats.favoritesCount],
      ].map(([label, value]) => (
        <Card key={String(label)}>
          <div style={{ padding: 16 }}>
            <div style={{ color: LBC.gray500, fontSize: 12 }}>{label}</div>
            <div style={{ color: LBC.gray900, fontSize: 28, fontWeight: 800, marginTop: 4 }}>{value}</div>
          </div>
        </Card>
      ))}
    </div>
  );
}

export function AdsTab({ listings, onPublish, isMobile = false }: Readonly<{ listings: ListingItem[]; onPublish: Dispatch<string>; isMobile?: boolean }>) {
  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>Mes annonces ({listings.length})</div>
      {listings.length === 0 ? (
        <div style={{ padding: 16, color: LBC.gray500 }}>Aucune annonce pour le moment.</div>
      ) : (
        listings.map(item => (
          <div key={item.id} style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr auto', gap: 12, alignItems: 'center', padding: 14, borderBottom: `1px solid ${LBC.gray100}` }}>
            <div>
              <Link href={`/listings/${item.slug}`} style={{ color: LBC.gray900, fontWeight: 700, textDecoration: 'none' }}>{item.title}</Link>
              <div style={{ fontSize: 13, color: LBC.gray500, marginTop: 4 }}>
                {formatPrice(item.price, item.currency)} · {item.city || item.region} · {item.views_count} vues · {timeAgo(item.created_at)}
              </div>
              <div style={{ marginTop: 6 }}>
                <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: item.status === 'published' ? LBC.greenLight : LBC.orangeLight, color: item.status === 'published' ? LBC.green : LBC.orange, fontWeight: 700 }}>
                  {item.status}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {(item.status === 'pending' || item.status === 'draft') && (
                <button onClick={() => onPublish(item.slug)} style={{ border: 'none', background: LBC.orange, color: LBC.white, padding: '8px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer' }}>
                  Publier
                </button>
              )}
              <Link href={`/listings/${item.slug}`} style={{ border: `1px solid ${LBC.gray200}`, background: LBC.white, color: LBC.gray700, padding: '8px 10px', borderRadius: 6, fontWeight: 700, textDecoration: 'none' }}>
                Voir
              </Link>
            </div>
          </div>
        ))
      )}
    </Card>
  );
}

export function MessagesTab({ conversations, user }: Readonly<{ conversations: ConversationItem[]; user: AuthUser }>) {
  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>
        Conversations ({conversations.length})
      </div>
      {conversations.length === 0 ? (
        <div style={{ padding: 16, color: LBC.gray500 }}>Aucune conversation pour le moment.</div>
      ) : (
        conversations.map(conv => {
          const interlocutor = conv.buyer.id === user.id ? conv.seller : conv.buyer;
          return (
            <div key={conv.id} style={{ padding: 14, borderBottom: `1px solid ${LBC.gray100}` }}>
              <div style={{ color: LBC.gray900, fontWeight: 700 }}>{interlocutor.first_name || interlocutor.email}</div>
              <div style={{ fontSize: 13, color: LBC.gray700, marginTop: 3 }}>{conv.listing.title}</div>
              <div style={{ fontSize: 12, color: LBC.gray500, marginTop: 4 }}>Dernière activité: {timeAgo(conv.last_message_at)}</div>
            </div>
          );
        })
      )}
    </Card>
  );
}

export function FavoritesTab({ favorites, onRemove }: Readonly<{ favorites: FavoriteItem[]; onRemove: Dispatch<number> }>) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(230px,1fr))', gap: 12 }}>
      {favorites.length === 0 ? (
        <Card><div style={{ padding: 16, color: LBC.gray500 }}>Aucun favori enregistré.</div></Card>
      ) : (
        favorites.map(fav => (
          <Card key={fav.id}>
            <div style={{ padding: 12 }}>
              <Link href={`/listings/${fav.listing.slug}`} style={{ color: LBC.gray900, fontWeight: 700, textDecoration: 'none' }}>
                {fav.listing.title}
              </Link>
              <div style={{ marginTop: 6, color: LBC.orange, fontWeight: 700 }}>{formatPrice(fav.listing.price, fav.listing.currency)}</div>
              <div style={{ marginTop: 6, fontSize: 12, color: LBC.gray500 }}>{fav.listing.city || fav.listing.region}</div>
              <button onClick={() => onRemove(fav.id)} style={{ marginTop: 10, border: `1px solid ${LBC.gray200}`, background: LBC.white, color: LBC.gray700, borderRadius: 6, padding: '6px 8px', fontWeight: 600, cursor: 'pointer' }}>
                Retirer
              </button>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}

export function ProfileTab({ user }: Readonly<{ user: AuthUser }>) {
  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>Mon profil</div>
      <div style={{ padding: 16, color: LBC.gray700, lineHeight: 1.7 }}>
        <div><strong>Nom:</strong> {user.first_name} {user.last_name}</div>
        <div><strong>Email:</strong> {user.email}</div>
        <div><strong>Téléphone:</strong> {user.phone_number || '—'}</div>
        <div><strong>Pays:</strong> {user.country || '—'}</div>
        <div><strong>Ville:</strong> {user.city || '—'}</div>
        <div><strong>Compte vérifié:</strong> {user.is_verified ? 'Oui' : 'Non'}</div>
      </div>
    </Card>
  );
}

export function SettingsTab() {
  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>Paramètres</div>
      <div style={{ padding: 16, color: LBC.gray700 }}>
        <p style={{ marginTop: 0 }}>Les paramètres avancés (notifications, confidentialité) peuvent être branchés ici.</p>
        <Link href="/auth/login" style={{ color: LBC.orange, fontWeight: 700 }}>Gérer la session</Link>
      </div>
    </Card>
  );
}
