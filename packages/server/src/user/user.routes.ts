import express from 'express';

import * as controller from './user.controller';
import { validateNewUser } from './user.middlewares';
import { authenticateUser } from '../middlewares';

const router = express.Router();

router.post('/users', validateNewUser, controller.post);
router.post('/users/authenticate', controller.authenticate);
router.put('/users', authenticateUser, controller.put);

export default router;
