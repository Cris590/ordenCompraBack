import Knex from 'knex';

import config from '../../knexfile';
import { logCrm, logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { FiltroBusquedaPedidosEcommerce, IActualizarProductoColorCrm, IActualizarProductoCrm, ICrearProductoColorCrm, INuevoSeguimientoPedidoEcommerce, IProductoNuevoCrm } from '../interfaces/crm-ecommerce';
import { ITallaje } from '../interfaces/tallaje';

const db = Knex(config.development);
const dbCrm= Knex(config.crmbrt);

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

export const insertarImagenProductoColorCrm = async (data: { url:string, cod_producto_color:string,id_woo?:number }) => {
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

export const obtenerInventarioTotalProducto = (idProducto:number) => {
    return dbCrm.select(
            dbCrm.raw('COALESCE(SUM(i.stock), 0) as stock')
        )
        .from('inventarios as i')
        .join('bodegas as b', 'b.id', 'i.id_tienda')
        .where('i.id_cod_producto', idProducto)
        .andWhere('b.inventario_ecommerce', 1)
        .andWhere('i.stock', '>', 0)
}

export const obtenerProductosCrmFiltros = (buscar:string, idCategoria:number,idSubCategoria:number) => {

    const query = dbCrm('productos as p')
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        })

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
            dbCrm.raw("LPAD(p.id_sub_categoria, 2, '0') as ref_prenda"),
            'p.lote as fecha',
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' ', pe.nombre_color)
                    ELSE p.descripcion
                END AS descripcion
            `),
            'p.color',
            dbCrm.raw('SUBSTRING(p.codigo, 7, 2) as color_secundario'),
            'p.talla',
            dbCrm.raw("CONCAT('$ ', FORMAT(p.precio_venta, 0, 'de_DE')) as precio"),
            'p.codigo as  codigo_barras'
        );
        
}


export const obtenerProductosListadoCrm = (codigoModelo:string) => {

    return dbCrm.select(
            'c.categoria',
            'sc.sub_categoria',
            'p.codigo',
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' ', pe.nombre_color)
                    ELSE p.descripcion
                END AS descripcion
            `),
            'p.color',
            'p.talla',
            'pe.nombre_color',
            'pe.codigo_color',
            'pe.color as color_rgb'
        ).from('productos as p')
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        })
        .join('categorias as c', 'c.id', 'p.id_categoria')
        .join('sub_categorias as sc', 'sc.id', 'p.id_sub_categoria')
        .where('p.codigo_modelo', codigoModelo)
        .orderBy('p.color','p.talla');
}


