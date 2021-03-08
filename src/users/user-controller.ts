import express from 'express';
import userService from './user-service';

function userController() {
  async function post(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const payload = req.body;
      const result = await userService.create(payload);

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  async function get(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const result = await userService.get(req.params.userId);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  }

  return { post, get };
}

export default userController();
