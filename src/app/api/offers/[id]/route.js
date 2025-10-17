import { NextResponse } from 'next/server';
import { db, readJson } from '../../_utils';

export async function GET(_req, { params }) {
  const offer = db.offers.find(o => o.id === params.id);
  if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json(offer);
}

export async function PATCH(req, { params }) {
  const offer = db.offers.find(o => o.id === params.id);
  if (!offer) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const data = await readJson(req);
  Object.assign(offer, data);
  return NextResponse.json(offer);
}

export async function DELETE(_req, { params }) {
  const idx = db.offers.findIndex(o => o.id === params.id);
  if (idx === -1) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const [removed] = db.offers.splice(idx, 1);
  return NextResponse.json(removed);
}


