import Knex from 'knex';

import config  from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IMenuChild, IUser } from '../interfaces/user';
import { IProductoEditar, IProductoResumen } from '../interfaces/producto';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message:any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message:any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message:any) => logDatabasePYS.info(formatMessages.responseFormat(message)));



export const getProductos = (): Promise<IProductoResumen[]> => {
  return db
    .select('p.cod_producto','p.nombre','p.talla', 'p.activo','p.tiene_talla','p.tiene_color', 'c.nombre as categoria', 'c.sexo', 'p.activo')
    .from('producto as p')
    .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
    .orderBy('p.activo','desc')
    .orderBy('p.cod_producto')
}

export const getColoresProductoResumen = ( cod_producto:number ): Promise<{color:string , color_descripcion:string}[]> => {
  return db
    .select('color','color_descripcion')
    .from('producto_color')
    .where('cod_producto',cod_producto)
}



export const getProductoDetalle = (codProducto:string): Promise<IProductoResumen[]> => {
  return db
    .select('p.cod_producto','p.nombre','p.talla', 'p.activo','p.tiene_talla','p.tiene_color', 'c.cod_categoria',  'c.sexo')
    .from('producto as p')
    .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
    .where('p.cod_producto', codProducto)
}

export const getInfoBasicaProducto = (codProducto:string): Promise<IProductoResumen[]> => {
  return db
    .select('cod_producto','nombre','p.cod_categoria',  'p.activo','p.descripcion')
    .from('producto as p')
    .where('p.cod_producto', codProducto)
}

export const crearProducto = async (data: { nombre:string, cod_categoria:number }) => {
  return db('producto').insert(data);
}

export const actualizarProducto = async (data:IProductoEditar, codProducto:number) => {
  return await db('producto').where('cod_producto',codProducto).update(data)
}

export const insertarImagenProductoColor = async (data: { url:string, cod_producto_color:string }) => {
  return db('producto_color_imagen').insert(data);
}

export const borrarImagenProductoColor = async ( codProductoColorImagen:number ) => {
  return await db.delete().from('producto_color_imagen').where('cod_producto_color_imagen', codProductoColorImagen)
}

export const insertarProductoColor = async (data: { cod_producto:string, color:string, color_descripcion:string }) => {
  return db('producto_color').insert(data);
}

export const editarProductoColor = async (data: { cod_producto:string, color:string, color_descripcion:string } , codProductoColor:number) => {
  return await db('producto_color').where('cod_producto_color',codProductoColor).update(data)
}

export const borrarProductoColor = async ( codProductoColor:number ) => {
  // return await db.delete().from('producto_color').where('cod_producto_color', codProductoColor)
  return db('producto_color').where('cod_producto_color',codProductoColor).update({activo:0})
}