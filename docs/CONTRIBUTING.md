# Contributing Guide

## Local Setup

```bash
git clone https://github.com/khandaker-abid/shopredlive.git
cd shopredlive
npm install
cd server && npm install && cd ..

# Copy and fill in environment variables
cp .env.local.example .env.local   # create this file if it doesn't exist

# Seed the database
node server/seed_categories.js
node import_test_data.js           # optional: sample users + products

# Start both servers
npm run dev:all
```

Frontend runs at `http://localhost:3000`, Express at `http://localhost:8000`.

## Branch Naming

| Type | Pattern | Example |
|------|---------|---------|
| Feature | `feature/<slug>` | `feature/wishlist-button` |
| Bug fix | `fix/<slug>` | `fix/offer-counter-reset` |
| Chore / tooling | `chore/<slug>` | `chore/update-stripe-sdk` |
| Docs | `docs/<slug>` | `docs/deployment-guide` |

Always branch from `main`.

## Before Opening a PR

- [ ] `npm run lint` passes with no errors
- [ ] `npm test` passes
- [ ] No hardcoded API keys, passwords, or connection strings
- [ ] New components follow the existing MUI + `'use client'` patterns
- [ ] New API routes validate input before touching the database
- [ ] Security-sensitive routes (auth, payments, orders) go through `security.js` middleware

## Test Data

Use `test_data/` JSON files for local development:

```bash
node import_test_data.js   # imports test_users.json, test_products.json, test_categories.json
```

Credentials for test users are in `test_data/test_users.json`.

## Code Style

- MUI components for all UI; no raw CSS files
- `'use client'` at the top of any component that uses hooks or browser APIs
- `BACKEND_URL` is always read from `process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000'`
- API calls from components go through `src/lib/api.js` where possible (benefits from the 60s cache)

## Working with the Security Service

Avoid editing `server/services/security.js` without reviewing the full flow. The rate limiter, account lockout, and fraud detection are interconnected — a change to one can affect the others. See `CLAUDE.md` for the layered security pattern overview.
