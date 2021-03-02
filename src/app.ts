import express from 'express';
import routes from './routes';

const app = express();

app.get('/', (req: express.Request, res: express.Response) => {
  res.status(200).send('marfu API');
});

app.use('/api', routes);

export default app;
