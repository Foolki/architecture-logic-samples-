/**
 * NEXUS TASK ORCHESTRATOR - SECURITY SAMPLE
 * 
 * THE CHALLENGE:
 * Protecting user-specific tasks from unauthorized access without 
 * slowing down the API with constant database session lookups.
 * 
 * THE SOLUTION:
 * A lightweight JWT (JSON Web Token) middleware. It intercepts 
 * incoming requests, verifies the token's signature, and injects 
 * the 'userId' directly into the request object for downstream logic.
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

// Extending Express Request to include our custom user data
export interface AuthRequest extends Request {
  user?: { id: string; role: string };
}

export const authenticateToken = (req: AuthRequest, res: Response, next: NextFunction) => {
  // Extract token from the Authorization header (Format: Bearer <token>)
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      message: 'Access Denied: No authentication token provided.' 
    });
  }

  try {
    const secret = process.env.JWT_SECRET || 'fallback_secret_for_dev_only';
    
    // Verify the token integrity
    const decodedUser = jwt.verify(token, secret) as { id: string; role: string };
    
    // Inject the verified user into the request
    req.user = decodedUser;
    
    next(); // Pass control to the next handler (e.g., the Task Controller)
  } catch (error) {
    return res.status(403).json({ 
      message: 'Session expired or invalid token. Please log in again.' 
    });
  }
};
