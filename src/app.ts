import express from 'express';
import { Request, Response } from 'express';

const app = express();

app.get('/', (req: Request, res: Response) => {
  res.send({
    message: 'hello from the other side!'
  });
});

console.log('process.env.NODE_ENV :>> ', process.env.NODE_ENV);
if (process.env.NODE_ENV === 'development') {
  app.listen(3000, () => {
    console.log('Server started at http://localhost:3000');
  });
}

export default app;
