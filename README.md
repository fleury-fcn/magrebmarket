🇬🇧 English version · 🇫🇷 [Version française](README.fr.md)

# Maghreb Market

> Premium classifieds marketplace for North Africa — Mauritania · Morocco · Algeria · Tunisia · Libya

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org)
[![Django](https://img.shields.io/badge/Django-6.0-092E20?logo=django)](https://djangoproject.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.4-3178C6?logo=typescript)](https://typescriptlang.org)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?logo=postgresql)](https://postgresql.org)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

## Table of contents

1. [Overview](#overview)
2. [Features](#features)
3. [Architecture](#architecture)
4. [Tech stack](#tech-stack)
5. [Monorepo structure](#monorepo-structure)
6. [Quick start](#quick-start)
7. [Environment variables](#environment-variables)
8. [API — Endpoint reference](#api--endpoint-reference)
9. [Deployment](#deployment)
10. [Quality & linting](#quality--linting)
11. [Roadmap](#roadmap)

---

## Overview

Maghreb Market is a classifieds marketplace inspired by LeBonCoin, built specifically for North African markets. It offers a modern, localized experience: fine-grained geographic search (country → region → city), categories tailored to local usage, integrated messaging, and a listing promotion system.

---

## Features

### User-facing

- **Dynamic homepage** — live market statistics, popular categories, recent listings, trends, and active cities
- **Guided listing creation** — multi-step form (category → photos → details → location), image upload, automatic publishing
- **Advanced search** — combined filters: category, country, region, city, price range, condition, promotion type; pagination + sorting
- **Listing page** — photo gallery, category-specific dynamic attributes, location, seller contact
- **Authentication** — sign-up, login, profile, password change and reset
- **Messaging** — buyer/seller conversations with message history
- **Favorites** — save and manage favorite listings
- **Reporting** — flag abusive listings

### Back-office

- **Moderation queue** — review, individual or bulk decisions, history
- **Auto-moderation** — automatic scoring at publication
- **Promotion rules** — automatic handling of `standard | featured | urgent | premium` types
- **Market stats** — dedicated `meta/stats/` endpoint (total listings, active, cities, categories)

---

## Architecture

```
maghreb-market/
├── apps/
│   ├── web/           # Next.js 14 — public interface (App Router, TypeScript)
│   └── api/            # Django 6 + DRF — REST API
├── packages/
│   ├── config/         # Shared data: regions, categories, constants
│   └── ui/              # Reusable React components
├── deploy/
│   └── nginx/           # Reverse proxy configuration
├── docker-compose.yml
├── turbo.json
└── package.json         # NPM Workspaces root
```

The frontend and backend communicate exclusively through the REST API (`/api/`). Nginx serves as the single entry point in production.

---

## Tech stack

| Layer            | Technology                     | Version    | Role                                     |
| ----------------- | -------------------------------- | ---------- | ------------------------------------------ |
| Frontend          | Next.js + React                  | 14 / 18    | SSR, App Router, listing SEO             |
| Frontend language | TypeScript                       | 5.4        | End-to-end typing                        |
| Backend           | Django + DRF                     | 6.0 / 3.17 | REST API, admin, auth, moderation        |
| Database          | PostgreSQL                       | 15         | Primary storage, geo queries             |
| ORM               | psycopg3                         | 3.3        | Native async-ready PostgreSQL connector  |
| Containerization  | Docker + Compose                 | —          | Postgres + API in development            |
| Reverse proxy     | Nginx                            | —          | SSL, static assets, routing              |
| Monorepo          | Turborepo + npm Workspaces       | —          | Lint/build/test orchestration            |
| Lint              | ESLint (next/core-web-vitals)    | 8          | Frontend code quality                    |

---

## Monorepo structure

### `apps/web` — Next.js frontend

```
app/
├── page.tsx                  # Home (stats, categories, recent listings)
├── search/                   # Results page + advanced filters
├── listings/
│   ├── new/page.tsx          # Listing creation (multi-step form)
│   └── [slug]/page.tsx       # Listing detail page
├── auth/                     # Sign-up / login
├── dashboard/                # User dashboard
├── favorites/                # Saved listings
├── messages/                 # Messaging
└── i18n/                     # Internationalization (fr / ar / en)
```

### `apps/api` — Django backend

```
listings/    # Listings, categories, search, moderation, uploads, stats
accounts/    # Authentication, user profiles
messaging/   # Conversations and messages
```

### `packages/config`

Shared reference data: list of countries, regions, cities, category schemas (`CATEGORY_FIELD_SCHEMAS`), currencies per country (`COUNTRY_CURRENCY`).

---

## Quick start

### Prerequisites

- **Node.js** ≥ 20
- **Python** ≥ 3.12
- **Docker** + **Docker Compose** (recommended for PostgreSQL)

### 1. Clone and install

```bash
git clone https://github.com/fleury-fcn/magrebmarket.git
cd magrebmarket
npm install
```

### 2. Environment variables

```bash
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# Edit the values for your environment
```

### 3. Start the database

```bash
docker compose up -d db
```

### 4. Initialize the Django backend

```bash
cd apps/api
python -m venv .venv
source .venv/bin/activate          # Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py createsuperuser   # optional — access to /admin/
python manage.py runserver 0.0.0.0:4000
```

### 5. Start the Next.js frontend

In a new terminal, from the monorepo root:

```bash
npm run dev:web
# → http://localhost:3000
```

### Alternative: full stack in Docker

```bash
docker compose up --build
# API → http://localhost:4000
# DB  → localhost:5432
```
> **Note:** The Next.js frontend runs in local dev mode via `npm run dev:web` and is not included in the default `docker-compose.yml`.

---

## Environment variables

### Root `.env`

| Variable            | Example                                                       | Description                |
| ------------------- | ---------------------------------------------------------------- | ----------------------------- |
| `DATABASE_URL`      | `postgresql://maghreb:maghreb@localhost:5432/maghreb_market`     | PostgreSQL connection        |
| `PUBLIC_ASSET_BASE` | `http://localhost:3000`                                           | Base URL for public assets   |

### `apps/web` (prefix `NEXT_PUBLIC_`)

| Variable                   | Example                              | Description                  |
| --------------------------- | --------------------------------------- | -------------------------------- |
| `NEXT_PUBLIC_API_BASE_URL` | `http://localhost:4000`               | Django API URL                |
| `NEXT_PUBLIC_MAP_STYLE`    | `https://api.mapbox.com/styles/...`   | Mapbox style (mapping)        |

### `apps/api/.env`

| Variable       | Example              | Description                |
| -------------- | ----------------------- | ------------------------------ |
| `DATABASE_URL` | `postgresql://...`    | PostgreSQL connection        |
| `API_PORT`     | `4000`                | Django listening port        |
| `API_HOST`     | `0.0.0.0`              | Django listening interface   |

---

## API — Endpoint reference

All routes are prefixed with `/api/`.

### Listings

| Method   | Endpoint                    | Description                                                                                                                       |
| -------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ |
| `GET`    | `listings/search/`          | Paginated search (params: `q`, `category`, `country`, `region`, `city`, `min_price`, `max_price`, `condition`, `promotion_type`) |
| `GET`    | `listings/`                  | List listings                                                                                                                     |
| `POST`   | `listings/`                  | Create a listing *(auth required)*                                                                                                |
| `GET`    | `listings/{slug}/`           | Listing detail                                                                                                                    |
| `PATCH`  | `listings/{slug}/`           | Edit a listing *(owner)*                                                                                                          |
| `DELETE` | `listings/{slug}/`           | Delete a listing *(owner)*                                                                                                        |
| `POST`   | `listings/{slug}/publish/`   | Publish a pending listing                                                                                                         |
| `POST`   | `uploads/cover-image/`       | Image upload (multipart/form-data)                                                                                                |

### Meta / Reference

| Method | Endpoint                   | Description                                              |
| ------ | ----------------------------- | -------------------------------------------------------------- |
| `GET`  | `meta/regions/`             | Countries and regions                                     |
| `GET`  | `meta/cities/?country=MA`   | Cities by country code                                     |
| `GET`  | `meta/categories/`          | Categories, subcategories, and dynamic fields              |
| `GET`  | `meta/stats/`               | Market statistics (total, active, cities, categories)     |

### Authentication

| Method      | Endpoint                | Description                  |
| ------------ | --------------------------- | -------------------------------- |
| `POST`      | `auth/register/`         | Sign-up                      |
| `POST`      | `auth/login/`             | Login (Django session)       |
| `POST`      | `auth/logout/`            | Logout                       |
| `GET/PATCH` | `auth/profile/`           | User profile                 |
| `POST`      | `auth/password/`          | Password change              |
| `POST`      | `auth/password/reset/`    | Password reset request       |
| `GET`       | `auth/csrf/`              | Retrieve CSRF token          |

### Messaging

| Method     | Endpoint                                 | Description                        |
| ----------- | -------------------------------------------- | -------------------------------------- |
| `GET/POST` | `messages/conversations/`                | List / create a conversation       |
| `GET`      | `messages/conversations/{id}/`           | Conversation detail                |
| `GET/POST` | `messages/conversations/{id}/messages/`  | History / send a message           |

### Favorites & Reports

| Method             | Endpoint      | Description             |
| -------------------- | --------------- | -------------------------- |
| `GET/POST/DELETE`  | `favorites/`   | Manage favorites         |
| `POST`              | `reports/`     | Report a listing          |

### Moderation *(admin)*

| Method | Endpoint                      | Description                  |
| ------ | -------------------------------- | -------------------------------- |
| `GET`  | `moderation/queue/`            | Paginated moderation queue   |
| `GET`  | `moderation/history/`          | Decision history              |
| `GET`  | `moderation/stats/`            | Moderation statistics         |
| `POST` | `moderation/bulk-decision/`    | Bulk decision                 |

---

## Deployment

### Nginx (production)

The `deploy/nginx/default.conf` file configures:

- **`/api/`** → proxy to Django (`http://api:4000`)
- **`/static/`**, **`/media/`** → Django assets served directly
- **All other routes** → proxy to Next.js (`http://web:3000`)

Enable HTTPS with Let's Encrypt and HTTP/2 before going to production.

### Next.js build

```bash
cd apps/web
npm run build && npm run start
```

### Django in production

```bash
cd apps/api
python manage.py collectstatic --no-input
gunicorn maghreb_api.wsgi:application --bind 0.0.0.0:4000 --workers 4
```

---

## Quality & linting

```bash
# Full frontend lint
cd apps/web && npx next lint

# Targeted lint on a single file
cd apps/web && npx next lint --file app/listings/new/page.tsx

# TypeScript check
cd apps/web && npx tsc --noEmit

# Python lint
cd apps/api && ruff check .
```

Active ESLint rules: `next/core-web-vitals`, `react-hooks/exhaustive-deps`, `@next/next/no-img-element`, `no-unused-vars`.

---

## Roadmap

- [ ] Full-text search engine (Meilisearch / Elasticsearch)
- [ ] Push and email notifications (new listing, new message)
- [ ] Online payment — Stripe + CinetPay (boost, premium)
- [ ] React Native mobile app (shared packages)
- [ ] Full Arabic RTL internationalization
- [ ] Interactive listings map (Mapbox GL)
- [ ] Seller rating system

---

## License

MIT © 2026

## 👤 Author

<img src="https://github.com/fleury-fcn.png" width="100" style="border-radius: 50%;" alt="Fleury Niyokwizera" />

**Fleury NIYOKWIZERA**
Master 1 in Applied Statistics and Business Intelligence – ISTA, University of Burundi 🇧🇮
Currently pursuing a Master's in Data Modeling (Artificial Intelligence track) – University of Lille, France 🇫🇷

[![GitHub](https://img.shields.io/badge/GitHub-fleury--fcn-181717?style=flat&logo=github&logoColor=white)](https://github.com/fleury-fcn)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Fleury_Niyokwizera-0A66C2?style=flat&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/fleury-niyokwizera-2a9436291)
