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

        const { codUsuario } = req.params
        let usuario: IUser = req.body

        await userService.editUser(usuario, +codUsuario)
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

        let usuario: IUser = req.body

        await userService.crearUsuarioAplicacionCompleta(usuario)
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

