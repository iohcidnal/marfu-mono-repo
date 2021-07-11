import express from 'express';

import { validateUser } from '../middlewares';
import * as controller from './member.controller';

const router = express.Router();

router.post('/members', validateUser, controller.post);
router.get('/members', validateUser, controller.getAll);
router.get('/members/:id', validateUser, controller.getById);
router.post('/members/dashboard', validateUser, controller.getAllForDashboard);
router.put('/members', validateUser, controller.put);
router.delete('/members/:id', validateUser, controller.deleteById);

export default router;
