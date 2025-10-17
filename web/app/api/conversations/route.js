import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.conversations); }

export async function POST(req) {
  const data = await readJson(req);
  const convo = { id: generateId('convo'), participants: data.participants || [], productId: data.productId || null, lastMessageAt: Date.now() };
  db.conversations.push(convo);
  return NextResponse.json(convo, { status: 201 });
}


