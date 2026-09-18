import Knex from 'knex';

import config  from '../../../knexfile';
import { logDatabasePYS } from '../../helpers/logger';
import * as formatMessages from '../../helpers/formatLogMessages';
import { ICategoria } from '../../interfaces/categoria';
import { IProductoResumen } from '../../interfaces/producto';
import { IDireccionWooCommerce } from '../../interfaces/webhook_ecommerce/webhook_ecommerce';

const db = Knex(config.development);

// Attach the logger to Knex queries
db.on('query', (message:any) => logDatabasePYS.info(formatMessages.queryFormat(message)))
  .on('query-error', (message:any) => logDatabasePYS.error(formatMessages.errorFormat(message)))
  .on('query-response', (message:any) => logDatabasePYS.info(formatMessages.responseFormat(message)));


export const guardarLogCreacionPedido = async (data: any) => {
    return db('ecommerce_pedidos_log').insert(data);
}

export const crearClienteEcommerce = async (data: any) => {
    return db('ecommerce_clientes').insert(data);
}

export const crearDireccionEcommerce = async (data: any) => {
    return db('ecommerce_direcciones').insert(data);
}

export const crearPedidoEcommerce = async (data: any) => {
    return db('ecommerce_pedidos').insert(data);
}

export const crearTransaccionEcommerce = async (data: any) => {
    return db('ecommerce_transactions').insert(data);
}


export const crearPedidoDetalleEcommerce = async (data: any) => {
    return db('ecommerce_pedidos_detalle').insert(data);
}

export const validarDireccionCliente = async (codCliente: number, direccion:IDireccionWooCommerce) => {
    
    return db
      .select('*')
      .from('ecommerce_direcciones')
      .where('cod_ecommerce_cliente',codCliente)
      .andWhere('direccion',direccion.address_1.trim().toLocaleUpperCase())
      .andWhere('direccion_2',direccion.address_2.trim().toLocaleUpperCase())
      .andWhere('ciudad',direccion.city)
      .andWhere('departamento', direccion.state)
      .andWhere('codigo_postal',direccion.postcode)
      .andWhere('pais',direccion.country)
      .andWhere('telefono',direccion.phone)
}

export const validarPedidoCreado = async (idWoo: number) => {
    
    return db
      .select('*')
      .from('ecommerce_pedidos')
      .where('id_woocommerce',idWoo)
      .first()
}

export const validarUltimaTransaccionPedidoCreado = async (codPedido: number) => {
    
    return db
      .select('*')
      .from('ecommerce_transactions')
      .where('cod_ecommerce_pedido',codPedido)
      .orderBy('cod_ecommerce_transaction','desc')
      .first()
}

export const actualizaTransaccionEcommerce = async (codTransaction: number, data:any) => {
    
    return db('ecommerce_transactions').where('cod_ecommerce_transaction', codTransaction).update(data)
}

export const actualizaEstadoPedidoEcommerce = async (codPedido: number, status:number) => {
    
    return db('ecommerce_pedidos').where('cod_ecommerce_pedido', codPedido).update({cod_ecommerce_estado_pedido:status})
}

