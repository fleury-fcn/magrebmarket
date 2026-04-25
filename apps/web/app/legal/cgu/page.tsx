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

export default function CGUPage() {
  return (
    <div style={s.page}>
      <div style={s.nav}>
        <Link href="/" style={s.navLink}>← Accueil</Link>
        <Link href="/legal/confidentialite" style={s.navLink}>Confidentialité</Link>
        <Link href="/legal/cookies" style={s.navLink}>Cookies</Link>
      </div>
      <h1 style={s.h1}>Conditions Générales d&apos;Utilisation</h1>
      <p style={s.updated}>Dernière mise à jour : janvier 2025</p>

      <h2 style={s.h2}>1. Objet</h2>
      <p style={s.p}>Les présentes conditions générales d&apos;utilisation (CGU) régissent l&apos;utilisation du site Maghreb Market, plateforme de petites annonces en ligne à destination des communautés maghrébines.</p>

      <h2 style={s.h2}>2. Accès au service</h2>
      <p style={s.p}>L&apos;accès au site est gratuit. Certaines fonctionnalités (dépôt d&apos;annonces, messagerie) nécessitent la création d&apos;un compte. L&apos;utilisateur s&apos;engage à fournir des informations exactes lors de son inscription.</p>

      <h2 style={s.h2}>3. Contenu des annonces</h2>
      <p style={s.p}>Les annonces publiées doivent respecter la législation en vigueur. Il est interdit de publier des contenus illicites, frauduleux, discriminatoires ou portant atteinte aux droits de tiers. Maghreb Market se réserve le droit de supprimer tout contenu contraire aux présentes CGU.</p>

      <h2 style={s.h2}>4. Responsabilité</h2>
      <p style={s.p}>Maghreb Market est un intermédiaire technique. Nous ne sommes pas parties aux transactions entre utilisateurs et déclinons toute responsabilité quant au contenu des annonces ou aux échanges entre utilisateurs.</p>

      <h2 style={s.h2}>5. Propriété intellectuelle</h2>
      <p style={s.p}>L&apos;ensemble des éléments graphiques, textuels et fonctionnels du site sont la propriété de Maghreb Market. Toute reproduction sans autorisation est interdite.</p>

      <h2 style={s.h2}>6. Modification des CGU</h2>
      <p style={s.p}>Maghreb Market se réserve le droit de modifier les présentes CGU à tout moment. Les utilisateurs seront informés par notification sur le site.</p>

      <h2 style={s.h2}>7. Contact</h2>
      <p style={s.p}>Pour toute question relative aux présentes CGU, vous pouvez nous contacter à : <a href="mailto:contact@maghrebmarket.com" style={{ color: '#f97316' }}>contact@maghrebmarket.com</a></p>
    </div>
  );
}
