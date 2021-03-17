import express from 'express';
import * as controller from './user.controller';
import { validateNewUser } from './user.middlewares';

const router = express.Router();

router.post('/users/', validateNewUser, controller.post);
router.post('/users/authenticate', controller.authenticate);

export default router;
