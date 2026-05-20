import { NextResponse } from 'next/server';
import connectMongo from '../../../../lib/mongodb';
import UserModel from '../../../../models/User';
import NotificationModel from '../../../../models/Notification';
import { buildDeviceFingerprint, checkRateLimit, deriveGeoFromIp, getRequestIp, updateKnownDevice, verifyCaptchaChallenge } from '../../../../lib/security';

export const runtime = 'nodejs';

function isSbuEmail(email) {
  return String(email || '').toLowerCase().endsWith('@stonybrook.edu') || String(email || '').toLowerCase().endsWith('.stonybrook.edu');
}

export async function POST(req) {
  const rate = checkRateLimit({ req, name: 'auth-register', windowMs: 60 * 60 * 1000, max: 6 });
  if (!rate.allowed) {
    return NextResponse.json({ error: 'Too many registration attempts. Try again later.' }, { status: 429 });
  }

  const body = await req.json();
  const captcha = body.captcha || {};
  const captchaCheck = verifyCaptchaChallenge({ ...captcha, purpose: 'register' });
  if (!captchaCheck.valid) {
    return NextResponse.json({ error: 'CAPTCHA verification failed', reason: captchaCheck.reason }, { status: 400 });
  }

  const first = String(body.first || '').trim();
  const last = String(body.last || '').trim();
  const username = String(body.username || '').trim();
  const email = String(body.email || '').trim().toLowerCase();
  const password = String(body.password || '');
  const img = body.img || '';

  if (!first || !last || !username || !email || !password) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await connectMongo();

  const existing = await UserModel.findOne({ $or: [{ email }, { name: username }] });
  if (existing) {
    return NextResponse.json({ error: 'Email or username already exists' }, { status: 400 });
  }

  const user = new UserModel({
    name: username,
    actualName: `${first} ${last}`,
    email,
    password,
    university: 'Stony Brook University',
    isAdmin: false,
    karma: 100,
    products: [],
    savedProducts: [],
    profilePic: img,
    isVerifiedStudent: isSbuEmail(email)
  });

  const ip = getRequestIp(req);
  const geo = deriveGeoFromIp(ip);
  updateKnownDevice(user, {
    deviceFingerprint: buildDeviceFingerprint(req),
    ip,
    geo,
    userAgent: req.headers.get('user-agent') || '',
    deviceLabel: req.headers.get('sec-ch-ua-platform') || 'Browser'
  });

  await user.save();

  await NotificationModel.create({
    recipient: user._id,
    type: 'system',
    title: 'Welcome to ShopRedLive',
    body: isSbuEmail(email)
      ? 'Your account was verified as a Stony Brook email.'
      : 'Complete your profile to unlock more seller features.'
  });

  const plain = user.toObject();
  delete plain.password;

  return NextResponse.json({ success: true, isVerifiedStudent: user.isVerifiedStudent, userId: user._id, user: plain }, { status: 201 });
}