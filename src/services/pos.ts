import { Request, Response, text } from 'express';
import * as posDao from '../databases/pos'
import * as productoDao from '../databases/producto'

import * as generalService from '../services/general'
import { RequestToken } from '../interfaces/express';
import { IFiltrosVentasPOS, IProductoVentaPOS, ITrasladoProductos } from '../interfaces/pos';
import { generateRandomNumber } from '../helpers/general';
import { generatePdfTicket } from '../helpers/createDocumentPdf';
import path from 'path';
const fs = require("fs");
const DEV = process.env.DEV || ''
// @ts-ignore
import Handlebars from "handlebars";
import { currencyFormat } from '../helpers/currencyFormat';



export const obtenerMediosPago = async (req: Request, res: Response) => {
    try {
        const metodosPago = await generalService.getTableInformationCrm('metodos_pago', 'activo', 1)
        res.send({
            error: 0,
            metodosPago
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener medios de pago'
            }
        })
    }

}

export const obtenerClientePorDocumento = async (req: Request, res: Response) => {
    try {
        const cliente = await generalService.getTableInformationCrm('clientes', 'documento', req.params.documento)
        res.send({
            error: 0,
            cliente: cliente.map(({
                nombre,
                documento,
                dv,
                id
            }) => ({
                nombre,
                documento,
                dv,
                id
            }))
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener cliente por documento'
            }
        })
    }

}

export const obtenerTiendasPosUsuario = async (req: any, res: Response) => {
    try {

        const codUsuario = req.auth.user.cod_usuario;
        const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
        let idTiendaObligatorio = 0
        let ultimaCompra;
        if (infoVendedor.length > 0) {
            idTiendaObligatorio = infoVendedor[0].id_bodega
           
        }


        const bodegas = await posDao.obtenerTiendasPosUsuario()
        
        res.send({
            error: 0,
            bodegas,
            idTiendaObligatorio
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener cliente por documento'
            }
        })
    }

}


export const obtenerTiendasPos = async (req: Request, res: Response) => {
    try {
        const tiendas = await generalService.getTableInformationCrm('bodegas')
        res.send({
            error: 0,
            tiendas
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener tiendas'
            }
        })
    }

}

export const obtenerVendedoresCrm = async (req: Request, res: Response) => {
    try {
        const vendedores = await generalService.getTableInformationCrm('usuarios', 'perfil', 4)
        const vendedoresCrm = vendedores.filter((vendedor) => vendedor.estado == 1).map(({ id, nombre, usuario }) => ({ id, nombre, usuario }))
        res.send({
            error: 0,
            vendedores: vendedoresCrm
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener vendedores activos'
            }
        })
    }

}

export const obtenerVendedoresPorTienda = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario;
        const vendedores = await posDao.obtenerVendedoresPorTienda(codUsuario)
        const ultimaCompra = await posDao.obtenerUltimaCompra(vendedores[0].id_bodega)
        const bodega = await generalService.getTableInformationCrm('bodegas','id',vendedores[0].id_bodega)
  
        res.send({
            error: 0,
            vendedores: vendedores,
            codigoNuevo:ultimaCompra ? +ultimaCompra.codigo + 1 : 0,
            esBrt: (bodega.length>0)? bodega[0].es_brt : null
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener vendedores activos'
            }
        })
    }

}

export const obtenerInfoProductoVenta = async (req: any, res: Response) => {
    try {
        const codigo = req.params.codigo;
        const codUsuario = req.auth.user.cod_usuario;
        const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
        if (infoVendedor.length == 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'El usuario no tiene permisos para crear una venta'
                }
            })
        }
        const producto = await posDao.obtenerProductoPorCodigoVenta(codigo, infoVendedor[0].id_bodega)

        res.send({
            error: 0,
            producto:producto[0]
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener productos'
            }
        })
    }

}

