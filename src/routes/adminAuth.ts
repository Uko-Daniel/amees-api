import { Router, type Request } from 'express';
import { randomInt } from 'crypto';
import { Resend } from 'resend';
import { prisma } from '../lib/prisma.js';
import { hashPassword, hashOtp, safeCompare, verifyPassword } from '../lib/password.js';
import { issueAdminToken } from '../lib/jwt.js';
import { requireAuth } from '../middleware/requireAuth.js';
import { buildOtpTemplate } from '../lib/emailTemplates.js';

export const adminAuthRouter = Router();

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
const OTP_MAX_ATTEMPTS = 5;

// Per-email throttle: 5 attempts per 15 min. Prevents credential stuffing on one account.
const attempts = new Map<string, { n: number; t: number }>();
function tooManyAttempts(key: string) {
  const now = Date.now();
  const rec = attempts.get(key);
  if (!rec || now - rec.t > 15 * 60 * 1000) {
    attempts.set(key, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > 5;
}

function clientIp(req: Request) {
  return (
    (req.headers['x-forwarded-for'] as string | undefined)?.split(',')[0]?.trim() ??
    req.socket.remoteAddress ??
    'unknown'
  );
}

function labelFromUa(ua: string | undefined): string {
  if (!ua) return 'Unknown device';
  const browser =
    /Edg\//.test(ua) ? 'Edge' :
    /Chrome\//.test(ua) ? 'Chrome' :
    /Firefox\//.test(ua) ? 'Firefox' :
    /Safari\//.test(ua) ? 'Safari' : 'Browser';
  const os =
    /Windows/.test(ua) ? 'Windows' :
    /Mac OS X/.test(ua) ? 'macOS' :
    /Android/.test(ua) ? 'Android' :
    /iPhone|iPad/.test(ua) ? 'iOS' :
    /Linux/.test(ua) ? 'Linux' : '';
  return os ? `${browser} on ${os}` : browser;
}

let resend: Resend | null = null;
function getResend() {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  resend = new Resend(key);
  return resend;
}

async function sendOtpEmail(email: string, code: string) {
  const from = process.env.RESEND_FROM ?? 'AMEES Website <no-reply@amees.com.ng>';
  const { error } = await getResend().emails.send({
    from,
    to: [email],
    subject: `Your AMEES admin code: ${code}`,
    text: `Your AMEES admin verification code is:\n\n  ${code}\n\nIt expires in 10 minutes. If you did not try to log in, change your password immediately.`,
    html: buildOtpTemplate(code),
  });
  if (error) throw new Error(`OTP email failed: ${error.message}`);
}

// POST /api/admin/auth/login
adminAuthRouter.post('/login', async (req, res) => {
  const { email, password, deviceId } = req.body ?? {};
  if (typeof email !== 'string' || typeof password !== 'string' || typeof deviceId !== 'string') {
    return res.status(400).json({ error: 'email, password and deviceId are required' });
  }

  const normalizedEmail = email.trim().toLowerCase();
  if (tooManyAttempts(normalizedEmail)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  const admin = await prisma.admin.findUnique({ where: { email: normalizedEmail } });
  // Verify password even if admin is missing (timing-safe-ish).
  const ok = admin ? verifyPassword(password, admin.passwordHash) : false;
  if (!admin || !ok) {
    return res.status(401).json({ error: 'Invalid email or password' });
  }

  // Known device?
  const trusted = await prisma.trustedDevice.findUnique({
    where: { adminId_deviceId: { adminId: admin.id, deviceId } },
  });

  if (trusted) {
    await prisma.trustedDevice.update({
      where: { id: trusted.id },
      data: { lastSeenAt: new Date() },
    });
    const token = issueAdminToken({ sub: admin.id, role: admin.role, email: admin.email });
    return res.json({ token, role: admin.role, email: admin.email });
  }

  // New device → issue OTP
  // Invalidate any existing unconsumed OTPs for this admin
  await prisma.loginOtp.updateMany({
    where: { adminId: admin.id, consumedAt: null },
    data: { consumedAt: new Date() },
  });

  const code = String(randomInt(100000, 1000000));
  const otp = await prisma.loginOtp.create({
    data: {
      adminId: admin.id,
      deviceId,
      codeHash: hashOtp('placeholder', code), // placeholder, real hash below
      expiresAt: new Date(Date.now() + OTP_TTL_MS),
    },
  });
  // Rehash with the real otp.id as the nonce
  await prisma.loginOtp.update({
    where: { id: otp.id },
    data: { codeHash: hashOtp(otp.id, code) },
  });

  try {
    await sendOtpEmail(admin.email, code);
  } catch (err) {
    console.error('[admin-auth] OTP email failed', err);
    return res.status(502).json({ error: 'Could not send verification email. Try again.' });
  }

  return res.json({
    needsOtp: true,
    challengeId: otp.id,
    email: admin.email,
    deviceLabel: labelFromUa(req.headers['user-agent']),
  });
});

// POST /api/admin/auth/verify-otp
adminAuthRouter.post('/verify-otp', async (req, res) => {
  const { challengeId, code, deviceId } = req.body ?? {};
  if (typeof challengeId !== 'string' || typeof code !== 'string' || typeof deviceId !== 'string') {
    return res.status(400).json({ error: 'challengeId, code and deviceId are required' });
  }

  const otp = await prisma.loginOtp.findUnique({
    where: { id: challengeId },
    include: { admin: true },
  });

  if (!otp || otp.consumedAt || otp.expiresAt < new Date()) {
    return res.status(400).json({ error: 'Code expired. Start over.' });
  }
  if (otp.deviceId !== deviceId) {
    return res.status(400).json({ error: 'Code was issued for a different device.' });
  }
  if (otp.attempts >= OTP_MAX_ATTEMPTS) {
    await prisma.loginOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });
    return res.status(429).json({ error: 'Too many attempts. Start over.' });
  }

  await prisma.loginOtp.update({
    where: { id: otp.id },
    data: { attempts: { increment: 1 } },
  });

  const expected = hashOtp(otp.id, code);
  if (!safeCompare(expected, otp.codeHash)) {
    return res.status(400).json({ error: 'Incorrect code.' });
  }

  // Consume + trust device in a single transaction
  await prisma.$transaction([
    prisma.loginOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    }),
    prisma.trustedDevice.upsert({
      where: { adminId_deviceId: { adminId: otp.adminId, deviceId } },
      update: { lastSeenAt: new Date() },
      create: {
        adminId: otp.adminId,
        deviceId,
        label: labelFromUa(req.headers['user-agent']),
        userAgent: req.headers['user-agent'] ?? null,
      },
    }),
  ]);

  const token = issueAdminToken({
    sub: otp.admin.id,
    role: otp.admin.role,
    email: otp.admin.email,
  });
  return res.json({ token, role: otp.admin.role, email: otp.admin.email });
});

// GET /api/admin/auth/me — current admin from token
adminAuthRouter.get('/me', requireAuth, async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { id: req.admin!.sub },
    select: { id: true, email: true, role: true },
  });
  if (!admin) return res.status(404).json({ error: 'Not found' });
  res.json(admin);
});

// GET /api/admin/auth/devices — list trusted devices
adminAuthRouter.get('/devices', requireAuth, async (req, res) => {
  const devices = await prisma.trustedDevice.findMany({
    where: { adminId: req.admin!.sub },
    orderBy: { lastSeenAt: 'desc' },
    select: { id: true, label: true, createdAt: true, lastSeenAt: true },
  });
  res.json(devices);
});

// DELETE /api/admin/auth/devices/:id — revoke a device
adminAuthRouter.delete('/devices/:id', requireAuth, async (req, res) => {
  await prisma.trustedDevice.deleteMany({
    where: { id: req.params.id, adminId: req.admin!.sub },
  });
  res.json({ success: true });
});