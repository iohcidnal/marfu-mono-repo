import { Request, Response, NextFunction } from 'express';
import * as memberService from './member-service';

export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await memberService.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await memberService.getAll();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
