# Responsive QA Checklist

Checklist rapide pour valider l’adaptation des pages `search`, `annonce/[id]` et `dashboard` sur mobile, tablette et desktop.

## Breakpoints à tester

- Mobile petit: `320x568` (iPhone SE)
- Mobile standard: `390x844` (iPhone 12/13)
- Tablette portrait: `768x1024` (iPad)
- Tablette paysage / petit laptop: `1024x768`
- Desktop: `1366x768` et `1440x900`

## Préparation

1. Lancer l’app:
   - Front: `http://localhost:3000`
   - API: `http://localhost:4000`
2. Ouvrir Chrome/Edge DevTools (`Cmd+Opt+I`) puis mode device toolbar (`Cmd+Shift+M`).
3. Tester chaque page avec hard refresh (`Cmd+Shift+R`).

## Pages à valider

- `/search`
- `/annonce/[id]` (utiliser une annonce existante)
- `/dashboard` (connecté)

## Critères globaux (toutes pages)

- Aucun scroll horizontal involontaire.
- Aucune zone tronquée (textes, boutons, cartes).
- Boutons/actions restent cliquables sans chevauchement.
- Espacements cohérents (pas de “collage” ni de trous excessifs).
- Typographie lisible sur mobile (pas trop petite).

## Checklist `/search`

- Header: champ recherche visible et utilisable sur mobile.
- Bouton filtres mobile visible et ouvre/ferme correctement le panneau.
- Sidebar filtres:
  - Mobile: en bloc plein largeur, non coupée.
  - Desktop: sticky + scroll interne ok.
- Résultats:
  - Mode grille: cartes alignées sans débordement.
  - Mode liste: image, texte, actions bien empilés sur mobile.
- Toolbar résultats:
  - Select tri visible.
  - Switch grille/liste utilisable sur petit écran.
- Pagination: boutons accessibles sans débordement.

## Checklist `/annonce/[id]`

- Mobile:
  - Layout en 1 colonne.
  - Galerie visible sans crop anormal.
  - Carte vendeur prend largeur disponible.
- Desktop:
  - Layout 2 colonnes conservé.
- Bloc signalement:
  - Bouton visible et modal utilisable sur petits écrans.
- Description/localisation: texte lisible, pas de coupure.

## Checklist `/dashboard`

- Header:
  - Mobile: bouton “Déposer une annonce” visible et aligné.
  - Desktop: alignement horizontal conservé.
- Tabs:
  - Mobile: scroll horizontal fluide, tab active visible.
- Onglet `Mes annonces`:
  - Mobile: actions (`Publier`, `Voir`) non chevauchées.
- Onglet `Favoris`:
  - Cartes adaptatives, sans overflow.
- Onglet `Profil` et `Paramètres`:
  - Contenu lisible et marges cohérentes.

## Validation finale

Cocher tous les points avant merge.

- [ ] Mobile 320
- [ ] Mobile 390
- [ ] Tablette 768
- [ ] Tablette 1024
- [ ] Desktop 1366+
- [ ] Aucun bug visuel bloquant

## Bugs à remonter (format recommandé)

- **Page**: `/search`
- **Viewport**: `390x844`
- **Étapes**: (1) ..., (2) ...
- **Résultat observé**: ...
- **Résultat attendu**: ...
- **Capture**: (ajouter screenshot)
