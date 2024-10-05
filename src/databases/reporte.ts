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
        'ce.lote',
        'e.nombre as entidad', 
        'e.no_contrato',
        'e.nit',
        db.raw(`
            CASE
              WHEN u.sexo = 'M' THEN 'MASCULINO'
              ELSE 'FEMENINO'
            END AS sexo
          `),
        db.raw(`
          CASE
            WHEN o.cod_orden IS NULL THEN 'INCOMPLETA'
            ELSE 'COMPLETA'
          END AS orden_completa
        `),
        'o.cod_orden',
        'o.productos',
        db.raw("CONVERT_TZ(o.fecha_creacion, '+00:00', '-05:00') AS fecha_creacion"),
        'e.direccion',
        'e.ciudad',
        'u2.cedula as cedula_creador',
        'u2.nombre as nombre_creador',
        'e.no_orden'
      )
      .from('usuario as u')
      .join('cargo_entidad as ce', 'u.cod_cargo_entidad', 'ce.cod_cargo_entidad')
      .join('entidad as e', 'e.cod_entidad','u.cod_entidad')
      .leftJoin('orden as o', 'o.cod_usuario', 'u.cod_usuario')
      .leftJoin('usuario as u2', 'o.cod_usuario_creacion', 'u2.cod_usuario')
      .where('u.cod_entidad', codEntidad)
      .andWhere('u.cod_perfil', 3);
}

export const reporteComparativo = async (codEntidad: number): Promise<IUsuarioOrdenPorEntidadSql[]> => {
  return db.select(
      'u.cedula as cedula_beneficiario',
      'u.nombre as nombre_beneficiario',
      'ce.nombre as cargo_entidad',
      'ce.lote',
      'e.nombre as entidad', 
      'e.no_contrato',
      'e.nit',
      'o.productos'
    )
    .from('usuario as u')
    .join('cargo_entidad as ce', 'u.cod_cargo_entidad', 'ce.cod_cargo_entidad')
    .join('entidad as e', 'e.cod_entidad','u.cod_entidad')
    .leftJoin('orden as o', 'o.cod_usuario', 'u.cod_usuario')
    .leftJoin('usuario as u2', 'o.cod_usuario_creacion', 'u2.cod_usuario')
    .where('u.cod_entidad', codEntidad)
    .andWhere('u.cod_perfil', 3);
}

export const coordinadorEntidad = async (codEntidad: number): Promise<IUsuarioOrdenPorEntidadSql[]> => {
  return db.select(
      'u.cedula',
      'u.nombre'
    )
    .from('usuario as u')
    .join('entidad as e', 'e.cod_entidad','u.cod_entidad')
    .where('u.cod_entidad', codEntidad)
    .andWhere('u.cod_perfil', 2);
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

