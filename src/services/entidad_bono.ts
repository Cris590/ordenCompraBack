import { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs'
const fs = require("fs");

// @ts-ignore
import Handlebars from "handlebars";
const DEV = process.env.DEV || ''

import * as generalService from './general'
import * as entidadBonosDao from '../databases/entidad_bono'
import * as posDao from '../databases/pos'
import * as ecommerceIntegration from './ecommerce/_index'

import { parseJson } from '../utils/parseJson';


export const consultarBonos = async (req: Request, res: Response) => {
    try {

        if (Object.entries(req.body).length == 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'warning',
                    text: 'No ingresaste ningún parametro de busqueda'
                }
            })
        }
        let usuariosAux = await entidadBonosDao.getBonos(req.body)
        let usuarios: any = []
        for (const usuario of usuariosAux) {
            let bonosEntregados = await entidadBonosDao.getUsuarioBonoEntrega(usuario.cod_usuario)
            let redimido = bonosEntregados.filter((bono) => parseJson(bono.data_entrega).redimido == 0).length == 0
            usuario.redimido = redimido
            usuarios.push(usuario)
        }
        res.send({
            error: 0,
            usuarios
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}

export const consultarBonoUsuario = async (req: Request, res: Response) => {
    try {

        const codUsuario = req.params.codUsuario
        let bonosEntregados = await generalService.getTableInformation('usuario_bono_entrega', 'cod_usuario', codUsuario)
        let bonos: any = []

        for (const bono of bonosEntregados) {
            let dataEntrega = parseJson(bono.data_entrega)
            let infoCargoBonosProducto = await generalService.getTableInformation('cargo_bonos_producto', 'cod_cargo_bonos_producto', dataEntrega.cod_cargo_bonos_producto)

            bonos.push({
                cod_usuario_bono_entrega: bono.cod_usuario_bono_entrega,
                nombre: infoCargoBonosProducto[0].nombre,
                descripcion: infoCargoBonosProducto[0].descripcion,
                valor: infoCargoBonosProducto[0].valor,
                redimido: dataEntrega.redimido,
                fecha_redimido: dataEntrega.fecha_redimido,
                comentario_cierre: dataEntrega.comentario_cierre,
                cedula_vendedor: dataEntrega.cedula_vendedor,
                nombre_vendedor: dataEntrega.nombre_vendedor,
                tienda: dataEntrega.tienda
            })

        }

        res.send({
            error: 0,
            bonos
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}

export const consultarEntidadesEntregaBonos = async (req: any, res: Response) => {
    try {

        const entidadesUsuario = (req.auth.user.entidades) ? parseJson(req.auth.user.entidades) : []
        const entidades = await generalService.getEntidadesEntregaBonos() as { cod_entidad: number, nombre: string }[]

        let entidadesFiltradas = [] as { cod_entidad: number, nombre: string }[]
        if (entidadesUsuario.length > 0) {
            entidadesFiltradas = entidades.filter(ent => entidadesUsuario.includes(ent.cod_entidad));
        }

        console.log(entidades)

        res.send({
            error: 0,
            entidades: entidadesFiltradas
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}


export const redimirBonoEntrega = async (req: Request, res: Response) => {
    try {


        const {
            comentario_cierre,
            cod_usuario_bono_entrega,
            cedula_vendedor,
            nombre_vendedor,
            tienda,
            cod_usuario
        } = req.body

        const dataUsuarioBonoEntrega = await generalService.getTableInformation('usuario_bono_entrega', 'cod_usuario_bono_entrega', cod_usuario_bono_entrega)
        const dataEntrega = parseJson(dataUsuarioBonoEntrega[0].data_entrega)

        const fecha_redimido = (new Date())

        const newDataEntrega = {
            ...dataEntrega,
            redimido: 1,
            fecha_redimido,
            comentario_cierre,
            cedula_vendedor,
            nombre_vendedor,
            tienda,
            cod_usuario
        }

        const actualizar = await entidadBonosDao.redimirBonoEntrega(JSON.stringify(newDataEntrega), cod_usuario_bono_entrega)

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Bono correctamente redimido'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}

export const obtenerBonosUsuarioRedencion = async (req: Request, res: Response) => {
    try {

        const {
            codUsuarios
        } = req.body

        const bonos = await entidadBonosDao.getBonosUsuarioRedencion(codUsuarios)
        const infoCliente = await entidadBonosDao.geInfoClienteRendecion(codUsuarios[0])

        res.send({
            error: 0,
            bonos,
            infoCliente
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}


export const buscarBonosCedula = async (req: Request, res: Response) => {
    try {

        const documento = req.params.documento
        let usuariosAux = await entidadBonosDao.getBonosUsuario(documento)
        let usuarios: any = []
        for (const usuario of usuariosAux) {
            const codUsuarios = usuario.cod_usuarios.split(',').map(Number);
            let bonosEntregados = await entidadBonosDao.getUsuarioBonoEntregaAgrupado(codUsuarios)
            let redimido = bonosEntregados.filter((bono) => parseJson(bono.data_entrega).redimido == 0).length == 0
            usuario.redimido = redimido
            usuarios.push(usuario)
        }
        res.send({
            error: 0,
            usuarios
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}


export const redimirBonosTienda = async (req: any, res: Response) => {
    try {
        const codUsuario = req.auth.user.cod_usuario
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
        const {
            bonos,
            cambio,
            cod_usuarios,
            descuento,
            impuesto,
            metodos_pago,
            productos,
            subtotal,
            total,
            total_pagado
        } = req.body

        const bonosDisponibles = await entidadBonosDao.getBonosUsuarioRedencion(cod_usuarios)
        const bonosDisponiblesRedimirArray = bonosDisponibles.map((bono: any) => +bono.cod_usuario_bono_entrega)

        // Validar que los bonos disponibles si sean validos para redimir
        const bonosInvalidos = bonos.some((bono:any) => !bonosDisponiblesRedimirArray.includes(bono.cod_usuario_bono_entrega))
        if (bonosInvalidos) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Hay bonos invalidos para redimir, revisa con el administrador.'
                }
            })
        }

        const infoCliente = await entidadBonosDao.geInfoClienteRendecion(cod_usuarios[0])

        const nuevaRedencionBono = {
            documento: infoCliente.documento,
            cod_entidad: infoCliente.cod_entidad,
            cod_usuarios: JSON.stringify(cod_usuarios),
            bonos: JSON.stringify(bonos),
            metodos_pago: JSON.stringify(metodos_pago),
            productos: JSON.stringify(productos),
            cod_usuario: codUsuario,
            id_tienda: idTienda,
            subtotal,
            total,
            impuesto,
            total_pagado,
            descuento,
            cambio
        }

        const nuevaRedencion = await entidadBonosDao.crearRedencionVenta(nuevaRedencionBono)

        let promesasActualizacionInventario = []
        if (nuevaRedencion[0]) {
            for (const producto of productos) {
                const nuevaCantidad = +producto.stock - +producto.cantidad
                await posDao.editarStockPos(producto.id, idTienda, nuevaCantidad)

                // TODO: Actualizar inventario en el ecommerce 
                /** Crear log venta */
                const logVenta = {
                    id_venta: nuevaRedencion[0],
                    id_producto: producto.id,
                    id_tienda: idTienda,
                    cantidad: producto.cantidad
                }
                await posDao.crearLogVentaCrm(logVenta)
                promesasActualizacionInventario.push(ecommerceIntegration.actualizarInventarioEcommerce(producto.id))
            }

        }

        await Promise.all(promesasActualizacionInventario)
        for (const bono of bonos) {
            
            const comentarioCierre = 'Rendecion de bono desde tienda negocio.'
            const dataUsuarioBonoEntrega = await generalService.getTableInformation('usuario_bono_entrega', 'cod_usuario_bono_entrega', bono.cod_usuario_bono_entrega)
            const infoUsuario = await generalService.getTableInformation('usuario','cod_usuario', codUsuario)
            const infoTienda = await generalService.getTableInformationCrm('bodegas', 'id', idTienda)
            
            const dataEntrega = parseJson(dataUsuarioBonoEntrega[0].data_entrega)

            const fecha_redimido = (new Date())

            const newDataEntrega = {
                ...dataEntrega,
                redimido: 1,
                fecha_redimido,
                comentario_cierre:comentarioCierre,
                cedula_vendedor: infoUsuario[0].cedula,
                nombre_vendedor: infoUsuario[0].nombre,
                tienda:infoTienda[0].nombre,
                cod_usuario:codUsuario
            }

            await entidadBonosDao.redimirBonoEntrega(JSON.stringify(newDataEntrega), bono.cod_usuario_bono_entrega)
        }

       

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Bono correctamente redimido'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las usuarios bonos'
            }
        })
    }

}