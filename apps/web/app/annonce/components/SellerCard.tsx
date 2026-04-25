/* eslint-disable no-unused-vars */
import React from 'react'
import Image from 'next/image'
import { LBC } from '../../search/data'
import type { SellerProfile } from '../types'

interface SellerCardProps {
  seller: SellerProfile
  annonceTitle: string
  onMessage: (_message: string) => void
  messageSent: boolean
  messageSending: boolean
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, annonceTitle, onMessage, messageSent, messageSending }) => {
  const [phoneRevealed, setPhoneRevealed] = React.useState(false)
  const [msgContent, setMsgContent] = React.useState(
    `Bonjour, est-ce que "${annonceTitle.slice(0, 40)}${annonceTitle.length > 40 ? '...' : ''}" est toujours disponible ?`
  )

  return (
    <div style={{ background: LBC.white, borderRadius: 12, border: `1px solid ${LBC.gray200}`, padding: 12, position: 'sticky', top: 80 }}>
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        {seller.avatar ? (
          <div style={{ width: 52, height: 52, borderRadius: '50%', overflow: 'hidden' }}>
            <Image src={seller.avatar} alt={seller.username} width={52} height={52} style={{ objectFit: 'cover' }} />
          </div>
        ) : (
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: LBC.orange, color: LBC.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800 }}>{seller.username.slice(0,2).toUpperCase()}</div>
        )}
        <div>
          <div style={{ fontWeight: 800, fontSize: 15, color: LBC.gray900 }}>{seller.username}</div>
          {seller.companyName && <div style={{ fontSize: 12, color: LBC.gray600 }}>{seller.companyName}</div>}
          <div style={{ fontSize: 12, color: LBC.gray400 }}>{seller.city} · {seller.activeAdsCount} annonces</div>
        </div>
      </div>

      <div style={{ marginTop: 12 }}>
        <button onClick={() => setPhoneRevealed(true)} style={{ width: '100%', padding: 11, borderRadius: 8, background: LBC.white, border: `1.5px solid ${LBC.gray200}`, fontWeight: 700, cursor: 'pointer' }}>
          {phoneRevealed ? seller.phone ?? '—' : 'Afficher le numéro'}
        </button>
        <textarea value={msgContent} onChange={e => setMsgContent(e.target.value)} style={{ marginTop: 8, width: '100%', minHeight: 72, padding: 10, borderRadius: 8, border: `1.5px solid ${LBC.gray200}`, fontFamily: 'inherit' }} />
        <button
          onClick={() => onMessage(msgContent)}
          disabled={messageSending}
          style={{ marginTop: 8, width: '100%', padding: 12, background: LBC.orange, color: LBC.white, border: 'none', borderRadius: 8, fontWeight: 800, cursor: 'pointer' }}
        >
          {(() => {
            if (messageSending) return 'Envoi...'
            if (messageSent) return 'Message envoyé'
            return 'Contacter le vendeur'
          })()}
        </button>
      </div>

      <button onClick={() => { globalThis.location.href = `/search?user=${seller.id}` }} style={{ display: 'block', textAlign: 'center', marginTop: 10, color: LBC.orange, fontWeight: 700, background: 'none', border: 'none', cursor: 'pointer' }}>Voir les autres annonces</button>
    </div>
  )
}
