import express, { NextFunction, Request, Response } from 'express';

//Routes

import { router as usersRouter } from './users';
import { router as categoriaRouter } from './categoria';
import { router as productoRouter } from './producto';
import { router as tallajeRouter } from './tallaje';
import { router as entidadRouter } from './entidad';

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
router.use('/tallaje', tallajeRouter);
router.use('/entidad', entidadRouter);


