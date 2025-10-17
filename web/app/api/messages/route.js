import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.messages); }

export async function POST(req) {
  const data = await readJson(req);
  const msg = { id: generateId('msg'), conversationId: data.conversationId, senderId: data.senderId, body: data.body, createdAt: Date.now() };
  db.messages.push(msg);
  return NextResponse.json(msg, { status: 201 });
}


