import jwt, { SignOptions } from 'jsonwebtoken';

import * as userBD from '../../databases/api/externalLogin';
import * as generalService from '../../services/general';
import { IUserLogin } from '../../interfaces/api/externalLogin';
import { blackbox } from '../../helpers/logger';

export const authenticate = async (user: IUserLogin): Promise<{ error: number; message?: string }> => {
    try {
        const useractive = await userBD.getUser(user.cedula, user.password);

        if (useractive.length > 0) {
            const jwtExpirationExternal = await generalService.getTableInformation('variable', 'nombre', 'JWT_EXPIRACION_EXTERNO');

            console.log('------------')
            console.log(jwtExpirationExternal[0].valor)
            const signInOptions: SignOptions = {
                expiresIn: jwtExpirationExternal[0]['valor']
            };
            const token = jwt.sign(
                { user_api: useractive[0]['cod_user_api'] },
                (process.env.JWTSECRET2 as string) ?? 'secret',
                signInOptions
            );
            return { error: 0, message: token };
        }
        return { error: 1, message: 'Incorrect credentials' };
    } catch (err) {
        throw new Error("Login failed");
    }
};
export const checkPermission = async (user_api: number, endpoint: string): Promise<any> => {
    return await userBD.getUserPermission(user_api, endpoint);
};