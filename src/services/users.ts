import bcrypt from 'bcryptjs'
import jwt, { SignOptions } from 'jsonwebtoken';
import * as userDao from '../databases/users';
import { logErrorApp } from '../helpers/logger';
import { IUser } from '../interfaces/user';

export const authenticate = async (cedula: string, password: string,): Promise<{ error: number; token?: string, menu?: any, user?:IUser }> => {
    try {
        const user = await userDao.getUser(cedula);
        let loginSuccess = {
            valid: false,
            message: 'Error en el inicio de sesión'
        };
        if (!!user) {
            let userRole
            let menu = await getMenu(user.cod_perfil)

            loginSuccess.message = 'Invalid credentials: ERP'
            loginSuccess.valid = user.password ? bcrypt.compareSync(password, user.password) : false;
            if (loginSuccess.valid) {
                const signInOptions: SignOptions = {
                    expiresIn: process.env.JWTEXPIRATION
                };

                delete user.password;
                delete user.cedula;

                const token = jwt.sign(
                    { user },
                    (process.env.JWTSECRET as string) ?? 'secret',
                    signInOptions
                );
                return { error: 0, token, menu,user };
            }
        }
        return { error: 1 };
    } catch (e) {
        logErrorApp.error(`ERROR === { servicio:'users_service',error:${String(e)}  }`)
        return { error: 1 };
    }
};

const getMenu = async (rolerId: number) => {
    const menuIndex = await userDao.getMenuchildrenByRole(rolerId);
    return menuIndex
}

export const renewToken = async (cedula: string): Promise<{ error: string; token?: string }> => {
    try {
        const user = await userDao.getUser(cedula);
        const signInOptions: SignOptions = {
            expiresIn: process.env.JWTEXPIRATION
        };
        delete user.password;
        delete user.activo;
        delete user.cedula;
        const token = jwt.sign(
            { user },
            (process.env.JWTSECRET as string) ?? 'secret',
            signInOptions
        );
        return { error: '', token };
    } catch (e) {
        logErrorApp.error(`ERROR === { servicio:'users_service',error:${String(e)}  }`)
        return { error: 'Ups, error no catalogado' };
    }
};

export const createUser = async (user: IUser): Promise<{ createdUser: number; message: string }> => {
    try {

        const salt = bcrypt.genSaltSync();
        user.password = (user.password) && bcrypt.hashSync(user.password, salt)

        const userCreated = await userDao.getUser(user.cedula!)
        if(userCreated)throw new Error('Usuario con cédula '+ user.cedula +' ya esta creado')

        const userId = await userDao.createUser(user);
        return {
            createdUser: userId[0],
            message: 'User created',
        };
    } catch (err:any) {
        logErrorApp.error(`ERROR === { servicio:'users_service',error:${String(err)}  }`)
        throw new Error("Error Creating User" + err);
    }
};