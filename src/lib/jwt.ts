import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET;
if (!SECRET) throw new Error('JWT_SECRET is not set');

const EXPIRES_IN = '7d';

export interface AdminTokenPayload {
  sub: string;
  role: string;
  email: string;
}

export function issueAdminToken(payload: AdminTokenPayload): string {
  return jwt.sign(payload, SECRET!, { expiresIn: EXPIRES_IN });
}

export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    return jwt.verify(token, SECRET!) as AdminTokenPayload;
  } catch {
    return null;
  }
}