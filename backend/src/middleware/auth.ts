import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../config/db';

export interface AuthRequest extends Request {
  user?: {
    id: string;
    email: string;
  };
  doctor?: any; // To store the full doctor record
}

export const protect = async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {
  let token;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      console.log('[AuthDebug] Received Token:', token.substring(0, 20) + '...');

      // Decode token
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret') as { id: string; email: string };
      console.log('[AuthDebug] Decoded Payload:', decoded);

      // 1. Verify doctor exists in DB
      console.log('[AuthDebug] Looking up doctor with ID:', decoded.id);
      const doctor = await prisma.doctor.findUnique({
        where: { id: decoded.id }
      });

      if (!doctor) {
        console.log('[AuthDebug] FAILED: Doctor not found in database for ID:', decoded.id);
        res.status(401).json({ message: 'Unauthorized: Doctor record no longer exists' });
        return;
      }

      console.log('[AuthDebug] SUCCESS: Doctor found:', doctor.name);

      // 2. Attach both the decoded user info and the full doctor record
      req.user = decoded;
      req.doctor = doctor;

      next();
    } catch (error: any) {
      console.error('[AuthDebug] Token verification failed:', error.message);
      res.status(401).json({ message: 'Not authorized, token failed' });
    }
  }

  if (!token) {
    console.log('[AuthDebug] FAILED: No token provided');
    res.status(401).json({ message: 'Not authorized, no token' });
  }
};
