import { Request, Response, NextFunction } from 'express';
import { INewUserDto } from '@common';

export function validateNewUser(req: Request, res: Response, next: NextFunction) {
  const user: INewUserDto = req.body;
  if (!user.userName) {
    return res.status(400).json({ message: 'Username is missing.' });
  }
  if (!user.password) {
    return res.status(400).json({ message: 'Password is missing.' });
  }

  next();
}
