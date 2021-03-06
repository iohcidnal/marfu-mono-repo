import express from 'express';
import { userController } from './controllers';

const router = express.Router();

router.get('/users/:userId', userController.get);
router.post('/users/', userController.post);

export default router;
