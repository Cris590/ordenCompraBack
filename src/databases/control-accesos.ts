import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IEntidadInfoBasica, IEntidadResumen, IUsuarioEntidad } from '../interfaces/entidad';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export const getUsuariosAplicacionCompleta = () =>{
     return db
        .select('u.cod_usuario','u.email','u.nombre','u.cedula as usuario','p.nombre as perfil','u.cod_perfil')
        .from('usuario as u')
        .join('perfil as p','u.cod_perfil','p.cod_perfil')
        .where('p.perfil_aplicacion_completa',1)
}
