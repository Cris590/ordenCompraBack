import Knex from 'knex';

import config  from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { ITallaje } from '../interfaces/tallaje';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message:any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message:any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message:any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export const crearImagenTallaje = async (data:ITallaje) => {
    return db('tallaje').insert(data);
  }

export const editarTallaje = async (data:any , codTallaje:number) => {
  return await db('tallaje').where('cod_tallaje',codTallaje).update(data)
}