import Knex from 'knex';

import config  from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IMenuChild, IUser } from '../interfaces/user';
import { IProductoResumen } from '../interfaces/producto';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message:any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message:any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message:any) => logDatabasePYS.info(formatMessages.responseFormat(message)));



export const getProductos = (): Promise<IProductoResumen[]> => {
  return db
    .select('p.cod_producto','p.nombre', 'p.color','p.talla', 'p.activo','p.tiene_talla','p.tiene_color', 'c.nombre as categoria', 'c.sexo')
    .from('producto as p')
    .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
}

export const getColoresProductoResumen = ( cod_producto:number ): Promise<{color:string , color_descripcion:string}[]> => {
  return db
    .select('color','color_descripcion')
    .from('producto_color')
    .where('cod_producto',cod_producto)
}



export const getProductoDetalle = (codProducto:string): Promise<IProductoResumen[]> => {
  return db
    .select('p.cod_producto','p.nombre', 'p.color','p.talla', 'p.activo','p.tiene_talla','p.tiene_color', 'c.cod_categoria',  'c.sexo')
    .from('producto as p')
    .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
    .where('p.cod_producto', codProducto)
}

export const getInfoBasicaProducto = (codProducto:string): Promise<IProductoResumen[]> => {
  return db
    .select('cod_producto','nombre','p.cod_categoria',  'p.activo')
    .from('producto as p')
    .where('p.cod_producto', codProducto)
}

export const insertarImagenProductoColor = async (data: { url:string, cod_producto_color:string }) => {
  return db('producto_color_imagen').insert(data);
}