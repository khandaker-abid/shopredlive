import { NextResponse } from 'next/server';
import { issueCaptchaChallenge } from '../../../../lib/security';

export const runtime = 'nodejs';

export async function GET(req) {
  const purpose = new URL(req.url).searchParams.get('purpose') || 'auth';
  const challenge = issueCaptchaChallenge(purpose);
  return NextResponse.json({
    challengeId: challenge.challengeId,
    challenge: challenge.challenge,
    difficulty: challenge.difficulty,
    expiresAt: challenge.expiresAt,
    purpose
  });
}