import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IEntidadInfoBasica, IEntidadResumen, IFiltrosRedencionBonosTienda, IUsuarioEntidad } from '../interfaces/entidad';

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
        .select('ube.*', 'u.codigo', 'cbp.nombre as producto_cargo', 'cbp.valor')
        .from('usuario_bono_entrega as ube')
        .join('usuario as u', 'u.cod_usuario', 'ube.cod_usuario')
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
        .whereIn('ube.cod_usuario', codUsuarios)
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

export const getEntidadesReportesPorUsuario = async (codUsuario: number, buscarTienda?: boolean) => {
    return await db('usuario_bono_entrega as ube')
        .distinct('ube.cod_entidad', 'e.nombre')
        .join('entidad as e', 'ube.cod_entidad', 'e.cod_entidad')
        .whereRaw("JSON_EXTRACT(ube.data_entrega, '$.redimido') = 1")
        .modify((query) => {
            if (buscarTienda) {
                query.andWhere(function () {
                    // Existe id_tienda: validar mediante vendedor y su bodega.
                    this.whereExists(function () {
                        this.select(db.raw('1'))
                            .from('vendedor as v')
                            .where('v.cod_usuario', codUsuario)
                            .whereRaw(
                                `v.id_bodega = CAST(
                                    JSON_UNQUOTE(
                                        JSON_EXTRACT(ube.data_entrega, '$.id_tienda')
                                    ) AS UNSIGNED
                                )`
                            )
                            .whereRaw(
                                `JSON_CONTAINS_PATH(
                                    ube.data_entrega,
                                    'one',
                                    '$.id_tienda'
                                ) = 1`
                            );
                    })
                        // No existe id_tienda: mantener el filtro original.
                        .orWhere(function () {
                            this.whereRaw(
                                `JSON_CONTAINS_PATH(
                                ube.data_entrega,
                                'one',
                                '$.id_tienda'
                            ) = 0`
                            ).andWhereRaw(
                                "JSON_EXTRACT(ube.data_entrega, '$.cod_usuario') = ?",
                                [codUsuario]
                            );
                        });
                });
            } else {
                query.andWhereRaw(
                    "JSON_EXTRACT(ube.data_entrega, '$.cod_usuario') = ?",
                    [codUsuario]
                );
            }
        });
};

export const obtenerBonosRedimidosTienda = async (
    filtros: IFiltrosRedencionBonosTienda
) => {
    return db
        .select(
            'rbt.cod_redencion_bono_tienda',
            'rbt.bonos',
            'rbt.metodos_pago',
            'rbt.productos',
            'rbt.subtotal',
            'rbt.descuento',
            'rbt.total_pagado',
            'u.cedula as documento_usuario',
            'u.nombre as nombre_usuario',
            'u2.cedula as documento_cliente',
            'u2.nombre as nombre_cliente',
            'rbt.fecha_creacion',
            'rbt.id_tienda'
        )
        .from('redencion_bono_tienda as rbt')
        .join('usuario as u', 'u.cod_usuario', 'rbt.cod_usuario')
        .leftJoin('usuario as u2', function () {
            this.on(
                'u2.cod_usuario',
                '=',
                db.raw(`(
                    SELECT u3.cod_usuario
                    FROM usuario AS u3
                    WHERE u3.cedula = rbt.documento
                    ORDER BY u3.cod_usuario DESC
                    LIMIT 1
                )`)
            );
        })
        .where("rbt.id_tienda",filtros.id_tienda)
        .modify((query) => {
            if (filtros.documento_cliente) {
                query.where('rbt.documento',filtros.documento_cliente);
            } else {
                if (filtros.fecha_inicial) {
                    query.where('rbt.fecha_creacion','>=',`${filtros.fecha_inicial} 00:00:00`);
                }

                if (filtros.fecha_final) {
                    query.where('rbt.fecha_creacion','<=',`${filtros.fecha_final} 23:59:59`);
                }
            }
        })
        .orderBy('rbt.fecha_creacion', 'desc');
};


export const obtenerDetalleBonoRedimido = (codRedencionBono: number) => {
    return db
        .select(
            'rbt.*',
            'u.cedula as documento_usuario',
            'u.nombre as nombre_usuario',
            'u2.cedula as documento_cliente',
            'u2.nombre as nombre_cliente',
             'e.nombre as entidad',
            'e.no_contrato',
            'e.nit'
        )
        .from('redencion_bono_tienda as rbt')
        .join('usuario as u', 'u.cod_usuario', 'rbt.cod_usuario')
        .leftJoin('usuario as u2', function () {
            this.on(
                'u2.cod_usuario',
                '=',
                db.raw(`(
                    SELECT u3.cod_usuario
                    FROM usuario AS u3
                    WHERE u3.cedula = rbt.documento
                    ORDER BY u3.cod_usuario DESC
                    LIMIT 1
                )`)
            );
        })
        .join('entidad AS e','e.cod_entidad','u2.cod_entidad')
        .where("rbt.cod_redencion_bono_tienda",codRedencionBono)
        .first();
}


export const infoBonoEntregado = async (codUsuarioBonoEntrega:number)=>{
    return db
        .select(
            'ube.cod_usuario_bono_entrega',
            'cbp.cod_cargo_entidad',
            'cbp.nombre as cargo_bono_producto',
            'cbp.descripcion as descripcion_bono_producto',
            'ce.nombre as cargo_entidad',
            'cbp.nombre',
            'cbp.descripcion',
            'cbp.valor'
        )
        .from('usuario_bono_entrega AS ube')
        .join(
            'cargo_bonos_producto AS cbp',
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.cod_cargo_bonos_producto')) = cbp.cod_cargo_bonos_producto`)
        )
        .join('cargo_entidad AS ce','cbp.cod_cargo_entidad','ce.cod_cargo_entidad')
        .join('usuario AS u','ube.cod_usuario','u.cod_usuario')
        .where('ube.cod_usuario_bono_entrega', codUsuarioBonoEntrega)
        .first()
}


export const codigosUsuarioBonoEntrega = async (codUsuario:number[])=>{
    return db
        .select(
            'codigo'
        )
        .from('usuario')
        .whereIn('cod_usuario', codUsuario)
}

