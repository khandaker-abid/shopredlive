import { NextResponse } from 'next/server';
import { db } from '../_utils';

export async function GET() { return NextResponse.json(db.categories); }


