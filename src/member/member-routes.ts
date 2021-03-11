import express from 'express';
import * as controller from './member-controller';

const router = express.Router();

router.post('/members', controller.post);
router.get('/members', controller.get);

export default router;
