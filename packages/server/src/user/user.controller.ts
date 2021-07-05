import { IUserBase } from '@common';
import { Request, Response, NextFunction } from 'express';
import * as service from './user.service';

declare module 'express-session' {
  interface Session {
    user: IUserBase;
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const payload = req.body;
    const result = await service.authenticate(payload);
    if (result) {
      req.session.user = result;
      return res.status(200).json(result);
    }

    return res.status(404).json({ message: 'User name or password do not match.' });
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

export async function checkSession(req: Request, res: Response, next: NextFunction) {
  try {
    if (req._id) return res.status(200).json({ _id: req._id });
    return res.status(401).json('Unauthorized session.');
  } catch (error) {
    next(error);
  }
}
