import { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs'
const fs = require("fs");
import * as generalService from '../general'
import * as webohookDao from '../../databases/webhook_ecommerce/webhook_ecommerce'
import * as crmEcommerceDao from '../../databases/crm-ecommerce'

// @ts-ignore
import Handlebars from "handlebars";
import { IDireccionWooCommerce, IOrdenWooCommerce } from '../../interfaces/webhook_ecommerce/webhook_ecommerce';
import { INuevoSeguimientoPedidoEcommerce } from '../../interfaces/crm-ecommerce';
const DEV = process.env.DEV || ''


export const procesarPedidoWooCommerce = async (req: Request, res: Response) => {
    try {
        if(!req.body.id){
            return res.send({
                error:'No hay pedido Id'
            })
        }
        const pedido = req.body as IOrdenWooCommerce
        const documentoFactura = pedido.meta_data.filter((meta: any) => meta.key == '_billing_document')[0].value
        const documentoEnvio = pedido.meta_data.filter((meta: any) => meta.key == '_shipping_document')[0].value

        // Validar cliente 
        const clienteFactura = await validarClienteEcommerce(documentoFactura, pedido.billing)
        const clienteEnvio = await validarClienteEcommerce(documentoEnvio, pedido.billing)

        const direccionFactura = await validarDireccionEcommerce(clienteFactura, pedido.billing)
        const direccionEnvio = await validarDireccionEcommerce(clienteEnvio, pedido.shipping)

        const nuevoPedido  =await crearNuevoPedido(pedido,clienteFactura,direccionFactura,direccionEnvio)
        const metodoPago = await crearMetodoPago(nuevoPedido,pedido)
        const log = {
            cod_ecommerce_pedido: nuevoPedido,
            tipo: 'creacion_pedido',
            payload: JSON.stringify(pedido)
        }
        await webohookDao.guardarLogCreacionPedido(log)

        res.send({
            error: 0,
            msg: 'Si pude ...',
        })



    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al procesar el pedido'
            }
        })
    }

}

const validarClienteEcommerce = async (documento: string, dataCliente: IDireccionWooCommerce) => {
    try {
        const cliente = await generalService.getTableInformation('ecommerce_clientes', 'documento', documento.trim())
        if (cliente.length > 0) {
            return cliente[0].cod_ecommerce_cliente
        } else {
            let dataNuevoCliente = {
                documento,
                nombre: dataCliente.first_name.trim().toLocaleUpperCase(),
                apellido: dataCliente?.last_name.trim().toLocaleUpperCase(),
                email: dataCliente?.email,
                telefono: dataCliente?.phone
            }
            const nuevoCliente = await webohookDao.crearClienteEcommerce(dataNuevoCliente)
            return nuevoCliente[0]
        }
    } catch (e) {
        return 0
    }
}

const validarDireccionEcommerce = async (codCliente: number, dataCliente: IDireccionWooCommerce) => {
    try {
        const direccion = await webohookDao.validarDireccionCliente(codCliente, dataCliente)
        if (direccion.length > 0) {
            return direccion[0].cod_ecommerce_direccion
        } else {
            let dataNuevaDirección = {
                cod_ecommerce_cliente: codCliente,
                nombre: dataCliente.first_name.trim().toLocaleUpperCase(),
                apellido: dataCliente.last_name.trim().toLocaleUpperCase(),
                direccion: dataCliente.address_1.trim().toLocaleUpperCase(),
                direccion_2: dataCliente.address_2.trim().toLocaleUpperCase(),
                ciudad: dataCliente.city,
                departamento: dataCliente.state,
                pais: dataCliente.country,
                codigo_postal: dataCliente.postcode,
                telefono: dataCliente.phone
            }
            const nuevaDireccion = await webohookDao.crearDireccionEcommerce(dataNuevaDirección)
            return nuevaDireccion[0]
        }
    } catch (e) {
        return 0
    }
}

