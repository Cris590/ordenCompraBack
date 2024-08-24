import express, { NextFunction, Request, Response } from 'express';
import { jwtInterno, jwtApiExterna } from '../helpers/jwt';

export const excludeDaemonsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (req.path.startsWith('/daemons/') || req.path.startsWith('/external/externalLogin')) {
        return next();
    } else if (req.path.startsWith('/external')) {
        return jwtApiExterna()(req, res, next);
    } else {
        return jwtInterno()(req, res, next);
    }
}