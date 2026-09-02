import express, { NextFunction, Request, Response } from 'express';
import { jwtInterno, jwtApiExterna } from '../helpers/jwt';

export const excludeDaemonsMiddleware = (req: Request, res: Response, next: NextFunction) => {
    console.log('------------------')
    console.log(req.path)
    if (req.path.startsWith('/daemons/') || req.path.startsWith('/external/externalLogin') || req.path.startsWith('/ecommerce/webhook_woocomerce') ) {
        return next();
    } else if (req.path.startsWith('/external')) {
        return jwtApiExterna()(req, res, next);
    } else {
        return jwtInterno()(req, res, next);
    }
}