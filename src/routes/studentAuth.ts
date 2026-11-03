import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';

export const studentAuthRouter = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';

// Initialize Resend (uses the same API key as your admin/sponsor emails)
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to standardize matric numbers (uppercase, no spaces)
const normalizeMatric = (matric: string) => {
  return matric.trim().toUpperCase().replace(/\s+/g, '');
};

// POST /api/student/auth/identify
studentAuthRouter.post('/identify', async (req, res) => {
  const { name, matric, email } = req.body;
  if (!name || !matric || !email) {
    return res.status(400).json({ error: 'Name, matric, and email are required' });
  }

  try {
    const cleanMatric = normalizeMatric(matric);

    const student = await prisma.student.findUnique({ where: { matric: cleanMatric } });
    
    // SECURITY: Do not allow random people to sign up. 
    // They must be added to the DB by an admin first.
    if (!student) {
      return res.status(404).json({ 
        error: 'Matric number not found. Please contact the AMEES executive to register your account.' 
      });
    }

    // Basic security check: Does the name match what's in the DB?
    if (student.name.toLowerCase() !== name.trim().toLowerCase()) {
       return res.status(400).json({ error: 'The name provided does not match our records for this matric number.' });
    }

    // Update their email in the DB if they use a different one
    if (student.email !== email) {
      await prisma.student.update({
        where: { id: student.id },
        data: { email }
      });
    }

    // Generate 6-digit OTP
    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    // Save OTP to DB
    const otpRecord = await prisma.studentLoginOtp.create({
      data: { studentId: student.id, codeHash: code, expiresAt }
    });

    // Send Email via Resend
    const from = process.env.RESEND_FROM ?? 'AMEES Portal <no-reply@amees.com.ng>';
    await resend.emails.send({
      from,
      to: [email],
      subject: `Your AMEES Student Portal code: ${code}`,
      text: `Your verification code is: ${code}\n\nIt expires in 10 minutes.`,
      html: `
        <div style="font:14px system-ui,sans-serif;max-width:480px">
          <h2 style="margin:0 0 12px">AMEES Student Portal</h2>
          <p style="margin:0 0 16px">Use this code to sign in to your Workbench.</p>
          <p style="font:600 28px monospace;letter-spacing:4px;background:#f4f4f4;padding:14px 18px;display:inline-block;border-radius:4px;margin:0 0 16px">${code}</p>
          <p style="margin:0;color:#666;font-size:12px">If you didn't request this, you can ignore this email.</p>
        </div>
      `
    });

    res.json({ challengeId: otpRecord.id, message: 'Code sent to email' });
  } catch (error) {
    console.error('[student-auth]', error);
    res.status(500).json({ error: 'Failed to initiate login' });
  }
});

// POST /api/student/auth/verify
studentAuthRouter.post('/verify', async (req, res) => {
  const { challengeId, code, rememberMe } = req.body;
  
  if (!challengeId || !code) {
    return res.status(400).json({ error: 'Challenge ID and code are required' });
  }

  try {
    const otp = await prisma.studentLoginOtp.findUnique({
      where: { id: challengeId },
      include: { student: true }
    });

    if (!otp || otp.consumedAt || otp.expiresAt < new Date()) {
      return res.status(400).json({ error: 'Code expired or invalid' });
    }

    if (otp.codeHash !== code) {
      return res.status(400).json({ error: 'Incorrect code' });
    }

    // Mark as consumed
    await prisma.studentLoginOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() }
    });

    // 30 days if rememberMe is true, otherwise 1 day
    const expiresIn = rememberMe ? '30d' : '1d';

    const token = jwt.sign(
      { sub: otp.studentId, role: 'student', name: otp.student.name },
      JWT_SECRET,
      { expiresIn }
    );

    res.json({ token, student: otp.student });
  } catch (error) {
    console.error('[student-auth]', error);
    res.status(500).json({ error: 'Failed to verify' });
  }
});