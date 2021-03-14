import express from 'express';
import userService from './user-service';

function userController() {
  async function authenticate(
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) {
    try {
      const payload = req.body;
      const result = await userService.authenticate(payload);
      if (result) return res.status(200).json(result);

      return res.status(404).json({ message: 'User name or password do not match.' });
    } catch (error) {
      next(error);
    }
  }

  async function post(req: express.Request, res: express.Response, next: express.NextFunction) {
    try {
      const payload = req.body;
      const result = await userService.create(payload);

      return res.status(201).json(result);
    } catch (error) {
      next(error);
    }
  }

  return {
    authenticate,
    post
  };
}

export default userController();