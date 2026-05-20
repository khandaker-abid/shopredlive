import crypto from 'crypto';

let stripeClientPromise;

export async function getStripeClient() {
  if (!process.env.STRIPE_SECRET_KEY) {
    return null;
  }

  if (!stripeClientPromise) {
    stripeClientPromise = import('stripe').then((module) => {
      const Stripe = module.default;
      return new Stripe(process.env.STRIPE_SECRET_KEY, {
        apiVersion: '2025-03-31.basil'
      });
    });
  }

  return stripeClientPromise;
}

function generateMockIds(prefix) {
  return `${prefix}_${crypto.randomBytes(12).toString('hex')}`;
}

export async function createManagedPaymentIntent({
  amount,
  currency = 'usd',
  sellerStripeAccountId,
  buyerId,
  sellerId,
  orderId,
  feeAmount,
  metadata = {}
}) {
  const stripe = await getStripeClient();
  const normalizedAmount = Math.max(0, Math.round(Number(amount) || 0));
  const applicationFeeAmount = typeof feeAmount === 'number' ? feeAmount : Math.max(0, Math.round(normalizedAmount * 0.08));

  const payload = {
    amount: normalizedAmount,
    currency: String(currency || 'usd').toLowerCase(),
    automatic_payment_methods: { enabled: true },
    metadata: {
      buyerId: buyerId ? String(buyerId) : '',
      sellerId: sellerId ? String(sellerId) : '',
      orderId: orderId ? String(orderId) : '',
      ...metadata
    }
  };

  if (sellerStripeAccountId) {
    payload.transfer_data = { destination: sellerStripeAccountId };
    payload.application_fee_amount = applicationFeeAmount;
    payload.on_behalf_of = sellerStripeAccountId;
  }

  if (!stripe) {
    const paymentIntentId = generateMockIds('pi');
    return {
      id: paymentIntentId,
      client_secret: `${paymentIntentId}_secret_mock`,
      application_fee_amount: payload.application_fee_amount || applicationFeeAmount,
      transfer_data: payload.transfer_data || null,
      livemode: false,
      status: 'requires_payment_method'
    };
  }

  return stripe.paymentIntents.create(payload);
}

export async function createStripeWebhookEvent(req, secret) {
  const stripe = await getStripeClient();
  if (!stripe) {
    return null;
  }

  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    throw new Error('Missing Stripe signature');
  }

  const rawBody = await req.text();
  return stripe.webhooks.constructEvent(rawBody, signature, secret);
}

export async function pauseSellerPayouts(UserModel, seller, reason, holdDays = 14) {
  const stripe = await getStripeClient();
  const holdUntil = new Date(Date.now() + holdDays * 24 * 60 * 60 * 1000);

  await UserModel.findByIdAndUpdate(seller._id || seller.id, {
    $set: {
      'stripe.payoutsHeldUntil': holdUntil,
      'stripe.payoutsHeldReason': reason
    }
  });

  if (stripe && seller?.stripe?.accountId) {
    try {
      await stripe.accounts.update(seller.stripe.accountId, {
        settings: {
          payouts: {
            schedule: { interval: 'manual' }
          }
        }
      });
    } catch (error) {
      console.warn('Stripe payout hold update failed:', error.message);
    }
  }

  return { holdUntil, reason };
}