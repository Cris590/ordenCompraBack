import { Request, Response } from 'express';
import { RequestToken } from '../interfaces/express';
import fs from 'fs';
import path from 'path';

import * as generalService from './general'
import * as reporteDao from '../databases/reporte'

import { IProductoOrden, IUsuarioProductosFormateados, IUsuarioReporteDetalle } from '../interfaces/reporte';

import { createExcelFile } from '../helpers/crearExcel';
import { formatDate } from '../helpers/formatDate';
import { generateRandomNumber, getFileBase64 } from '../helpers/general';
import { crearDocumentoPdfWK } from '../helpers/createDocumentPdf';




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

                    let productInfo = await generalService.getTableInformation('producto','cod_producto', producto.cod_producto)
                    let aux: IUsuarioReporteDetalle = {
                        ...usuario,
                        cod_producto: producto.cod_producto,
                        nombre_producto: producto.nombre,
                        color: producto.tiene_color ? (color.length > 0 && color[0].color_descripcion) : 'NA',
                        talla: producto.tiene_talla ? producto.talla : 'NA',
                        cantidad: producto.cantidad,
                        categoria: producto.categoria,
                        fecha_creacion:(usuario.fecha_creacion) ? formatDate(usuario.fecha_creacion) : undefined,
                        descripcion_producto:(productInfo.length>0) ? productInfo[0].descripcion : ''
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
                    categoria: '',
                    descripcion_producto:''
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

export const descargarBonosUsuario = async (req: Request, res: Response) => {
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

        
        let logo = await getFileBase64(path.join(process.cwd(), `assets/logo.png`))
        let usuariosEntidadResult = await reporteDao.infoBonosEntidad(+codEntidad)
        if(usuariosEntidadResult.length === 0) {
            return res.send({
                error:1,
                msg:{
                    icon:'error',
                    text:'No hay bonos para esta entidad'
                }
            })
        }
        
        let usuarios = usuariosEntidadResult.map((usuario)=>{

            let productosAux = JSON.parse(usuario.productos) as IProductoOrden[]

            let productos = productosAux.reduce((acc, producto) => {
                const { cod_producto, nombre, cantidad, categoria } = producto;
              
                const existente = acc.find(item => item.cod_producto === cod_producto);
              
                if (existente) {
                  existente.cantidad += cantidad;
                } else {
                  acc.push({ cod_producto, nombre, categoria, cantidad });
                }
              
                return acc;
              }, [] as { cod_producto: number; nombre: string; categoria: string; cantidad: number }[]);

            return {
                nombre_entidad: usuario.nombre_entidad,
                no_contrato: usuario.no_contrato,
                fecha_aprobacion: formatDate(usuario.fecha_gestionada),
                nombre: usuario.nombre,
                cedula: usuario.cedula,
                sexo: usuario.sexo,
                logo,
                productos
            }
        })

        let data = {
            usuarios
        }

        let nombre =`bono_${generateRandomNumber(7)}` 
        await crearDocumentoPdfWK(data, 'bono', nombre)

        const filePath = path.join(process.cwd(), `documents_storage/storage/`, `${nombre}.pdf`);
        
        res.download(filePath, (err) => {
            if (err) {
                return res.send({
                    error: 1,
                    msg: {
                        icon: 'error',
                        text: 'Error al generar el archivo'
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

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                type: 'error',
                message: 'Error al crear bonos'
            }
        })
    }

}