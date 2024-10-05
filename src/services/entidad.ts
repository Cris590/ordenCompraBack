
import { Request, Response } from 'express';
import path from 'path';
import bcrypt from 'bcryptjs'
const fs = require("fs");

// @ts-ignore
import Handlebars from "handlebars";
const DEV = process.env.DEV || ''

import * as generalService from './general'
import * as entidadDao from '../databases/entidad'
import * as userDao from '../databases/users';
import * as userService from '../services/users';
import * as ordenCompraDao from '../databases/orden_compra'

import { processCSVFile } from '../helpers/csvUpload';
import { IUser } from '../interfaces/user';
import { RequestToken } from '../interfaces/express';
import { sendMail } from '../helpers/sendMail';
import PasswordManager from '../helpers/passwordManager';

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

export const informacionContrato = async (req: Request, res: Response) => {
    try {
        let request = req as RequestToken
        if (request.auth.user.cod_perfil != 2) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    message: 'No tiene permisos para ver la información de la entidad'
                }
            })
        }
        let info = await entidadDao.getInfoContrato(request.auth.user.cod_entidad)
        res.send({
            error: 0,
            info: info[0]
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
        if (!req.body.nombre || !req.body.nit || !req.body.info_contrato) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Los parametros son obligatorios'
                }
            })
        }

        let entidad = await entidadDao.crearEntidad(req.body)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Entidad creado correctamente'
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

        if (!!req.body.entrega_bonos && req.body.entrega_bonos === "VIRTUAL") {
            await enviarCorreosActivacionUsuario(+codEntidad)
        }
        await entidadDao.actualizarEntidad(req.body, +codEntidad)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Entidad editada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar la identidad'
            }
        })
    }

}

export const pruebasCorreo = async (req: Request, res: Response) => {
    try {

        const passwordManager = new PasswordManager();
        let password = passwordManager.obtenerPassword('1013661443');


        await enviarCorreoUsuario('cristian.aragon@pysltda.com', '1013661443', '123456', 'Cristian Aragón')
        res.send('ok')

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar la identidad'
            }
        })
    }

}

const enviarCorreosActivacionUsuario = async (codEntidad: number) => {
    try {
        let usuarios = await entidadDao.getUsuariosEntidadCorreo(codEntidad)
        let promisesCorreos: any[] = []

        const passwordManager = new PasswordManager();

        for (const usuario of usuarios) {
            let password = passwordManager.obtenerPassword(usuario.cedula);
            let correo = usuario.email
            let usuarioCredenciales = usuario.cedula
            let nombre = usuario.nombre
            promisesCorreos.push(enviarCorreoUsuario(correo, usuarioCredenciales, password, nombre))
        }

        Promise.all(promisesCorreos)
    } catch (e) {
        return false
    }
}

