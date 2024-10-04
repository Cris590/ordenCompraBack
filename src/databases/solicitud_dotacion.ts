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
            'o.fecha_creacion', db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as cargo"))
        .from('usuario as uo')
        .leftJoin('orden as o','uo.cod_usuario','o.cod_usuario')
        .join('cargo_entidad as c','c.cod_cargo_entidad','uo.cod_cargo_entidad')
        .join('entidad as e','e.cod_entidad','uo.cod_entidad')
        .where('uo.cod_entidad',codEntidad)
        .andWhere('uo.cod_perfil',3)
        .whereNull('o.cod_orden')
        .andWhere('e.entrega_bonos','VIRTUAL')
        .andWhere('e.gestionada',0)
}