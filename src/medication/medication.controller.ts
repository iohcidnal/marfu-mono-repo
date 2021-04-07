import { Request, Response, NextFunction } from 'express';
import * as service from './medication.service';

/* istanbul ignore next */
/* mongodbMemoryServerOptions does not support transactions */
export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function get(req: Request, res: Response, next: NextFunction) {
  try {
    const memberId = req.params.memberId;
    const clientDateTime = req.body.clientDateTime;
    const result = await service.getAll(memberId, clientDateTime);

    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function put(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.update(req.body);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
