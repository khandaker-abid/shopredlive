import { NextResponse } from 'next/server';
import { db, readJson } from '../../_utils';

export async function GET(_req, { params }) {
  const item = db.products.find(p => p.id === params.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(item);
}

export async function PATCH(req, { params }) {
  const item = db.products.find(p => p.id === params.id);
  if (!item) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = await readJson(req);
  Object.assign(item, data);
  return NextResponse.json(item);
}

export async function DELETE(_req, { params }) {
  const idx = db.products.findIndex(p => p.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [removed] = db.products.splice(idx, 1);
  return NextResponse.json(removed);
}


