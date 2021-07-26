import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import session from 'express-session';
import MongoStore from 'connect-mongo';

export default function loadMiddlewares() {
  const app = express();

  app.use(express.json());
  app.use(
    cors({
      credentials: true,
      origin: [process.env.APPHOST as string]
    })
  );
  app.use(cookieParser());
  app.use(
    session({
      name: 'marfu.sid',
      secret: process.env.SECRET as string,
      resave: true,
      saveUninitialized: false,
      store: MongoStore.create({
        mongoUrl: process.env.DB_URL
      })
    })
  );

  return app;
}
