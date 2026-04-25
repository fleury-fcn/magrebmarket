'use client';

import Link from 'next/link';
import { type CSSProperties } from 'react';

const s: Record<string, CSSProperties> = {
  page: { maxWidth: 820, margin: '0 auto', padding: '36px 20px 64px', fontFamily: 'Nunito Sans, sans-serif', color: '#1a1a1a', lineHeight: 1.7 },
  h1: { fontSize: 28, fontWeight: 800, marginBottom: 8, color: '#1a1a1a' },
  updated: { fontSize: 13, color: '#888', marginBottom: 32 },
  h2: { fontSize: 18, fontWeight: 700, marginTop: 32, marginBottom: 8, color: '#1a1a1a' },
  p: { fontSize: 15, marginBottom: 12 },
  nav: { marginBottom: 24, fontSize: 14 },
  navLink: { color: '#f97316', textDecoration: 'none', marginRight: 16 },
};

export default function ConfidentialitePage() {
  return (
    <div style={s.page}>
      <div style={s.nav}>
        <Link href="/" style={s.navLink}>← Accueil</Link>
        <Link href="/legal/cgu" style={s.navLink}>CGU</Link>
        <Link href="/legal/cookies" style={s.navLink}>Cookies</Link>
      </div>
      <h1 style={s.h1}>Politique de Confidentialité</h1>
      <p style={s.updated}>Dernière mise à jour : janvier 2025</p>

      <h2 style={s.h2}>1. Responsable du traitement</h2>
      <p style={s.p}>Le responsable du traitement des données personnelles est Maghreb Market. Contact : <a href="mailto:privacy@maghrebmarket.com" style={{ color: '#f97316' }}>privacy@maghrebmarket.com</a></p>

      <h2 style={s.h2}>2. Données collectées</h2>
      <p style={s.p}>Nous collectons les données suivantes :</p>
      <ul style={{ paddingLeft: 24, marginBottom: 12 }}>
        <li>Données d&apos;inscription : email, prénom, nom, pays</li>
        <li>Données d&apos;annonces : titre, description, photos, prix, localisation</li>
        <li>Données de navigation : adresse IP, pages visitées, durée de session</li>
        <li>Communications : messages échangés via la messagerie interne</li>
      </ul>

      <h2 style={s.h2}>3. Finalités du traitement</h2>
      <p style={s.p}>Vos données sont utilisées pour : la gestion de votre compte, la publication et la recherche d&apos;annonces, la communication entre utilisateurs, l&apos;amélioration du service et la prévention des fraudes.</p>

      <h2 style={s.h2}>4. Base légale</h2>
      <p style={s.p}>Le traitement est fondé sur l&apos;exécution du contrat (CGU) que vous avez accepté lors de votre inscription, ainsi que sur nos intérêts légitimes à améliorer le service.</p>

      <h2 style={s.h2}>5. Conservation des données</h2>
      <p style={s.p}>Vos données sont conservées pendant la durée de vie de votre compte, puis supprimées dans un délai de 30 jours après la suppression du compte, sauf obligation légale contraire.</p>

      <h2 style={s.h2}>6. Vos droits</h2>
      <p style={s.p}>Conformément au RGPD, vous disposez des droits suivants : accès, rectification, suppression, portabilité, opposition et limitation. Pour exercer ces droits, contactez : <a href="mailto:privacy@maghrebmarket.com" style={{ color: '#f97316' }}>privacy@maghrebmarket.com</a></p>

      <h2 style={s.h2}>7. Partage des données</h2>
      <p style={s.p}>Nous ne vendons pas vos données. Elles peuvent être partagées avec nos hébergeurs techniques dans le cadre strict de la fourniture du service.</p>
    </div>
  );
}
