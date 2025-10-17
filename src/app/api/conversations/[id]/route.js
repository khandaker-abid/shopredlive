import { NextResponse } from 'next/server';
import { db, readJson } from '../../_utils';

export async function GET(_req, { params }) {
  const convo = db.conversations.find(c => c.id === params.id);
  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(convo);
}

export async function PATCH(req, { params }) {
  const convo = db.conversations.find(c => c.id === params.id);
  if (!convo) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = await readJson(req);
  Object.assign(convo, data);
  return NextResponse.json(convo);
}

export async function DELETE(_req, { params }) {
  const idx = db.conversations.findIndex(c => c.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [removed] = db.conversations.splice(idx, 1);
  return NextResponse.json(removed);
}


