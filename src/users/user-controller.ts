import express from 'express';
import userService from './user-service';

function userController() {
  async function post(req: express.Request, res: express.Response) {
    const payload = req.body;
    const result = await userService.create(payload);

    return res.status(201).json(result);
  }

  async function get(req: express.Request, res: express.Response) {
    const result = await userService.get(req.params.userId);
    return res.status(200).json(result);
  }

  return { post, get };
}

export default userController();
