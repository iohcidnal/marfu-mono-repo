import express from 'express';

import { validateUser } from '../middlewares';
import * as controller from './medication.controller';

const router = express.Router();

router.post('/medications', validateUser, controller.post);
router.get('/medications/:memberId', validateUser, controller.get);
router.put('/medications', validateUser, controller.put);

export default router;
