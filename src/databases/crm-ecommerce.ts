import Knex from 'knex';

import config from '../../knexfile';
import { logCrm, logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IActualizarProductoColorCrm, IActualizarProductoCrm, ICrearProductoColorCrm, IProductoNuevoCrm } from '../interfaces/crm-ecommerce';
import { ITallaje } from '../interfaces/tallaje';

const db = Knex(config.development);
const dbCrm = Knex(config.crmbrt);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));

dbCrm.on('query', (message: any) => logCrm.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logCrm.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logCrm.info(formatMessages.responseFormat(message)));
   


interface ICategoriaCrm {
    categoria?: string,
    id_woo?: number
}

export const crearCategoria = (categoria: ICategoriaCrm) => {
    return dbCrm('categorias').insert(categoria);
}

export const actualizarCategoriaCrm = (codCategoria: number, categoria: ICategoriaCrm) => {
    return dbCrm('categorias').where('id', codCategoria).update(categoria)
}


export const subCategoriaInfo = (codSubCategoria: string) => {
    return dbCrm
        .select('sc.sub_categoria', 'sc.id_woo as id_woo_subcategoria', 'c.id_woo as id_woocategoria')
        .from('sub_categorias as sc')
        .join('categorias as c', 'sc.id_categoria', 'c.id')
        .where('sc.id', codSubCategoria)
}

interface ISubCategoriaCrm {
    id_categoria?: number,
    sub_categoria?: string,
    id_woo?: number,
    consecutivo?: number
}

export const crearSubCategoriaCrm = (subcategoria: ISubCategoriaCrm) => {
    return dbCrm('sub_categorias').insert(subcategoria);
}

export const actualizarSubCategoriaCrm = (codSubCategoria: number, subCategoria: ISubCategoriaCrm) => {
    return dbCrm('sub_categorias').where('id', codSubCategoria).update(subCategoria)
}

interface filtroBusquedaProductosCRM{
    page: number;
    perPage: number;
    buscar?: string;
    idCategoria?: number;
    idSubCategoria?: number;
}

export const totalProductosCrm = async ({buscar,idCategoria,idSubCategoria}: Partial<filtroBusquedaProductosCRM>) => {

    const query = dbCrm('productos as p');

    if (buscar) {
        query.where(function () {
            this.where('p.descripcion', 'like', `%${buscar}%`)
                .orWhere('p.codigo', 'like', `%${buscar}%`)
                .orWhere('p.lote', 'like', `%${buscar}%`);
        });
    }

    if (idCategoria) {
        query.where('p.id_categoria', idCategoria);
    }

    if (idSubCategoria) {
        query.where('p.id_sub_categoria', idSubCategoria);
    }

    const totalResult = await query
        .countDistinct({
            total: dbCrm.raw('CONCAT(p.lote,"-",p.id_categoria,"-",p.id_sub_categoria)')
        })
        .first();

    return totalResult ? Number(totalResult.total) : 0;
}

export const obtenerProductosCrm = ({page, perPage, buscar, idCategoria,idSubCategoria}: filtroBusquedaProductosCRM) => {

    const offset = (page - 1) * perPage;

    const query = dbCrm('productos as p')
        .join('categorias as c', 'c.id', 'p.id_categoria')
        .join('sub_categorias as sc', 'sc.id', 'p.id_sub_categoria');

    if (buscar) {
        query.where(function () {
            this.where('p.descripcion', 'like', `%${buscar}%`)
                .orWhere('p.codigo', 'like', `%${buscar}%`)
                .orWhere('p.lote', 'like', `%${buscar}%`)
                .orWhere('p.codigo_modelo', 'like', `%${buscar}%`);;
        });
    }

    if (idCategoria) {
        query.where('p.id_categoria', idCategoria);
    }

    if (idSubCategoria) {
        query.where('p.id_sub_categoria', idSubCategoria);
    }

    return query
        .select(
            'p.lote',
            'p.codigo_modelo',
            'p.id_categoria',
            'c.categoria',
            'p.id_sub_categoria',
            'sc.sub_categoria',
            'sc.id_woo as id_woo_subcategoria',
            dbCrm.raw(`
                CONCAT(
                    LEFT(p.codigo, 4),
                    'CC',
                    SUBSTRING(p.codigo, 7, 2),
                    'TT',
                    RIGHT(p.codigo, 4)
                ) AS codigo_auxiliar
            `),
            'p.descripcion',
            dbCrm.raw('MIN(p.precio_compra) AS precio_compra'),
            dbCrm.raw('MIN(p.precio_venta) AS precio_venta'),
            dbCrm.raw('COUNT(DISTINCT p.color) AS total_colores'),
            dbCrm.raw('COUNT(DISTINCT p.talla) AS total_tallas')
        )
        .groupBy(
            'p.lote',
            'p.id_categoria',
            'c.categoria',
            'p.id_sub_categoria',
            'sc.sub_categoria',
            'p.descripcion'
        )
        .orderByRaw('MAX(p.id) DESC')
        .limit(perPage)
        .offset(offset);
}