export const crearVentaPos = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario;
        const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
        if (infoVendedor.length == 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'El usuario no tiene permisos para crear una venta'
                }
            })
        }
        const idTienda = infoVendedor[0].id_bodega
        const ventaReq = req.body
        const ultimaCompra = await posDao.obtenerUltimaCompra(idTienda)

        let venta ={
            codigo: +ultimaCompra.codigo + 1,
            id_cliente:ventaReq.clienteId,
            id_vendedor:ventaReq.vendedorId,
            id_tienda:idTienda,
            productos:JSON.stringify(ventaReq.productos),
            impuesto:ventaReq.impuesto,
            neto:ventaReq.neto,
            total:ventaReq.total,
            costos:ventaReq.costos,
            descuento:ventaReq.descuento,
            metodo_pago:JSON.stringify(ventaReq.pagos),
            deuda:ventaReq.deuda,
            fc:0
        }
        
        const nuevaVenta = await posDao.crearVentaPos(venta)

        /**Actualizar inventario e información del cliente */
        if(nuevaVenta[0] && ventaReq.deuda == 0){
            for (const producto of ventaReq.productos) {
                await posDao.editarStockPos(producto.id, idTienda, producto.stock)

                // TODO: Actualizar inventario en el ecommerce 
                /** Crear log venta */
                const logVenta = {
                    id_venta:nuevaVenta[0],
                    id_producto:producto.id,
                    id_tienda:idTienda,
                    cantidad:producto.cantidad
                }
                await posDao.crearLogVentaCrm(logVenta)
            }
        
            /** Actualizar compras del cliente */
            const cliente = await generalService.getTableInformationCrm('clientes','id',ventaReq.clienteId)
            await posDao.actualizarInfoClienteCrm(ventaReq.clienteId, { 
                compras:+cliente[0].compras + 1,
                ultima_compra:new Date()
            })
        }

        res.send({
            error: 0,
            ventaId:nuevaVenta[0],
            msg: {
                icon: 'success',
                text: 'Venta creada correctamente.'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear la venta'
            }
        })
    }

}

export const editarVentaPos = async (req: any, res: Response) => {
    try {
        
        const codUsuario = req.auth.user.cod_usuario;
        const idVenta = req.params.id_venta

        const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
        if (infoVendedor.length == 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'El usuario no tiene permisos para crear una venta'
                }
            })
        }
        const idTienda = infoVendedor[0].id_bodega
        const ventaReq = req.body
        const ultimaCompra = await generalService.getTableInformationCrm('ventas','id_tienda',idTienda)

        let venta ={
            codigo: +ultimaCompra[0].codigo + 1,
            id_cliente:ventaReq.clienteId,
            id_vendedor:ventaReq.vendedorId,
            id_tienda:idTienda,
            productos:JSON.stringify(ventaReq.productos),
            impuesto:ventaReq.impuesto,
            neto:ventaReq.neto,
            total:ventaReq.total,
            costos:ventaReq.costos,
            descuento:ventaReq.descuento,
            metodo_pago:JSON.stringify(ventaReq.pagos),
            deuda:ventaReq.deuda,
            fc:0
        }
        
        const nuevaVenta = await posDao.editarVentaPos(idVenta, venta)

        /**Actualizar inventario e información del cliente */
        if(ventaReq.deuda == 0){
            for (const producto of ventaReq.productos) {
                await posDao.editarStockPos(producto.id, idTienda, producto.stock)

                // TODO: Actualizar inventario en el ecommerce 
                /** Crear log venta */
                const logVenta = {
                    id_venta:idVenta,
                    id_producto:producto.id,
                    id_tienda:idTienda,
                    cantidad:producto.cantidad
                }
                await posDao.crearLogVentaCrm(logVenta)
            }
        
            /** Actualizar compras del cliente */
            const cliente = await generalService.getTableInformationCrm('clientes','id',ventaReq.clienteId)
            await posDao.actualizarInfoClienteCrm(ventaReq.clienteId, { 
                compras:+cliente[0].compras + 1,
                ultima_compra:new Date()
            })
        }

        res.send({
            error: 0,
            ventaId:idVenta,
            msg: {
                icon: 'success',
                text: 'Venta creada correctamente.'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al actualizar la venta'
            }
        })
    }

}


