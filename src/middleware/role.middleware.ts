import { Request, Response, NextFunction } from 'express';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const roleMiddleware = (allowedRoles: string[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const userId = req.userId;
      
      if (!userId) {
        return res.status(401).json({ message: 'User not authenticated' });
      }

      // Get user with role information
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          roles: true,
        },
      });

      if (!user || !user.roles) {
        return res.status(403).json({ message: 'Access denied. User role not found.' });
      }

      // Check if user role is in allowed roles
      const userRole = user.roles.roles_name;
      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ 
          message: `Access denied. Required roles: ${allowedRoles.join(', ')}. Your role: ${userRole}` 
        });
      }

      // Add user role to request for further use
      req.userRole = userRole;
      req.userInfo = user;
      
      next();
    } catch (error) {
      console.error('Role middleware error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
};

// Extend Request interface to include user role
declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: string;
      userInfo?: any;
    }
  }
}

export { roleMiddleware };
