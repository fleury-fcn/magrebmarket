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
  table: { width: '100%', borderCollapse: 'collapse', marginBottom: 20, fontSize: 14 },
  th: { textAlign: 'left', padding: '8px 12px', background: '#f5f5f5', borderBottom: '2px solid #ddd', fontWeight: 700 },
  td: { padding: '8px 12px', borderBottom: '1px solid #eee', verticalAlign: 'top' },
};

export default function CookiesPage() {
  return (
    <div style={s.page}>
      <div style={s.nav}>
        <Link href="/" style={s.navLink}>← Accueil</Link>
        <Link href="/legal/cgu" style={s.navLink}>CGU</Link>
        <Link href="/legal/confidentialite" style={s.navLink}>Confidentialité</Link>
      </div>
      <h1 style={s.h1}>Politique de Cookies</h1>
      <p style={s.updated}>Dernière mise à jour : janvier 2025</p>

      <h2 style={s.h2}>Qu&apos;est-ce qu&apos;un cookie ?</h2>
      <p style={s.p}>Un cookie est un petit fichier texte déposé sur votre terminal lors de votre visite sur notre site. Il permet de mémoriser vos préférences et d&apos;améliorer votre expérience.</p>

      <h2 style={s.h2}>Cookies utilisés sur Maghreb Market</h2>
      <table style={s.table}>
        <thead>
          <tr>
            <th style={s.th}>Nom</th>
            <th style={s.th}>Type</th>
            <th style={s.th}>Finalité</th>
            <th style={s.th}>Durée</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style={s.td}>auth_token</td>
            <td style={s.td}>Essentiel</td>
            <td style={s.td}>Maintien de la session utilisateur</td>
            <td style={s.td}>Session</td>
          </tr>
          <tr>
            <td style={s.td}>mm_language</td>
            <td style={s.td}>Fonctionnel</td>
            <td style={s.td}>Mémorisation de la langue choisie</td>
            <td style={s.td}>1 an</td>
          </tr>
          <tr>
            <td style={s.td}>mm_recent_searches</td>
            <td style={s.td}>Fonctionnel</td>
            <td style={s.td}>Historique des recherches récentes (localStorage)</td>
            <td style={s.td}>Permanent (local)</td>
          </tr>
          <tr>
            <td style={s.td}>_ga, _gid</td>
            <td style={s.td}>Analytique</td>
            <td style={s.td}>Mesure d&apos;audience (Google Analytics, si activé)</td>
            <td style={s.td}>2 ans</td>
          </tr>
        </tbody>
      </table>

      <h2 style={s.h2}>Gestion des cookies</h2>
      <p style={s.p}>Vous pouvez à tout moment configurer votre navigateur pour refuser les cookies ou être alerté avant leur dépôt. Notez que le blocage des cookies essentiels peut affecter le fonctionnement du site.</p>
      <p style={s.p}>Pour en savoir plus sur la gestion des cookies selon votre navigateur :</p>
      <ul style={{ paddingLeft: 24, marginBottom: 12, fontSize: 14 }}>
        <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>Google Chrome</a></li>
        <li><a href="https://support.mozilla.org/fr/kb/cookies-informations-sites-enregistrent" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>Mozilla Firefox</a></li>
        <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" style={{ color: '#f97316' }}>Safari</a></li>
      </ul>

      <h2 style={s.h2}>Contact</h2>
      <p style={s.p}>Pour toute question sur notre utilisation des cookies : <a href="mailto:privacy@maghrebmarket.com" style={{ color: '#f97316' }}>privacy@maghrebmarket.com</a></p>
    </div>
  );
}
