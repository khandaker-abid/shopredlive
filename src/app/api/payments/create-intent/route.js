import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import UserModel from '../../../../models/User';
import ProductModel from '../../../../models/Product';
import OrderModel from '../../../../models/Order';
import NotificationModel from '../../../../models/Notification';
import { checkTransactionVelocity, deriveGeoFromIp, detectTriangulationFraud, getRequestIp } from '../../../../lib/security';
import { createManagedPaymentIntent } from '../../../../lib/stripe';

export const runtime = 'nodejs';

export async function POST(req) {
  const body = await req.json();
  const productId = String(body.productId || '').trim();
  const buyerId = String(body.buyerId || '').trim();
  const shippingAddress = body.shippingAddress || {};
  const returnUrl = String(body.returnUrl || '').trim();

  if (!productId || !buyerId) {
    return NextResponse.json({ error: 'Product and buyer are required' }, { status: 400 });
  }

  await connectMongo();

  const [product, buyer] = await Promise.all([
    ProductModel.findById(productId).populate('seller', 'name actualName profilePic email stripe').lean(),
    UserModel.findById(buyerId).lean()
  ]);

  if (!product || !buyer) {
    return NextResponse.json({ error: 'Product or buyer not found' }, { status: 404 });
  }

  const ip = getRequestIp(req);
  const ipGeo = deriveGeoFromIp(ip);
  const velocity = await checkTransactionVelocity({
    OrderModel,
    buyerId,
    amount: product.price,
    currency: product.currency || 'USD',
    windowMinutes: 30,
    highValueThreshold: Number(process.env.HIGH_VALUE_TRANSACTION_THRESHOLD || 75),
    maxHighValueOrders: 2
  });

  if (velocity.flagged) {
    await NotificationModel.create({
      recipient: product.seller._id,
      type: 'system',
      title: 'High velocity purchase blocked',
      body: `A buyer attempted repeated high-value purchases for ${product.name}.`,
      data: { buyerId, productId, velocity }
    });

    return NextResponse.json({ error: 'Purchase blocked for review', velocity }, { status: 429 });
  }

  const triangulation = detectTriangulationFraud({ shippingAddress, ipGeo });
  const riskFlags = [];
  if (triangulation.flagged) {
    riskFlags.push('triangulation_fraud');
  }

  const order = await OrderModel.create({
    product: product._id,
    buyer: buyer._id,
    seller: product.seller._id,
    price: product.price,
    currency: product.currency || 'USD',
    shippingAddress,
    buyerIp: ip,
    buyerGeo: ipGeo,
    fraudFlags: riskFlags,
    riskScore: riskFlags.length ? 80 : 0,
    status: triangulation.flagged ? 'under_review' : 'pending_payment',
    payment: {
      provider: 'stripe'
    }
  });

  if (triangulation.flagged) {
    await NotificationModel.create({
      recipient: product.seller._id,
      type: 'system',
      title: 'Payment flagged for review',
      body: `A checkout for ${product.name} was flagged for triangulation fraud review.`,
      data: { orderId: order._id, productId, riskFlags }
    });
  }

  const paymentIntent = await createManagedPaymentIntent({
    amount: Math.round(Number(product.price) * 100),
    currency: (product.currency || 'USD').toLowerCase(),
    sellerStripeAccountId: product.seller?.stripe?.accountId,
    buyerId,
    sellerId: product.seller._id,
    orderId: order._id,
    metadata: {
      productId,
      returnUrl,
      riskFlags: riskFlags.join(',')
    }
  });

  order.payment.stripePaymentIntentId = paymentIntent.id;
  order.payment.applicationFeeAmount = paymentIntent.application_fee_amount || 0;
  await order.save();

  return NextResponse.json({
    clientSecret: paymentIntent.client_secret,
    paymentIntentId: paymentIntent.id,
    orderId: order._id,
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '',
    riskFlags,
    requiresReview: triangulation.flagged,
    order
  });
}