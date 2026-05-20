# ShopRedLive - Secondhand Retail Platform for SBU

A full-featured secondhand marketplace for Stony Brook University students to buy and sell items on campus.

## Features

- **User Authentication** - Register/login with SBU email verification
- **Product Listings** - Create, edit, delete listings with image uploads
- **Messaging System** - Real-time messaging between buyers and sellers (SignalHouse integration ready)
- **Offer System** - Make, accept, or decline offers on products
- **Order Management** - Track transactions and order status
- **Notifications** - Get notified about new messages, offers, and order updates
- **Reviews & Ratings** - Rate and review sellers after transactions
- **Advanced Search** - Filter by category, condition, price range, and sort options
- **Save Items** - Save products to watch list
- **Report System** - Report suspicious listings or users

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start MongoDB:**
   Make sure MongoDB is running on your system (default: mongodb://127.0.0.1:27017)

3. **Seed categories:**
   ```bash
   node server/seed_categories.js
   ```

4. **Import test data (optional):**
   ```bash
   node import_test_data.js
   ```

5. **Start the development servers:**
   - Option 1 - Separately:
     - Terminal 1 (Frontend): `npm run dev`
     - Terminal 2 (Backend): `npm run server`
   - Option 2 - Simultaneously: `npm run dev:all` (requires concurrently)

## SignalHouse Messaging Integration

The messaging system is prepared for SignalHouse integration. To enable:

1. Get your API key from [SignalHouse](https://signalhouse.io)
2. Add to `.env.local`:
   ```
   SIGNALHOUSE_API_KEY=your_api_key_here
   SIGNALHOUSE_API_URL=https://devapi.signalhouse.io
   ```
3. The service in `/server/services/signalhouse.js` handles all messaging API calls

## Environment Variables

Create a `.env.local` file:
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:8000
SIGNALHOUSE_API_KEY=your_key_here
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
STRIPE_SECRET_KEY=sk_test_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx
POW_CAPTCHA_DIFFICULTY=4
HIGH_VALUE_TRANSACTION_THRESHOLD=75
```

## Project Structure

- `/src` - Next.js frontend application
  - `/app` - App router pages
  - `/components` - React components
  - `/context` - Auth context
- `/server` - Express.js backend
  - `/models` - MongoDB schemas
  - `/services` - External service integrations
- `/uploads` - Uploaded product images

## API Endpoints

### Products
- `GET /products` - List all products
- `GET /products/search` - Search with filters (q, category, condition, minPrice, maxPrice, sort)
- `GET /product/:id` - Get single product
- `POST /newProduct` - Create product
- `PATCH /product/:id` - Update product
- `DELETE /product/:id` - Delete product
- `POST /product/:id/view` - Increment view count

### Users
- `GET /user/:id` - Get user profile
- `PATCH /user/:id` - Update profile
- `POST /user/:id/save-product` - Save a product
- `POST /user/:id/unsave-product` - Unsave a product
- `POST /register` - Register new user
- `POST /users/verify-login` - Verify login credentials

### Messaging
- `GET /conversations/:userId` - Get user's conversations
- `POST /conversations` - Create conversation
- `GET /conversation/:id/messages` - Get messages
- `POST /conversation/:id/messages` - Send message
- `POST /conversation/:id/read` - Mark messages as read

### Offers
- `GET /offers/user/:userId` - Get user's offers
- `POST /offers` - Create offer
- `PATCH /offers/:id` - Update offer status (accept/decline)

### Orders
- `GET /orders/user/:userId` - Get user's orders
- `PATCH /orders/:id` - Update order status

### Notifications
- `GET /notifications/:userId` - Get notifications
- `PATCH /notifications/:id/read` - Mark as read
- `POST /notifications/read-all` - Mark all as read

### Reviews
- `GET /reviews/user/:userId` - Get user's reviews
- `POST /reviews` - Create review

### Reports
- `POST /reports` - Create report

### Categories
- `GET /categories` - List all categories
- `POST /categories` - Create category

### File Upload
- `POST /upload` - Upload images (multipart/form-data)



## Security, Fraud, and Payments Implementation (Presentation Notes)

This project now includes a full end-to-end security and payments hardening pass across the Next.js app router APIs, frontend flows, and backend data models.

### 1) Account Takeover (ATO) and Bot Prevention

- **Rate limiting for auth-critical routes**
   - Implemented on Next.js auth routes for login and password reset.
   - Implemented on backend login verification as a second enforcement layer.

- **Proof-of-work CAPTCHA (privacy-focused)**
   - Added a challenge endpoint and client-side solver component.
   - Integrated into login, signup, and forgot-password flows.
   - No third-party behavioral tracking dependency required.

- **User account security model upgrades**
   - User schema now tracks:
      - `failedLoginAttempts`
      - `lockUntil`
      - `lastLoginIp`
      - `lastLoginGeo`
      - `knownDevices[]`
      - password reset token hash and expiry fields
      - MFA challenge state

- **Automatic lockout and recovery**
   - Account lockout is triggered after repeated failed logins.
   - Password reset flow clears lockout and failed attempt counters after successful reset.

- **Risk-Based Authentication (RBA) + MFA challenge**
   - Login risk checks evaluate unrecognized device, IP shift, and geo shift.
   - If suspicious, login requires a secondary verification code (email-style challenge path).
   - Challenge metadata is persisted and validated with expiry checks.

### 2) Fraud Detection and Triangulation Fraud Controls

- **Transaction velocity checks**
   - During checkout intent creation, recent purchase behavior is analyzed.
   - Repeated high-value purchases in a short window are flagged/blocked for review.

- **Triangulation mismatch detection**
   - Buyer IP-derived geography is compared with submitted shipping address geography.
   - Significant mismatch adds fraud flags and elevates risk score.
   - Flagged transactions are moved into review-oriented order state.

- **Risk-aware order metadata**
   - Orders now store:
      - `buyerIp`, `buyerGeo`
      - `shippingAddress`
      - `fraudFlags[]`
      - `riskScore`

### 3) Stripe Managed Payments (Connect) and Dispute Handling

- **Integrated managed payments flow**
   - Added checkout page and Stripe Payment Element integration.
   - Buyers stay on platform during payment confirmation.
   - Payment intent supports automatic payment methods (including Apple Pay/Google Pay where available).

- **Connect-style fund routing support**
   - Payment intent creation supports destination transfer fields when seller Stripe account ID exists.
   - Application fee support is included in payment metadata.

- **Dispute webhook automation**
   - Added Stripe webhook route for `charge.dispute.created`.
   - On dispute:
      - order status is updated to disputed
      - dispute metadata is stored
      - seller notifications are generated
      - payout hold logic is applied

- **Return request payout hold flow**
   - Added a return-request API endpoint that also places temporary payout holds and notifies sellers.

### 4) New Next.js Routes and Pages Added

- **Auth & security APIs**
   - `/api/security/captcha`
   - `/api/auth/login`
   - `/api/auth/register`
   - `/api/auth/password-reset`

- **Payments APIs**
   - `/api/payments/create-intent`
   - `/api/stripe/webhook`
   - `/api/orders/[id]/return-request`

- **Frontend pages/components**
   - `/checkout`
   - `/forgot-password`
   - `/reset-password`
   - Proof-of-work CAPTCHA component
   - Stripe checkout form component

### 5) Model and State Upgrades

- **Order model upgraded** with:
   - payment metadata (`stripePaymentIntentId`, charge/transfer placeholders, fee)
   - dispute and payout-hold state
   - extended statuses (`pending_payment`, `under_review`, `disputed`, `refunded`, etc.)

- **User model upgraded** with:
   - device trust and login telemetry
   - lockout and failed login controls
   - MFA and reset token management
   - Stripe payout hold metadata

### 6) Operational Notes for Demo

- If Stripe secrets are missing, the code can still run in a safe mock-style path for local development.
- For full live Stripe behavior, configure publishable key, secret key, and webhook secret.
- Recommended demo path:
   1. Sign up with CAPTCHA challenge.
   2. Login from an unrecognized session to show MFA challenge.
   3. Start checkout to show managed payment creation.
   4. Trigger a return request to show payout hold + seller notification behavior.

---

## Admin Moderation, Reputation, and Search Features (Presentation Notes)

This project now includes a full admin moderation system, structured seller reputation badges, and end-to-end negotiable listing filtering. These features span new frontend pages, new backend endpoints, and schema upgrades on both the user and product models.

### 1) Admin Moderation Dashboard

- **Moderation queue UI (`AdminModeration.js`)**
   - Displays all reports in a card-per-report layout, ordered newest first.
   - Each card shows the report reason, current status chip, reporter name, target user and/or target listing, the report details text, and a timestamp of the last action taken.
   - A status filter dropdown lets admins narrow the queue to `open`, `reviewing`, `resolved`, or `dismissed` — or view all at once.
   - A live summary line above the list shows the total count of open and in-review reports so the size of the queue is always visible at a glance.

- **Per-report action dialog**
   - Clicking any action button on a report card opens a confirmation dialog with an optional moderator note field.
   - For user-targeted reports, the available actions are: Mark Reviewing, Warn User, Suspend User, Resolve, and Dismiss.
   - For listing-targeted reports, the available actions are: Remove Listing and Restore Listing, in addition to the standard status transitions.
   - Suspend User exposes a configurable suspension length field (in days, defaulting to 7) directly in the dialog before the action is submitted.
   - After any action is submitted, the queue automatically reloads so the updated state is immediately reflected.

- **Admin navigation entry point (`Header.js`)**
   - An "Admin" link appears in the site header exclusively for users whose account has `isAdmin: true`.
   - Non-admin users never see the link, and the page itself enforces the same check before rendering the moderation UI.

### 2) Moderation Backend and Report Action Endpoints

- **Report listing endpoint (`GET /reports`)**
   - Accepts an optional `status` query parameter to filter by report status.
   - Results are paginated and sorted by newest first.
   - Response populates `reporter`, `targetUser` (including their current `moderation` state), and `targetProduct` so the frontend can render all relevant context without additional requests.

- **Report action dispatch endpoint (`POST /reports/:id/action`)**
   - Single endpoint that handles the full range of moderation actions: `reviewing`, `dismiss`, `resolve`, `warn_user`, `suspend_user`, `remove_listing`, and `restore_listing`.
   - Every action appends a structured entry to `report.actions[]` containing the action name, moderator note, timestamp, and actor ID — creating a complete audit trail on the report document.
   - `warn_user` increments `moderation.warnings` on the target user and sets `moderation.status` to `warned`, then sends an in-app notification to the affected account.
   - `suspend_user` sets `moderation.status` to `suspended`, writes `moderation.suspendedUntil` to the calculated expiry date, and notifies the user with the suspension end date included in the message body.
   - `remove_listing` sets both the product's top-level `status` and `moderation.status` to `removed`, records `removedAt` and `removedBy`, and notifies the seller.
   - `restore_listing` reverses a removal, sets `moderation.status` back to `clean` and `status` back to `active`, and notifies the seller.

- **Report schema upgraded** with:
   - `status` enum: `open`, `reviewing`, `resolved`, `dismissed` (default `open`)
   - `moderatorNotes[]` subdocument for freeform notes attached to a report over time
   - `actions[]` subdocument for structured action history — each entry carries `action`, `note`, `createdAt`, `createdBy`, and an open `metadata` object for action-specific context

### 3) User and Product Moderation Metadata

- **User moderation subdocument added (`server/models/users.js`)**
   - `moderation.status` — lifecycle state of the account: `active`, `warned`, `suspended`, `banned`
   - `moderation.warnings` — cumulative warning count, incremented by the `warn_user` action
   - `moderation.suspendedUntil` — date field written when an account is suspended; the backend compares against this on every login attempt
   - `moderation.reason` and `moderation.lastActionAt` — the human-readable reason and timestamp of the most recent moderator action

- **Login suspension enforcement**
   - The Express login verification route (`server/server.js`) checks `moderation.status` on every successful password match before issuing a session.
   - `banned` accounts are rejected immediately with a 403 and a `"Account banned"` error.
   - `suspended` accounts are rejected with a 403 and the `suspendedUntil` timestamp returned to the client so the frontend can display a meaningful message.
   - The Next.js login API route (`src/app/api/auth/login/route.js`) mirrors the same check on the frontend API layer as a second enforcement point.
   - The PATCH user endpoint strips `moderation` from the allowed update fields so users cannot self-modify their suspension state.

- **Product moderation subdocument added (`server/models/products.js`)**
   - `moderation.status` — content state of the listing: `clean`, `flagged`, `removed` (default `clean`)
   - `moderation.reason` and `moderation.note` — reason for removal and any additional moderator context
   - `moderation.removedAt` and `moderation.removedBy` — timestamp and admin user reference populated when a listing is removed

### 4) Negotiable Listing Filter

- **End-to-end negotiable toggle**
   - The Sidebar adds a "Negotiable only" switch that appends `negotiable=true` to the URL query string when enabled.
   - The filter state syncs back from the URL on mount, so refreshing the page or navigating via a shared link preserves the setting.
   - ProductGrid reads `negotiable` from the URL params alongside every other active filter and includes it in the request to the backend search endpoint.
   - The backend `/products/search` handler parses the param through its existing `parseBoolean` utility and adds `query.negotiable = true` to the Mongoose query when present.
   - The `negotiable` flag participates in the `hasActiveFilters` check, meaning it correctly triggers the "clear filters" option when set.

- **Negotiable flag in saved searches**
   - When a user saves the current search from the Product Grid, `negotiable` is included in the saved filter state alongside the existing `allowsMeetup`, `allowsShipping`, campus, condition, and price range fields.
   - Re-running a saved search from the Profile page restores `negotiable` to the URL params so the search executes with the same intent it was saved with.
   - The User schema `savedSearches[].filters` subdocument (`server/models/users.js`) stores this as a `negotiable: Boolean` field.

### 5) Seller Reputation Badges

- **Badge computation layer (`src/lib/reputation.js`)**
   - Pure helper function `buildReputationBadges({ user, avgRating, reviewCount })` takes user data and review stats and returns a list of badge descriptor objects — no React dependency, no side effects.
   - Four badges are currently defined, each with an `id`, display `label`, MUI color `tone`, and a tooltip `description`:
      - **SBU Verified** — awarded when `user.isVerifiedStudent` is `true`; signals to buyers that the seller is a confirmed Stony Brook student
      - **Top Rated** — awarded when `avgRating >= 4.6` with at least 3 qualifying reviews; requires a minimum review count to prevent gaming with a single five-star
      - **Fast Responder** — awarded when `user.responseTimeAvgMinutes <= 60`; tells buyers they can expect a reply within the hour
      - **Trusted** — awarded when `user.karma >= 150`; reflects long-term positive standing in the community
   - Keeping the logic in a standalone module means it can be unit tested independently and could be run server-side (e.g., for badge-aware search ranking) without pulling in UI code.

- **Badge UI component (`ReputationBadges.js`)**
   - Renders earned badges as a row of MUI `Chip` components, each with a matching icon: Verified checkmark, Star, Bolt, and Shield respectively.
   - Every chip is wrapped in a `Tooltip` that surfaces the badge's description on hover, giving buyers the context to understand what each badge means.
   - Accepts `size` and `includeVerified` props — `includeVerified` can be set to `false` to suppress the verified badge in space-constrained layouts without forking logic.
   - Returns `null` when the user has no earned badges, so it never introduces whitespace or empty placeholder area in the UI.

- **Badge surfaces**
   - Displayed below the seller's name on the Product Detail page, giving buyers immediate signal about the seller before they engage.
   - Displayed below the user's own name on the Profile page, so sellers can see how their account presents to buyers.

- **User schema additions for reputation inputs (`server/models/users.js`)**
   - `responseTimeAvgMinutes` — rolling average message response time in minutes; used as the input for the Fast Responder badge threshold
   - `responseTimeCount` — denominator for the rolling average, allowing it to be updated incrementally without storing every individual message timestamp
   - `karma` — numeric community trust score (pre-existing field, now actively consumed by the Trusted badge threshold)
   - `isVerifiedStudent` — boolean flag (pre-existing field) driving the SBU Verified badge

### 6) New Routes, Pages, and Components Added

- **Admin page**
   - `/admin/moderation` — protected Next.js route wrapping `AdminModeration`; enforces authentication via `ProtectedRoute` and renders an access-denied message for non-admin users at the component level as a second check

- **Backend report endpoints**
   - `GET /reports` — filterable, paginated report listing with populated relational data
   - `PATCH /reports/:id` — update report status and append moderator notes
   - `POST /reports/:id/action` — dispatch a structured moderation action with side effects (user sanctions, listing mutations, notifications)

- **Frontend components**
   - `AdminModeration.js` — full moderation queue UI with filtering, action dialogs, and inline feedback
   - `ReputationBadges.js` — badge chip row component consumed by both Profile and ProductDetail
   - `src/lib/reputation.js` — pure badge computation utility, no framework dependency

### 7) Operational Notes for Demo

- Reputation badges will only display for users who meet the criteria. To see all four in action, use a test user with `isVerifiedStudent: true`, `karma >= 150`, `responseTimeAvgMinutes <= 60`, and enough five-star reviews to cross the Top Rated threshold.
- To demonstrate the full moderation flow:
   1. Log in as an admin user (set `isAdmin: true` on a seed user via the database or import script).
   2. Navigate to `/admin/moderation` using the "Admin" link in the header.
   3. Submit a report against a test listing or user from a separate non-admin account.
   4. Open the report in the moderation queue and apply a `suspend_user` or `remove_listing` action with a moderator note.
   5. Attempt to log in as the suspended user to confirm the 403 rejection and expiry date are returned correctly.
   6. Use the negotiable filter toggle on the home page alongside a saved search to verify end-to-end persistence of that filter state.