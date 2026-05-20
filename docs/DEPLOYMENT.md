# Deployment Guide

## Environment Variables Checklist

Before deploying, ensure all of these are set in your hosting platform:

- [ ] `NEXT_PUBLIC_BACKEND_URL` — public URL of the Express server (e.g. `https://api.shopredlive.com`)
- [ ] `SIGNALHOUSE_API_KEY`
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] `STRIPE_SECRET_KEY`
- [ ] `STRIPE_WEBHOOK_SECRET`
- [ ] `POW_CAPTCHA_DIFFICULTY` (recommended: `4` for production)
- [ ] `HIGH_VALUE_TRANSACTION_THRESHOLD` (e.g. `200`)
- [ ] `MONGODB_URI` — Atlas connection string (see below)

## MongoDB Atlas

1. Create a free M0 cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Add a database user with read/write access
3. Whitelist `0.0.0.0/0` (or your server's IP) under Network Access
4. Copy the connection string:
   ```
   mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/shopredlive?retryWrites=true&w=majority
   ```
5. Set as `MONGODB_URI` in your backend environment

The Express server reads `MONGODB_URI` first, falling back to `mongodb://127.0.0.1:27017/shopredlive`.

## Frontend — Vercel

1. Push the repo to GitHub
2. Import the project at [vercel.com/new](https://vercel.com/new)
3. Set all `NEXT_PUBLIC_*` variables under Project → Settings → Environment Variables
4. Build command: `npm run build` | Output dir: `.next`
5. The Next.js API routes deploy as serverless functions automatically

## Backend — Railway

1. Create a new project at [railway.app](https://railway.app)
2. Connect the GitHub repo and set the **root directory** to `/server`
3. Start command: `node server.js`
4. Set all backend env vars in Railway's Variables tab
5. Add a Railway Volume mounted at `/app/uploads` to persist uploaded images between deploys
6. Note the Railway-provided public URL — use it as `NEXT_PUBLIC_BACKEND_URL`

## Stripe Webhook

After deploying the frontend to Vercel:

1. Go to [dashboard.stripe.com/webhooks](https://dashboard.stripe.com/webhooks) → Add endpoint
2. URL: `https://<your-vercel-domain>/api/stripe/webhook`
3. Events to listen for: `charge.dispute.created`, `payment_intent.succeeded`, `payment_intent.payment_failed`
4. Copy the webhook signing secret → set as `STRIPE_WEBHOOK_SECRET`

## Health Check

The Express server exposes `GET /` which returns `{ status: 'ok' }`. Use this for Railway's health check path.

## File Uploads

Uploaded product images are stored at `/uploads` on the Express host. On Railway, mount a persistent volume at that path. For production scale, consider migrating to S3/Cloudinary and updating the multer storage config in `server/server.js`.
