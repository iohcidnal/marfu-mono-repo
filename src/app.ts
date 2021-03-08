import express from 'express';
import bodyParser from 'body-parser';
import dotenv from 'dotenv';

import connectDb from './database';
import userRoutes from './users/user-routes';

dotenv.config();

const app = express();
app.use(bodyParser.json());

connectDb();

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('marfu API');
});

app.use('/api', userRoutes);

export default app;
