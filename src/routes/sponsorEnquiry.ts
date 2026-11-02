import { Router, type Request } from 'express';
import { Resend } from 'resend';

export const sponsorEnquiryRouter = Router();

const SPONSORS_EMAIL = 'sponsors@amees.com.ng'; // fixed destination, never from client

// Verified sender. Use a subdomain you verified in Resend, e.g.:
const FROM = process.env.RESEND_FROM ?? 'AMEES Website <no-reply@mail.amees.com.ng>';

const LIMITS = { org: 120, name: 120, email: 254, tier: 60, msg: 4000 } as const;

const str = (v: unknown, max: number) =>
  typeof v === 'string' ? v.trim().slice(0, max) : '';

const esc = (s: string) =>
  s.replace(/[&<>"']/g, c =>
    ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!),
  );

// Lazy singleton: dotenv.config() in index.ts runs after imports, so read env
// on first use. Throws a clear error if the key is missing.
let resend: Resend | null = null;
function getResend(): Resend {
  if (resend) return resend;
  const key = process.env.RESEND_API_KEY;
  if (!key) {
    throw new Error('RESEND_API_KEY is not set — email cannot be sent.');
  }
  resend = new Resend(key);
  return resend;
}

// Crude in-memory throttle — swap for Redis in prod.
const hits = new Map<string, { n: number; t: number }>();
function rateLimited(ip: string) {
  const now = Date.now();
  const rec = hits.get(ip);
  if (!rec || now - rec.t > 60_000) {
    hits.set(ip, { n: 1, t: now });
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

sponsorEnquiryRouter.post('/', async (req, res) => {
  const ip = clientIp(req);
  if (rateLimited(ip)) {
    return res.status(429).json({ error: 'Too many enquiries. Try again in a minute.' });
  }

  const f = req.body?.fields ?? req.body ?? {};
  const org = str(f.org, LIMITS.org);
  const name = str(f.name, LIMITS.name);
  const email = str(f.email, LIMITS.email);
  const tier = str(f.tier, LIMITS.tier) || 'Not sure yet';
  const msg = str(f.msg, LIMITS.msg);

  if (!org || !name || !email) {
    return res.status(400).json({ error: 'Organisation, name and email are required.' });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: 'That email address looks invalid.' });
  }

  const subject = `Sponsor enquiry — ${org} (${tier})`;

  const text = [
    `Organisation: ${org}`,
    `Contact name: ${name}`,
    `Reply-to: ${email}`,
    `Tier of interest: ${tier}`,
    '',
    'Message:',
    msg || '(none)',
    '',
    `— Sent from the AMEES sponsor enquiry form (${ip})`,
  ].join('\n');

  const html = `
    <h2 style="margin:0 0 16px;font:600 18px system-ui,sans-serif">New sponsor enquiry</h2>
    <table cellpadding="6" style="border-collapse:collapse;font:14px system-ui,sans-serif">
      <tr><td><strong>Organisation</strong></td><td>${esc(org)}</td></tr>
      <tr><td><strong>Contact name</strong></td><td>${esc(name)}</td></tr>
      <tr><td><strong>Reply-to</strong></td><td><a href="mailto:${esc(email)}">${esc(email)}</a></td></tr>
      <tr><td><strong>Tier of interest</strong></td><td>${esc(tier)}</td></tr>
    </table>
    <h3 style="margin:20px 0 8px;font:600 14px system-ui,sans-serif">Message</h3>
    <p style="white-space:pre-wrap;font:14px system-ui,sans-serif;margin:0">${esc(msg) || '<em>(none)</em>'}</p>
  `;

  // If the key is absent in dev, log and pretend success so you can still
  // exercise the form. In prod this is a hard failure.
  if (!process.env.RESEND_API_KEY) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[sponsor-enquiry] RESEND_API_KEY is not set');
      return res.status(503).json({ error: 'Email is not configured on the server.' });
    }
    console.info('\n[sponsor-enquiry] RESEND_API_KEY not set — would have sent:\n');
    console.info(`To: ${SPONSORS_EMAIL}\nFrom: ${FROM}\nSubject: ${subject}\n\n${text}\n`);
    return res.json({ ok: true, transport: 'console' });
  }

  try {
     const { data, error } = await getResend().emails.send(
      {
        from: FROM,
        to: [SPONSORS_EMAIL],
        replyTo: `${name} <${email}>`,
        subject,
        text,
        html,
    },
    {
        idempotencyKey: `sponsor-enquiry/${ip}/${Date.now()}`,
    },
    );

    if (error) {
      console.error('[sponsor-enquiry] resend rejected', error);
      return res.status(502).json({
        error:
          error.name === 'validation_error'
            ? 'The email could not be sent — check the sender domain is verified.'
            : 'We couldn’t send that just now. Please try again shortly.',
      });
    }

    console.info('[sponsor-enquiry] sent', data?.id);
    return res.json({ ok: true, transport: 'resend', id: data?.id });
  } catch (err) {
    console.error('[sponsor-enquiry] send failed', err);
    return res.status(502).json({
      error: 'We couldn’t send that just now. Please try again shortly.',
    });
  }
});