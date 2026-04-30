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



export interface IUsuarioBonoBusqueda{
    cod_usuario:number,
    nombre:string,
    cedula:string,
    sexo:'F' | 'M',
    entidad:string,
    cargo_entidad:string,
    no_contrato:string,
    nit_entidad:string,
    redimido:boolean,
    
}
export const getBonos = async (filters: any)  => {

    let query = db
        .select(
           'u.cod_usuario',
           'u.nombre',
           'u.codigo',
           'u.cedula',
           'u.sexo',
           'e.nombre as entidad',
           'e.no_contrato',
           'e.nit',
            db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as cargo_entidad"),
        )
        .from('usuario as u')
        .join('entidad as e', 'e.cod_entidad', 'u.cod_entidad')
        .join('cargo_entidad as c', 'c.cod_cargo_entidad', 'u.cod_cargo_entidad')
        .where('u.cod_perfil',5)

    if (Object.entries(filters).length > 0) {
        Object.entries(filters).forEach(([key, value]) => {
            if (value) {
                switch (key) {
                    case 'codigo':
                        // TODO: Aca se pone un filtro solo por el primer caracter, toca volverlo a dejar de la otra forma
                        query.whereRaw('u.codigo = ?', [value]);
                        // query.whereRaw('LEFT(u.codigo, 1) = LEFT(?, 1)', [value]);
                        break;
                    case 'cedula':
                        query.whereRaw('u.cedula = ?', [value]);
                        break;
                    case 'cod_entidad':
                        query.whereRaw('e.cod_entidad = ?', [value]);
                        break;
                    case 'nit':
                        query.whereRaw('e.nit = ?', [value]);
                        break;
                    case 'no_contrato':
                        query.whereRaw(`UPPER(e.no_contrato) like '%${String(value).toUpperCase()}%'`);
                        break;
                }
            }
        });
    }
    query.orderBy('u.cod_usuario', 'desc');
    return await query;
}


export const getUsuarioBonoEntrega = (codUsuario:number) =>{
     return db
        .select('*')
        .from('usuario_bono_entrega')
        .where('cod_usuario', codUsuario)
}

export const redimirBonoEntrega = async (data: any, codUsuarioBonoEntrega: number) => {
    return await db('usuario_bono_entrega').where('cod_usuario_bono_entrega', codUsuarioBonoEntrega).update({
        data_entrega:data
    })
}