import express from 'express';
import { Request, Response } from 'express';

const app = express();

app.get('/api', (req: Request, res: Response) => {
  res.send({
    message: 'hello from the other side...'
  });
});

export default app;