const enviarCorreoUsuario = async (correo: string, usuario: string, password: string, nombre: String) => {
    try {
        var templateHtml = fs.readFileSync(
            path.join(process.cwd(), `${DEV}/templates/correo_credenciales.html`),
            "utf8"
        );

        var template = Handlebars.compile(templateHtml);
        var html = template({
            nombre,
            usuario,
            password
        });

        let envio = await sendMail(correo, 'Credenciales punto de venta', html)
        return true

    } catch (e) {
        console.log('***** ERROR enviarCorreoUsuario ****')
        console.log(e)
        return false
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

        let columnasValidas = ["NOMBRE", "CEDULA", "EMAIL", "CARGO", "LOTE", "SEXO", "ACTIVO", "PASSWORD",]
        let columnasArchivo = Object.keys(rows[0]).filter((value) => value.length > 0)
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

        if (usuariosCreacion.length > 0) {
            await userDao.createUser(usuariosCreacion)
        }

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: `Total de clientes cargados ( ${total} )`
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
    cargo: string,
    lote: number,
    sexo: string,
    activo: number,
    password: string
}

const validarUsuarios = async (usuarios: IUsuarioCarga[], codEntidad: number) => {
    try {

        let usuariosCreacion: IUser[] = []
        let usuariosCreados = 0
        for (const usuario of usuarios) {
            let usuarioLimpio = await limpiarUsuario(usuario, codEntidad)
            if (usuarioLimpio) {
                usuariosCreacion.push(usuarioLimpio)
                usuariosCreados += 1
            }
        }

        return {
            usuariosCreacion,
            total: usuariosCreados
        }
    } catch (e) {
        return {
            usuariosCreacion: [],
            total: 0
        }
    }
}


const limpiarUsuario = async (usuarioEntidad: IUsuarioCarga, codEntidad: number) => {
    try {

        let {
            cargo,
            ...resto
        } = usuarioEntidad

        let usuarioLimpio: IUser | null = {
            cod_perfil: 3,
            cod_entidad: codEntidad,
            cod_cargo_entidad: 0,
            ...resto
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

                    usuarioEntidad[key] = usuarioEntidad[key].trim()
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
                case 'cargo':
                    if (usuarioEntidad[key].length === 0) {
                        usuarioLimpio = null
                    } else {
                        let cargoEntidad = await entidadDao.cargoEntidadPorNombre(codEntidad, usuarioEntidad[key].trim(), +usuarioEntidad.lote)
                        if (cargoEntidad.length === 0) {
                            usuarioLimpio = null
                        } else {
                            if (usuarioLimpio) {
                                usuarioLimpio.cod_cargo_entidad = cargoEntidad[0].cod_cargo_entidad
                            }
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

        const passwordManager = new PasswordManager();

        const contrasenaExistente = passwordManager.obtenerPassword(usuarioLimpio.cedula!);
        if (contrasenaExistente) {
            // console.log(`La contraseña actual para el usuario '${usuarioLimpio.cedula!}' es: ${contrasenaExistente}`);
            // console.log('Modificando la contraseña...');

            // Modificar la contraseña
            passwordManager.establecerPassword(usuarioLimpio.cedula!, usuarioLimpio.password!);
            // console.log(`La contraseña para el usuario '${usuarioLimpio.cedula!}' ha sido actualizada.`);
        } else {
            // console.log(`El usuario '${usuarioLimpio.cedula!}' no existe. Creando una nueva entrada...`);

            // Crear una nueva entrada
            passwordManager.establecerPassword(usuarioLimpio.cedula!, usuarioLimpio.password!);
            // console.log(`La contraseña para el usuario '${usuarioLimpio.cedula!}' ha sido creada.`);
        }



        const salt = bcrypt.genSaltSync();
        usuarioLimpio.password = (usuarioLimpio.password) && bcrypt.hashSync(usuarioLimpio.password, salt)
        delete usuarioLimpio.lote
        return usuarioLimpio

    } catch (e: any) {
        console.log('*****')
        console.log(e)
        return null
    }
}

export const obtenerUsuariosEntidad = async (req: Request, res: Response) => {
    try {
        let { codEntidad } = req.params

        let usuarios = await entidadDao.getUsuariosIdentidad(codEntidad)
        let infoEntidad = await generalService.getTableInformation('entidad', 'cod_entidad', codEntidad)
        res.send({
            error: 0,
            usuarios,
            gestionada: (infoEntidad.length > 0) ? infoEntidad[0].gestionada : 0
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

export const obtenerUsuarioCoordinadorEntidad = async (req: Request, res: Response) => {
    try {
        let { codEntidad } = req.params

        let usuarioCoor = await entidadDao.getUsuarioCoordinador(codEntidad)
        res.send({
            error: 0,
            usuario: usuarioCoor.length > 0 ? usuarioCoor[0] : null
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


export const crearUsuarioEntidad = async (req: Request, res: Response) => {
    try {
        let user = req.body as IUser



        // Enviar correo al coordinador
        if (user.cod_perfil === 2) {
            await enviarCorreoUsuario(user.email!, user.cedula!, user.password!, user.nombre)
        } else if (user.cod_perfil === 3) {
            const passwordManager = new PasswordManager();
            passwordManager.establecerPassword(user.cedula!, user.password!);
        }

        let usuarioNuevo = await userService.createUser(user)
        res.send({
            error: 0,
            cod_usuario: usuarioNuevo.createdUser,
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
                text: e.message
            }
        })
    }
}

export const editarUsuarioEntidad = async (req: Request, res: Response) => {
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


export const cargosPorEntidadResumen = async (req: Request, res: Response) => {
    try {
        let { codEntidad } = req.params
        let cargos = await entidadDao.cargosEntidadResumen(codEntidad)
        res.send({
            error: 0,
            cargos
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


export const detalleCargoEntidad = async (req: Request, res: Response) => {
    try {
        let { codCargoEntidad } = req.params
        let cargo = await generalService.getTableInformation('cargo_entidad', 'cod_cargo_entidad', codCargoEntidad)
        if (cargo.length > 0) {
            cargo[0].cod_categorias = JSON.parse(cargo[0].cod_categorias)
        }
        res.send({
            error: 0,
            cargo: cargo[0]
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al cargar el detalle del cargo'
            }
        })
    }

}


export const crearCargoEntidad = async (req: Request, res: Response) => {
    try {
        if (!req.body.nombre || !req.body.cod_categorias) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Los parametros son obligatorios'
                }
            })
        }

        req.body.cod_categorias = JSON.stringify(req.body.cod_categorias)
        let cargoEntidad = await entidadDao.crearCargoEntidad(req.body)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Cargo creado correctamente'
            },
            cod_cargo_entidad: cargoEntidad[0]
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

export const editarCargoEntidad = async (req: Request, res: Response) => {
    try {

        let { codCargoEntidad } = req.params

        if (req.body.cod_categorias) {
            req.body.cod_categorias = JSON.stringify(req.body.cod_categorias)
        }
        await entidadDao.actualizarCargoEntidad(req.body, +codCargoEntidad)
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Cargo editado correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar la identidad'
            }
        })
    }

}



export const resumenProductosEntidad = async (req: Request, res: Response) => {
    try {
        let { codEntidad } = req.params
        let cargos = await entidadDao.categoriasPorCargo(+codEntidad)
        if (cargos.length === 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'No hay categorias parametrizada para entidad, por lo tanto no hay productos para mostrar'
                }
            })
        }

        let response: any[] = []
        for (const cargo of cargos) {
            let categoriasValidacion = await validarCategoriasActivas(cargo.cod_categorias)
            let categoriasResumen=[]
            for (const categoria of categoriasValidacion) {

                let sexoResumen = []
                for (const sexo of categoria.sexo) {

                    let productos = await entidadDao.getProductosEntidad([categoria.cod_categoria])
                    let productosResumen = []
                    for (const producto of productos) {
                        let coloresProducto: { cod_producto_color: number, color: string, color_descripcion: string, imagenes?: string[] }[] = []
                        if (producto.tiene_color) {
                            let coloresAux = await ordenCompraDao.getColoresProducto(producto.cod_producto)

                            for (const colorProducto of coloresAux) {
                                let imagenes = await ordenCompraDao.getImagenesPorColor(colorProducto.cod_producto_color)

                                coloresProducto.push({
                                    ...colorProducto,
                                    imagenes: (imagenes.length > 0) ? imagenes.map(({ url }) => url) : []
                                })
                            }

                        }

                        productosResumen.push({
                            ...producto,
                            colores: producto.tiene_color ? coloresProducto : undefined,
                            talla: producto.tiene_talla ? JSON.parse(producto.talla || '') : undefined,
                        })
                    }

                    sexoResumen.push({
                        nombre: (sexo === "M") ? 'Masculino' : 'Femenino',
                        productos: productosResumen
                    })
                }
                categoriasResumen.push({
                    nombre:categoria.nombre,
                    cantidad:categoria.cantidad,
                    sexos:sexoResumen
                })

            }

            response.push({
                cargo: cargo.nombre,
                categorias:categoriasResumen
            })
        }
        res.send({
            error: 0,
            response
        })


        let response2 = [{
            cargo: 'SECRETARIA',
            categorias: [{
                nombre: 'BLUSAS',
                sexos: [{
                    nombre: 'FEMENINO',
                    productos: [{
                        nombre: 'Blusa Primatela',
                        tallas: ['x', 'y', 'z'],
                        colores: ['x', 'y', 'z'],
                        cantidad: 1
                    }]

                }]
            }]

        }]
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

const validarCategoriasActivas = async (categoriasString: string) => {
    try {
       
        let categorias = JSON.parse(categoriasString) as { cod_categoria: number, cantidad: string }[]
        let categoriasActivas: { cod_categoria: number, cantidad: number, nombre: string, sexo: string[] }[] = []
        for (const categoria of categorias) {
            let categoriaActiva = await ordenCompraDao.getCategoriaActiva(categoria.cod_categoria)
            if (categoriaActiva.length > 0) {
                categoriasActivas.push({
                    cod_categoria: categoria.cod_categoria,
                    cantidad: +categoria.cantidad,
                    nombre: categoriaActiva[0].nombre,
                    sexo: JSON.parse(categoriaActiva[0].sexo)
                })
            }
        }

        return categoriasActivas
    } catch (e) {
        return []
    }
}
