import Knex from 'knex';

import config from '../../knexfile';
import { logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IEntidadInfoBasica, IEntidadResumen, IUsuarioEntidad } from '../interfaces/entidad';

const db = Knex(config.development);
const dbCrm = Knex(config.crmbrt);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));




export const getInfoContrato = (codEntidad: number): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre', 'e.nit', 'e.info_contrato', 'no_contrato', 'fecha_inicio', 'fecha_final',
            'gestionada', 'fecha_gestionada', 'entrega_bonos', 'no_orden', 'direccion', 'ciudad')
        .from('entidad as e')
        .where('e.cod_entidad', codEntidad)
}

export const getEntidades = (): Promise<IEntidadResumen[]> => {
    return db
        .select('e.cod_entidad', 'e.nombre', 'e.nit', 'e.activo', 'e.gestionada', 'e.fecha_gestionada', 'e.entrega_bonos', 'e.tipo_entrega_contrato')
        .from('entidad as e')
        .orderBy('e.activo', 'desc')
        .orderBy('e.tipo_entrega_contrato', 'desc')
        .orderBy('e.fecha_gestionada', 'asc')
        .orderBy('e.cod_entidad')
}

export const crearEntidad = async (data: { nombre: string, cod_categorias: string }) => {
    return db('entidad').insert(data);
}

export const crearCargoEntidad = async (data: { nombre: string, cod_categorias: string }) => {
    return db('cargo_entidad').insert(data);
}

export const crearCargoBonosProducto = async (data: { nombre: string, cod_cargo_entidad: string, descripcion: string, valor: string }) => {
    return db('cargo_bonos_producto').insert(data);
}

export const getInfoBasicaEntidad = (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('cod_entidad', 'nombre', 'activo', 'nit', 'info_contrato', 'no_contrato', 'fecha_inicio', 'fecha_final', 'tipo_entrega_contrato')
        .from('entidad')
        .where('cod_entidad', codEntidad)
}

export const actualizarEntidad = async (data: IEntidadInfoBasica, codEntidad: number) => {
    return await db('entidad').where('cod_entidad', codEntidad).update(data)
}

export const actualizarCargoEntidad = async (data: IEntidadInfoBasica, codCargoEntidad: number) => {
    return await db('cargo_entidad').where('cod_cargo_entidad', codCargoEntidad).update(data)
}

export const actualizarCargoBonoEntidad = async (data: any, codCargoBonosProducto: number) => {
    return await db('cargo_bonos_producto').where('cod_cargo_bonos_producto', codCargoBonosProducto).update(data)
}

export const getUsuariosEntidadCorreo = (codEntidad: string | number): Promise<IUsuarioEntidad[]> => {
    return db
        .select('u.email', 'u.nombre', 'u.cedula', 'u.raw_pass as pasword')
        .from('usuario as u')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil', 3)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario', 'desc')
}

export const getUsuariosIdentidad = (codEntidad: string | number, tipoEntrega: string | number): Promise<IUsuarioEntidad[]> => {
    let cod_perfil = 0
    switch (tipoEntrega) {
        case 1:
            cod_perfil = 3
            break;
        case 2:
            cod_perfil = 5
            break;

        default:
            break;
    }

    return db
        .select('u.cod_usuario', 'u.codigo', 'u.email', 'u.nombre', 'u.activo', 'u.sexo', 'u.cedula', 'u.cod_cargo_entidad',
            'o.cod_orden', db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as cargo_entidad"))
        .from('usuario as u')
        .join('cargo_entidad as c', 'c.cod_cargo_entidad', 'u.cod_cargo_entidad')
        .leftJoin('orden as o', 'u.cod_usuario', 'o.cod_usuario')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil', cod_perfil)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario', 'desc')
}



export const getUsuarioCoordinador = (codEntidad: string): Promise<IEntidadInfoBasica[]> => {
    return db
        .select('u.cod_usuario', 'u.email', 'u.nombre', 'u.activo', 'u.sexo', 'u.cedula', 'o.cod_orden')
        .from('usuario as u')
        .leftJoin('orden as o', 'u.cod_usuario', 'o.cod_usuario')
        .where('u.cod_entidad', codEntidad)
        .andWhere('u.cod_perfil', 2)
        .orderBy('u.activo')
        .orderBy('u.cod_usuario', 'desc')
        .limit(1)
}

