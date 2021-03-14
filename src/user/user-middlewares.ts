import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import userModel from './user-model';

export function validateNewUser(req: Request, res: Response, next: NextFunction) {
  const user: IUser = req.body;
  if (!user.userName) {
    return res.status(400).json({ message: 'User name is missing.' });
  }
  if (!user.password) {
    return res.status(400).json({ message: 'Password is missing.' });
  }

  next();
}

export async function authenticateUser(req: Request, res: Response, next: NextFunction) {
  try {
    const authorization = req.get('Authorization');
    if (!authorization) {
      return res.status(401).json({ message: 'Authorization missing.' });
    }

    const [bearer, token] = authorization.split(' ');
    if (bearer !== 'Bearer' || !token) {
      return res.status(401).json({ message: 'Invalid bearer token.' });
    }

    const decoded = jwt.verify(token, process.env.SECRET as string) as IModelBase;
    const user = await userModel.findById(decoded._id).exec();
    if (!user) {
      return res.status(401).json({ message: 'User not found.' });
    }

    next();
  } catch (error) {
    next(error);
  }
}
