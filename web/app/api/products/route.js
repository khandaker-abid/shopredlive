import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() {
  return NextResponse.json(db.products);
}

export async function POST(req) {
  const data = await readJson(req);
  const product = { id: generateId('prod'), name: data.name || 'Untitled', price: data.price || '0', description: data.description || '', status: 'active', createdAt: Date.now() };
  db.products.push(product);
  return NextResponse.json(product, { status: 201 });
}


