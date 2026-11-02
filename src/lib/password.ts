import { scryptSync, randomBytes, timingSafeEqual, createHmac } from 'crypto';

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;
  const test = scryptSync(password, salt, 64).toString('hex');
  if (hash.length !== test.length) return false;
  return timingSafeEqual(Buffer.from(hash, 'hex'), Buffer.from(test, 'hex'));
}

/** HMAC-SHA256 keyed on a server secret — a leaked DB alone can't brute-force the OTP. */
export function hashOtp(otpId: string, code: string): string {
  const secret = process.env.OTP_SECRET;
  if (!secret) throw new Error('OTP_SECRET is not set');
  return createHmac('sha256', secret).update(`${otpId}:${code}`).digest('hex');
}

export function safeCompare(a: string, b: string): boolean {
  const ba = Buffer.from(a, 'hex');
  const bb = Buffer.from(b, 'hex');
  if (ba.length !== bb.length) return false;
  return timingSafeEqual(ba, bb);
}