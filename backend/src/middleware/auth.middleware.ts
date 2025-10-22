import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../api/auth/auth.service';

export interface AuthRequest extends Request {
  user?: {
    userId: number;
    email: string;
  };
}

export const authMiddleware = async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token di accesso richiesto' });
    }

    const token = authHeader.substring(7);
    const decoded = await AuthService.verifyAccessToken(token);
    
    req.user = {
      userId: decoded.userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    return res.status(401).json({ error: 'Token non valido' });
  }
};