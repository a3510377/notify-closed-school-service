import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import router from '@/routes';

export const createServer = () => {
  const app = express();

  app
    .use(cors())
    .use(morgan('dev'))
    .use(express.json())
    .use(express.urlencoded({ extended: false }));

  app.use(router);

  return app;
};
