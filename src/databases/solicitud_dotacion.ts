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



export const obtenerOrdenesPendientes = (codEntidad:number): Promise<IEntidadResumen[]> => {
    return db
        .select('o.cod_orden', 'o.cod_usuario','uo.nombre as usuario','uo.cedula', 
            'uc.nombre as usuario_creacion','uc.cedula as documento_usuario_creacion', 'o.fecha_creacion','c.nombre as cargo')
        .from('orden as o')
        .join('usuario as uo','uo.cod_usuario','o.cod_usuario')
        .join('usuario as uc','uc.cod_usuario','o.cod_usuario')
        .join('cargo_entidad as c','c.cod_cargo_entidad','uo.cod_cargo_entidad')
        .where('uo.cod_entidad',codEntidad)
        .andWhereRaw( `( o.ciudad is null or o.direccion is null)` )
                
}