export const obtenerVentasPos = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario;
        const codPerfil = req.auth.user.cod_perfil;
        const filtros = req.body as IFiltrosVentasPOS
        
        const perfilesValidosRes = await generalService.getTableInformation('variable', 'nombre', 'PERFILES_BUSQUEDA_VENTAS_POS');
        const perfilesValidos = JSON.parse(perfilesValidosRes[0].valor)

        if(!perfilesValidos.includes(+codPerfil)){
            return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'El usuario no tiene permisos para crear una venta'
                    }
                })
        }


        // Si es vendedor validar su existencia, configuracion y su perfil
        if(codPerfil == 8){
            const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
            if (infoVendedor.length == 0) {
                return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'El usuario no tiene permisos ver las ventas'
                    }
                })
            }else{
                filtros.id_tienda = infoVendedor[0].id_bodega
            }
        }
        
        const ventas = await posDao.obtenerVentasPOS(filtros)

        res.send({
            error: 0,
            ventas
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener productos'
            }
        })
    }

}

export const obtenerVentasRetomarCrm = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario;
        const codPerfil = req.auth.user.cod_perfil;
        const filtros = req.body as IFiltrosVentasPOS
        
        const perfilesValidosRes = await generalService.getTableInformation('variable', 'nombre', 'PERFILES_BUSQUEDA_VENTAS_POS');
        const perfilesValidos = JSON.parse(perfilesValidosRes[0].valor)

        if(!perfilesValidos.includes(+codPerfil)){
            return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'El usuario no tiene permisos para crear una venta'
                    }
                })
        }

        // Si es vendedor validar su existencia, configuracion y su perfil
        if(codPerfil == 8){
            const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
            if (infoVendedor.length == 0) {
                return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'El usuario no tiene permisos ver las ventas'
                    }
                })
            }else{
                filtros.id_tienda = infoVendedor[0].id_bodega
            }
        }
        
        const ventas = await posDao.obtenerVentasPendientesPOS(filtros)

        res.send({
            error: 0,
            ventas
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener productos'
            }
        })
    }

}




export const obtenerVentaDetalle = async (req: any, res: Response) => {
    try {
        const idVenta = req.params.id_venta;
        
        const venta = await posDao.obtenerVentaDetalle(idVenta)
        
        let productosModificados:IProductoVentaPOS[] = []
        for (const producto of JSON.parse(venta.productos)) {
            const productoDetalle = await  generalService.getTableInformationCrm('productos','id',producto.id)
            productosModificados.push({
                codigo:productoDetalle[0].codigo,
                descripcion:productoDetalle[0].descripcion,
                cantidad: producto.cantidad,
                precio: producto.precio,
                total: producto.total
            })
        }

        venta.productos = productosModificados

        if (venta.metodo_pago) {        
            try {
                venta.metodo_pago = JSON.parse(venta.metodo_pago);
            } catch (error) {
                venta.metodo_pago = [];
            }
        } else {
            venta.metodo_pago = [];
        }

        venta.total_sin_descuento = venta.neto / (1 - venta.descuento );
        venta.total_productos = productosModificados.length
        
        res.send({
            error: 0,
            venta
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener productos'
            }
        })
    }

}

