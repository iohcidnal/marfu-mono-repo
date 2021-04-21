import express from 'express';

import { validateUser } from '../middlewares';
import * as controller from './frequency-log.controller';

const router = express.Router();

router.post('/frequency-logs', validateUser, controller.post);
router.get('/frequency-logs/:frequencyId', validateUser, controller.getByFrequencyId);
router.put('/frequency-logs', validateUser, controller.put);

export default router;
