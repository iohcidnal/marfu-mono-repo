import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

import { IModelBase } from '@common';
import userModel from '../user/user.model';

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

// TODO: Replace authenticateUser with validateSession since session is now used instead of jwt
export async function validateSession(req: Request, res: Response, next: NextFunction) {
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
