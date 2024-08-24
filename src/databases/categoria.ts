import Knex from 'knex';

import config  from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { ICategoria } from '../interfaces/categoria';

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