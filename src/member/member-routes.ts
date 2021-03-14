import express from 'express';

import { authenticateUser } from '../user/user-middlewares';
import * as memberController from './member-controller';

const router = express.Router();

router.post('/members', authenticateUser, memberController.post);
router.get('/members', authenticateUser, memberController.get);

export default router;
