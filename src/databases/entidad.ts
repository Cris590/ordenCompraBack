import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IEntidadInfoBasica, IEntidadResumen, IUsuarioEntidad } from '../interfaces/entidad';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));




export const getInfoContrato = (codEntidad:number): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre','e.nit', 'e.info_contrato','no_contrato','fecha_inicio','fecha_final', 
            'gestionada','fecha_gestionada','entrega_bonos', 'no_orden','direccion','ciudad')
        .from('entidad as e')
        .where('e.cod_entidad',codEntidad)
}

export const getEntidades = (): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre','e.nit', 'e.activo','e.gestionada','e.fecha_gestionada','e.entrega_bonos')
        .from('entidad as e')
        .orderBy('e.activo', 'desc')
        .orderBy('e.fecha_gestionada', 'asc')
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

export const getUsuariosEntidadCorreo= (codEntidad: string | number): Promise<IUsuarioEntidad[]> => {
    return db
        .select('u.email','u.nombre','u.cedula','u.raw_pass as pasword')
        .from('usuario as u')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil',3)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario','desc')
}

export const getUsuariosIdentidad= (codEntidad: string | number): Promise<IUsuarioEntidad[]> => {
    return db
        .select('u.cod_usuario','u.email','u.nombre','u.activo','u.sexo','u.cedula','u.cod_cargo_entidad',
             'o.cod_orden', db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as cargo_entidad"))
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
        .select('cod_cargo_entidad','nombre','lote')
        .from('cargo_entidad')
        .where('cod_entidad', codEntidad)
}

export const cargoEntidadPorNombre = (codEntidad:number, cargo:string, lote:number) =>{
    return db
        .select('cod_cargo_entidad','nombre')
        .from('cargo_entidad')
        .where('cod_entidad', codEntidad)
        .andWhere('lote',lote)
        .andWhere(db.raw('TRIM(UPPER(nombre)) = TRIM(UPPER(?))', [cargo.trim().toUpperCase()]));
}



export const categoriasPorCargo = (codEntidad:number ):Promise< { cod_categorias:string, nombre:string}[]> =>{
    return db
        .select('c.cod_categorias', db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as nombre"))
        .from('cargo_entidad as c')
        .where('c.cod_entidad',codEntidad) 
}

export const getProductosEntidad = (categorias:number[] ): Promise<any[]> => {
    return db
        .select('p.cod_producto', 'p.cod_categoria','p.nombre','p.tiene_talla','p.tiene_color','p.talla','c.nombre as categoria', 'c.cod_categoria')
        .from('producto as p')
        .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
        .whereIn('p.cod_categoria',categorias)
        .andWhere('p.activo',1)
        .andWhere('c.activo',1)
}