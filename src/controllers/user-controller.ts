import express from 'express';
import { userService } from '../services';

function userController() {
  async function post(req: express.Request, res: express.Response) {
    const payload = req.body;
    const result = await userService.create(payload);
    return res.status(201).json(result);
  }

  async function get(req: express.Request, res: express.Response) {
    const userId = req.params.userId;
    return res.status(200).json(await userService.get(userId));
  }

  return { post, get };
}

export default userController();
