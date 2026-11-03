import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { randomInt } from 'crypto';
import jwt from 'jsonwebtoken';
import { Resend } from 'resend';
import { buildOtpTemplate } from '../lib/emailTemplates.js';

// THIS EXPORT IS CRITICAL
export const studentAuthRouter = Router();

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret';
const resend = new Resend(process.env.RESEND_API_KEY);

// Helper function to standardize matric numbers
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
    if (!student) {
      return res.status(404).json({ 
        error: 'Matric number not found. Please contact the AMEES executive to register your account.' 
      });
    }

    // Basic security check
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

    const code = String(randomInt(100000, 1000000));
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    const otpRecord = await prisma.studentLoginOtp.create({
      data: { studentId: student.id, codeHash: code, expiresAt }
    });

    const from = process.env.RESEND_FROM ?? 'AMEES Portal <no-reply@amees.com.ng>';
    await resend.emails.send({
      from,
      to: [email],
      subject: `Your AMEES Student Portal code: ${code}`,
      text: `Your verification code is: ${code}\n\nIt expires in 10 minutes.`,
      html: buildOtpTemplate(code)
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

    await prisma.studentLoginOtp.update({
      where: { id: otp.id },
      data: { consumedAt: new Date() }
    });

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