export const generarFactura = async (req: Request,res: Response) => {

    try {
        const { id_venta } = req.params;
        const venta = await posDao.obtenerVentaDetalle(+id_venta);
        if (!venta) {

            return res.send({
                error: 1,
                msg: {
                    icon: "error",
                    text: "No se encontró la venta"
                }
            });
        }

        let productosModificados = []
         for (const producto of JSON.parse(venta.productos)) {
            const productoDetalle = await  generalService.getTableInformationCrm('productos','id',producto.id)
            productosModificados.push({
                codigo:productoDetalle[0].codigo,
                descripcion:productoDetalle[0].descripcion,
                cantidad: producto.cantidad,
                valorUnitario: currencyFormat(productoDetalle[0].precio_venta),
                precioTotal: currencyFormat(productoDetalle[0].precio_venta * producto.cantidad),
            })
        }

        venta.productos = productosModificados

        const metodosPago = JSON.parse(venta.metodo_pago || "[]").map((metodoPago:any)=>({
            metodo_pago:metodoPago.metodo_pago,
            valor:currencyFormat(metodoPago.valor)
        }));

        let msgResolucion = '';
        if (venta["fc"] == 1 || venta["fc"] == 2) {
            let resolucionInicial = '';
            let resolucionFinal = ''
			if (venta["fc"] == 1) {
				resolucionInicial = venta['cod_pos_inicial'];
				resolucionFinal = venta['cod_pos_final'];
			} else if (venta["fc"] == 2) {
				resolucionInicial = venta['codigo_factura'];
				resolucionFinal = venta['codigo_final'];
			}

			msgResolucion = 'AUTORIZACION DIAN nº 00000000 DEL 000 DESDE  ' + resolucionInicial + ' HASTA ' + resolucionFinal + '';
		} else if (venta["fc"] == 0) {
			msgResolucion = 'GRACIAS POR SU COMPRA';
		}

        const fecha = new Date(venta.fecha);
        const anio = fecha.getFullYear();
        const mes = String(fecha.getMonth() + 1).padStart(2, "0");
        const dia = String(fecha.getDate()).padStart(2, "0");

        const horas = String(fecha.getHours()).padStart(2, "0");
        const minutos = String(fecha.getMinutes()).padStart(2, "0");
        const segundos = String(fecha.getSeconds()).padStart(2, "0");

        const fechaFormateada = `${anio}-${mes}-${dia}`;
        const horaFormateada = `${horas}:${minutos}:${segundos}`;

        const data = {
            codigo:venta.codigo,
            fecha:fechaFormateada,
            hora:horaFormateada,
            usuario:venta.usuario,
            
            documento_cliente:venta.documento_cliente,
            cliente:venta.cliente,
            telefono_cliente:venta.telefono_cliente,
            email_cliente:venta.email_cliente,

            bodega:venta.tienda,
            productos: venta.productos,
            metodosPago,

            nombre_empresa:(venta.es_brt == 1) ?  'INVERSIONES BRT SAS':'BARONATTO PH',
            nombre_comercial:(venta.es_brt == 1) ?  '':'<br> Juan Pablo Huertas Rodriguez',
            nit_empresa:(venta.es_brt == 1) ?  '901.474.311-8':'1000217136-7',
            correo_empresa:(venta.es_brt == 1) ?  'inverbarsas@gmail.com':'almacenpablohuertastunja@gmail.com',
            responsabilidad_fiscal:(venta.es_brt == 1) ? 'RESPONSABLE DE IVA':'NO RESPONSABLE DE IVA',
            direccion_tienda:venta.direccion_tienda,
            telefono_tienda:venta.telefono_tienda,
            msgResolucion,
            
            total_productos: productosModificados.reduce((total: number,producto: any) => total + Number( producto.cantidad || 0),0),
            descuento:venta.descuento,
            impuesto:currencyFormat(venta.impuesto),
            total:currencyFormat(venta.total),
            subtotal:currencyFormat(venta.neto/(1-(venta.descuento/100)))
        };

        const nombreInicial =generateRandomNumber(6);
        const basePath = path.join(process.cwd(),"documents_storage/facturas",`${nombreInicial}_venta_${venta.codigo}`);
        const htmlPath =`${basePath}.html`;
        const pdfPath =`${basePath}.pdf`;

        // -------------------------
        // HANDLEBARS
        // -------------------------

        const templateHtml = fs.readFileSync(path.join(process.cwd(),`${DEV}/templates/factura_pos.html`),"utf8");
        const template =Handlebars.compile(templateHtml);
        const html = template(data);
        fs.writeFileSync(htmlPath,html,"utf8");

        // -------------------------
        // PDF
        // -------------------------

        const height = calcularAlturaFactura(productosModificados.length,metodosPago.length);
        const pdf = await generatePdfTicket(pdfPath,htmlPath,height,true);

        if (pdf.error !== 0) {

            return res.send({
                error: 1,
                msg: {
                    icon: "error",
                    text: pdf.message
                }
            });
        }

        // -------------------------
        // DESCARGAR
        // -------------------------

        res.download(
            pdfPath,
            `factura-${venta.codigo}.pdf`,
            (err) => {

                if (err) {

                    console.error(
                        "Error descargando factura",
                        err
                    );

                    return;
                }

                fs.unlink(
                    pdfPath,
                    (unlinkErr:any) => {

                        if (unlinkErr) {

                            console.error(
                                "Error eliminando PDF",
                                unlinkErr
                            );

                        }
                    }
                );

            }
        );

    } catch (e: any) {

        console.error(
            "******** ERROR FACTURA ********"
        );

        console.error(e);

        return res.send({
            error: 1,
            msg: {
                icon: "error",
                text:
                    "Error al generar la factura"
            }
        });
    }
};

