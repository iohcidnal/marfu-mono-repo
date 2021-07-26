import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export default function loadMiddlewares() {
  const app = express();
  app.enable('trust proxy');
  app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', req.headers.origin);
    res.header('Access-Control-Allow-Methods', 'PUT, GET, POST, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', [
      'Accept',
      'Authorization',
      'Content-Type',
      'X-Requested-With',
      'X-HTTP-Method-Override'
    ]);

    next();
  });
  app.use(express.json());
  app.use(cookieParser());
  app.use(
    cors({
      credentials: true,
      origin: [process.env.APPHOST as string]
    })
  );
  app.use(
    session({
      name: 'marfu.sid',
      secret: process.env.SECRET as string,
      resave: true,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DB_URL
      }),
      rolling: true,
      proxy: true,
      cookie: {
        secure: true,
        maxAge: 5184000000 // 2 months
      }
    })
  );

  return app;
}
