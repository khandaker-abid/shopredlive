import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.notifications); }

export async function POST(req) {
  const data = await readJson(req);
  const n = { id: generateId('notif'), recipientId: data.recipientId, type: data.type || 'system', title: data.title || '', body: data.body || '', createdAt: Date.now() };
  db.notifications.push(n);
  return NextResponse.json(n, { status: 201 });
}


