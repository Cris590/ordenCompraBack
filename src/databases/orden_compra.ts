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



export const getUsuariosEntidad = (codUsuario: number): Promise<any[]> => {
    return db
        .select('c.cod_categorias', 'u.sexo')
        .from('usuario as u')
        .join('cargo_entidad as c', 'u.cod_cargo_entidad', 'c.cod_cargo_entidad')
        .where('u.cod_usuario', codUsuario)
        .andWhere('u.activo', 1)
        .andWhere('u.cod_perfil', 3)
}

export const getProductosEntidades = (entidades: number[], sexo: string): Promise<any[]> => {
    return db
        .select('p.cod_producto', 'p.cod_categoria', 'p.nombre', 'p.tiene_talla', 'p.tiene_color', 'p.talla', 'c.nombre as categoria', 'c.cod_categoria')
        .from('producto as p')
        .join('categoria as c', 'c.cod_categoria', 'p.cod_categoria')
        .whereIn('p.cod_categoria', entidades)
        .andWhereRaw(`JSON_CONTAINS(c.sexo ,'["${sexo}"]')`)
        .andWhere('p.activo', 1)
        .andWhere('c.activo', 1)
}

export const getProductoDetalleMostrar = (codProducto: number): Promise<any[]> => {
    return db
        .select('p.cod_producto', 'p.cod_categoria', 'p.nombre', 'p.tiene_talla', 'p.tiene_color', 'p.talla', 'p.descripcion',
            'c.nombre as categoria', 'c.cod_categoria', 't.imagen as url_tallaje')
        .from('producto as p')
        .join('categoria as c', 'c.cod_categoria', 'p.cod_categoria')
        .leftJoin('tallaje as t', function () {
            this.on('p.cod_tallaje', 't.cod_tallaje')
                .andOn(db.raw('t.activo = ?', [1]));; // Solo trae tallajes activos
        })
        .where('p.cod_producto', codProducto)
        .andWhere('p.activo', 1)
        .andWhere('c.activo', 1)
}

export const getCategoriaActiva = (codCategoria: number): Promise<any[]> => {
    return db
        .select('nombre', 'sexo')
        .from('categoria as c')
        .where('cod_categoria', codCategoria)
        .andWhere('activo', 1)
}

export const getColoresProducto = (cod_producto: number): Promise<{
    color: string;
    color_descripcion: string;
    cod_producto_color: number
}[]> => {
    return db
        .select('cod_producto_color', 'color', 'color_descripcion')
        .from('producto_color')
        .where('cod_producto', cod_producto)
}


export const getImagenesPorColor = (codProductoColor: number): Promise<{ url: string }[]> => {
    return db
        .select('url')
        .from('producto_color_imagen')
        .where('cod_producto_color', codProductoColor)
}



export const crearOrdenCompra = async (data: any) => {
    return db('orden').insert(data);
}

export const validarOrden = async (codUsuario: number) => {
    return db
        .select("o.*", db.raw("CONVERT_TZ(o.fecha_creacion, '+00:00', '-05:00') AS fecha_creacion_local")
            , "u.nombre as usuario_creacion", "e.direccion", "e.ciudad")
        .from('orden as o')
        .leftJoin('usuario as u', 'o.cod_usuario_creacion', 'u.cod_usuario')
        .leftJoin('entidad as e', 'e.cod_entidad', 'u.cod_entidad')
        .where('o.cod_usuario', codUsuario)
}

export const obtenerInfoUsuario = async (codUsuario: number) => {
    return db
        .select('u.cod_usuario', 'e.nombre as entidad', 'e.nit', 'u.nombre as usuario', 'u.cedula', 'c.nombre as cargo_entidad', 'u.sexo')
        .from('usuario as u')
        .join('entidad as e', 'e.cod_entidad', 'u.cod_entidad')
        .join('cargo_entidad as c', 'c.cod_cargo_entidad', 'u.cod_cargo_entidad')
        .where('u.cod_usuario', codUsuario)
        .andWhere('u.activo', 1)
        .limit(1)
}

export const obtenerCoordinadorDeEntidad = async (codEntidad: number) => {
    return db
        .select('u.cod_usuario as cod_usuario_coordinador', 'u.nombre as coordinador')
        .from('usuario as u')
        .join('entidad as e', 'e.cod_entidad', 'u.cod_entidad')
        .where('e.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil', 2)
        .andWhere('u.activo', 1)
        .limit(1)
}

export const obtenerUsuariosCoordinador = (codEntidad: number): Promise<any[]> => {
    return db
        .select('u.cod_usuario', 'u.email', 'u.nombre', 'u.activo', 'u.sexo', 'u.cedula', 'u.cod_cargo_entidad', 'o.cod_orden',
            db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as cargo_entidad"))
        .from('usuario as u')
        .join('cargo_entidad as c', 'c.cod_cargo_entidad', 'u.cod_cargo_entidad')
        .leftJoin('orden as o', 'u.cod_usuario', 'o.cod_usuario')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil', 3)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario', 'desc')
}

export const obtenerReporteBonosRedimidos = (codUsuario: number): Promise<any[]> => {
    return db('usuario_bono_entrega as ube')
        .select(
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.fecha_redimido')) as fecha_redimido`),
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.comentario_cierre')) as comentario_cierre`),
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.cedula_vendedor')) as cedula_vendedor`),
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.nombre_vendedor')) as nombre_vendedor`),
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.tienda')) as tienda`),
            'u2.nombre',
            'u2.cedula',
            'u2.codigo',
            'u2.sexo',
            'cbp.valor',
            'cbp.descripcion',
            'e.nombre as entidad',
            'e.no_contrato'
        )
        .join('usuario as u', function () {
            this.on(
                'u.cod_usuario',
                '=',
                db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.cod_usuario'))`)
            );
        })
        .join('entidad as e', 'u.cod_entidad', 'e.cod_entidad')
        .join('usuario as u2', 'u2.cod_usuario', 'ube.cod_usuario')
        .join('cargo_bonos_producto as cbp', function () {
            this.on(
                'cbp.cod_cargo_bonos_producto',
                '=',
                db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.cod_cargo_bonos_producto'))`)
            );
        })
        .where(
            db.raw(`JSON_UNQUOTE(JSON_EXTRACT(ube.data_entrega, '$.redimido'))`),
            '=',
            '1'
        )
        .andWhere('u.cod_usuario', codUsuario)
        .orderBy('fecha_redimido','desc');

}