import Knex from 'knex';

import config from '../../knexfile';
import { logCrm, logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IFiltroLogInventarios, IFiltrosVentasPOS, IFiltroTrasladosProductos } from '../interfaces/pos';

const db = Knex(config.development);
const dbCrm = Knex(config.crmbrt);

// Attach the logger to Knex queries
db.on('query', (message: any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logDatabasePYS.info(formatMessages.responseFormat(message)));

dbCrm.on('query', (message: any) => logCrm.info(formatMessages.queryFormat(message)))
    .on('query-error', (message: any) => logCrm.error(formatMessages.errorFormat(message)))
    .on('query-response', (message: any) => logCrm.info(formatMessages.responseFormat(message)));




export const obtenerMediosPago = () => {
    return dbCrm
        .select('p.cod_producto', 'p.nombre', 'p.talla', 'p.activo', 'p.tiene_talla', 'p.tiene_color', 'c.nombre as categoria', 'c.sexo', 'p.activo')
        .from('metodos_pago as p')
}

export const obtenerTiendasPosUsuario = () => {
    return dbCrm
        .select('id', 'nombre')
        .from('bodegas')
}

export const obtenerVendedoresPorTienda = (codUsuario: number) => {
    return db("vendedor as v")
        .innerJoin("usuario as u", "u.cod_usuario", "v.cod_usuario")
        .innerJoin("vendedor as vu", function () {
            this.on("vu.id_bodega", "=", "v.id_bodega")
                .andOn("vu.cod_usuario", "=", db.raw("?", [codUsuario]));
        })
        .select(
            "v.cod_vendedor",
            "v.cod_usuario",
            "v.id_usuario_crm",
            "v.id_bodega",
            "u.nombre",
            "u.cedula"
        )
        .orderBy("u.nombre");

}

export const obtenerVendedoresVenta = (idUsuarioCrm: number) => {
    return db.select(
        "v.cod_vendedor",
        "v.cod_usuario",
        "v.id_usuario_crm",
        "v.id_bodega",
        "u.nombre",
        "u.cedula"
    ).from("vendedor as v")
        .join("usuario as u", "u.cod_usuario", "v.cod_usuario")
        .where('v.id_usuario_crm', idUsuarioCrm)
        .first()
}

export const obtenerProductoPorCodigoVenta = (codigo: string, idTienda: number) => {
    return dbCrm
        .select('p.id', 'p.codigo', 'p.precio_venta as precio', 'i.stock', 
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' - ', pe.nombre_color)
                    ELSE p.descripcion
                END AS nombre
            `), 
            'p.precio_compra as costo')
        .from('productos as p')
        .leftJoin('inventarios as i', 'i.id_cod_producto', 'p.id')
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        })
        .where('p.codigo', codigo)
        .andWhere('i.id_tienda', idTienda)
}

export const obtenerVentasPOS = async (filtros: IFiltrosVentasPOS) => {

    return dbCrm
        .select(
            'v.id',
            'v.codigo',
            'v.id_cliente',
            'c.documento as documento_cliente',
            'c.nombre as cliente',
            'v.id_vendedor',
            'u.nombre as vendedor',
            'b.id as id_tienda',
            'b.nombre as tienda',
            'v.neto',
            'v.total',
            'v.metodo_pago',
            'v.fecha',
            'v.factura_valida',
            'v.fc',
            'v.productos'
        )
        .from('ventas as v')
        .join('clientes as c', 'v.id_cliente', 'c.id')
        .join('usuarios as u', 'v.id_vendedor', 'u.id')
        .join('bodegas as b', 'v.id_tienda', 'b.id')
        .where('v.deuda', '<=', 0)
        .andWhere('v.factura_valida',1)
        .modify((query) => {

            // Si la tienda es "Todas", no se aplica este filtro
            if (
                filtros.id_tienda &&
                filtros.id_tienda !== 'todas'
            ) {
                query.where('v.id_tienda', filtros.id_tienda);
            }

            // Documento del cliente
            if (filtros.documento_cliente) {
                query.where('c.documento', filtros.documento_cliente);
            }

            // Fecha inicial
            if (filtros.fecha_inicial) {
                query.where('v.fecha', '>=', `${filtros.fecha_inicial} 00:00:00`);
            }

            // Fecha final
            if (filtros.fecha_final) {
                query.where('v.fecha', '<=', `${filtros.fecha_final} 23:59:59`);
            }
        })
        .orderBy('v.fecha', 'desc');
};

export const obtenerVentasPendientesPOS = async (filtros: IFiltrosVentasPOS) => {

    return dbCrm
        .select(
            'v.id',
            'v.codigo',
            'v.id_cliente',
            'c.documento as documento_cliente',
            'c.nombre as cliente',
            'v.id_vendedor',
            'u.nombre as vendedor',
            'b.id as id_tienda',
            'b.nombre as tienda',
            'v.neto',
            'v.total',
            'v.metodo_pago',
            'v.fecha',
            'v.factura_valida',
            'v.fc',
            'v.productos',
            'v.deuda'
        )
        .from('ventas as v')
        .join('clientes as c', 'v.id_cliente', 'c.id')
        .join('usuarios as u', 'v.id_vendedor', 'u.id')
        .join('bodegas as b', 'v.id_tienda', 'b.id')
        .where('v.deuda', '>', 0)
        .modify((query) => {

            // Si la tienda es "Todas", no se aplica este filtro
            if (
                filtros.id_tienda &&
                filtros.id_tienda !== 'todas'
            ) {
                query.where('v.id_tienda', filtros.id_tienda);
            }

            // Documento del cliente
            if (filtros.documento_cliente) {
                query.where('c.documento', filtros.documento_cliente);
            }

            // Fecha inicial
            if (filtros.fecha_inicial) {
                query.where('v.fecha', '>=', `${filtros.fecha_inicial} 00:00:00`);
            }

            // Fecha final
            if (filtros.fecha_final) {
                query.where('v.fecha', '<=', `${filtros.fecha_final} 23:59:59`);
            }
        })
        .orderBy('v.fecha', 'desc');
};

export const obtenerVentaDetalle = (idVenta: number) => {
    return dbCrm
        ("ventas as v")
        .select(
            "v.id",
            "v.codigo",

            "v.id_cliente",
            "c.documento as documento_cliente",
            "c.nombre as cliente",
            "c.dv",
            "c.email as email_cliente",
            "c.telefono as telefono_cliente",

            "c.id_tipo_documento",
            "td.descripcion as tipo_documento",

            "v.id_vendedor",
            "u.nombre as usuario",

            "b.id as id_tienda",
            "b.nombre as tienda",
            "b.es_brt",
            "b.direccion as direccion_tienda",
            "b.telefono as telefono_tienda",

            "v.neto",
            "v.total",
            "v.fecha",

            "v.factura_valida",
            "v.fc",

            "v.impuesto",
            "v.descuento",
            "v.productos",
            "v.metodo_pago",
        )
        .innerJoin("clientes as c", "v.id_cliente", "c.id")
        .innerJoin(
            "tipo_documento as td",
            "c.id_tipo_documento",
            "td.id"
        )
        .innerJoin("usuarios as u", "v.id_vendedor", "u.id")
        .innerJoin("bodegas as b", "v.id_tienda", "b.id")
        .where("v.id", idVenta)
        .first();
}

export const crearVentaPos = async (venta: any) => {
    return dbCrm('ventas').insert(venta);
}

export const editarVentaPos = async (idVenta: number, venta: any) => {
    return await dbCrm('ventas')
        .where('id', idVenta)
        .update(venta)
}

export const editarStockPos = async (idProducto: number, idTienda: number, stock: number) => {
    return await dbCrm('inventarios')
        .where('id_cod_producto', idProducto)
        .andWhere('id_tienda', idTienda)
        .update({ stock })
}

export const crearLogVentaCrm = async (logVenta: any) => {
    return dbCrm('log_ventas').insert(logVenta);
}

interface ILogInventario{
    "id_cod_producto":number,
    "id_tienda":number,
    "id_usuario":number,
    "stock_anterior":number,
    "stock_nuevo":number,
    "comentario":string,
}
export const crearLogInventarios = async (logInventario: ILogInventario) => {
    return dbCrm('log_inventarios').insert(logInventario);
}


export const actualizarInfoClienteCrm = async (idCliente: number, dataCliente: any) => {
    return await dbCrm('clientes')
        .where('id', idCliente)
        .update(dataCliente)
}

export const crearClienteCrm = async (cliente: any) => {
    return dbCrm('clientes').insert(cliente);
}

export const obtenerClientesCrm = async (id_tienda?: number) => {

    const query = dbCrm
        .select(
            'c.id',
            'c.nombre',
            'c.id_tipo_documento',
            'c.documento',
            'c.dv',
            'c.email',
            'c.telefono',
            'c.direccion',
            'c.compras',
            'c.ultima_compra',
            'c.fecha',
            'c.id_tienda',
            'c.origen',
            'c.id_usuario',
            // 'c.fecha_nacimiento',
            dbCrm.raw("DATE_FORMAT(c.fecha_nacimiento, '%Y-%m-%d') as fecha_nacimiento"),
            'td.descripcion as tipo_documento',
            'b.descripcion as bodega'
        )
        .from('clientes as c')
        .join(
            'tipo_documento as td',
            'c.id_tipo_documento',
            'td.id'
        )
        .join(
            'bodegas as b',
            'c.id_tienda',
            'b.id'
        );

    if (id_tienda !== undefined && id_tienda !== null) {
        query.where('c.id_tienda', id_tienda);
    }

    return query;
};

export const obtenerInventariosPos = async (filtros: {id_tienda: number[];codigo?: string;},validarSinFiltro = false) => {

    const query = dbCrm
        .select(
            'p.id',
            'p.codigo',
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' - ', pe.nombre_color)
                    ELSE p.descripcion
                END AS descripcion
            `),
            'i.stock as cantidad',
            'b.id as id_bodega',
            'b.nombre as bodega',
            'c.categoria',
            'sc.sub_categoria'
        )
        .from('inventarios as i')
        .join('productos as p', 'p.id', 'i.id_cod_producto')
        .join('bodegas as b', 'i.id_tienda', 'b.id')
        .join('categorias as c', 'p.id_categoria', 'c.id')
        .join('sub_categorias as sc', 'p.id_sub_categoria', 'sc.id')
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        })

    if (!validarSinFiltro) {
        query.whereIn('i.id_tienda', filtros.id_tienda);
    }

    if (filtros.codigo) {
        query.where('p.codigo', filtros.codigo);
    }

    return query
        .orderBy('i.stock', 'desc')
        .orderBy('p.fecha', 'desc');
};


