import express from 'express';
import * as userController from './user-controller';
import { validateNewUser } from './user-middlewares';

const router = express.Router();

router.post('/users/', validateNewUser, userController.post);
router.post('/users/authenticate', userController.authenticate);

export default router;
