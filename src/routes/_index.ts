import express, { NextFunction, Request, Response } from 'express';

//Routes

import { router as usersRouter } from './users';
import { router as categoriaRouter } from './categoria';
import { router as productoRouter } from './producto';

//Apis externas

//Daemons


export const router = express.Router();

/* GET home page. */
router.get('', (req: Request, res: Response, next: NextFunction) => {
  res.json({ version: process.env.npm_package_version });
});

router.use('/users', usersRouter);
router.use('/categoria', categoriaRouter);
router.use('/producto', productoRouter);

