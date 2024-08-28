
import { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs'

import * as generalService from './general'
import * as entidadDao from '../databases/entidad'
import * as userDao from '../databases/users';
import * as userService from '../services/users';
import { processCSVFile } from '../helpers/csvUpload';
import { IUser } from '../interfaces/user';

export const obtenerEntidades = async (req: Request, res: Response) => {
    try {
        let entidades = await entidadDao.getEntidades()
        res.send({
            error: 0,
            entidades
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las entidades'
            }
        })
    }

}

export const crearEntidad = async (req: Request, res: Response) => {
    try {
        if (!req.body.nombre || !req.body.cod_categorias) {
            return res.send({
                error: 1,
                msg: {
                    type: 'error',
                    message: 'Los parametros son obligatorios'
                }
            })
        }

        req.body.cod_categorias = JSON.stringify(req.body.cod_categorias)
        let entidad = await entidadDao.crearEntidad(req.body)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'entidad creado correctamente'
            },
            cod_entidad: entidad[0]
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las entidades'
            }
        })
    }

}


export const obtenerInfoBasicaEntidad = async (req: Request, res: Response) => {
    try {
        let { codEntidad } = req.params

        let entidad = await entidadDao.getInfoBasicaEntidad(codEntidad)
        if (entidad.length > 0) {
            entidad[0].cod_categorias = JSON.parse(entidad[0].cod_categorias)
        }
        res.send({
            error: 0,
            entidad: entidad.length > 0 ? entidad[0] : {}
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar los productos'
            }
        })
    }

}


export const editarEntidad = async (req: Request, res: Response) => {
    try {

        let { codEntidad } = req.params

        if (req.body.cod_categorias) {
            req.body.cod_categorias = JSON.stringify(req.body.cod_categorias)
        }
        await entidadDao.actualizarEntidad(req.body, +codEntidad)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'entidad editada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar los productos'
            }
        })
    }

}

export const cargarUsuariosEntidad = async (req: Request, res: Response) => {
    try {

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.usuarios) {
            return res.status(400).send('No hay archivo cargado.');
        }

        let csvFile = Array.isArray(req.files.usuarios) ? req.files.usuarios[0] : req.files.usuarios
        const uploadPath = path.join(process.cwd(), `uploads/usuarios/`, csvFile.name)
        await csvFile.mv(uploadPath)

        const rows: IUsuarioCarga[] = await processCSVFile(uploadPath);

        // Validar que las columnas si correspondan

        console.log(rows[0])

        let columnasValidas = ["NOMBRE", "CEDULA", "EMAIL", "SEXO", "ACTIVO", "PASSWORD",]
        let columnasArchivo = Object.keys(rows[0]).filter((value)=>value.length > 0)
                                .map((rowName) => rowName.toLocaleUpperCase().trim())

        const isSameColumns = columnasValidas.length === columnasArchivo.length &&
            columnasValidas.every((col, index) => col === columnasArchivo[index]);

        if (!isSameColumns) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Las columnas no corresponden , recuerde, los encabezados del archivo deben ser =>' + columnasValidas.join(',') + ' Y NO debe tener tildes en los encabezados.'
                }
            })
        }

        let {
            usuariosCreacion,
            total
        } = await validarUsuarios(rows, +req.body.cod_entidad)

        if(usuariosCreacion.length > 0){
            await userDao.createUser(usuariosCreacion)
        }

        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:`Total de clientes cargados ( ${total} )`
            }
        })

    } catch (e: any) {
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al cargar el archivo'
            }
        })
    }
}

interface IUsuarioCarga {
    nombre: string,
    documento: string,
    email: string,
    sexo: string,
    activo: number,
    password: string
}

const validarUsuarios = async (usuarios: IUsuarioCarga[], codEntidad:number) => {
    try {
    
        let usuariosCreacion:IUser[] = []
        let usuariosCreados = 0
        for (const usuario of usuarios) {
            let usuarioLimpio = await limpiarUsuario(usuario, codEntidad)
            if(usuarioLimpio){
                usuariosCreacion.push(usuarioLimpio)
                usuariosCreados += 1
            }
        }   

        return {
            usuariosCreacion,
            total:usuariosCreados
        }
    } catch (e) {
        return {
            usuariosCreacion:[],
            total:0
        }
    }
}


const limpiarUsuario = async (usuarioEntidad: IUsuarioCarga, codEntidad: number) => {
    try {


        let usuarioLimpio: IUser | null = {
            cod_perfil: 3,
            cod_entidad: codEntidad,
            ...usuarioEntidad
        }


        for (const key of Object.keys((usuarioEntidad))) {
            switch (key) {
                case 'nombre':
                case 'documento':
                case 'password':
                case 'email':
                    if (usuarioEntidad[key].length === 0) {
                        usuarioLimpio = null
                    };
                    break;
                case 'sexo':
                    if (!["M", "F"].includes(usuarioEntidad[key]) || usuarioEntidad[key].length === 0) {
                        usuarioLimpio = null
                    }
                    break;

                case 'activo':
                    if (!usuarioEntidad[key]) {
                        if (usuarioLimpio) {
                            usuarioLimpio.activo = 0
                        }

                    }

                    break;

                default:
            }
        }

        if (!usuarioLimpio) return usuarioLimpio

        // Si existe usuario devuelvalo
        const existeUsuario = await userDao.getUser(usuarioLimpio.cedula!)
        if (existeUsuario) return null

        const salt = bcrypt.genSaltSync();
        usuarioLimpio.password = (usuarioLimpio.password) && bcrypt.hashSync(usuarioLimpio.password, salt)

        return usuarioLimpio

    } catch (e: any) {
        return null
    }
}

export const obtenerUsuariosEntidad = async (req: Request, res: Response) => {
    try {
        let { codEntidad } = req.params

        let usuarios = await entidadDao.getUsuariosIdentidad(codEntidad)
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
                text: 'Error al consultar los productos'
            }
        })
    }

}


export const crearUsuarioEntidad = async (req:Request, res:Response) =>{
    try {
        let user = req.body
        let usuarioNuevo = await userService.createUser(user as IUser)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Usuario creado correctamente'
            }
        })

    } catch (e:any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: e.message
            }
        })
    }
}

export const editarUsuarioEntidad= async (req: Request, res: Response) => {
    try {

        const { codUsuario } = req.params
        let usuario:IUser = req.body
        
        await userService.editUser(usuario, +codUsuario)
        res.send({
            error:0,
            msg:{
                icon:'success',
                text:'Usuario Creado correctamente'
            } 
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al editar el usuario'
            } 
        })
    }

}

