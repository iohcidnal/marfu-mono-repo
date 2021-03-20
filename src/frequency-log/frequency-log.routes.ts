import express from 'express';

import { authenticateUser } from '../middlewares';
import * as controller from './frequency-log.controller';

const router = express.Router();

router.post('/frequency-logs', authenticateUser, controller.post);
router.get('/frequency-logs/:frequencyId', authenticateUser, controller.getByFrequencyId);

export default router;
