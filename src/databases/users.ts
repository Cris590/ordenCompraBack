import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IMenuChild, IUser } from '../interfaces/user';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));



export async function getUser(cedula: string): Promise<IUser> {
  return db
    .select("u.*","e.nombre as entidad","e.nit")
    .from("usuario as u")
    .leftJoin("entidad as e","u.cod_entidad","e.cod_entidad")
    .where('u.cedula', cedula)
    .first()
}

export async function addRolesToUser(user: IUser): Promise<IUser> {
  const userRoles = await db
    .select(['ur.role as roleId', 'r.name'])
    .from({ ur: 'user_role' })
    .join({ r: 'role' }, 'ur.role', 'r.roleId')
    .where('usuario', user.cod_usuario)
  return user;
}

export async function getMenuchildrenByRole(cod_perfil: number): Promise<IMenuChild[]> {
  return await db
    .select("cod_menu", "label", "route", "icono","visible")
    .from('menu as m')
    .whereRaw(`JSON_CONTAINS(perfil ,'[` + cod_perfil + `]')`)
    .where('activo', 1)
    .orderBy('orden');
}

export async function getRoleByUserId(userId: number): Promise<any> {
  return db
    .select(db.raw("JSON_ARRAYAGG(a.role) as role"))
    .from({ a: 'user_role' })
    .where('user', userId);
}

export async function createUser(user: Partial<IUser> | IUser[]): Promise<number[]> {
  return await db('usuario').insert(user)
}

export const editarUsuario = async (data: Partial<IUser>, codUsuario: number) => {
  return db("usuario")
    .update(data)
    .where({ cod_usuario: codUsuario });

}