export const obtenerPedidosEcommerce = ({
    page,
    perPage,
    documento,
    numeroPedido,
    codEstadoPedido,
    fechaDesde,
    fechaHasta,
    estadoFinal
}: FiltroBusquedaPedidosEcommerce) => {

    const offset = (page - 1) * perPage;

    const query = db('ecommerce_pedidos as ep')
        .leftJoin(
            'ecommerce_clientes as ec',
            'ec.cod_ecommerce_cliente',
            'ep.cod_ecommerce_cliente'
        )
        .leftJoin(
            'ecommerce_direcciones as de',
            'de.cod_ecommerce_direccion',
            'ep.cod_direccion_envio'
        )
        .leftJoin(
            'ecommerce_estado_pedido as ee',
            'ee.cod_ecommerce_estado_pedido',
            'ep.cod_ecommerce_estado_pedido'
        )
        .leftJoin(
            'ecommerce_pedido_seguimientos as ps',
            'ps.cod_ecommerce_pedido_seguimiento',
            db.raw(`(
                SELECT MAX(ps2.cod_ecommerce_pedido_seguimiento)
                FROM ecommerce_pedido_seguimientos as ps2
                WHERE ps2.cod_ecommerce_pedido = ep.cod_ecommerce_pedido
            )`)
        );

    if (documento) {
        query.where('ec.documento', 'like', `%${documento}%`);
    }

    if (numeroPedido) {
        query.where('ep.numero_pedido', 'like', `%${numeroPedido}%`);
    }

    if (codEstadoPedido) {
        query.where('ep.cod_ecommerce_estado_pedido',codEstadoPedido);
    }

    if (fechaDesde) {
        query.where('ep.fecha_creacion','>=',`${fechaDesde} 00:00:00`);
    }

    if (fechaHasta) {
        query.where('ep.fecha_creacion','<=',`${fechaHasta} 23:59:59`);
    }

    if (estadoFinal !== undefined) {
        query.where('ee.estado_final',estadoFinal ? 1 : 0);
    }

    return query
        .select(
            'ep.cod_ecommerce_pedido',
            'ep.id_woocommerce',
            'ep.numero_pedido',
            db.raw('CONCAT(ec.nombre, " ", ec.apellido) as nombre_cliente'),
            'ec.documento as documento_cliente',
            'ec.email as email_cliente',
            'ec.telefono as telefono_cliente',
            'de.direccion as direccion_envio',
            'de.ciudad as ciudad_envio',
            'de.departamento as departamento_envio',
            'ep.subtotal',
            'ep.descuento',
            'ep.impuesto',
            'ep.envio',
            'ep.total',
            'ep.metodo_pago',
            'ep.codigo_metodo_pago',
            'ee.cod_ecommerce_estado_pedido as cod_estado_pedido',
            'ee.codigo as codigo_estado_pedido',
            'ee.descripcion as descripcion_estado_pedido',
            'ee.estado_final',
            'ps.descripcion as descripcion_ultimo_seguimiento',
            'ps.fecha_creacion as fecha_ultimo_seguimiento',
            'ep.fecha_creacion',
            'ep.fecha_actualizacion'
        )
        .orderBy('ep.cod_ecommerce_pedido', 'desc')
        .limit(perPage)
        .offset(offset);
};

export const totalPedidosEcommerce = async ({
    documento,
    numeroPedido,
    codEstadoPedido,
    fechaDesde,
    fechaHasta,
    estadoFinal
}: Partial<FiltroBusquedaPedidosEcommerce>) => {

    const query = db('ecommerce_pedidos as ep')
        .leftJoin('ecommerce_clientes as ec','ec.cod_ecommerce_cliente','ep.cod_ecommerce_cliente')
        .leftJoin('ecommerce_estado_pedido as ee','ee.cod_ecommerce_estado_pedido','ep.cod_ecommerce_estado_pedido');

    if (documento) {
        query.where('ec.documento','like',`%${documento}%`);
    }

    if (numeroPedido) {
        query.where('ep.numero_pedido','like',`%${numeroPedido}%`);
    }

    if (codEstadoPedido) {
        query.where('ep.cod_ecommerce_estado_pedido',codEstadoPedido);
    }

    if (fechaDesde) {
        query.where('ep.fecha_creacion','>=',`${fechaDesde} 00:00:00`);
    }

    if (fechaHasta) {
        query.where('ep.fecha_creacion','<=',`${fechaHasta} 23:59:59`);
    }

    if (estadoFinal !== undefined) {
        query.where('ee.estado_final',estadoFinal ? 1 : 0);
    }

    const totalResult = await query
        .countDistinct({total: 'ep.cod_ecommerce_pedido'})
        .first();

    return totalResult
        ? Number(totalResult.total)
        : 0;
};

export const crearSeguimientoPedidoEcommerce = (seguimiento: Partial<INuevoSeguimientoPedidoEcommerce>) => {
    return db('ecommerce_pedido_seguimientos').insert(seguimiento);
}

