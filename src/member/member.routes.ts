import express from 'express';

import { authenticateUser } from '../middlewares';
import * as controller from './member.controller';

const router = express.Router();

router.post('/members', authenticateUser, controller.post);
router.get('/members', authenticateUser, controller.get);

export default router;
