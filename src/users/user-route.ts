import express from 'express';
import userController from './user-controller';

const router = express.Router();

router.get('/users/:userId', userController.get);
router.post('/users/', userController.post);

export default router;
