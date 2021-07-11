import { Request, Response, NextFunction } from 'express';
import * as service from './member.service';

export async function post(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.create(req.body);
    return res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAll(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getAll();
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getAllForDashboard(req: Request, res: Response, next: NextFunction) {
  try {
    const clientDateTime = req.body.clientDateTime;
    const result = await service.getAllForDashboard(clientDateTime);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.getById(req.params.id);
    if (result) return res.status(200).json(result);
    return res.status(401).json('Member not found.');
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

export async function deleteById(req: Request, res: Response, next: NextFunction) {
  try {
    const result = await service.deleteById(req.params.id);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
