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



export interface IUsuarioBonoBusqueda {
    cod_usuario: number,
    nombre: string,
    cedula: string,
    sexo: 'F' | 'M',
    entidad: string,
    cargo_entidad: string,
    no_contrato: string,
    nit_entidad: string,
    redimido: boolean,

}
export const getBonos = async (filters: any) => {

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
        .where('u.cod_perfil', 5)
        .andWhere('u.activo', 1)

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


export const getUsuarioBonoEntrega = (codUsuario: number) => {
    return db
        .select('*')
        .from('usuario_bono_entrega')
        .where('cod_usuario', codUsuario)
}

export const redimirBonoEntrega = async (data: any, codUsuarioBonoEntrega: number) => {
    return await db('usuario_bono_entrega').where('cod_usuario_bono_entrega', codUsuarioBonoEntrega).update({
        data_entrega: data
    })
}


export const getBonosUsuario = async (documento: string) => {

    return await db
        .select(
            'u.cod_entidad',
            'u.nombre',
            'u.cedula',
            'u.sexo',
            'e.nombre as entidad',
            'e.no_contrato',
            'e.nit',
            db.raw('COUNT(*) as cantidad_codigos'),
            db.raw('GROUP_CONCAT(u.cod_usuario) as cod_usuarios')
        )
        .from('usuario as u')
        .join('entidad as e', 'e.cod_entidad', 'u.cod_entidad')
        .join('cargo_entidad as c', 'c.cod_cargo_entidad', 'u.cod_cargo_entidad')
        .where('u.cod_perfil', 5)
        .andWhere('u.activo', 1)
        .andWhere('u.cedula', documento)
        .groupBy('u.cod_entidad');
}

export const getUsuarioBonoEntregaAgrupado = (codUsuarios: number[]) => {
    return db
        .select('*')
        .from('usuario_bono_entrega')
        .whereIn('cod_usuario', codUsuarios)
}


export const getBonosUsuarioRedencion = async (codUsuarios: number[]) => {
    return await db
        .select(
            'ube.cod_usuario_bono_entrega',
            db.raw(`
            CONCAT(u.codigo,'_',ce.nombre,'_',cbp.nombre) AS codigo_bono
        `),
            'cbp.nombre',
            'cbp.descripcion',
            'cbp.valor'
        )
        .from('usuario_bono_entrega AS ube')
        .join(
            'cargo_bonos_producto AS cbp',
                db.raw(`
                JSON_UNQUOTE(
                    JSON_EXTRACT(
                        ube.data_entrega,
                        '$.cod_cargo_bonos_producto'
                    )
                ) = cbp.cod_cargo_bonos_producto
            `)
        )
        .join(
            'cargo_entidad AS ce',
            'cbp.cod_cargo_entidad',
            'ce.cod_cargo_entidad'
        )
        .join(
            'usuario AS u',
            'ube.cod_usuario',
            'u.cod_usuario'
        )
        .whereIn('ube.cod_usuario', codUsuarios)
        .andWhereRaw("JSON_EXTRACT(ube.data_entrega, '$.redimido') = 0");
}


export const geInfoClienteRendecion = async (codUsuario: number) => {
    return await db
    .select(
        'u.cedula as documento',
        'u.nombre',
        'e.nombre as entidad',
        'e.cod_entidad',
        'e.no_contrato',
        'e.fecha_inicio',
        'e.fecha_final'
    )
    .from('usuario as u')
    .join('entidad as e', 'u.cod_entidad', 'e.cod_entidad')
    .where('u.cod_usuario', codUsuario)
    .first();
}


export const crearRedencionVenta = async (redencion: any) => {
    return db('redencion_bono_tienda').insert(redencion);
}