export const obtenerInventarioPorCodigo = (codigo: string, idTienda:number) => {
    return dbCrm
        .select(
            'p.id',
            'p.codigo',
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' ', pe.nombre_color)
                    ELSE p.descripcion
                END AS descripcion
            `),
            'i.stock as cantidadDisponible',
            )
        .from('inventarios as i')
        .join('productos as p', 'p.id', 'i.id_cod_producto')
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        })
        .where('p.codigo', codigo)
        .andWhere('i.id_tienda',idTienda)
        .first()
}

export const obtenerInventarioPorId= (idProducto: number, idTienda:number) => {
    return dbCrm
        .select('i.stock',)
        .from('inventarios as i')
        .where('i.id_cod_producto', idProducto)
        .andWhere('i.id_tienda',idTienda)
        .first()
}

export const obtenerUltimaCompra = (idTienda:number) => {
    return dbCrm
        .select('codigo')
        .from('ventas as v')
        .andWhere('v.id_tienda',idTienda)
        .orderBy('id','desc')
        .first()
}

export const crearLogTrasladoPos = async (log: any) => {
    return dbCrm('log_traslados').insert(log);
}

export const mostrarLogTransferencia = async (filtros: IFiltroTrasladosProductos) => {
    const query = dbCrm("log_traslados as lg")
        .select(
            "lg.id_log",
            'lg.id_usuario',
            "u.nombre as usuario",
            dbCrm.raw(`
                CASE
                    WHEN pe.nombre_color IS NOT NULL
                        AND pe.nombre_color != ''
                    THEN CONCAT(p.descripcion, ' ', pe.nombre_color)
                    ELSE p.descripcion
                END AS producto
            `),
            "p.codigo",
            "lg.stock",
            "b1.nombre as bodega_entrada",
            "b2.nombre as bodega_salida",
            "lg.fecha"
        )
        .join("productos as p", "p.id", "lg.id_cod_producto")
        .leftJoin("usuarios as u", "u.id", "lg.id_usuario")
        .join("bodegas as b1", "b1.id", "lg.id_bodega_entrada")
        .join("bodegas as b2", "b2.id", "lg.id_bodega_salida")
        .leftJoin('producto_color as pe', function () {
            this.on('p.codigo_modelo', '=', 'pe.codigo_modelo')
                .andOn('p.color', '=', 'pe.codigo_color');
        });

    // Fecha inicial
    if (filtros.fecha_inicial) {
        query.where(
            "lg.fecha",
            ">=",
            `${filtros.fecha_inicial} 00:00:00`
        );
    }

    // Fecha final
    if (filtros.fecha_final) {
        query.where(
            "lg.fecha",
            "<=",
            `${filtros.fecha_final} 23:59:59`
        );
    }

    // Bodega salida
    if (filtros.id_bodega_salida?.length) {
        query.whereIn(
            "lg.id_bodega_salida",
            filtros.id_bodega_salida
        );
    }

    // Bodega entrada
    if (filtros.id_bodega_entrada?.length) {
        query.whereIn(
            "lg.id_bodega_entrada",
            filtros.id_bodega_entrada
        );
    }

    // Código de producto
    if (filtros.codigo_producto?.trim()) {
        query.where(
            "p.codigo",
            filtros.codigo_producto.trim()
        );
    }

    return await query.orderBy("lg.id_log", "desc");
}

export const obtenerUltimaCompraDeClientePos = (idCliente:number, idVenta:number) => {
    return dbCrm
        .select('v.*')
        .from('ventas as v')
        .andWhere('v.id_cliente',idCliente)
        .andWhere('v.id','!=',idVenta)
        .andWhere('v.factura_valida',1)
        .orderBy('id','desc')
        .first()
}

export const crearLogInOutInventario = async (logInOut: any) => {
    return dbCrm('log_in_out').insert(logInOut);
}

export const mostrarMovimientoInventarios= async (filtros: IFiltroLogInventarios) => {
    const query = dbCrm("log_in_out as lg")
        .select(
            "lg.id_log_in_out",
            dbCrm.raw(`
                CASE
                    WHEN tipo_operacion = 'in' THEN 'Entrada de inventario'
                    ELSE 'Salida de inventario'
                END AS tipo_operacion
            `),
            'lg.productos',
            "b.nombre as bodega",
            "u.nombre as usuario",
            "lg.id_usuario",
            "lg.comentario",
            "lg.fecha"
        )
        .leftJoin("usuarios as u", "u.id", "lg.id_usuario")
        .join("bodegas as b", "b.id", "lg.id_tienda")

    // Fecha inicial
    if (filtros.fecha_inicial) {
        query.where(
            "lg.fecha",
            ">=",
            `${filtros.fecha_inicial} 00:00:00`
        );
    }

    // Fecha final
    if (filtros.fecha_final) {
        query.where(
            "lg.fecha",
            "<=",
            `${filtros.fecha_final} 23:59:59`
        );
    }

    // Bodega salida
    if (filtros.id_tienda?.length) {
        query.whereIn(
            "lg.id_tienda",
            filtros.id_tienda
        );
    }
    return await query.orderBy("lg.id_log_in_out", "desc");
}
