import { NextResponse } from 'next/server';
import { db, readJson } from '../../_utils';

export async function GET(_req, { params }) {
  const order = db.orders.find(o => o.id === params.id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(order);
}

export async function PATCH(req, { params }) {
  const order = db.orders.find(o => o.id === params.id);
  if (!order) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = await readJson(req);
  Object.assign(order, data);
  return NextResponse.json(order);
}

export async function DELETE(_req, { params }) {
  const idx = db.orders.findIndex(o => o.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [removed] = db.orders.splice(idx, 1);
  return NextResponse.json(removed);
}


