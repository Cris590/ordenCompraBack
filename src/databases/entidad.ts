import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IEntidadInfoBasica, IEntidadResumen } from '../interfaces/entidad';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));



export const getEntidades = (): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre', 'e.activo')
        .from('entidad as e')
        .orderBy('e.activo', 'desc')
        .orderBy('e.cod_entidad')
}

export const crearEntidad = async (data: { nombre: string, cod_categorias: string }) => {
    return db('entidad').insert(data);
}

export const getInfoBasicaEntidad = (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('cod_entidad', 'nombre', 'cod_categorias', 'activo')
        .from('entidad')
        .where('cod_entidad', codEntidad)
}

export const actualizarEntidad = async (data: IEntidadInfoBasica, codEntidad: number) => {
    return await db('entidad').where('cod_entidad', codEntidad).update(data)
}

export const getUsuariosIdentidad= (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('u.cod_usuario','u.email','u.nombre','u.activo','u.sexo','u.cedula','o.cod_orden')
        .from('usuario as u')
        .leftJoin('orden as o','u.cod_usuario','o.cod_usuario')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil',3)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario','desc')
}