import { Router } from 'express';
import { Resend } from 'resend';
import { requireAuth } from '../middleware/requireAuth.js';
import {
  buildSemiFormalTemplate,
  buildLiveEventTemplate,
  buildFormalTemplate,
  buildInformalTemplate,
} from '../lib/emailTemplates.js';

export const adminEmailsRouter = Router();
adminEmailsRouter.use(requireAuth);

const resend = new Resend(process.env.RESEND_API_KEY);
const FROM = process.env.RESEND_FROM || 'AMEES <no-reply@amees.com.ng>';

adminEmailsRouter.post('/send', async (req, res) => {
  const { templateType, recipients, subject, data } = req.body;

  if (!recipients || !recipients.trim()) {
    return res.status(400).json({ error: 'Recipients are required.' });
  }

  // Parse comma or newline separated emails
  const emailList = recipients
    .split(/[\n,]+/)
    .map((e: string) => e.trim())
    .filter((e: string) => e.length > 0 && e.includes('@'));

  if (emailList.length === 0) {
    return res.status(400).json({ error: 'No valid email addresses found.' });
  }

  if (emailList.length > 100) {
    return res.status(400).json({ error: 'Too many recipients. Please limit to 100 per batch.' });
  }

  // Generate the HTML based on the selected template
  let html = '';
  try {
    if (templateType === 'semi') html = buildSemiFormalTemplate(data);
    else if (templateType === 'live') html = buildLiveEventTemplate(data);
    else if (templateType === 'formal') html = buildFormalTemplate(data);
    else if (templateType === 'informal') html = buildInformalTemplate(data);
    else return res.status(400).json({ error: 'Invalid template type.' });
  } catch (err) {
    console.error('Template error:', err);
    return res.status(500).json({ error: 'Failed to build email template.' });
  }

  try {
    // Send bulk email (Resend allows up to 50 recipients per call, we loop in chunks if needed)
    // For simplicity, we send one by one to protect privacy (no "To:" list leaking)
    let successCount = 0;
    let failCount = 0;
    const errors: string[] = [];

    for (const to of emailList) {
      const { error } = await resend.emails.send({
        from: FROM,
        to: [to],
        subject: subject,
        html: html,
      });

      if (error) {
        console.error(`Failed to send to ${to}:`, error);
        failCount++;
        errors.push(`${to}: ${error.message}`);
      } else {
        successCount++;
      }
    }

    if (successCount === 0) {
      return res.status(502).json({ error: 'Failed to send to any recipients.', details: errors });
    }

    res.json({ success: true, sent: successCount, failed: failCount, errors });
  } catch (error) {
    console.error('Resend error:', error);
    res.status(500).json({ error: 'Failed to send emails.' });
  }
});