import Knex from 'knex';

import config from '../../knexfile';
import { logCrm, logDatabasePYS } from '../helpers/logger';
import * as formatMessages from '../helpers/formatLogMessages';
import { IFiltrosVentasPOS } from '../interfaces/pos';

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
        .select('p.id', 'p.codigo', 'p.precio_venta as precio', 'i.stock', 'p.descripcion as nombre', 'p.precio_compra as costo')
        .from('productos as p')
        .leftJoin('inventarios as i', 'i.id_cod_producto', 'p.id')
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

export const editarStockCrm = async (idProducto: number, idTienda: number, stock: number) => {
    return await dbCrm('inventarios')
        .where('id_cod_producto', idProducto)
        .andWhere('id_tienda', idTienda)
        .update({ stock })
}

export const crearLogVentaCrm = async (logVenta: any) => {
    return dbCrm('log_ventas').insert(logVenta);
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

export const obtenerInventariosPos = async (filtros: { id_tienda: number[] }) => {

    return dbCrm
        .select(
            'p.id',
            'p.codigo',
            'p.descripcion',
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
        .whereIn('i.id_tienda', filtros.id_tienda)
        .orderBy('i.stock', 'desc')
        .orderBy('p.fecha', 'desc');
};
/**
 * 
 * export interface IProductoTraslado {
    id: number | null;
    codigo: string;
    descripcion: string;
    cantidadDisponible: number;
}

 */
export const obtenerInventarioPorCodigo = (codigo: string, idTienda:number) => {
    return dbCrm
        .select(
            'p.id',
            'p.codigo',
            'p.descripcion',
            'i.stock as cantidadDisponible',
            )
        .from('inventarios as i')
        .join('productos as p', 'p.id', 'i.id_cod_producto')
        .where('p.codigo', codigo)
        .andWhere('i.id_tienda',idTienda)
        .first()
}