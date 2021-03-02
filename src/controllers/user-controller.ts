import express from 'express';
import { userService } from '../services';

function userController() {
  function get(req: express.Request, res: express.Response) {
    return res.status(200).send(userService.get());
  }

  return { get };
}

export default userController();
