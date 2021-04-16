import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDb from './database';
import userRoutes from './user/user.routes';
import memberRoutes from './member/member.routes';
import medicationRoutes from './medication/medication.routes';
import frequencyLogRoutes from './frequency-log/frequency-log.routes';

dotenv.config();

const app = express();
app.use(express.json());
// TODO: Limit cors origin
app.use(cors());

connectDb();

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('marfu API');
});

app.use('/api', userRoutes, memberRoutes, medicationRoutes, frequencyLogRoutes);

export default app;
