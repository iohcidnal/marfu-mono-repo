import express from 'express';

import { validateUser } from '../middlewares';
import * as controller from './medication.controller';

const router = express.Router();

router.post('/medications', validateUser, controller.post);
router.get('/medications/members/:memberId', validateUser, controller.getAllByMemberId);
router.put('/medications', validateUser, controller.put);
router.delete('/medications/:id', validateUser, controller.deleteById);

export default router;
