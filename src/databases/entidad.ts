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




export const getInfoContrato = (codEntidad:number): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre','e.nit', 'e.info_contrato')
        .from('entidad as e')
        .where('e.cod_entidad',codEntidad)
}

export const getEntidades = (): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre','e.nit', 'e.activo','e.gestionada')
        .from('entidad as e')
        .orderBy('e.activo', 'desc')
        .orderBy('e.cod_entidad')
}

export const crearEntidad = async (data: { nombre: string, cod_categorias: string }) => {
    return db('entidad').insert(data);
}

export const crearCargoEntidad = async (data: { nombre: string, cod_categorias: string }) => {
    return db('cargo_entidad').insert(data);
}

export const getInfoBasicaEntidad = (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('cod_entidad', 'nombre', 'activo','nit','info_contrato','no_contrato','fecha_inicio','fecha_final')
        .from('entidad')
        .where('cod_entidad', codEntidad)
}

export const actualizarEntidad = async (data: IEntidadInfoBasica, codEntidad: number) => {
    return await db('entidad').where('cod_entidad', codEntidad).update(data)
}

export const actualizarCargoEntidad = async (data: IEntidadInfoBasica, codCargoEntidad: number) => {
    return await db('cargo_entidad').where('cod_cargo_entidad', codCargoEntidad).update(data)
}

export const getUsuariosIdentidad= (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('u.cod_usuario','u.email','u.nombre','u.activo','u.sexo','u.cedula','u.cod_cargo_entidad', 'o.cod_orden','c.nombre as cargo_entidad')
        .from('usuario as u')
        .join('cargo_entidad as c','c.cod_cargo_entidad','u.cod_cargo_entidad')
        .leftJoin('orden as o','u.cod_usuario','o.cod_usuario')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil',3)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario','desc')
}

export const getUsuarioCoordinador= (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('u.cod_usuario','u.email','u.nombre','u.activo','u.sexo','u.cedula','o.cod_orden')
        .from('usuario as u')
        .leftJoin('orden as o','u.cod_usuario','o.cod_usuario')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil',2)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario','desc')
        .limit(1)
}

export const cargosEntidadResumen= (codEntidad: string): Promise<{cod_cargo_entidad:number, nombre:string}[]> => {
    return db
        .select('cod_cargo_entidad','nombre')
        .from('cargo_entidad')
        .where('cod_entidad', codEntidad)
}

export const cargoEntidadPorNombre = (codEntidad:number, cargo:string) =>{
    return db
        .select('cod_cargo_entidad','nombre')
        .from('cargo_entidad')
        .where('cod_entidad', codEntidad)
        .andWhere(db.raw('TRIM(UPPER(nombre)) = TRIM(UPPER(?))', [cargo.trim().toUpperCase()]));
}