import { NextResponse } from 'next/server';
import crypto from 'crypto';
import connectMongo from '../../../../lib/mongodb';
import UserModel from '../../../../models/User';
import NotificationModel from '../../../../models/Notification';
import { checkRateLimit, verifyCaptchaChallenge, safeHash } from '../../../../lib/security';

export const runtime = 'nodejs';

function hashResetToken(token) {
  return safeHash(`password-reset:${token}`);
}

export async function POST(req) {
  const rate = checkRateLimit({ req, name: 'password-reset-request', windowMs: 60 * 60 * 1000, max: 6 });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many password reset attempts. Try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const captchaCheck = verifyCaptchaChallenge({ ...(body.captcha || {}), purpose: 'password-reset' });
  if (!captchaCheck.valid) {
    return NextResponse.json({ error: 'CAPTCHA verification failed', reason: captchaCheck.reason }, { status: 400 });
  }

  const email = String(body.email || '').trim().toLowerCase();
  await connectMongo();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ success: true, message: 'If the email exists, a reset link was sent.' });
  }

  const token = crypto.randomBytes(24).toString('hex');
  user.passwordResetTokenHash = hashResetToken(token);
  user.passwordResetExpiresAt = new Date(Date.now() + 30 * 60 * 1000);
  await user.save();

  await NotificationModel.create({
    recipient: user._id,
    type: 'system',
    title: 'Password reset requested',
    body: `Use this token to reset your password: ${token}`,
    data: { tokenExpiresAt: user.passwordResetExpiresAt }
  });

  return NextResponse.json({
    success: true,
    message: 'If the email exists, a reset link was sent.',
    resetToken: process.env.NODE_ENV === 'production' ? undefined : token
  });
}

export async function PATCH(req) {
  const rate = checkRateLimit({ req, name: 'password-reset-confirm', windowMs: 60 * 60 * 1000, max: 8 });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many password reset attempts. Try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const token = String(body.token || '').trim();
  const newPassword = String(body.newPassword || '');

  if (!email || !token || !newPassword) {
    return NextResponse.json({ error: 'Email, token, and new password are required' }, { status: 400 });
  }

  await connectMongo();
  const user = await UserModel.findOne({ email });
  if (!user || !user.passwordResetTokenHash || !user.passwordResetExpiresAt) {
    return NextResponse.json({ error: 'Reset token is invalid or expired' }, { status: 400 });
  }

  if (user.passwordResetExpiresAt.getTime() <= Date.now()) {
    return NextResponse.json({ error: 'Reset token is invalid or expired' }, { status: 400 });
  }

  if (hashResetToken(token) !== user.passwordResetTokenHash) {
    return NextResponse.json({ error: 'Reset token is invalid or expired' }, { status: 400 });
  }

  user.password = newPassword;
  user.passwordResetTokenHash = null;
  user.passwordResetExpiresAt = null;
  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  await user.save();

  return NextResponse.json({ success: true });
}