import { signInMode } from '@common';
import { Request, Response, NextFunction } from 'express';
import * as service from './user.service';

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await service.authenticate(payload);
    if (result) return res.status(200).json(result);

    return res.status(404).json({ message: 'Username or password do not match.' });
  } catch (error) {
    next(error);
  }
}

export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await service.create(payload);

    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function put(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await service.update(payload);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function signOut(req: Request, res: Response, next: NextFunction) {
  try {
    res.set('user-id', '');
    req.userId = undefined;
    const result: signInMode = 'SIGNED_OUT';
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkSession(req: Request, res: Response, next: NextFunction) {
  try {
    if (req.userId) return res.status(200).json({ userId: req.userId });
    return res.status(401).json('Unauthorized session.');
  } catch (error) {
    next(error);
  }
}
