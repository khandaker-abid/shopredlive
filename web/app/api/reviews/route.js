import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.reviews); }

export async function POST(req) {
  const data = await readJson(req);
  const review = { id: generateId('rev'), reviewerId: data.reviewerId, revieweeId: data.revieweeId, rating: data.rating, comment: data.comment || '', createdAt: Date.now() };
  db.reviews.push(review);
  return NextResponse.json(review, { status: 201 });
}


