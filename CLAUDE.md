# ShopRedLive — Claude Code Guide

## What This Is

A university-focused secondhand marketplace for Stony Brook University students. Next.js 16 frontend + Express 5 backend + MongoDB. Students list, browse, negotiate, and pay for used items on campus.

## Dev Commands

```bash
npm run dev:all       # start Next.js (:3000) + Express (:8000) concurrently
npm run dev           # Next.js only
npm run dev:server    # Express only
npm test              # Jest test suite
npm run build         # production build
node server/seed_categories.js   # seed categories
node import_test_data.js         # seed users + products + test data
```

## Environment Variables

Copy `.env.local.example` → `.env.local` and fill in:

| Variable | Description |
|---|---|
| `NEXT_PUBLIC_BACKEND_URL` | Express base URL (default `http://localhost:8000`) |
| `SIGNALHOUSE_API_KEY` | External messaging service key |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key |
| `STRIPE_SECRET_KEY` | Stripe secret key |
| `STRIPE_WEBHOOK_SECRET` | From `stripe listen --forward-to localhost:3000/api/stripe/webhook` |
| `POW_CAPTCHA_DIFFICULTY` | Proof-of-work difficulty (integer, default 3) |
| `HIGH_VALUE_TRANSACTION_THRESHOLD` | Dollar amount triggering extra fraud checks |

## Architecture

```
Browser
  └─ Next.js :3000  (src/)
       ├─ App Router pages        src/app/**/page.js
       ├─ Next.js API routes      src/app/api/**/route.js
       ├─ React components        src/components/
       ├─ Auth state              src/context/AuthContext.js
       └─ API client + cache      src/lib/api.js

Express :8000  (server/)
  ├─ Main router                  server/server.js
  ├─ MongoDB schemas              server/models/
  └─ Services
       ├─ Security                server/services/security.js
       ├─ Stripe                  server/services/stripe.js
       └─ SignalHouse             server/services/signalhouse.js

MongoDB (local or Atlas)
  └─ shopredlive DB
```

## Key Files

| File | Purpose |
|---|---|
| `src/lib/api.js` | Cached fetch client used by all components |
| `src/context/AuthContext.js` | Global auth state; persists to localStorage |
| `src/components/ProductDetail.js` | Largest UI component — offers, messages, checkout |
| `src/components/Profile.js` | User profile + orders + reviews (50 KB, most complex) |
| `server/server.js` | All Express routes (~40 endpoints) |
| `server/services/security.js` | Rate limiting, device fingerprinting, MFA, fraud scoring |
| `server/services/stripe.js` | Payment intents, managed payouts, dispute handling |

## Security Patterns

The backend uses a layered security approach — do not bypass these when editing auth or payment routes:

1. **Rate limiting** — per-IP via `checkRateLimit` in `security.js`
2. **Proof-of-Work CAPTCHA** — solved client-side in `ProofOfWorkCaptcha.js`, verified server-side
3. **Account lockout** — tracked via `failedLoginAttempts` + `lockUntil` on the User model
4. **Device fingerprinting** — new devices trigger an MFA challenge
5. **Transaction velocity** — high-frequency buyers trigger payout holds
6. **Triangulation fraud** — buyer/seller/product mismatch patterns set `fraudFlag` on Order

## Tests

```
__tests__/components/ProductCard.test.js
__tests__/components/WishlistButton.test.js
__tests__/lib/api.test.js
```

Run with `npm test`. Coverage via `npm run test:coverage`.

## UML Diagrams

Source files (PlantUML) in `docs/UML/sequence/src/` and `docs/UML/class/src/`.
Generate PNGs with: `plantuml docs/UML/**/*.puml`
