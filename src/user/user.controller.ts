import { Request, Response, NextFunction } from 'express';
import * as userService from './user.service';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await userService.authenticate(payload);
    if (result) return res.status(200).json(result);

    return res.status(404).json({ message: 'User name or password do not match.' });
  } catch (error) {
    next(error);
  }
}

export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await userService.create(payload);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}
