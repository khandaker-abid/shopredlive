import { NextResponse } from 'next/server';
import { db, generateId, readJson } from '../_utils';

export async function GET() { return NextResponse.json(db.reports); }

export async function POST(req) {
  const data = await readJson(req);
  const report = { id: generateId('report'), reporterId: data.reporterId, targetUserId: data.targetUserId, targetProductId: data.targetProductId, reason: data.reason, details: data.details || '', status: 'open', createdAt: Date.now() };
  db.reports.push(report);
  return NextResponse.json(report, { status: 201 });
}


