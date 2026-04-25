# Maghreb Market

> Plateforme d'annonces classées premium pour l'Afrique du Nord — Mauritanie · Maroc · Algérie · Tunisie · Libye

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django)](https://djangoproject.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table des matières

1. [Vue d'ensemble](#vue-densemble)
2. [Fonctionnalités](#fonctionnalités)
3. [Architecture](#architecture)
4. [Stack technique](#stack-technique)
5. [Structure du monorepo](#structure-du-monorepo)
6. [Démarrage rapide](#démarrage-rapide)
7. [Variables d'environnement](#variables-denvironnement)
8. [API — Référence des endpoints](#api--référence-des-endpoints)
9. [Déploiement](#déploiement)
10. [Qualité & lint](#qualité--lint)
11. [Roadmap](#roadmap)

---

## Vue d'ensemble

Maghreb Market est un marketplace d'annonces inspiré de LeBonCoin, conçu spécifiquement pour les marchés nord-africains. Il propose une expérience moderne et localisée : recherche géographique fine (pays → région → ville), catégories adaptées aux usages locaux, messagerie intégrée et système de promotion d'annonces.

---

## Fonctionnalités

### Côté utilisateur

- **Page d'accueil dynamique** — statistiques live du marché, catégories populaires, annonces récentes, tendances et villes actives
- **Dépôt d'annonce guidé** — formulaire multi-étapes (catégorie → photos → détails → localisation), upload d'images et publication automatique
- **Recherche avancée** — filtres combinés : catégorie, pays, région, ville, fourchette de prix, état, type de promotion ; pagination + tri
- **Fiche annonce** — galerie photos, attributs dynamiques par catégorie, localisation, contact vendeur
- **Authentification** — inscription, connexion, profil, changement et réinitialisation de mot de passe
- **Messagerie** — conversations entre acheteur et vendeur avec historique des messages
- **Favoris** — sauvegarde et gestion des annonces favorites
- **Signalement** — signalement d'annonces abusives

### Côté back-office

- **File de modération** — examen, décision individuelle ou en masse, historique
- **Auto-modération** — scoring automatique à la publication
- **Règles de promotion** — traitement automatique des types `standard | featured | urgent | premium`
- **Stats marché** — endpoint dédié `meta/stats/` (total annonces, actives, villes, catégories)

---

## Architecture

```
maghreb-market/
├── apps/
│   ├── web/           # Next.js 14 — interface publique (App Router, TypeScript)
│   └── api/           # Django 6 + DRF — API REST
├── packages/
│   ├── config/        # Données partagées : régions, catégories, constantes
│   └── ui/            # Composants React réutilisables
├── deploy/
│   └── nginx/         # Configuration reverse proxy
├── docker-compose.yml
├── turbo.json
└── package.json       # NPM Workspaces root
```

Le frontend et le backend communiquent exclusivement via l'API REST (`/api/`). Nginx sert de point d'entrée unique en production.

---

## Stack technique

| Couche | Technologie | Version | Rôle |
|---|---|---|---|
| Frontend | Next.js + React | 14 / 18 | SSR, App Router, SEO des fiches annonces |
| Langage front | TypeScript | 5.4 | Typage bout en bout |
| Backend | Django + DRF | 6.0 / 3.17 | API REST, admin, auth, modération |
| Base de données | PostgreSQL | 15 | Stockage principal, requêtes géo |
| ORM | psycopg3 | 3.3 | Connecteur PostgreSQL natif async-ready |
| Conteneurisation | Docker + Compose | — | Postgres + API en développement |
| Reverse proxy | Nginx | — | SSL, assets statiques, routing |
| Monorepo | Turborepo + npm Workspaces | — | Orchestration lint/build/test |
| Lint | ESLint (next/core-web-vitals) | 8 | Qualité code frontend |

---

## Structure du monorepo

### `apps/web` — Frontend Next.js

```
app/
├── page.tsx                  # Accueil (stats, catégories, annonces récentes)
├── search/                   # Page de résultats + filtres avancés
├── listings/
│   ├── new/page.tsx          # Dépôt d'annonce (formulaire multi-étapes)
│   └── [slug]/page.tsx       # Fiche annonce
├── auth/                     # Inscription / connexion
├── dashboard/                # Espace utilisateur
├── favorites/                # Annonces sauvegardées
├── messages/                 # Messagerie
└── i18n/                     # Internationalisation (fr / ar / en)
```

### `apps/api` — Backend Django

```
listings/    # Annonces, catégories, recherche, modération, uploads, stats
accounts/    # Authentification, profils utilisateurs
messaging/   # Conversations et messages
```

### `packages/config`

Données de référence partagées : liste des pays, régions, villes, schémas de catégories (`CATEGORY_FIELD_SCHEMAS`), devises par pays (`COUNTRY_CURRENCY`).

---

## Démarrage rapide

### Prérequis

- **Node.js** ≥ 20
- **Python** ≥ 3.12
- **Docker** + **Docker Compose** (recommandé pour PostgreSQL)

### 1. Cloner et installer

```bash
git clone https://github.com/your-org/maghreb-market.git
cd maghreb-market
npm install
```

### 2. Variables d'environnement

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# Éditez les valeurs selon votre environnement
```

### 3. Démarrer la base de données

```bash
docker compose up -d db
```

### 4. Initialiser le backend Django

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate          # Windows : .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optionnel — accès à /admin/
python manage.py runserver 0.0.0.0:4000
```

### 5. Démarrer le frontend Next.js

Dans un nouveau terminal, depuis la racine du monorepo :

```bash
npm run dev:web
# → http://localhost:3000
```

### Alternative : stack complète en Docker

```bash
docker compose up --build
# API → http://localhost:4000
# DB  → localhost:5432
```

> **Note :** Le frontend Next.js tourne en mode dev local via `npm run dev:web` et n'est pas inclus dans le `docker-compose.yml` par défaut.

---

## Variables d'environnement

### `.env` racine

| Variable | Exemple | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://maghreb:maghreb@localhost:5432/maghreb_market` | Connexion PostgreSQL |
| `PUBLIC_ASSET_BASE` | `http://localhost:3000` | Base URL des assets publics |

### `apps/web` (préfixe `NEXT_PUBLIC_`)

| Variable | Exemple | Description |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000` | URL de l'API Django |
| `NEXT_PUBLIC_MAP_STYLE` | `https://api.mapbox.com/styles/...` | Style Mapbox (cartographie) |

### `apps/api/.env`

| Variable | Exemple | Description |
|---|---|---|
| `DATABASE_URL` | `postgresql://...` | Connexion PostgreSQL |
| `API_PORT` | `4000` | Port d'écoute Django |
| `API_HOST` | `0.0.0.0` | Interface d'écoute Django |

---

## API — Référence des endpoints

Toutes les routes sont préfixées par `/api/`.

### Annonces

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `listings/search/` | Recherche paginée (params: `q`, `category`, `country`, `region`, `city`, `min_price`, `max_price`, `condition`, `promotion_type`) |
| `GET` | `listings/` | Liste des annonces |
| `POST` | `listings/` | Créer une annonce *(auth requise)* |
| `GET` | `listings/{slug}/` | Détail d'une annonce |
| `PATCH` | `listings/{slug}/` | Modifier une annonce *(propriétaire)* |
| `DELETE` | `listings/{slug}/` | Supprimer une annonce *(propriétaire)* |
| `POST` | `listings/{slug}/publish/` | Publier une annonce en attente |
| `POST` | `uploads/cover-image/` | Upload d'image (multipart/form-data) |

### Méta / Référentiel

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `meta/regions/` | Pays et régions |
| `GET` | `meta/cities/?country=MA` | Villes par code pays |
| `GET` | `meta/categories/` | Catégories, sous-catégories et champs dynamiques |
| `GET` | `meta/stats/` | Statistiques du marché (total, actives, villes, catégories) |

### Authentification

| Méthode | Endpoint | Description |
|---|---|---|
| `POST` | `auth/register/` | Inscription |
| `POST` | `auth/login/` | Connexion (session Django) |
| `POST` | `auth/logout/` | Déconnexion |
| `GET/PATCH` | `auth/profile/` | Profil utilisateur |
| `POST` | `auth/password/` | Changement de mot de passe |
| `POST` | `auth/password/reset/` | Demande de réinitialisation |
| `GET` | `auth/csrf/` | Récupérer le token CSRF |

### Messagerie

| Méthode | Endpoint | Description |
|---|---|---|
| `GET/POST` | `messages/conversations/` | Lister / créer une conversation |
| `GET` | `messages/conversations/{id}/` | Détail d'une conversation |
| `GET/POST` | `messages/conversations/{id}/messages/` | Historique / envoyer un message |

### Favoris & Signalements

| Méthode | Endpoint | Description |
|---|---|---|
| `GET/POST/DELETE` | `favorites/` | Gérer les favoris |
| `POST` | `reports/` | Signaler une annonce |

### Modération *(admin)*

| Méthode | Endpoint | Description |
|---|---|---|
| `GET` | `moderation/queue/` | File de modération paginée |
| `GET` | `moderation/history/` | Historique des décisions |
| `GET` | `moderation/stats/` | Statistiques de modération |
| `POST` | `moderation/bulk-decision/` | Décision en masse |

---

## Déploiement

### Nginx (production)

Le fichier `deploy/nginx/default.conf` configure :

- **`/api/`** → proxy vers Django (`http://api:4000`)
- **`/static/`**, **`/media/`** → assets Django servis directement
- **Toutes les autres routes** → proxy vers Next.js (`http://web:3000`)

Activez HTTPS avec Let's Encrypt et HTTP/2 avant la mise en production.

### Build Next.js

```bash
cd apps/web
npm run build && npm run start
```

### Django en production

```bash
cd apps/api
python manage.py collectstatic --no-input
gunicorn maghreb_api.wsgi:application --bind 0.0.0.0:4000 --workers 4
```

---

## Qualité & lint

```bash
# Lint frontend complet
cd apps/web && npx next lint

# Lint ciblé sur un fichier
cd apps/web && npx next lint --file app/listings/new/page.tsx

# Vérification TypeScript
cd apps/web && npx tsc --noEmit

# Lint Python
cd apps/api && ruff check .
```

Règles ESLint actives : `next/core-web-vitals`, `react-hooks/exhaustive-deps`, `@next/next/no-img-element`, `no-unused-vars`.

---

## Roadmap

- [ ] Moteur de recherche full-text (Meilisearch / Elasticsearch)
- [ ] Notifications push et email (nouvelle annonce, nouveau message)
- [ ] Paiement en ligne — Stripe + CinetPay (boost, premium)
- [ ] Application mobile React Native (partage des packages)
- [ ] Internationalisation complète arabe RTL
- [ ] Carte interactive des annonces (Mapbox GL)
- [ ] Système de notation vendeur

---

## Licence

MIT © 2026 Maghreb Market
