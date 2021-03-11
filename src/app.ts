import express from 'express';
import dotenv from 'dotenv';

import connectDb from './database';
import userRoutes from './user/user-routes';
import memberRoutes from './member/member-routes';

dotenv.config();

const app = express();
app.use(express.json());

connectDb();

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('marfu API');
});

app.use('/api', userRoutes, memberRoutes);

export default app;
