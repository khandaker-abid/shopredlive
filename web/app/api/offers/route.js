import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.offers); }

export async function POST(req) {
  const data = await readJson(req);
  const offer = { id: generateId('offer'), productId: data.productId, buyerId: data.buyerId, amount: data.amount, status: 'pending', createdAt: Date.now() };
  db.offers.push(offer);
  return NextResponse.json(offer, { status: 201 });
}


