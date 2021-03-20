import { Request, Response, NextFunction } from 'express';
import * as service from './frequency-log.service';

export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getByFrequencyId(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getByFrequencyId(req.params.frequencyId);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
