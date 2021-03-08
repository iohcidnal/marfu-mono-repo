import express from 'express';

export function validateNewUser(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  const user: IUser = req.body;
  if (!user.userName) {
    return res.status(400).json({ message: 'User name is missing.' });
  }
  if (!user.password) {
    return res.status(400).json({ message: 'Password is missing.' });
  }

  next();
}
