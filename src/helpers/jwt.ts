import { RequestHandler } from 'express';
import { expressjwt } from 'express-jwt';

/**
 * Valida token recibido
 * @return {*}
 */
export const jwtInterno = (): RequestHandler => {
  return expressjwt({
    secret: (process.env.JWTSECRET as string) ?? 'secret',
    requestProperty: 'auth',
    algorithms: ['HS256'],
    onExpired: async (req, err) => {
      throw err;
    },
  }).unless({
    path: ['/api/users/authentication', /^\/api\/jobs\//, '/api/client'],
  }) as RequestHandler;
};
export const jwtApiExterna  = (): RequestHandler => {
  return expressjwt({
    secret: (process.env.JWTSECRET2 as string) ?? 'secret',
    requestProperty: 'auth',
    algorithms: ['HS256'],
    onExpired: async (req, err) => {
      throw err;
    },
  }).unless({
    path: ['/api/users/authentication', /^\/api\/jobs\//],
  }) as RequestHandler;
};