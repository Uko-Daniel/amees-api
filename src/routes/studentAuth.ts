import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { hashOtp, safeCompare } from '../lib/password.js';
import { buildOtpTemplate } from '../lib/emailTemplates.js';

export const studentAuthRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const OTP_TTL_MS = 10 * 60 * 1000;      // 10 minutes
const OTP_MAX_ATTEMPTS = 5;              // per challengeId

// Lazy Resend — dotenv.config() in index.js runs after module imports,
// so reading process.env at module top-level is unsafe. Same pattern as adminAuth.
let resend: Resend | null = null;
function getResend(): Resend {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error('RESEND_API_KEY is not set');
  resend = new Resend(key);
  return resend;
}

// Per-matric throttle on /identify: 5 per 15 min. Stops enumeration + email bombs.
const identifyAttempts = new Map<string, { n: number; t: number }>();
function tooManyIdentifyAttempts(key: string) {
  const now = Date.now();
  const rec = identifyAttempts.get(key);
  if (!rec || now - rec.t > 15 * 60 * 1000) {
    identifyAttempts.set(key, { n: 1, t: now });
    return false;
  }
  rec.n += 1;
  return rec.n > 5;
}

const normalizeMatric = (matric: string) =>
  matric.trim().toUpperCase().replace(/\s+/g, '');

// POST /api/student/auth/identify
studentAuthRouter.post('/identify', async (req, res) => {
  const { name, matric, email } = req.body ?? {};

  if (
    typeof name !== 'string' ||
    typeof matric !== 'string' ||
    typeof email !== 'string' ||
    !name.trim() || !matric.trim() || !email.trim()
  ) {
    return res.status(400).json({ error: 'Name, matric, and email are required' });
  }

  const cleanMatric = normalizeMatric(matric);
  if (tooManyIdentifyAttempts(cleanMatric)) {
    return res.status(429).json({ error: 'Too many attempts. Try again in 15 minutes.' });
  }

  try {
    const student = await prisma.student.findUnique({ where: { matric: cleanMatric } });

    // SECURITY: only pre-registered students may sign in.
    if (!student) {
      return res.status(404).json({
        error:
          'Matric number not found. Please contact the AMEES executive to register your account.',
      });
    }

    // Matric + name is the identity boundary for the student flow.
    if (student.name.toLowerCase() !== name.trim().toLowerCase()) {
      return res.status(400).json({
        error: 'The name provided does not match our records for this matric number.',
      });
    }

    // ── OPTION A: email must match the one on file ─────────────────────────
    // We never update the email from this public endpoint. Anyone who knows a
    // name + matric would otherwise be able to redirect the OTP to their own
    // inbox and take over the account. Email changes are an admin action only.
    if (student.email.toLowerCase() !== email.trim().toLowerCase()) {
      return res.status(400).json({
        error:
          'That email does not match the one on file for this matric number. Sign in with the registered email, or ask the AMEES executive to update it.',
      });
    }
    // ───────────────────────────────────────────────────────────────────────

    // Invalidate any still-valid OTPs so exactly one code is live at a time.
    await prisma.studentLoginOtp.updateMany({
      where: { studentId: student.id, consumedAt: null },
      data: { consumedAt: new Date() },
    });

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + OTP_TTL_MS);

    // Create with a placeholder, then re-hash with the real id as the nonce.
    // (Same two-step dance adminAuth uses — the id doesn't exist until the
    //  create returns, and the id is the nonce.)
    const otpRecord = await prisma.studentLoginOtp.create({
      data: {
        studentId: student.id,
        codeHash: hashOtp('placeholder', code),
        expiresAt,
      },
    });
    await prisma.studentLoginOtp.update({
      where: { id: otpRecord.id },
      data: { codeHash: hashOtp(otpRecord.id, code) },
    });

    // Send the email. Check the error explicitly instead of trusting the promise.
    const from = process.env.RESEND_FROM ?? 'AMEES Portal <no-reply@amees.com.ng>';
    try {
      const { error } = await getResend().emails.send({
        from,
        to: [student.email],          // ← always the address on file
        subject: `Your AMEES Student Portal code: ${code}`,
        text: `Your verification code is: ${code}\n\nIt expires in 10 minutes.`,
        html: buildOtpTemplate(code, {
          name: student.name.split(' ')[0],
          purpose: 'Student Portal',
          forLabel: `Student Portal, matric ending ${cleanMatric.slice(-4)}`,
          expiresInMinutes: OTP_TTL_MS / 60000,
          actionUrl: 'https://amees.com.ng/workbench',
          actionLabel: 'Open the Workbench',
        }),
      });
      if (error) throw new Error(`OTP email failed: ${error.message}`);
    } catch (err) {
      console.error('[student-auth] OTP email failed', err);
      return res.status(502).json({ error: 'Could not send verification email. Try again.' });
    }

    res.json({ challengeId: otpRecord.id, message: 'Code sent to email' });
  } catch (error) {
    console.error('[student-auth]', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

// POST /api/student/auth/verify
studentAuthRouter.post('/verify', async (req, res) => {
  const { challengeId, code, rememberMe } = req.body ?? {};

  if (typeof challengeId !== 'string' || typeof code !== 'string') {
    return res.status(400).json({ error: 'Challenge ID and code are required' });
  }

  try {
    const otp = await prisma.studentLoginOtp.findUnique({
      where: { id: challengeId },
      include: { student: true },
    });

    if (!otp || otp.consumedAt || otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Code expired or invalid' });
    }

    if (otp.attempts >= OTP_MAX_ATTEMPTS) {
      // Already burned out — consume so it can't be retried.
      await prisma.studentLoginOtp.update({
        where: { id: otp.id },
        data: { consumedAt: new Date() },
      });
      return res.status(429).json({ error: 'Too many attempts. Start over.' });
    }

    // Increment before comparing: even a correct code on the last attempt
    // leaves the counter at the limit, and a wrong code on the last attempt
    // trips lockout on the next call.
    await prisma.studentLoginOtp.update({
      where: { id: otp.id },
      data: { attempts: { increment: 1 } },
    });

    const expected = hashOtp(otp.id, code);
    if (!safeCompare(expected, otp.codeHash)) {
      return res.status(400).json({ error: 'Incorrect code' });
    }

    await prisma.studentLoginOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() },
    });

    const expiresIn = rememberMe ? '30d' : '1d';
    const token = jwt.sign(
      { sub: otp.studentId, role: 'student', name: otp.student.name },
      JWT_SECRET,
      { expiresIn },
    );

    res.json({ token, student: otp.student });
  } catch (error) {
    console.error('[student-auth]', error);
    res.status(500).json({ error: 'Failed to verify' });
  }
});