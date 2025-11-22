import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

export interface AuthRequest extends Request {
  user?: {
    userId: string;
    email: string;
  };
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'No token provided. Authorization required.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      // Verify token
      const decoded = jwt.verify(token, JWT_SECRET) as any;
      
      // Add user info to request
      (req as any).user = {
        userId: decoded.userId,
        email: decoded.email
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Invalid or expired token'
      });
    }
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: 'Error in authentication',
      error: error.message
    });
  }
};

// Optional auth - doesn't fail if no token, but adds user if present
export const optionalAuth = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.replace('Bearer ', '');
      
      try {
        const decoded = jwt.verify(token, JWT_SECRET) as any;
        (req as any).user = {
          userId: decoded.userId,
          email: decoded.email
        };
      } catch (jwtError) {
        // Token invalid, but continue without user
      }
    }
    
    next();
  } catch (error) {
    next();
  }
};
