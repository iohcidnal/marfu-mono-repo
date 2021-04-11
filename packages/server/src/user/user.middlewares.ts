import { Request, Response, NextFunction } from 'express';
import { IUserDto } from '@common';

export function validateNewUser(req: Request, res: Response, next: NextFunction) {
  const user: IUserDto = req.body;
  if (!user.userName) {
    return res.status(400).json({ message: 'User name is missing.' });
  }
  if (!user.password) {
    return res.status(400).json({ message: 'Password is missing.' });
  }

  next();
}
