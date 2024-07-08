import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const authMiddleware = (req: Request,res: Response, next: NextFunction) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ message: 'Authorization denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string }; 

         console.log("decoded",decoded.userId)
            const userId = decoded.userId
            req.userId =  userId;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

export default authMiddleware;