export const obtenerTallasPorProducto = (codigoModelo:string) => {
     return dbCrm('productos')
        .distinct('talla')
        .where('codigo_modelo', codigoModelo)
}

export const obtenerColoresPorProducto = (codigoModelo:string) => {
     return dbCrm('producto_color')
        .select('*')
        .where('codigo_modelo', codigoModelo)
        .andWhere('activo',1)
}


export const coloresProductoPosibles = (codigoModelo:string) => {
    return dbCrm('productos')
        .select('*')
        .groupBy('color')
        .where('codigo_modelo',codigoModelo)
}

export const actualizarProductoCrm = (codigoModelo: string, producto: IActualizarProductoCrm) => {
    return dbCrm('productos').where('codigo_modelo', codigoModelo).update(producto)
}

export const actualizarProductoIndividualCrm = (idProducto: string, producto: IActualizarProductoCrm) => {
    return dbCrm('productos').where('id', idProducto).update(producto)
}

export const crearColorProductoCrm = (color: ICrearProductoColorCrm) => {
    return dbCrm('producto_color').insert(color);
}

export const actualizarColorProductoCrm = (id: number, color: IActualizarProductoColorCrm) => {
    return dbCrm('producto_color').where('cod_producto_color', id).update(color)
}

export const obtenerColorProductoPorCodigo = (codigoModelo:string, codigoColor:string) => {
    return dbCrm('producto_color')
        .select('*')
        .where('codigo_modelo',codigoModelo)
        .andWhere('codigo_color',codigoColor)
}

export const insertarImagenProductoColorCrm = async (data: { url:string, cod_producto_color:string }) => {
  return dbCrm('producto_color_imagen').insert(data);
}


export const borrarImagenProductoColorCrm = async ( codProductoColorImagen:number ) => {
  return await dbCrm.delete().from('producto_color_imagen').where('cod_producto_color_imagen', codProductoColorImagen)
}

export const tallajesProductoPosibles = (codigoModelo:string) => {
    return dbCrm('productos')
        .select('talla','cod_tallaje')
        .groupBy('talla')
        .where('codigo_modelo',codigoModelo)
}

export const crearImagenTallajeCrm = async (data:ITallaje) => {
    return dbCrm('tallaje').insert(data);
  }

export const editarTallajeCrm = async (data:any , codTallaje:number) => {
  return await dbCrm('tallaje').where('cod_tallaje',codTallaje).update(data)
}

export const getTallasActivasCrm = async () => {
  return dbCrm.select("cod_tallaje","nombre","imagen")
  .from("tallaje")
  .where('activo', 1)
}


export const crearProductoCrm = async (data: IProductoNuevoCrm | IProductoNuevoCrm[]) => {
  return dbCrm('productos').insert(data);
}

export const obtenerColorEImagenPorProducto = (codigoModelo:string) => {
    return dbCrm
        .select('*')
        .from('producto_color as pc')
        .leftJoin('producto_color_imagen as pci', 'pc.cod_producto_color', 'pci.cod_producto_color')
        .where('pc.codigo_modelo', codigoModelo)
}

export const obtenerInventarioProducto = (idProducto:number) => {
    return dbCrm.select(
            dbCrm.raw('COALESCE(SUM(i.stock), 0) as stock')
        )
        .from('inventarios as i')
        .join('bodegas as b', 'b.id', 'i.id_tienda')
        .where('i.id_cod_producto', idProducto)
        .andWhere('b.inventario_ecommerce', 1)
        .andWhere('i.stock', '>', 0)
}