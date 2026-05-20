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