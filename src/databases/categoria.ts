import Knex from 'knex';

import config  from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { ICategoria } from '../interfaces/categoria';
import { IProductoResumen } from '../interfaces/producto';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message:any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message:any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message:any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export const crearCategoria = async (data: ICategoria) => {
    return db('categoria').insert(data);
}

export const actualizarCategoria = async (data: ICategoria, codCategoria: number) => {
    return db("categoria")
      .update(data)
      .where({ cod_categoria: codCategoria });
  
  }

  
export const productosCategoria = async (codCategoria: number) : Promise<IProductoResumen[]> => {
  return db
    .select('p.cod_producto','p.nombre','p.talla', 'p.activo','p.tiene_talla','p.tiene_color', 'c.nombre as categoria', 'c.sexo', 'p.activo')
    .from('producto as p')
    .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
    .where('p.cod_categoria',codCategoria)
    .andWhere('p.activo',1)
    .andWhere('c.activo',1)
    .orderBy('p.activo','desc')
    .orderBy('p.cod_producto')

}

export const categoriasActivas = async (codCategoria: number) : Promise<IProductoResumen[]> => {
  return db
    .select('p.cod_producto','p.nombre','p.talla', 'p.activo','p.tiene_talla','p.tiene_color', 'c.nombre as categoria', 'c.sexo', 'p.activo')
    .from('producto as p')
    .join('categoria as c', 'c.cod_categoria','p.cod_categoria')
    .where('p.cod_categoria',codCategoria)
    .andWhere('p.activo',1)
    .andWhere('c.activo',1)
    .orderBy('p.activo','desc')
    .orderBy('p.cod_producto')

}