import express from 'express';

import { validateUser } from '../middlewares';
import * as controller from './member.controller';

const router = express.Router();

router.post('/members', validateUser, controller.post);
router.get('/members', validateUser, controller.get);
router.put('/members', validateUser, controller.put);
router.delete('/members/:id', validateUser, controller.deleteById);

export default router;
