import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import userModel from '../user/user.model';

export async function validateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.headers['x-access-token'] as string;

    if (!token) return res.status(403).json({ message: 'Token is missing.' });

    jwt.verify(token, process.env.SECRET as string, async (err, decoded) => {
      if (err) return res.status(401).json({ message: 'User not authorized.' });

      const user = await userModel.findById(decoded?.userId).exec();
      if (!user) return res.status(401).json({ message: 'User not found.' });

      res.set('user-id', user._id);
      req.userId = user._id;
      next();
    });
  } catch (error) {
    next(error);
  }
}
