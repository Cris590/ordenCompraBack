import Knex from 'knex';
import config from '../../../knexfile';
import { logDatabasePYS } from '../../helpers/logger';
import * as formatMessages from '../../helpers/formatLogMessages';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message:any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message:any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message:any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export async function getUser(username: string, password: string): Promise<any> {
    return await db.select('cod_user_api')
        .from('user_api')
        .where('user', username)
        .andWhere("password", password)
        .andWhere("active", 1);
}

export async function getUserPermission(cod_user_api: number, endpoint: string): Promise<any> {
    return await db.select('cod_user_api_permission')
        .from('user_api_permission')
        .where('cod_user_api', cod_user_api)
        .andWhere("endpoint", endpoint);
}