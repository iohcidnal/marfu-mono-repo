import express from 'express';
import dotenv from 'dotenv';

import userRoutes from './user/user.routes';
import memberRoutes from './member/member.routes';
import medicationRoutes from './medication/medication.routes';
import frequencyLogRoutes from './frequency-log/frequency-log.routes';
import loadMiddlewares from './load-middlewares';
import connectDb from './database';

dotenv.config();
connectDb();

const app = loadMiddlewares();

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('marfu API');
});

app.use('/api', userRoutes, memberRoutes, medicationRoutes, frequencyLogRoutes);

export default app;
