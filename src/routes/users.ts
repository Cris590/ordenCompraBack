import dotenv from 'dotenv';
import express, { Request, Response } from 'express';
import { blackbox } from '../helpers/logger';
import * as userService from '../services/users';
import { logErrorApp } from '../helpers/logger';
import { reqValidator } from '../helpers/req-validator';
import { IUserLogin } from '../interfaces/api/externalLogin';
import { IUser } from '../interfaces/user';

dotenv.config();

export const router = express.Router();

router.post('/authentication', (req: Request, res: Response) => {
  // #swagger.tags = ['Users']
  // TODO: is not validating required params
  blackbox.info(process.env.DBHOST);
  const app = express();
  // const enviroment = app.settings.env;
  userService
    .authenticate(req.body.cedula, req.body.password)
    .then((userAuthenticated) => {
      res.send(userAuthenticated);
    })
    .catch((err: Error) => {
      logErrorApp.error(`ERROR === { servicio:'users_route',error:${String(err)}  }`)
      res.status(500).send(err.message);
    });
});


router.post('', async (req: Request, res: Response) =>  {
    // #swagger.tags = ['Users']
        let status = 201
        let user = req.body
        await userService
          .createUser(user as IUser)
          .then(async (createdUser) => {
            if (
              (createdUser as { createdUser: number; message: string }).createdUser >
              0
            ) {
              status = 201;
            } else {
              status = 400;
            }
            res.status(status).send(createdUser);
          })
          .catch((err: Error) => {
            res.status(500).send(err.message);
          });
  
  });