import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { ITallaje } from '../interfaces/tallaje';
import { IUsuarioBonos, IUsuarioOrdenPorEntidadSql } from '../interfaces/reporte';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export const reporteEntidad = async (codEntidad: number): Promise<IUsuarioOrdenPorEntidadSql[]> => {
    return db.select(
        'u.cedula',
        'u.nombre',
        'u.email',
        'ce.nombre as cargo_entidad',
        'e.nombre as entidad', 
        'e.no_contrato',
        'e.nit',
        db.raw(`
            CASE
              WHEN u.sexo = 'M' THEN 'MASCULINO'
              ELSE 'FEMENINO'
            END AS sexo
          `),
        'o.cod_orden',
        'o.productos',
        'o.fecha_creacion',
        'o.direccion',
        'o.ciudad',
        'u2.cedula as cedula_creador',
        'u2.nombre as nombre_creador',
        'e.no_orden',
        'o.observaciones',
        db.raw(`
            CASE
              WHEN o.direccion IS NULL OR o.ciudad IS NULL THEN 'INCOMPLETA'
              ELSE 'COMPLETA'
            END AS orden_completa
          `)
      )
      .from('usuario as u')
      .join('cargo_entidad as ce', 'u.cod_cargo_entidad', 'ce.cod_cargo_entidad')
      .join('entidad as e', 'e.cod_entidad','u.cod_entidad')
      .leftJoin('orden as o', 'o.cod_usuario', 'u.cod_usuario')
      .leftJoin('usuario as u2', 'o.cod_usuario_creacion', 'u2.cod_usuario')
      .where('u.cod_entidad', codEntidad)
      .andWhere('u.cod_perfil', 3);
}

export const infoBonosEntidad = async (codEntidad: number): Promise<IUsuarioBonos[]> => {
  return db.select(
      'u.cedula',
      'u.nombre',
      'e.nombre as nombre_entidad', 
      'e.no_contrato',
      'u.sexo',
      'e.fecha_gestionada',
      'o.cod_orden',
      'o.productos',
    )
    .from('usuario as u')
    .join('cargo_entidad as ce', 'u.cod_cargo_entidad', 'ce.cod_cargo_entidad')
    .join('entidad as e', 'e.cod_entidad','u.cod_entidad')
    .leftJoin('orden as o', 'o.cod_usuario', 'u.cod_usuario')
    .leftJoin('usuario as u2', 'o.cod_usuario_creacion', 'u2.cod_usuario')
    .where('u.cod_entidad', codEntidad)
    .andWhere('e.gestionada', 1)
    .andWhere('u.cod_perfil', 3);
}