export const obtenerDetallePedidoEcommerce = (codPedido:string) => {

    return db.select(
            'ep.cod_ecommerce_pedido',
            'ep.id_woocommerce',
            'ep.numero_pedido',
            'ep.subtotal',
            'ep.descuento',
            'ep.impuesto',
            'ep.envio',
            'ep.total',
            'ep.metodo_pago',
            'ep.codigo_metodo_pago',
            'ee.codigo as codigo_estado_pedido',
            'ee.descripcion as descripcion_estado_pedido',
            'ee.estado_woocommerce',
            'ee.estado_final',
            'ee.estados_siguientes',
            'ep.cod_ecommerce_estado_pedido',
            'ep.fecha_creacion',
            'ep.fecha_actualizacion',
            'ep.cod_ecommerce_cliente',
            'ep.cod_direccion_facturacion',
            'ep.cod_direccion_envio'
        )
        .from('ecommerce_pedidos as ep')
        .join('ecommerce_estado_pedido as ee', 'ee.cod_ecommerce_estado_pedido', 'ep.cod_ecommerce_estado_pedido')
        .where('ep.cod_ecommerce_pedido', codPedido)
        .first()
}

export const obtenerClientePedidoEcommerce = (codCliente:string) => {

    return db.select(
            'cod_ecommerce_cliente',
            'id_woocommerce',
            db.raw('CONCAT(nombre, " ", apellido) as nombre_cliente'),
            'documento',
            'email',
            'telefono',
            'fecha_creacion',
            'fecha_actualizacion',        )
        .from('ecommerce_clientes')
        .where('cod_ecommerce_cliente', codCliente)
        .first()
}

export const obtenerDireccionPedidoEcommerce = (codDireccion:string) => {

    return db.select(
            'cod_ecommerce_direccion',
            db.raw('CONCAT(nombre, " ", apellido) as nombre_cliente'),
            'direccion',
            'direccion_2',
            'ciudad',
            'departamento',
            'codigo_postal',
            'telefono',
            'fecha_creacion',        )
        .from('ecommerce_direcciones')
        .where('cod_ecommerce_direccion', codDireccion)
        .first()
}

export const obtenerProductoPedidoEcommerce = (idVariante:number) => {

    return dbCrm.select(
            'p.id',
            'c.categoria',
            'sc.sub_categoria',
            'p.codigo',
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' ', pe.nombre_color)
                    ELSE p.descripcion
                END AS descripcion
            `),
            'p.color',
            'p.talla',
            'pe.cod_producto_color',
            'pe.nombre_color',
            'pe.codigo_color',
            'pe.color as color_rgb',
            'p.precio_venta'
        ).from('productos as p')
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        })
        .join('categorias as c', 'c.id', 'p.id_categoria')
        .join('sub_categorias as sc', 'sc.id', 'p.id_sub_categoria')
        .where('p.id_woo_variante_producto', idVariante)
        .first();
}

export const obtenerSeguimientosPedidoEcommerce = (codPedido:string) => {

    return db.select(
            's.descripcion',
            'e.codigo as codigo_estado',
            'e.descripcion as descripcion_estado_pedido',
            's.fecha_creacion'
        )
        .from('ecommerce_pedido_seguimientos as s')
        .join('ecommerce_estado_pedido as e','s.cod_ecommerce_estado_pedido','e.cod_ecommerce_estado_pedido')
        .where('cod_ecommerce_pedido', codPedido)
}

export const obtenerEstadosPermitidosPedidoEcommerce = (codEstados:number[]) => {

    return db.select(
            'cod_ecommerce_estado_pedido',
            'descripcion',
            'codigo',
            'estado_woocommerce',
            'estado_final'
        )
        .from('ecommerce_estado_pedido')
        .whereIn('cod_ecommerce_estado_pedido',codEstados)
        .andWhere('activo',1)
}


export const obtenerTransaccionesPedidoEcommerce = (codPedido:string) => {

    return db.select('id_transaccion','metodo_pago','estado','monto')
        .from('ecommerce_transactions')
        .where('cod_ecommerce_pedido', codPedido)
}

export const obtenerInventarioProductoBodegaActiva = (idProducto:number) => {
    return dbCrm.select(
            'b.id as id_tienda',
            'b.nombre as nombre_tienda',
            'i.stock as cantidad_disponible'
        )
        .from('inventarios as i')
        .join('bodegas as b', 'b.id', 'i.id_tienda')
        .where('i.id_cod_producto', idProducto)
        .andWhere('b.inventario_ecommerce', 1)
        .andWhere('i.stock', '>', 0)
}