const calcularAlturaFactura = (cantidadProductos: number,cantidadMetodosPago: number): number => {

    let altura = 222;
    altura += cantidadProductos * 11;
    altura += cantidadMetodosPago * 8;
    return altura;
};


export const obtenerTiposDocumento = async (req: any, res: Response) => {
    try {
        const tiposDocumento = await generalService.getTableInformationCrm('tipo_documento')
        
        res.send({
            error: 0,
            tiposDocumento,
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener tipos de documento'
            }
        })
    }

}

export const obtenerClientesPos = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario;
        const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
        
        let idTienda = null
        if (infoVendedor.length > 0) {
            idTienda = infoVendedor[0].id_bodega
        }
        const clientes = await posDao.obtenerClientesCrm(idTienda)
        
        res.send({
            error: 0,
            clientes,
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener vendedores activos'
            }
        })
    }

}

export const actualizarClienteCrm = async (req: Request, res: Response) => {
    try {

        let { idCliente } = req.params

        let cliente = await posDao.actualizarInfoClienteCrm( +idCliente,req.body)
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Cliente actualizado correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al actualizar el cliente'
            }
        })
    }

}


export const crearClienteCrm = async (req: any, res: Response) => {
    try {
        
        const codUsuario = req.auth.user.cod_usuario;
        let clienteNuevo = req.body
        const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)

        if (infoVendedor.length > 0) {
            const idTienda = infoVendedor[0].id_bodega   
            clienteNuevo.origen = 'crear-venta-crm'  
            clienteNuevo.id_tienda = idTienda
            clienteNuevo.id_usuario = infoVendedor[0].id_usuario_crm
        }else{
            clienteNuevo.origen = 'modulo-cliente-crm'
            clienteNuevo.id_tienda = 0
            clienteNuevo.codUsuario  
        }
       
        const validarCliente = await generalService.getTableInformationCrm('clientes','documento',clienteNuevo.documento)
        if(validarCliente.length > 0){
            return res.send({
                error: 1,
                msg:{
                    icon:'error',
                    text:'Ya existe un cliente con el documento ' + clienteNuevo.documento
                }
            })
        }
        let cliente = await posDao.crearClienteCrm(clienteNuevo)
        
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Cliente creado correctamente'
            },
            idCliente:cliente[0],
            documento:req.body.documento
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear el cliente'
            }
        })
    }

}

