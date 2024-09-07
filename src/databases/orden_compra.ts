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



export const getUsuariosEntidad = (codUsuario:number): Promise<any[]> => {
    return db
        .select('e.cod_categorias', 'u.sexo')
        .from('usuario as u')
        .join('entidad as e', 'u.cod_entidad','e.cod_entidad')
        .where('u.cod_usuario',codUsuario)
        .andWhere('u.activo',1)
        .andWhere('u.cod_perfil',3)
        .andWhere('e.activo',1)
        
}

export const getProductosEntidades = (entidades:number[] , sexo:string): Promise<any[]> => {
    return db
        .select('p.cod_producto', 'p.cod_categoria','p.nombre','p.tiene_talla','p.tiene_color','p.talla','c.nombre as categoria', 'c.cod_categoria')
        .from('producto as p')
        .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
        .whereIn('p.cod_categoria',entidades)
        .andWhereRaw(`JSON_CONTAINS(c.sexo ,'["${sexo}"]')`)
        .andWhere('p.activo',1)
        .andWhere('c.activo',1)
}

export const getProductoDetalleMostrar = (codProducto:number): Promise<any[]> => {
    return db
        .select('p.cod_producto', 'p.cod_categoria','p.nombre','p.tiene_talla','p.tiene_color','p.talla','p.descripcion',
            'c.nombre as categoria', 'c.cod_categoria','t.imagen as url_tallaje')
        .from('producto as p')
        .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
        .leftJoin('tallaje as t', function() {
            this.on('p.cod_tallaje', 't.cod_tallaje')
            .andOn(db.raw('t.activo = ?', [1]));; // Solo trae tallajes activos
          })
        .where('p.cod_producto', codProducto)
        .andWhere('p.activo',1)
        .andWhere('c.activo',1)
}

export const getCategoriaActiva = (codCategoria:number): Promise<any[]> => {
    return db
        .select('nombre')
        .from('categoria as c')
        .where('cod_categoria',codCategoria)
        .andWhere('activo',1)       
}

export const getColoresProducto = (cod_producto: number):Promise<{
    color: string;
    color_descripcion: string;
    cod_producto_color:number
}[]> => {
  return db
    .select('cod_producto_color','color','color_descripcion')
    .from('producto_color')
    .where('cod_producto',cod_producto)
}


export const getImagenesPorColor = (codProductoColor: number):Promise<{url:string}[]> => {
  return db
    .select('url')
    .from('producto_color_imagen')
    .where('cod_producto_color',codProductoColor)
}
