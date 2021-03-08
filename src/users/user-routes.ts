import express from 'express';
import userController from './user-controller';
import { validateNewUser } from './user-middlewares';

const router = express.Router();

router.get('/users/:userId', userController.get);
router.post('/users/', validateNewUser, userController.post);

export default router;