export const obtenerVentaParaRemotar = async (req: any, res: Response) => {
    try {
        const idVenta = req.params.id_venta;
        
        const ventaInfo = await generalService.getTableInformationCrm('ventas','id',idVenta)
        if(ventaInfo.length == 0){
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'No existe venta con estos parametros'
                }
            })
        }

        const venta = ventaInfo[0]

        const descuento = venta.descuento
   
        let productosModificados:any[] = []
        for (const producto of JSON.parse(venta.productos)) {
            const productoDetalle = await  generalService.getTableInformationCrm('productos','id',producto.id)
            const inventarioProducto = await  posDao.obtenerProductoPorCodigoVenta(productoDetalle[0].codigo, venta.id_tienda)
            productosModificados.push({
                id:producto.id,
                codigo:productoDetalle[0].codigo,
                nombre:productoDetalle[0].descripcion,
                precio: producto.precio,
                stock: inventarioProducto[0].stock,
                costo: productoDetalle[0].precio_compra,
                cantidad: producto.cantidad,
            })
        }


        if (venta.metodo_pago) {        
            try {
                venta.metodo_pago = JSON.parse(venta.metodo_pago);
            } catch (error) {
                venta.metodo_pago = [];
            }
        } else {
            venta.metodo_pago = [];
        }

        let metodosPagoModificado:any[] = []
        for (const metodoPago of venta.metodo_pago) {
            const detalleMetodoPago = await generalService.getTableInformationCrm('metodos_pago','valor',metodoPago.metodo_pago)
            if(detalleMetodoPago.length > 0){
                metodosPagoModificado.push({
                    id_metodo_pago: detalleMetodoPago[0].id,
                    nombre: detalleMetodoPago[0].valor,
                    valor: metodoPago.valor
                })
            }
        }

        const clienteInfo = await generalService.getTableInformationCrm('clientes','id',venta.id_cliente)
        const clienteModificado = {
            id: clienteInfo[0].id,
            documento: clienteInfo[0].documento,
            nombre: clienteInfo[0].nombre,
            dv: clienteInfo[0].dv
        }
        
        const vendedor = await posDao.obtenerVendedoresVenta(venta.id_vendedor)

        
        res.send({
            error: 0,
            descuento,
            productos:productosModificados,
            cliente:clienteModificado,
            vendedor,
            mediosPago:metodosPagoModificado
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener venta a retomar'
            }
        })
    }

}

export const obtenerInventariosPos = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario;
        const codPerfil = req.auth.user.cod_perfil;
        const filtros = req.body as {id_tienda:number[]}
        
        // Si es vendedor validar su existencia, configuracion y su perfil
        if(codPerfil == 8){
            const infoVendedor = await generalService.getTableInformation('vendedor', 'cod_usuario', codUsuario)
            if (infoVendedor.length == 0) {
                return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'El usuario no tiene permisos ver las ventas'
                    }
                })
            }else{
                filtros.id_tienda = [infoVendedor[0].id_bodega]
            }
        }
        
        const inventarios = await posDao.obtenerInventariosPos(filtros)

        res.send({
            error: 0,
            inventarios
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener productos'
            }
        })
    }

}

export const obtenerInventarioPorCodigo = async (req: any, res: Response) => {
    try {
        const codigo = req.params.codigo;
        const idTienda = req.params.id_tienda;
        const producto = await posDao.obtenerInventarioPorCodigo(codigo, idTienda)
        res.send({
            error: 0,
            producto
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener inventario'
            }
        })
    }

}

export const busquedaInventarioCodigo = async (req: any, res: Response) => {
    try {
        const codigo = req.params.codigo;
        const inventarios = await posDao.obtenerInventariosPos({codigo, id_tienda:[]}, true)
        res.send({
            error: 0,
            inventarios
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener el inventario.'
            }
        })
    }

}

export const transferirProductosEntreBodegas = async (req: any, res: Response) => {
    try {
        
        const codUsuario = req.auth.user.cod_usuario;
        const transferencia = req.body as ITrasladoProductos
        
        for (const producto of transferencia.productos) {

            const stockBodegaSalida = producto.cantidadDisponible - producto.cantidadTransferir 
            await posDao.editarStockPos(producto.id,transferencia.bodegaSalida,stockBodegaSalida)

            const stockActualBodegaEntrada = await posDao.obtenerInventarioPorCodigo(producto.codigo, transferencia.bodegaEntrada)
            await posDao.editarStockPos(producto.id,transferencia.bodegaEntrada,stockActualBodegaEntrada.cantidadDisponible + producto.cantidadTransferir)
        
            const logTraslado = {
                id_usuario: codUsuario,
                stock:producto.cantidadTransferir,
                id_bodega_salida:transferencia.bodegaSalida,
                id_bodega_entrada:transferencia.bodegaEntrada
            }

            await posDao.crearLogTrasladoPos(logTraslado)
        }


       

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Transferencia creada correctamente.'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener productos'
            }
        })
    }

}
