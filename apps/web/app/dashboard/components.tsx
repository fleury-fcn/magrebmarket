import Link from 'next/link';
import React, { type Dispatch, type ReactNode } from 'react';
import type { AuthUser } from '../auth/types';
import type { ConversationItem, DashboardStats, DashboardTab, FavoriteItem, ListingItem } from './types';
import { formatPrice, timeAgo, type SearchAlert, updateProfile, changePassword, deleteAccount } from './services';

const STATUS_LABELS: Record<string, string> = {
  published: '✅ Publiée',
  pending: '⏳ En attente',
  draft: '📝 Brouillon',
  archived: '📦 Archivée',
};

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
  ['alerts', '🔔 Alertes'],
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

export function AdsTab({ listings, onPublish, onDelete, isMobile = false }: Readonly<{ listings: ListingItem[]; onPublish: Dispatch<string>; onDelete: Dispatch<string>; isMobile?: boolean }>) {
  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>Mes annonces ({listings.length})</div>
      {listings.length === 0 ? (
        <div style={{ padding: 16, color: LBC.gray500 }}>
          Aucune annonce pour le moment.{' '}
          <Link href="/listings/new" style={{ color: LBC.orange, fontWeight: 700 }}>Déposer une annonce →</Link>
        </div>
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
                  {STATUS_LABELS[item.status] ?? item.status}
                </span>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(item.status === 'pending' || item.status === 'draft') && (
                <button onClick={() => onPublish(item.slug)} style={{ border: 'none', background: LBC.orange, color: LBC.white, padding: '8px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}>
                  ▶ Publier
                </button>
              )}
              <Link href={`/listings/new?edit=${item.slug}`} style={{ border: `1px solid ${LBC.gray200}`, background: LBC.white, color: LBC.gray700, padding: '8px 10px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                ✏️ Éditer
              </Link>
              <Link href={`/listings/${item.slug}`} style={{ border: `1px solid ${LBC.gray200}`, background: LBC.white, color: LBC.gray700, padding: '8px 10px', borderRadius: 6, fontWeight: 700, textDecoration: 'none', fontSize: 13 }}>
                👁 Voir
              </Link>
              <button
                onClick={() => {
                  if (globalThis.window?.confirm(`Supprimer "${item.title}" ? Cette action est irréversible.`)) {
                    onDelete(item.slug);
                  }
                }}
                style={{ border: `1px solid ${LBC.red}`, background: LBC.redLight, color: LBC.red, padding: '8px 10px', borderRadius: 6, fontWeight: 700, cursor: 'pointer', fontSize: 13 }}
              >
                🗑 Supprimer
              </button>
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

export function ProfileTab({ user, onUpdate }: Readonly<{ user: AuthUser; onUpdate?: (_u: Partial<AuthUser>) => void }>) {
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({ first_name: user.first_name ?? '', last_name: user.last_name ?? '', phone_number: user.phone_number ?? '', city: user.city ?? '', country: user.country ?? '' });
  const [saving, setSaving] = React.useState(false);
  const [msg, setMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const handleSave = async () => {
    setSaving(true); setMsg(null);
    try {
      await updateProfile(form);
      setMsg({ type: 'ok', text: 'Profil mis à jour ✅' });
      setEditing(false);
      onUpdate?.(form);
    } catch {
      setMsg({ type: 'err', text: 'Erreur lors de la sauvegarde' });
    } finally { setSaving(false); }
  };

  return (
    <Card>
      <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        Mon profil
        <button onClick={() => { setEditing(e => !e); setMsg(null); }} style={{ border: `1px solid ${LBC.gray200}`, background: LBC.white, borderRadius: 6, padding: '6px 12px', cursor: 'pointer', fontWeight: 600 }}>
          {editing ? 'Annuler' : '✏️ Modifier'}
        </button>
      </div>
      <div style={{ padding: 16 }}>
        {msg && <div style={{ marginBottom: 12, padding: '8px 12px', borderRadius: 6, background: msg.type === 'ok' ? LBC.greenLight : LBC.redLight, color: msg.type === 'ok' ? LBC.green : LBC.red, fontWeight: 600 }}>{msg.text}</div>}
        {editing ? (
          <div style={{ display: 'grid', gap: 12 }}>
            {(['first_name', 'last_name', 'phone_number', 'city', 'country'] as const).map(field => (
              <label key={field} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
                <span style={{ color: LBC.gray500, textTransform: 'capitalize' }}>{field.replace('_', ' ')}</span>
                <input value={form[field]} onChange={e => setForm(f => ({ ...f, [field]: e.target.value }))} style={{ border: `1px solid ${LBC.gray200}`, borderRadius: 6, padding: '8px 10px', fontSize: 14 }} />
              </label>
            ))}
            <button onClick={handleSave} disabled={saving} style={{ background: LBC.orange, color: LBC.white, border: 'none', borderRadius: 7, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', opacity: saving ? 0.7 : 1 }}>
              {saving ? 'Sauvegarde…' : 'Enregistrer'}
            </button>
          </div>
        ) : (
          <div style={{ color: LBC.gray700, lineHeight: 1.9 }}>
            <div><strong>Prénom:</strong> {user.first_name || '—'}</div>
            <div><strong>Nom:</strong> {user.last_name || '—'}</div>
            <div><strong>Email:</strong> {user.email}</div>
            <div><strong>Téléphone:</strong> {user.phone_number || '—'}</div>
            <div><strong>Pays:</strong> {user.country || '—'}</div>
            <div><strong>Ville:</strong> {user.city || '—'}</div>
            <div><strong>Compte vérifié:</strong> {user.is_verified ? '✅ Oui' : '❌ Non'}</div>
          </div>
        )}
      </div>
    </Card>
  );
}

export function SettingsTab({ onAccountDeleted }: Readonly<{ onAccountDeleted?: () => void }>) {
  const [oldPwd, setOldPwd] = React.useState('');
  const [newPwd, setNewPwd] = React.useState('');
  const [confirmPwd, setConfirmPwd] = React.useState('');
  const [pwdMsg, setPwdMsg] = React.useState<{ type: 'ok' | 'err'; text: string } | null>(null);
  const [pwdSaving, setPwdSaving] = React.useState(false);
  const [deleteConfirm, setDeleteConfirm] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  const handlePwdChange = async () => {
    if (newPwd !== confirmPwd) { setPwdMsg({ type: 'err', text: 'Les mots de passe ne correspondent pas' }); return; }
    if (newPwd.length < 8) { setPwdMsg({ type: 'err', text: 'Mot de passe trop court (8 caractères min)' }); return; }
    setPwdSaving(true); setPwdMsg(null);
    try {
      await changePassword(oldPwd, newPwd);
      setPwdMsg({ type: 'ok', text: 'Mot de passe modifié ✅' });
      setOldPwd(''); setNewPwd(''); setConfirmPwd('');
    } catch {
      setPwdMsg({ type: 'err', text: 'Ancien mot de passe incorrect' });
    } finally { setPwdSaving(false); }
  };

  const handleDelete = async () => {
    setDeleting(true);
    try {
      await deleteAccount();
      onAccountDeleted?.();
    } catch {
      setDeleting(false); setDeleteConfirm(false);
    }
  };

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <Card>
        <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>🔐 Changer le mot de passe</div>
        <div style={{ padding: 16, display: 'grid', gap: 12 }}>
          {pwdMsg && <div style={{ padding: '8px 12px', borderRadius: 6, background: pwdMsg.type === 'ok' ? LBC.greenLight : LBC.redLight, color: pwdMsg.type === 'ok' ? LBC.green : LBC.red, fontWeight: 600 }}>{pwdMsg.text}</div>}
          {[['Ancien mot de passe', oldPwd, setOldPwd], ['Nouveau mot de passe', newPwd, setNewPwd], ['Confirmer le mot de passe', confirmPwd, setConfirmPwd]].map(([label, val, setter]) => (
            <label key={String(label)} style={{ display: 'flex', flexDirection: 'column', gap: 4, fontSize: 13 }}>
              <span style={{ color: LBC.gray500 }}>{String(label)}</span>
              <input type="password" value={String(val)} onChange={e => (setter as React.Dispatch<React.SetStateAction<string>>)(e.target.value)} style={{ border: `1px solid ${LBC.gray200}`, borderRadius: 6, padding: '8px 10px', fontSize: 14 }} />
            </label>
          ))}
          <button onClick={handlePwdChange} disabled={pwdSaving || !oldPwd || !newPwd} style={{ background: LBC.orange, color: LBC.white, border: 'none', borderRadius: 7, padding: '10px 18px', fontWeight: 700, cursor: 'pointer', opacity: pwdSaving ? 0.7 : 1 }}>
            {pwdSaving ? 'Modification…' : 'Modifier le mot de passe'}
          </button>
        </div>
      </Card>

      <Card>
        <div style={{ padding: 16, borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700, color: LBC.red }}>⚠️ Zone dangereuse</div>
        <div style={{ padding: 16 }}>
          {!deleteConfirm ? (
            <button onClick={() => setDeleteConfirm(true)} style={{ border: `1px solid ${LBC.red}`, background: LBC.redLight, color: LBC.red, padding: '10px 16px', borderRadius: 7, fontWeight: 700, cursor: 'pointer' }}>
              Supprimer mon compte
            </button>
          ) : (
            <div style={{ background: LBC.redLight, border: `1px solid ${LBC.red}`, borderRadius: 8, padding: 16 }}>
              <p style={{ margin: '0 0 12px', fontWeight: 700, color: LBC.red }}>⚠️ Cette action est irréversible. Toutes vos données seront supprimées.</p>
              <div style={{ display: 'flex', gap: 10 }}>
                <button onClick={handleDelete} disabled={deleting} style={{ background: LBC.red, color: LBC.white, border: 'none', borderRadius: 7, padding: '10px 16px', fontWeight: 700, cursor: 'pointer' }}>
                  {deleting ? 'Suppression…' : 'Confirmer la suppression'}
                </button>
                <button onClick={() => setDeleteConfirm(false)} style={{ border: `1px solid ${LBC.gray200}`, background: LBC.white, borderRadius: 7, padding: '10px 16px', cursor: 'pointer', fontWeight: 600 }}>Annuler</button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}

export function AlertsTab({
  alerts,
  onDelete,
  onToggle,
}: Readonly<{
  alerts: SearchAlert[];
  onDelete: Dispatch<number>;
  onToggle: (_id: number, _active: boolean) => void;
}>) {
  if (alerts.length === 0) {
    return (
      <Card>
        <div style={{ padding: 32, textAlign: 'center', color: LBC.gray700 }}>
          <div style={{ fontSize: 36, marginBottom: 12 }}>🔔</div>
          <p style={{ margin: 0, fontWeight: 600 }}>Aucune alerte de recherche</p>
          <p style={{ margin: '8px 0 0', fontSize: 13 }}>
            Depuis la page de recherche, sauvegardez une recherche pour être notifié des nouvelles annonces.
          </p>
        </div>
      </Card>
    );
  }
  return (
    <Card>
      <div style={{ padding: '14px 16px', borderBottom: `1px solid ${LBC.gray100}`, fontWeight: 700 }}>
        🔔 Mes alertes ({alerts.length})
      </div>
      {alerts.map(alert => (
        <div key={alert.id} style={{ padding: '14px 16px', borderBottom: `1px solid ${LBC.gray100}`, display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>{alert.label}</div>
            <div style={{ fontSize: 12, color: LBC.gray700, marginTop: 2 }}>
              {alert.query ? `Recherche : "${alert.query}"` : ''}
              {alert.category ? ` · ${alert.category}` : ''}
              {alert.country ? ` · ${alert.country}` : ''}
            </div>
          </div>
          <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={alert.is_active}
              onChange={e => onToggle(alert.id, e.target.checked)}
              style={{ cursor: 'pointer' }}
            />{' '}
            Active
          </label>
          <button
            type="button"
            onClick={() => { if (globalThis.confirm('Supprimer cette alerte ?')) onDelete(alert.id); }}
            style={{ padding: '4px 10px', border: `1px solid ${LBC.gray200}`, borderRadius: 6, background: 'none', cursor: 'pointer', fontSize: 13, color: '#e30613' }}
          >
            🗑 Supprimer
          </button>
        </div>
      ))}
    </Card>
  );
}
