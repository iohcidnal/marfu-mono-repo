import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';

export default function loadMiddlewares() {
  const app = express();

  app.use(express.json());
  app.use(cors());
  app.use((req, res, next) => {
    // For debugging:
    // res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Origin', process.env.APPHOST);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'X-HTTP-Method-Override'
    ]);
    res.set('Access-Control-Expose-Headers', 'user-id');

    next();
  });
  app.use(cookieParser());

  return app;
}
