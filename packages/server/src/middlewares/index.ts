import { Request, Response, NextFunction } from 'express';
import userModel from '../user/user.model';

export async function validateUser(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.session.user) {
      const user = await userModel.findById(req.session.user._id).exec();
      if (!user) {
        return res.status(401).json({ message: 'User not found.' });
      }
      req._id = req.session.user._id;
      next();
    } else {
      return res.status(401).json({ message: 'User not authenticated.' });
    }
  } catch (error) {
    next(error);
  }
}
