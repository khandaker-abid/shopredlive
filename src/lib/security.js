import crypto from 'crypto';

const loginRateBuckets = new Map();
const captchaChallenges = new Map();
const mfaChallenges = new Map();

export function safeHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex');
}

export function getRequestIp(req) {
  const forwarded = req?.headers?.get?.('x-forwarded-for');
  if (forwarded) {
    const candidate = String(forwarded).split(',')[0];
    if (candidate) return candidate.trim();
  }

  return req?.ip || req?.socket?.remoteAddress || '0.0.0.0';
}

function getHeader(req, name) {
  return req?.headers?.get?.(name) || '';
}

export function buildDeviceFingerprint(req) {
  const fingerprintSource = [
    getHeader(req, 'user-agent'),
    getHeader(req, 'accept-language'),
    getHeader(req, 'sec-ch-ua'),
    getHeader(req, 'sec-ch-ua-platform'),
    getRequestIp(req)
  ].join('|');

  return safeHash(fingerprintSource).slice(0, 32);
}

export function deriveGeoFromIp(ip) {
  if (!ip) {
    return { country: 'unknown', region: 'unknown', city: 'unknown', source: 'derived' };
  }

  const normalized = String(ip).toLowerCase();
  if (normalized.includes('127.0.0.1') || normalized.includes('::1') || normalized.includes('local')) {
    return { country: 'US', region: 'NY', city: 'Stony Brook', source: 'local-network' };
  }

  const octets = normalized.replace(/[^0-9.]/g, '').split('.').filter(Boolean).map((part) => Number(part));
  if (octets.length < 2 || octets.some((part) => Number.isNaN(part))) {
    return { country: 'unknown', region: 'unknown', city: 'unknown', source: 'derived' };
  }

  const regionSeed = octets[0] % 4;
  const citySeed = octets[1] % 5;
  const regions = ['NY', 'CA', 'TX', 'FL'];
  const cities = ['New York', 'Albany', 'Ithaca', 'Buffalo', 'Syracuse'];

  return {
    country: 'US',
    region: regions[regionSeed],
    city: cities[citySeed],
    source: 'derived'
  };
}

function compareGeos(previousGeo, currentGeo) {
  if (!previousGeo || !currentGeo) return false;
  if (previousGeo.country && currentGeo.country && previousGeo.country !== currentGeo.country) return true;
  if (previousGeo.region && currentGeo.region && previousGeo.region !== currentGeo.region) return true;
  if (previousGeo.city && currentGeo.city && previousGeo.city !== currentGeo.city) return true;
  return false;
}

function createRateLimitKey(req, name = 'default') {
  const ip = getRequestIp(req);
  const email = req?.body?.email || req?.query?.email || '';
  const userAgent = getHeader(req, 'user-agent');
  return `${name}:${ip}:${safeHash(`${email}:${userAgent}`).slice(0, 12)}`;
}

export function checkRateLimit({ req, name = 'default', windowMs = 60_000, max = 5 }) {
  const key = createRateLimitKey(req, name);
  const now = Date.now();
  const entry = loginRateBuckets.get(key) || { count: 0, resetAt: now + windowMs };

  if (entry.resetAt <= now) {
    entry.count = 0;
    entry.resetAt = now + windowMs;
  }

  entry.count += 1;
  loginRateBuckets.set(key, entry);

  return {
    allowed: entry.count <= max,
    remaining: Math.max(max - entry.count, 0),
    resetAt: entry.resetAt
  };
}

function normalizeKnownDevices(user) {
  return Array.isArray(user.knownDevices) ? user.knownDevices : [];
}

export function updateKnownDevice(user, context) {
  const devices = normalizeKnownDevices(user);
  const now = new Date();
  const existing = devices.find((device) => device.fingerprint === context.deviceFingerprint);

  if (existing) {
    existing.lastSeenAt = now;
    existing.ip = context.ip;
    existing.userAgent = context.userAgent;
    existing.geo = context.geo;
    existing.trusted = true;
  } else {
    devices.push({
      fingerprint: context.deviceFingerprint,
      label: context.deviceLabel || 'Unknown device',
      userAgent: context.userAgent,
      ip: context.ip,
      geo: context.geo,
      firstSeenAt: now,
      lastSeenAt: now,
      trusted: true
    });
  }

  user.knownDevices = devices;
  user.lastLoginIp = context.ip;
  user.lastLoginGeo = context.geo;
  user.lastLoginAt = now;
}

export function loginRiskSummary(user, context) {
  const devices = normalizeKnownDevices(user);
  const knownDevice = devices.find((device) => device.fingerprint === context.deviceFingerprint && device.trusted !== false);
  const geoShift = compareGeos(user.lastLoginGeo, context.geo);
  const ipShift = user.lastLoginIp && user.lastLoginIp !== context.ip;

  return {
    unrecognizedDevice: !knownDevice,
    geoShift,
    ipShift,
    requireMfa: !knownDevice || geoShift || ipShift
  };
}

