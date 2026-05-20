import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import UserModel from '../../../../models/User';
import OrderModel from '../../../../models/Order';
import NotificationModel from '../../../../models/Notification';
import { createStripeWebhookEvent, pauseSellerPayouts } from '../../../../lib/stripe';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req) {
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json({ error: 'Stripe webhook secret is not configured' }, { status: 500 });
  }

  let event;
  try {
    event = await createStripeWebhookEvent(req, secret);
  } catch (error) {
    return NextResponse.json({ error: `Webhook signature verification failed: ${error.message}` }, { status: 400 });
  }

  if (!event) {
    return NextResponse.json({ received: true, mocked: true });
  }

  await connectMongo();

  if (event.type === 'charge.dispute.created') {
    const dispute = event.data.object;
    const order = await OrderModel.findOne({
      $or: [
        { 'payment.stripePaymentIntentId': dispute.payment_intent },
        { 'payment.stripeChargeId': dispute.charge },
        { _id: dispute.metadata?.orderId }
      ]
    }).populate('seller buyer product');

    if (order) {
      order.status = 'disputed';
      order.dispute = {
        active: true,
        reason: dispute.reason || 'chargeback',
        openedAt: new Date(),
        stripeDisputeId: dispute.id
      };
      order.payoutHold = {
        active: true,
        reason: 'buyer_dispute_opened',
        until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
      };
      await order.save();

      await pauseSellerPayouts(UserModel, order.seller, 'buyer_dispute_opened', 14);

      await NotificationModel.create({
        recipient: order.seller._id,
        type: 'system',
        title: 'Chargeback opened',
        body: `A dispute was opened for ${order.product?.name || 'an order'}. Pending payouts are on hold.`,
        data: { orderId: order._id, disputeId: dispute.id }
      });
    }
  }

  return NextResponse.json({ received: true });
}