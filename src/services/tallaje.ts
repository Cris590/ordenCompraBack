import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as generalService from './general'
import * as tallajeDao from '../databases/tallaje'
import { borrarArchivo, subirArchivo } from '../helpers/subir-archivo';



export const obtenerTallas = async (req: Request, res: Response) => {
    try {
        let tallajes = await generalService.getTableInformation('tallaje')

        res.send({
            error: 0,
            tallajes
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


export const obtenerTallasActivas = async (req: Request, res: Response) => {
    try {
        let tallajes = await tallajeDao.getTallasActivas()
        res.send({
            error: 0,
            tallajes
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


export const crearTallaje = async (req: Request, res: Response) => {
    try {

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.imagen) {
            console.log(req.files)
            return res.status(400).send('No hay archivos para cargar.');
        }

        let files = Array.isArray(req.files.imagen) ? req.files.imagen : [req.files.imagen]

        for (const file of files) {
            let subirFile = await subirArchivo(file, 'images')

            if (subirFile.error === 1) {
                return subirFile
                break;
            }
            await tallajeDao.crearImagenTallaje({
                imagen: subirFile.nombre || '',
                ...req.body
            })

        }

        res.send({
            error: 0
        })



    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al cargar la imagen'
            }
        })
    }

}

export const editarTallaje = async (req: Request, res: Response) => {
    try {
        let { cod_tallaje } = req.params

        let data = req.body
        let imagen = ''

        if (req.files && req.files.imagen) {
            
            // Borrar imagene del servidor
            let tallajeInfo = await generalService.getTableInformation('tallaje','cod_tallaje',cod_tallaje)
            await borrarArchivo(tallajeInfo[0].imagen)


            let files = Array.isArray(req.files.imagen) ? req.files.imagen : [req.files.imagen]
            for (const file of files) {
                let subirFile = await subirArchivo(file, 'images')

                if (subirFile.error === 1) {
                    return subirFile
                    break;
                }

                imagen = subirFile.nombre || ''
            }
        }

        data.imagen = imagen
        await tallajeDao.editarTallaje(data, +cod_tallaje)

        res.send({
            error: 0
        })



    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al cargar la imagen'
            }
        })
    }

}