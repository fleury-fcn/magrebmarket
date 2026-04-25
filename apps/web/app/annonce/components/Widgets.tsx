import React from 'react'
import Image from 'next/image'
import { LBC } from '../../search/data'
import type { SimilarAnnonce } from '../types'

export const SimilarAnnonces: React.FC<{ annonces: SimilarAnnonce[] }> = ({ annonces }) => {
  if (!annonces || annonces.length === 0) return null
  return (
    <div style={{ background: LBC.white, borderRadius: 10, border: `1px solid ${LBC.gray200}`, padding: 12 }}>
      <h3 style={{ margin: '0 0 8px', fontSize: 16 }}>Annonces similaires</h3>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
        {annonces.map(a => (
          <a key={a.id} href={`/annonce/${a.id}`} style={{ display: 'block', textDecoration: 'none', color: 'inherit', background: LBC.white, borderRadius: 8, overflow: 'hidden', border: `1px solid ${LBC.gray100}` }}>
            <div style={{ aspectRatio: '4/3', background: LBC.gray100 }}>
              {a.mainImage ? (
                <Image src={a.mainImage} alt={a.title} width={400} height={300} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>📷</div>
              )}
            </div>
            <div style={{ padding: 8 }}>
              <div style={{ fontWeight: 800 }}>{a.price ? `${a.price} €` : 'Gratuit'}</div>
              <div style={{ fontSize: 12, color: LBC.gray600 }}>{a.title}</div>
            </div>
          </a>
        ))}
      </div>
    </div>
  )
}

export const SecurityTips: React.FC = () => {
  const [expanded, setExpanded] = React.useState(false)
  const tips = [
    'Privilégiez les échanges en main propre dans un lieu public',
    'Vérifiez l\'objet avant tout paiement',
    'Ne payez jamais à l\'avance via Western Union, PayPal ami ou crypto',
    'Méfiez-vous des prix anormalement bas',
    'N\'envoyez jamais de document d\'identité',
    'En cas de doute, ne donnez pas suite',
  ]
  return (
    <div style={{ background: LBC.white, borderRadius: 10, border: `1px solid ${LBC.gray200}`, padding: 12, marginTop: 12 }}>
      <button onClick={() => setExpanded(s => !s)} style={{ background: 'none', border: 'none', padding: 0, cursor: 'pointer', display: 'flex', justifyContent: 'space-between', width: '100%', alignItems: 'center' }}>
        <h3 style={{ margin: 0 }}>Conseils sécurité</h3>
        <div style={{ fontSize: 18 }}>{expanded ? '−' : '+'}</div>
      </button>
      {expanded && (
        <ul style={{ marginTop: 8, paddingLeft: 16 }}>
          {tips.map((t) => <li key={t} style={{ marginBottom: 6 }}>{t}</li>)}
        </ul>
      )}
    </div>
  )
}

interface ReportModalProps { annonceId: number; onClose: () => void; onSubmit: Function; loading: boolean; sent: boolean }

export const ReportModal: React.FC<ReportModalProps> = (props) => {
  const { onClose, onSubmit, loading, sent } = props
  const [reason, setReason] = React.useState<'fraud'|'spam'|'prohibited'|'offensive'|'wrong_category'|'other'>('fraud')
  const [desc, setDesc] = React.useState('')
  if (sent) return (
    <div style={{ padding: 20 }} data-annonce-id={props.annonceId}>
      <div style={{ fontWeight: 800, color: LBC.green }}>Signalement envoyé</div>
      <button onClick={onClose} style={{ marginTop: 12 }}>Fermer</button>
    </div>
  )
  return (
    <div style={{ padding: 20 }} data-annonce-id={props.annonceId}>
      <h3>Signaler cette annonce</h3>
      <div>
        <label style={{ display: 'block', marginTop: 8 }}>
          <span style={{ position: 'absolute', left: -9999, top: 'auto' }}>Raison</span>
          <select value={reason} onChange={e => setReason(e.target.value as any)}>
            <option value="fraud">Arnaque / Fraude</option>
            <option value="spam">Spam / Doublons</option>
            <option value="prohibited">Objet interdit</option>
            <option value="offensive">Contenu offensant</option>
            <option value="wrong_category">Mauvaise catégorie</option>
            <option value="other">Autre</option>
          </select>
        </label>
        <textarea value={desc} onChange={e => setDesc(e.target.value)} style={{ width: '100%', minHeight: 100, marginTop: 8 }} />
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <button onClick={() => onSubmit({ reason: reason as any, description: desc })} disabled={loading} style={{ background: LBC.orange, color: LBC.white, border: 'none', padding: '10px 14px' }}>{loading ? 'Envoi...' : 'Envoyer'}</button>
          <button onClick={onClose} style={{ background: LBC.gray100, border: 'none', padding: '10px 14px' }}>Annuler</button>
        </div>
      </div>
    </div>
  )
}
