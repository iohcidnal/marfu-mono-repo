import express from 'express';
import * as memberService from './member-service';

export async function post(
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) {
  try {
    const result = await memberService.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function get(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const result = await memberService.getAll();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
