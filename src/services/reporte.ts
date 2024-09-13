import { Request, Response } from 'express';
import { RequestToken } from '../interfaces/express';
import fs from 'fs';
import path from 'path';

import * as generalService from './general'
import * as reporteDao from '../databases/reporte'

import { IUsuarioProductosFormateados, IUsuarioReporteDetalle } from '../interfaces/reporte';

import { createExcelFile } from '../helpers/crearExcel';
import { formatDate } from '../helpers/formatDate';



export const reporteGeneralEntidad = async (req: Request, res: Response) => {
    try {
        let request = req as RequestToken
        const { codEntidad } = req.params
        const { cod_entidad, cod_perfil } = request.auth.user
        if(!(cod_perfil === 1 || (cod_perfil === 2 && +codEntidad === cod_entidad ))){
            return res.send({
                error:1,
                msg:{
                    icon:'error',
                    text:'No tiene permisos para descargar este reporte'
                }
            })
        }
        let usuariosEntidadResult = await reporteDao.reporteEntidad(+codEntidad)
        let usuariosEntidad: IUsuarioProductosFormateados[] = []

        usuariosEntidadResult.forEach((result) => {
            usuariosEntidad.push({
                ...result,
                productos:(result.productos) ? JSON.parse(result.productos) : null,
                
            })
        })

        let arreglo: IUsuarioReporteDetalle[] = []
        for (const usuario of usuariosEntidad) {

            if (usuario.productos) {
                for (const producto of usuario.productos) {
                    let color: any[] = []
                    if (producto.tiene_color && producto.cod_color_producto) {
                        color = await generalService.getTableInformation('producto_color', 'cod_producto_color', producto.cod_color_producto)
                    }
                    let aux: IUsuarioReporteDetalle = {
                        ...usuario,
                        cod_producto: producto.cod_producto,
                        nombre_producto: producto.nombre,
                        color: producto.tiene_color ? (color.length > 0 && color[0].color_descripcion) : 'NA',
                        talla: producto.tiene_talla ? producto.talla : 'NA',
                        cantidad: producto.cantidad,
                        categoria: producto.categoria,
                        fecha_creacion:(usuario.fecha_creacion) ? formatDate(usuario.fecha_creacion) : undefined
                    }
                    delete aux.productos
                    arreglo.push(aux)
                }
            } else {
                let aux: IUsuarioReporteDetalle = {
                    ...usuario,
                    cod_producto: 0,
                    nombre_producto: '',
                    color: '',
                    talla: '',
                    cantidad: 0,
                    categoria: ''
                }
                delete aux.productos
                arreglo.push(aux)
            }

        }
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:.TZ]/g, '');
        const filePath = path.join(process.cwd(), `uploads/reportes/${timestamp}.xlsx`)

        await createExcelFile(arreglo, filePath)
        // Envía el archivo como respuesta
        res.download(filePath, (err) => {
            if (err) {
                return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'Error al generar el informe, comuniquese con administrador'
                    }
                })
            }

            // Borra el archivo después de enviarlo
            fs.unlink(filePath, (unlinkErr) => {
                if (unlinkErr) {
                    console.error('Error al borrar el archivo:', unlinkErr);
                }
            });
        });

        // res.send({
        //     error: 0,
        //     reporte: arreglo
        // })

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