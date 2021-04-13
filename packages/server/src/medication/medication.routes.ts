import express from 'express';

import { authenticateUser } from '../middlewares';
import * as controller from './medication.controller';

const router = express.Router();

router.post('/medications', authenticateUser, controller.post);
router.get('/medications/:memberId', authenticateUser, controller.get);
router.put('/medications', authenticateUser, controller.put);

export default router;
