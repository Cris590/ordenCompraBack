import Knex from 'knex';

import config from '../../knexfile';
import { logCrm, logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IEntidadInfoBasica, IEntidadResumen, IUsuarioEntidad } from '../interfaces/entidad';

const db = Knex(config.development);
const dbCrm = Knex(config.crmbrt);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));

dbCrm.on('query', (message: any) => logCrm.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logCrm.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logCrm.info(formatMessages.responseFormat(message)));
   

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export const getUsuariosAplicacionCompleta = () =>{
     return db
        .select('u.cod_usuario','u.email','u.nombre','u.cedula as usuario','p.nombre as perfil','u.cod_perfil','u.entidades','v.id_usuario_crm','v.id_bodega')
        .from('usuario as u')
        .join('perfil as p','u.cod_perfil','p.cod_perfil')
        .leftJoin('vendedor as v','v.cod_usuario','u.cod_usuario')
        .where('p.perfil_aplicacion_completa',1)
}



export const obtenerPerfilesAplicacion = () =>{
     return db
        .select('cod_perfil','nombre')
        .from('perfil')
        .where('perfil_aplicacion_completa',1)
}

export const crearVendedor = async (data: {cod_usuario:number, id_usuario_crm:number, id_bodega:number }) => {
    return db('vendedor').insert(data);
}

export const actualizarVendedorCrm = async (idUsuario:number, data: any) => {
    return dbCrm('usuarios').where('id', idUsuario).update(data)
}

export const actualizarVendedor = async (codUsuario:number, data: { id_usuario_crm:number, id_bodega:number }) => {
    return db('vendedor').where('cod_usuario', codUsuario).update(data)
}

 