export const cargosEntidadResumen = (codEntidad: string): Promise<{ cod_cargo_entidad: number, nombre: string }[]> => {
    return db
        .select('cod_cargo_entidad', 'nombre', 'lote')
        .from('cargo_entidad')
        .where('cod_entidad', codEntidad)
}

export const cargoEntidadPorNombre = (codEntidad: number, cargo: string, lote: number) => {
    return db
        .select('cod_cargo_entidad', 'nombre')
        .from('cargo_entidad')
        .where('cod_entidad', codEntidad)
        .andWhere('lote', lote)
        .andWhere(db.raw('TRIM(UPPER(nombre)) = TRIM(UPPER(?))', [cargo.trim().toUpperCase()]));
}



export const categoriasPorCargo = (codEntidad: number): Promise<{ cod_categorias: string, nombre: string }[]> => {
    return db
        .select('c.cod_categorias', db.raw("CONCAT(c.nombre, ' - LOTE ', c.lote) as nombre"))
        .from('cargo_entidad as c')
        .where('c.cod_entidad', codEntidad)
}

export const getProductosEntidad = (categorias: number[]): Promise<any[]> => {
    return db
        .select('p.cod_producto', 'p.cod_categoria', 'p.nombre', 'p.tiene_talla', 'p.tiene_color', 'p.talla', 'c.nombre as categoria', 'c.cod_categoria')
        .from('producto as p')
        .join('categoria as c', 'c.cod_categoria', 'p.cod_categoria')
        .whereIn('p.cod_categoria', categorias)
        .andWhere('p.activo', 1)
        .andWhere('c.activo', 1)
}


export const getCargoBonoPorUsuario = (codUsuario: number, codEntidad: number): Promise<{ cod_cargo_bonos_producto: number, cod_usuario: number }[]> => {
    return db
        .select('cbp.cod_cargo_bonos_producto', 'u.cod_usuario')
        .from('cargo_bonos_producto as cbp')
        .join('cargo_entidad as ce', 'cbp.cod_cargo_entidad', 'ce.cod_cargo_entidad')
        .join('usuario as u', 'u.cod_cargo_entidad', 'ce.cod_cargo_entidad')
        .join('entidad as e', 'e.cod_entidad', 'u.cod_entidad')
        .where('u.cod_usuario', codUsuario)
        .andWhere('e.tipo_entrega_contrato', 2)
        .andWhere('u.cod_perfil', 5)
        .andWhere('e.cod_entidad', codEntidad)
}

export const crearUsuarioBonoEntrega = async (data: any) => {
    return db('usuario_bono_entrega').insert(data);
}


export const getProductosAsociados = (codCargoBonosProductos: number): Promise<{
    cod_producto_asociado_subcategoria: number,
    cod_subcategoria: number,
    cod_cargo_bonos_producto: number,
    valor: number
}[]> => {
    return db
        .select('cod_producto_asociado_subcategoria', 'cod_subcategoria', 'cod_cargo_bonos_producto', 'valor')
        .from('producto_asociado_subcategoria')
        .andWhere('cod_cargo_bonos_producto', codCargoBonosProductos)
}

export const getSubCategoras = (codSubcategorias: number[]): Promise<{ cod_subcategoria: number, nombre: string }[]> => {
    return dbCrm
        .select('id as cod_subcategoria', 'sub_categoria as nombre')
        .from('sub_categorias')
        .whereIn('id', codSubcategorias)
}


export const asociarSubCategoriaBonosProducto = async (data: any) => {
    return db('producto_asociado_subcategoria').insert(data);
}

export const actualizarAsociacionSubCategoriaBonosProducto = async (data: any, codProductoAsociadoCategoria: number) => {
    return await db('producto_asociado_subcategoria').where('cod_producto_asociado_subcategoria', codProductoAsociadoCategoria).update(data)
}

export const borrarAsociacionSubCategoriaBonosProducto = async ( codProductoAsociadoCategoria:number ) => {
  return db('producto_asociado_subcategoria').where('cod_producto_asociado_subcategoria', codProductoAsociadoCategoria)
  .delete();
}