export function createMfaChallenge(user, context) {
  const challengeId = crypto.randomUUID();
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000);
  const codeHash = safeHash(`${challengeId}:${code}`);

  user.mfa = {
    activeChallengeId: challengeId,
    codeHash,
    delivery: 'email',
    reason: context.reason || 'suspicious_login',
    expiresAt,
    verifiedAt: null,
    lastSentAt: new Date()
  };

  mfaChallenges.set(challengeId, {
    userId: String(user._id),
    codeHash,
    expiresAt,
    reason: context.reason || 'suspicious_login'
  });

  return { challengeId, code, expiresAt };
}

export function verifyMfaChallenge(user, challengeId, code) {
  if (!user?.mfa?.activeChallengeId || user.mfa.activeChallengeId !== challengeId) {
    return { valid: false, reason: 'challenge_mismatch' };
  }

  const record = mfaChallenges.get(challengeId);
  if (!record || record.expiresAt.getTime() <= Date.now()) {
    return { valid: false, reason: 'challenge_expired' };
  }

  const codeHash = safeHash(`${challengeId}:${code}`);
  if (codeHash !== record.codeHash) {
    return { valid: false, reason: 'invalid_code' };
  }

  user.mfa.verifiedAt = new Date();
  user.mfa.activeChallengeId = null;
  user.mfa.codeHash = null;
  user.mfa.expiresAt = null;
  mfaChallenges.delete(challengeId);

  return { valid: true };
}

export function issueCaptchaChallenge(purpose = 'auth') {
  const challengeId = crypto.randomUUID();
  const challenge = crypto.randomBytes(18).toString('hex');
  const difficulty = Number(process.env.POW_CAPTCHA_DIFFICULTY || 4);
  const expiresAt = Date.now() + 10 * 60 * 1000;

  captchaChallenges.set(challengeId, { challenge, purpose, difficulty, expiresAt });

  return { challengeId, challenge, difficulty, expiresAt };
}

export function verifyCaptchaChallenge({ challengeId, nonce, digest, purpose = 'auth' }) {
  const record = captchaChallenges.get(challengeId);
  if (!record || record.expiresAt <= Date.now() || record.purpose !== purpose) {
    return { valid: false, reason: 'challenge_expired' };
  }

  const computed = safeHash(`${record.challenge}:${nonce}`);
  const prefix = '0'.repeat(record.difficulty);
  const expectedDigest = digest || computed;

  if (!computed.startsWith(prefix) || computed !== expectedDigest) {
    return { valid: false, reason: 'invalid_solution' };
  }

  captchaChallenges.delete(challengeId);
  return { valid: true };
}

export async function checkTransactionVelocity({ OrderModel, buyerId, amount, currency = 'USD', windowMinutes = 30, highValueThreshold = 75, maxHighValueOrders = 2 }) {
  const since = new Date(Date.now() - windowMinutes * 60 * 1000);
  const orders = await OrderModel.find({
    buyer: buyerId,
    currency,
    createdAt: { $gte: since }
  }).lean();

  const highValueOrders = orders.filter((order) => Number(order.price || 0) >= highValueThreshold);
  const aggregateSpend = highValueOrders.reduce((total, order) => total + Number(order.price || 0), 0) + Number(amount || 0);

  return {
    flagged: highValueOrders.length >= maxHighValueOrders || aggregateSpend >= highValueThreshold * (maxHighValueOrders + 1),
    highValueOrders: highValueOrders.length,
    aggregateSpend
  };
}

export function detectTriangulationFraud({ shippingAddress = {}, ipGeo = {} }) {
  const shippingCountry = String(shippingAddress.country || '').trim().toUpperCase();
  const shippingRegion = String(shippingAddress.state || shippingAddress.region || '').trim().toUpperCase();
  const ipCountry = String(ipGeo.country || '').trim().toUpperCase();
  const ipRegion = String(ipGeo.region || '').trim().toUpperCase();

  const mismatch = Boolean(
    (shippingCountry && ipCountry && shippingCountry !== ipCountry) ||
    (shippingRegion && ipRegion && shippingRegion !== ipRegion)
  );

  return {
    flagged: mismatch,
    mismatch,
    shippingCountry,
    ipCountry,
    shippingRegion,
    ipRegion
  };
}

export function placeSellerPayoutHold(user, { reason, days = 14 }) {
  const until = new Date(Date.now() + days * 24 * 60 * 60 * 1000);
  user.stripe = {
    ...(user.stripe || {}),
    payoutsHeldUntil: until,
    payoutsHeldReason: reason
  };

  return { until, reason };
}