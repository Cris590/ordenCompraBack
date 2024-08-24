import express, { NextFunction, Request, Response } from 'express';
import * as externalLoginService from '../services/api/externalLogin';
interface RequestValidated extends Request {
    auth: any
}

export const validateApiRoute = async (req: Request, res: Response, next: NextFunction) => {
    let reqAux = req as RequestValidated
    if (!(req.path.startsWith('/external')) || req.path.startsWith('/external/externalLogin')) {
        return next();
    } else {
        const userpermission = await externalLoginService.checkPermission(reqAux.auth.user_api, req.path)
        if (userpermission.length > 0) {
            return next();
        } else {
            return res.status(401).send({
                error: 1,
                message: 'User not Authorized'
            })
        }
    }
}