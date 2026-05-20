import { NextResponse } from 'next/server';
import connectMongo from '../../../../../lib/mongodb';
import OrderModel from '../../../../../models/Order';
import UserModel from '../../../../../models/User';
import NotificationModel from '../../../../../models/Notification';
import { pauseSellerPayouts } from '../../../../../lib/stripe';

export const runtime = 'nodejs';

export async function POST(_req, { params }) {
  await connectMongo();

  const order = await OrderModel.findById(params.id).populate('seller product');
  if (!order) {
    return NextResponse.json({ error: 'Order not found' }, { status: 404 });
  }

  order.status = 'disputed';
  order.dispute = {
    active: true,
    reason: 'return_request',
    openedAt: new Date()
  };
  order.payoutHold = {
    active: true,
    reason: 'return_requested',
    until: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
  };
  await order.save();

  await pauseSellerPayouts(UserModel, order.seller, 'return_requested', 14);

  await NotificationModel.create({
    recipient: order.seller._id,
    type: 'system',
    title: 'Return requested',
    body: `A return was requested for ${order.product?.name || 'your order'}. Payouts are on hold.`,
    data: { orderId: order._id }
  });

  return NextResponse.json({ success: true, order });
}