const crearNuevoPedido = async (pedido: IOrdenWooCommerce, codClienteFactura: number, codDireccionFactura: number, codDireccionEnvio: number) => {
    try {
        const subtotal = pedido.line_items.reduce(
            (total, item) => total + Number(item.subtotal),
            0
        );

        const estadoPos = await generalService.getTableInformation('ecommerce_estado_pedido','estado_woocommerce',pedido.status)
        
        const nuevoPedidoData = {
            id_woocommerce: pedido.id,
            cod_ecommerce_cliente: codClienteFactura,
            cod_direccion_facturacion: codDireccionFactura,
            cod_direccion_envio: codDireccionEnvio,
            numero_pedido: pedido.order_key,
            estado: pedido.status, 
            cod_ecommerce_estado_pedido: estadoPos.length > 0 ? estadoPos[0].cod_ecommerce_estado_pedido : 0,
            subtotal: subtotal,
            impuesto: pedido.total_tax,
            envio: pedido.shipping_total,
            total: pedido.total,
            metodo_pago: pedido.payment_method_title,
            codigo_metodo_pago: pedido.payment_method
        }

        const nuevoPedido = await webohookDao.crearPedidoEcommerce(nuevoPedidoData)

        let productosNuevos: any = []
        for (const producto of pedido.line_items) {
            const nuevoProducto = {
                cod_ecommerce_pedido: nuevoPedido[0],
                id_woo_variacion: producto.variation_id,
                cantidad: producto.quantity,
                precio: Number(producto.price),
                descuento: Number(producto.subtotal) - Number(producto.total),
                impuesto: Number(producto.total_tax),
                total:producto.total
            };
            productosNuevos.push(nuevoProducto)
        }

        await webohookDao.crearPedidoDetalleEcommerce(productosNuevos)
        await crmEcommerceDao.crearSeguimientoPedidoEcommerce({
            cod_ecommerce_pedido:nuevoPedido[0],
            cod_ecommerce_estado_pedido: estadoPos.length > 0 ? estadoPos[0].cod_ecommerce_estado_pedido : 0,
            descripcion:'Creación nuevo pedido'
        })
        return nuevoPedido[0]
    } catch (e) {
        return 0
    }
}

const crearMetodoPago = async (codPedido:number,pedido: IOrdenWooCommerce,status:string = 'pending',)=>{
    try {   
        const transaccion = {
            cod_ecommerce_pedido:codPedido,
            id_transaccion: pedido.transaction_id,
            metodo_pago: pedido.payment_method,
            monto: pedido.total,
            moneda: pedido.currency,
            fecha_transaccion: pedido.date_paid,
            estado:status
        };

        await webohookDao.crearTransaccionEcommerce(transaccion)
    } catch (e) {
        
    }
}

export const actualizarPedidoWooCommerce = async (req: Request, res: Response) => {
    try {

        console.log('---------- VAMOS A ACTUALIZAR ESTE PEDIDO ----------');

        const pedido = req.body as IOrdenWooCommerce;
        const pedidoCreado = await webohookDao.validarPedidoCreado(pedido.id);
        const log = {
            cod_ecommerce_pedido: pedidoCreado.cod_ecommerce_pedido,
            tipo: 'actualizacion_pedido',
            payload: JSON.stringify(req.body)
        };
        await webohookDao.guardarLogCreacionPedido(log);

        const estadoPos = await generalService.getTableInformation('ecommerce_estado_pedido','estado_woocommerce',pedido.status)
        const nuevoEstadoPedidoCrm = estadoPos.length > 0 ? estadoPos[0].cod_ecommerce_estado_pedido : 0
        // Actualizar estado del pedido si cambió
        // if (pedidoCreado.cod_ecommerce_estado_pedido !== nuevoEstadoPedidoCrm) {
        //     await webohookDao.actualizaEstadoPedidoEcommerce(pedidoCreado.cod_ecommerce_pedido,nuevoEstadoPedidoCrm);
        // }

        let nuevoSeguimiento:INuevoSeguimientoPedidoEcommerce = {
            cod_ecommerce_pedido:pedidoCreado.cod_ecommerce_pedido,
            cod_ecommerce_estado_pedido:nuevoEstadoPedidoCrm,
            descripcion:'Actualización por webhook del pedido'

        }
        // Validar última transacción
        const ultimaTransaccion = await webohookDao.validarUltimaTransaccionPedidoCreado(pedidoCreado.cod_ecommerce_pedido);

        if (ultimaTransaccion) {

            // Si el método de pago es el mismo
            if (ultimaTransaccion.metodo_pago === pedido.payment_method) {

                // Si la transacción está vacía y WooCommerce ya trae información,
                // completamos la transacción existente.
                if (!ultimaTransaccion.id_transaccion && pedido.transaction_id) {
                    nuevoSeguimiento.descripcion = 'Actualización del metodo de pago'
                    const transaccion = {
                        id_transaccion: pedido.transaction_id,
                        metodo_pago: pedido.payment_method,
                        monto: pedido.total,
                        moneda: pedido.currency,
                        fecha_transaccion: pedido.date_paid,
                        estado: 'aprobado'
                    };

                    await webohookDao.actualizaTransaccionEcommerce(
                        ultimaTransaccion.cod_ecommerce_transaction,
                        transaccion
                    );
                }

            } else {
                nuevoSeguimiento.descripcion = 'Cambio de metodo de pago, se crea nueva transacción'
                // Cambió el método de pago → crear nueva transacción
                await crearMetodoPago(pedidoCreado.cod_ecommerce_pedido,pedido);
            }
        }

        

        
        await crmEcommerceDao.crearSeguimientoPedidoEcommerce(nuevoSeguimiento)

        res.send({
            error: 0,
            msg: 'Si pude ...',
        });

    } catch (e: any) {

        console.log('***********');
        console.log(e);

        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al procesar el pedido'
            }
        });
    }
}

