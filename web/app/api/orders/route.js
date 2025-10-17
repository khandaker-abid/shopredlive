import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.orders); }

export async function POST(req) {
  const data = await readJson(req);
  const order = { id: generateId('order'), productId: data.productId, buyerId: data.buyerId, sellerId: data.sellerId, price: data.price, status: 'pending_meetup', meetup: data.meetup || {}, createdAt: Date.now() };
  db.orders.push(order);
  return NextResponse.json(order, { status: 201 });
}


