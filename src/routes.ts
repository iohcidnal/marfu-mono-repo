import express from 'express';
import { userController } from './controllers';

const router = express.Router();
router.get('/users', userController.get);

export default router;
