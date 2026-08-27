import { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs'
const fs = require("fs");

// @ts-ignore
import Handlebars from "handlebars";
const DEV = process.env.DEV || ''

import * as generalService from './general'
import * as entidadBonosDao from '../databases/entidad_bono'
import { parseJson } from '../utils/parseJson';


export const consultarBonos = async (req: Request, res: Response) => {
    try {

        if(Object.entries(req.body).length == 0){
            return res.send({
            error: 1,
            msg: {
                icon: 'warning',
                text: 'No ingresaste ningún parametro de busqueda'
            }
        })
        }
        let usuariosAux = await entidadBonosDao.getBonos(req.body)
        let usuarios:any = []
        for (const usuario of usuariosAux) {
            let bonosEntregados = await entidadBonosDao.getUsuarioBonoEntrega(usuario.cod_usuario)
            let redimido = bonosEntregados.filter((bono)=>parseJson(bono.data_entrega).redimido == 0).length == 0
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
        let bonosEntregados = await generalService.getTableInformation('usuario_bono_entrega','cod_usuario', codUsuario)
        let bonos:any = []

        for (const bono of bonosEntregados) {
            let dataEntrega = parseJson(bono.data_entrega)
            let infoCargoBonosProducto = await generalService.getTableInformation('cargo_bonos_producto','cod_cargo_bonos_producto', dataEntrega.cod_cargo_bonos_producto)

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
        const entidades = await generalService.getEntidadesEntregaBonos() as { cod_entidad:number, nombre:string}[]

        let entidadesFiltradas = [] as { cod_entidad:number, nombre:string}[]
        if(entidadesUsuario.length > 0){
            entidadesFiltradas = entidades.filter(ent => entidadesUsuario.includes(ent.cod_entidad) );
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

        const dataUsuarioBonoEntrega = await generalService.getTableInformation('usuario_bono_entrega', 'cod_usuario_bono_entrega',cod_usuario_bono_entrega)
        const dataEntrega = parseJson(dataUsuarioBonoEntrega[0].data_entrega)

        const fecha_redimido = (new Date())

        const newDataEntrega = {
            ...dataEntrega,
            redimido:1,
            fecha_redimido,
            comentario_cierre,
            cedula_vendedor,
            nombre_vendedor,
            tienda,
            cod_usuario
        }

        const actualizar = await entidadBonosDao.redimirBonoEntrega(parseJson(newDataEntrega), cod_usuario_bono_entrega)



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