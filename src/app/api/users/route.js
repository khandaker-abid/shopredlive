import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.users); }

export async function POST(req) {
  const data = await readJson(req);
  const user = { id: generateId('user'), name: data.name || 'User', email: data.email || '', university: data.university || '', createdAt: Date.now() };
  db.users.push(user);
  return NextResponse.json(user, { status: 201 });
}


