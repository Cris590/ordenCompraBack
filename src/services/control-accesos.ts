import { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs'
const fs = require("fs");

// @ts-ignore
import Handlebars from "handlebars";
const DEV = process.env.DEV || ''

import * as generalService from './general'
import * as controlAccesosDao from '../databases/control-accesos'
import * as userService from '../services/users';
import { IUser } from '../interfaces/user';


export const getUsuariosAplicacion = async (req: Request, res: Response) => {
    try {
        
        const usuarios = await controlAccesosDao.getUsuariosAplicacionCompleta()
        const entidades = await generalService.getEntidadesEntregaBonos()
        res.send({
            error: 0,
            usuarios,
            entidades
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

export const editarUsuario = async (req: Request, res: Response) => {
    try {
        let codPerfil = req.body.cod_perfil
        let idBodega = req.body.id_bodega
        let idUsuarioCrm = req.body.id_usuario_crm

        delete req.body.id_bodega
        delete req.body.id_usuario_crm

        const { codUsuario } = req.params
        let usuario: IUser = req.body

        await userService.editUser(usuario, +codUsuario)

        /**Validar si el usuario es vendedor para hacer la modificación */
        const vendedor = await generalService.getTableInformation('vendedor','cod_usuario',codUsuario)
        if(vendedor.length > 0){
            const vendedor = {
                id_usuario_crm: idUsuarioCrm,
                id_bodega: idBodega
            }
            await controlAccesosDao.actualizarVendedor(+codUsuario,vendedor)
            await controlAccesosDao.actualizarVendedorCrm(idUsuarioCrm,{id_tienda:idBodega })
        }
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Usuario modificado correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar el usuario'
            }
        })
    }

}


export const obtenerPerfilesAplicacion = async (req: Request, res: Response) => {
    try {

       const perfiles = await controlAccesosDao.obtenerPerfilesAplicacion()
        res.send({
            error: 0,
           perfiles
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener perfiles'
            }
        })
    }

}

export const crearUsuario = async (req: Request, res: Response) => {
    try {
        let codPerfil = req.body.cod_perfil
        let idBodega = req.body.id_bodega
        let idUsuarioCrm = req.body.id_usuario_crm

        delete req.body.id_bodega
        delete req.body.id_usuario_crm

        let usuario: IUser = req.body

        const usuarioNuevo = await userService.crearUsuarioAplicacionCompleta(usuario)
        
        // Si es perfil vendedor se va a crear el registro en la tabla vendedor.
        if(codPerfil == 8){
            const vendedor = {
                cod_usuario:usuarioNuevo.createdUser,
                id_usuario_crm: idUsuarioCrm,
                id_bodega: idBodega
            }
            await controlAccesosDao.crearVendedor(vendedor)
            await controlAccesosDao.actualizarVendedorCrm(idUsuarioCrm,{id_tienda:idBodega })

        }
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Usuario creado correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar el usuario'
            }
        })
    }

}

