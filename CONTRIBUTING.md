# Contributing to Maghreb Market

First off, thank you for considering contributing to **Maghreb Market**! 🛍️

This project is a classifieds marketplace built for North African markets (Mauritania, Morocco, Algeria, Tunisia, Libya), combining a Next.js frontend with a Django REST API. Whether you're fixing a bug, improving the UI, or adding a new feature — every contribution matters.

---

## 🙋 Ways to contribute

You don't need to be an expert developer to help. Here are several ways to get involved:

- **🐛 Report bugs** — Found something broken? Open an issue describing what happened and how to reproduce it.
- **💡 Suggest features** — Have an idea to improve the marketplace? Open an issue to discuss it before starting work.
- **💻 Write code** — Fix bugs, build features, improve performance. See [Good first issues](#-good-first-issues) below.
- **📝 Improve documentation** — Clearer setup instructions, better code comments, or corrections to this file are all welcome.
- **🌍 Add translations** — Help extend Arabic RTL support and other locales.
- **🎨 Improve the UI/UX** — The frontend is built with Next.js + TypeScript and could benefit from design polish.

---

## 🛠️ Setting up your development environment

### Prerequisites
- Node.js ≥ 20
- Python ≥ 3.12
- Docker + Docker Compose (recommended for PostgreSQL)

### Steps

```bash
# 1. Fork this repository on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/magrebmarket.git
cd magrebmarket

# 2. Add the original repository as an upstream remote
git remote add upstream https://github.com/fleury-fcn/magrebmarket.git

# 3. Install frontend dependencies
npm install

# 4. Configure environment variables
cp .env.example .env
cp apps/api/.env.example apps/api/.env
# Edit the values for your environment

# 5. Start the database
docker compose up -d db

# 6. Set up the Django backend
cd apps/api
python -m venv .venv
source .venv/bin/activate      # on Windows: .venv\Scripts\activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver 0.0.0.0:4000

# 7. In a new terminal, start the frontend
npm run dev:web
# → http://localhost:3000
```

You now have a working local copy of the platform. 🎉

---

## 🔄 Making a contribution

1. **Create a branch** for your change, based on the latest `main`:
   ```bash
   git checkout main
   git pull upstream main
   git checkout -b feature/short-description
   ```

2. **Make your changes.** Keep commits focused — one logical change per commit when possible.

3. **Write clear commit messages**, following this convention where relevant:
   ```
   feat: add price range filter to search
   fix: correct image upload validation
   docs: clarify local setup instructions
   ```

4. **Run lint and type checks before opening a PR:**
   ```bash
   cd apps/web && npx next lint && npx tsc --noEmit
   cd apps/api && ruff check .
   ```

5. **Push your branch and open a Pull Request:**
   ```bash
   git push origin feature/short-description
   ```
   Then open a PR on GitHub against the `main` branch of this repository. Describe what your change does and why.

6. **Respond to review feedback.** A maintainer will review your PR and may suggest changes — this is a normal part of the process, not a rejection.

---

## 🎯 Good first issues

New to the project? Look for issues labeled [`good first issue`](../../labels/good%20first%20issue) — these are scoped to be approachable without deep familiarity with the codebase.

Don't see one that fits? Feel free to open an issue proposing a small improvement (a UI fix, a missing filter option, a documentation gap) and mention you'd like to work on it.

---

## 🧭 Project structure

For an overview of how the monorepo is organized (Next.js frontend, Django API, shared packages), see the [README](README.md#monorepo-structure).

---

## 💬 Questions?

If anything is unclear, open an issue with the `question` label, or reach out via [fleuryniyokwizera2021@gmail.com](mailto:fleuryniyokwizera2021@gmail.com).

---

## 📜 Code of Conduct

Be respectful, be constructive, and remember there's a person on the other side of every issue and pull request. We want this to be a welcoming space for contributors of all backgrounds and experience levels.

---

Thank you again for helping build a better marketplace for North African users. 🙏
