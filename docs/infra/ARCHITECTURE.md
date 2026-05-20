# Architecture Overview

## System Layout

```
┌─────────────────────────────────────────────────────────┐
│                        Browser                          │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP / fetch
┌─────────────────────▼───────────────────────────────────┐
│            Next.js  :3000  (Vercel)                     │
│                                                         │
│  App Router pages     src/app/**/page.js                │
│  Next.js API routes   src/app/api/**/route.js           │
│    (serverless fns)                                     │
│  React components     src/components/                   │
│  Auth state           src/context/AuthContext.js        │
│  API cache client     src/lib/api.js  (60s TTL)         │
└─────────────────────┬───────────────────────────────────┘
                      │ HTTP (NEXT_PUBLIC_BACKEND_URL)
┌─────────────────────▼───────────────────────────────────┐
│            Express  :8000  (Railway)                    │
│                                                         │
│  Routes             server/server.js  (~40 endpoints)   │
│  Security layer     server/services/security.js         │
│  Stripe payouts     server/services/stripe.js           │
│  Messaging bridge   server/services/signalhouse.js      │
│  File uploads       /uploads  (Railway Volume)          │
└─────────────────────┬───────────────────────────────────┘
                      │ Mongoose
┌─────────────────────▼───────────────────────────────────┐
│            MongoDB  (Atlas M0)                          │
│                                                         │
│  Users · Products · Orders · Conversations · Messages   │
│  Offers · Reviews · Notifications · Categories · Reports│
└─────────────────────────────────────────────────────────┘

          ┌──────────┐        ┌──────────────┐
          │  Stripe  │◄──────►│  Webhooks    │
          └──────────┘        │  /api/stripe │
                              │  /webhook    │
                              └──────────────┘
```

## Component Responsibilities

| Layer | Responsibility |
|-------|---------------|
| Next.js pages | Route rendering, auth guards via `ProtectedRoute` |
| Next.js API routes | Thin proxy to Express; handles Stripe webhooks and Next.js-specific auth (password reset emails) |
| Express routes | Business logic, data access, file upload handling |
| Security service | Rate limiting, CAPTCHA, lockout, device fingerprinting, MFA, fraud scoring |
| Stripe service | Payment intent creation, destination transfers, dispute escalation |
| MongoDB models | Schema enforcement; `users.js` carries all security state |

## Auth Flow

1. User submits credentials on `/login`
2. Next.js API route (`/api/auth/login`) forwards to Express `POST /users/verify-login`
3. Express runs rate limit → CAPTCHA check → lockout check → bcrypt compare → device fingerprint
4. On success: Express returns `{ validEmail: true, validPassword: true, userId }`
5. `AuthContext.login()` stores the user object in React state + `localStorage`
6. `ProtectedRoute` reads from context; unauthenticated users are redirected to `/login`

## File Upload Flow

1. Client submits `multipart/form-data` to Express `POST /products` or `PATCH /products/:id`
2. Multer middleware writes files to `server/uploads/`
3. Express stores the relative path (`/uploads/<filename>`) in the Product document
4. Frontend constructs the full URL: `${BACKEND_URL}/uploads/<filename>`
5. `next.config.js` allows all remote image hostnames so `<img>` tags load correctly

## Payment Flow

1. Buyer clicks "Buy Now" → Next.js route calls Express `POST /payments/create-payment-intent`
2. Security service scores the transaction (velocity + triangulation)
3. Express calls Stripe: `createPaymentIntent(amount, { transfer_data: { destination: sellerStripeId } })`
4. Client secret returned to browser; `StripeCheckoutForm` confirms payment
5. On success: order status updated to `payment_received`
6. Stripe webhook fires on disputes → Express sets `order.disputeActive = true` and holds payout

## Listing Expiration

A cron-like check runs on each `GET /products` request: any product with `expiresAt < now` is set to `status: expired`. Default listing duration is controlled by `LISTING_DURATION_DAYS` (default 30).
