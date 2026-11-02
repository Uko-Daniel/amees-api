import type { Request, Response, NextFunction } from 'express';
import { verifyAdminToken, type AdminTokenPayload } from '../lib/jwt.js';

declare global {
  namespace Express {
    interface Request {
      admin?: AdminTokenPayload;
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  const payload = verifyAdminToken(header.slice(7));
  if (!payload) {
    return res.status(401).json({ error: 'Invalid or expired session' });
  }
  req.admin = payload;
  next();
}