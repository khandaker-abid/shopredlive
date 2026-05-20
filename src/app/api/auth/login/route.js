import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import UserModel from '../../../../models/User';
import NotificationModel from '../../../../models/Notification';
import {
  buildDeviceFingerprint,
  checkRateLimit,
  deriveGeoFromIp,
  getRequestIp,
  loginRiskSummary,
  updateKnownDevice,
  createMfaChallenge,
  verifyMfaChallenge,
  verifyCaptchaChallenge
} from '../../../../lib/security';

export const runtime = 'nodejs';

function sanitizeUser(user) {
  const plain = user.toObject ? user.toObject() : user;
  delete plain.password;
  delete plain.passwordResetTokenHash;
  delete plain.passwordResetExpiresAt;
  if (plain.mfa) {
    delete plain.mfa.codeHash;
  }
  return plain;
}

async function recordLoginFailure(user) {
  user.failedLoginAttempts = (user.failedLoginAttempts || 0) + 1;
  if (user.failedLoginAttempts >= 5) {
    user.lockUntil = new Date(Date.now() + 30 * 60 * 1000);
  }
  await user.save();
}

export async function POST(req) {
  const rate = checkRateLimit({ req, name: 'auth-login', windowMs: 15 * 60 * 1000, max: 8 });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many login attempts. Try again later.' }, { status: 429, headers: { 'Retry-After': String(Math.ceil((rate.resetAt - Date.now()) / 1000)) } });
  }

  const body = await req.json();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const captcha = body.captcha || {};
  const mfaCode = String(body.mfaCode || '').trim();
  const mfaChallengeId = body.mfaChallengeId || '';

  if (!mfaChallengeId) {
    const captchaCheck = verifyCaptchaChallenge({ ...captcha, purpose: 'login' });
    if (!captchaCheck.valid) {
      return NextResponse.json({ error: 'CAPTCHA verification failed', reason: captchaCheck.reason }, { status: 400 });
    }
  }

  await connectMongo();

  const user = await UserModel.findOne({ email });
  if (!user) {
    return NextResponse.json({ validEmail: false, validPassword: false, error: 'Invalid credentials' }, { status: 401 });
  }

  if (user.isLocked()) {
    return NextResponse.json({ error: 'Account locked. Please reset your password or try later.', lockedUntil: user.lockUntil }, { status: 423 });
  }

  const passwordValid = await user.validatePassword(password);
  if (!passwordValid) {
    await recordLoginFailure(user);
    return NextResponse.json({ validEmail: true, validPassword: false, error: 'Invalid credentials' }, { status: 401 });
  }

  const moderation = user.moderation || {};
  if (moderation.status === 'banned') {
    return NextResponse.json({ error: 'Account banned' }, { status: 403 });
  }
  if (moderation.status === 'suspended') {
    if (!moderation.suspendedUntil || moderation.suspendedUntil.getTime() > Date.now()) {
      return NextResponse.json({ error: 'Account suspended', suspendedUntil: moderation.suspendedUntil }, { status: 403 });
    }
  }

  const ip = getRequestIp(req);
  const deviceFingerprint = buildDeviceFingerprint(req);
  const geo = deriveGeoFromIp(ip);
  const risk = loginRiskSummary(user, {
    ip,
    geo,
    deviceFingerprint,
    userAgent: req.headers.get('user-agent') || ''
  });
  const deviceIsKnown = Array.isArray(user.knownDevices)
    && user.knownDevices.some((device) => device.fingerprint === deviceFingerprint && device.trusted !== false);

  if (risk.requireMfa) {
    if (!mfaChallengeId || !mfaCode) {
      const challenge = createMfaChallenge(user, { reason: risk.geoShift ? 'geo_anomaly' : 'unrecognized_device' });
      await user.save();

      await NotificationModel.create({
        recipient: user._id,
        type: 'system',
        title: 'Login verification code',
        body: `Your sign-in verification code is ${challenge.code}. It expires in 10 minutes.`,
        data: { challengeId: challenge.challengeId, delivery: 'email' }
      });

      return NextResponse.json({
        mfaRequired: true,
        mfaChallengeId: challenge.challengeId,
        delivery: 'email',
        message: 'We sent a verification code to your email because this sign-in looks unusual.'
      });
    }

    const mfaCheck = verifyMfaChallenge(user, mfaChallengeId, mfaCode);
    if (!mfaCheck.valid) {
      return NextResponse.json({ mfaRequired: true, error: 'Invalid MFA code', reason: mfaCheck.reason }, { status: 401 });
    }
  }

  user.failedLoginAttempts = 0;
  user.lockUntil = null;
  updateKnownDevice(user, {
    deviceFingerprint,
    ip,
    geo,
    userAgent: req.headers.get('user-agent') || '',
    deviceLabel: req.headers.get('sec-ch-ua-platform') || 'Browser'
  });
  await user.save();

  if (!deviceIsKnown) {
    await NotificationModel.create({
      recipient: user._id,
      type: 'system',
      title: 'New device sign-in detected',
      body: `We noticed a sign-in from a new device (${req.headers.get('sec-ch-ua-platform') || 'Browser'}).`,
      data: { ip, geo }
    });
  }

  return NextResponse.json({
    validEmail: true,
    validPassword: true,
    userId: user._id,
    user: sanitizeUser(user),
    risk
  });
}