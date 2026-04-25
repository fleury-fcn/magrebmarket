import React, { type Dispatch } from 'react';

import { LBC } from '../../search/data';
import { ImageGallery } from '../../annonce/components/ImageGallery';
import { SellerCard } from '../../annonce/components/SellerCard';
import { ReportModal, SecurityTips, SimilarAnnonces } from '../../annonce/components/Widgets';
import type { AnnonceDetail, SimilarAnnonce } from '../../annonce/types';

export function AnnonceLoadingView() {
  return <div style={{ padding: 20 }}>Chargement…</div>;
}

export function AnnonceErrorView({ error }: Readonly<{ error: string }>) {
  return <div style={{ padding: 20 }}>Erreur: {error}</div>;
}

export function AnnonceNotFoundView() {
  return <div style={{ padding: 20 }}>Annonce introuvable</div>;
}

interface AnnonceDetailViewProps {
  annonce: AnnonceDetail;
  similar: SimilarAnnonce[];
  isMobile: boolean;
  messageSent: boolean;
  messageSending: boolean;
  reportOpen: boolean;
  reportSent: boolean;
  reportLoading: boolean;
  onMessage: Dispatch<string>;
  onOpenReport: () => void;
  onCloseReport: () => void;
  onSubmitReport: Function;
}

export function AnnonceDetailView({
  annonce,
  similar,
  isMobile,
  messageSent,
  messageSending,
  reportOpen,
  reportSent,
  reportLoading,
  onMessage,
  onOpenReport,
  onCloseReport,
  onSubmitReport,
}: Readonly<AnnonceDetailViewProps>) {
  return (
    <div style={{ padding: isMobile ? 12 : 16, maxWidth: 1100, margin: '0 auto' }}>
      <nav style={{ fontSize: 13, color: LBC.gray600, marginBottom: 8 }}>
        <a href="/" style={{ color: LBC.orange, textDecoration: 'none' }}>Accueil</a> › <span style={{ color: LBC.gray900 }}>{annonce.title}</span>
      </nav>

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 340px', gap: isMobile ? 14 : 24 }}>
        <div>
          <div style={{ marginBottom: 12 }}>
            <ImageGallery images={annonce.images} title={annonce.title} isUrgent={annonce.isUrgent} />
          </div>

          <div style={{ background: LBC.white, borderRadius: 12, padding: 18, border: `1px solid ${LBC.gray200}` }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, flexDirection: isMobile ? 'column' : 'row' }}>
              <div style={{ flex: 1 }}>
                <h1 style={{ margin: '0 0 8px', fontSize: 22 }}>{annonce.title}</h1>
                <div style={{ fontSize: 28, fontWeight: 900 }}>{annonce.price ? `${annonce.price.toLocaleString('fr-FR')} €` : 'Gratuit'}</div>
                {annonce.isPriceNegotiable && <div style={{ marginTop: 8, color: LBC.green }}>Prix négociable</div>}
              </div>
              <div style={{ width: isMobile ? '100%' : 220 }}>
                <SellerCard seller={annonce.seller} annonceTitle={annonce.title} onMessage={onMessage} messageSent={messageSent} messageSending={messageSending} />
              </div>
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ margin: '0 0 8px' }}>Description</h3>
              <p style={{ whiteSpace: 'pre-line', margin: 0 }}>{annonce.description}</p>
            </div>

            <div style={{ marginTop: 18 }}>
              <h3 style={{ margin: '0 0 8px' }}>Localisation</h3>
              <div>{annonce.city}{annonce.postalCode ? ` (${annonce.postalCode})` : ''}</div>
            </div>
          </div>

          <div style={{ marginTop: 14 }}>
            <SimilarAnnonces annonces={similar} />
          </div>
        </div>

        <aside style={{ order: isMobile ? -1 : 0 }}>
          <SecurityTips />
          <div style={{ marginTop: 12 }}>
            <button onClick={onOpenReport} style={{ width: '100%', padding: 12, background: LBC.orangeLight, border: `1px solid ${LBC.orangeBorder}`, borderRadius: 8, fontWeight: 700 }}>Signaler</button>
          </div>

          {reportOpen && (
            <div style={{ marginTop: 12 }}>
              <ReportModal annonceId={annonce.id} onClose={onCloseReport} onSubmit={onSubmitReport} loading={reportLoading} sent={reportSent} />
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
