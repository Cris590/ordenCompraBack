import { Request, Response } from 'express';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import * as generalService from './general'
import * as productoDao from '../databases/producto'
import { IColorProductoBD, IProductoDetalle } from '../interfaces/producto';
import { borrarArchivo, subirArchivo } from '../helpers/subir-archivo';



export const obtenerProductos = async (req: Request, res: Response) => {
    try {
        let productos = await productoDao.getProductos()
        let productosResumen = []
        for (const producto of productos) {
            let colorProducto: {color:string , color_descripcion:string}[] = []
            if (producto.tiene_color && producto.color) {
                colorProducto = await productoDao.getColoresProductoResumen(producto.cod_producto)
            }

            productosResumen.push ({
                ...producto,
                color: producto.tiene_color ? colorProducto : undefined,
                talla: producto.tiene_talla ? JSON.parse(producto.talla || '') : undefined,
                sexo: JSON.parse(producto.sexo)

            })
        }

        res.send({
            error: 0,
            productos: productosResumen
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


export const obtenerProductoEditar = async (req: Request, res: Response) => {
    try {
        let { codProducto } = req.params

        let productos = await productoDao.getProductoDetalle(codProducto)

        let productoDetalle: IProductoDetalle[] = productos.map((producto) => {

            return {
                ...producto,
                color_detalle: producto.tiene_color ? JSON.parse(producto.color || '') : undefined,
                talla_detalle: producto.tiene_talla ? JSON.parse(producto.talla || '') : undefined,
                sexo_detalle: JSON.parse(producto.sexo)
            }
        })

        res.send({
            error: 0,
            producto: productoDetalle.length > 0 ? productoDetalle[0] : {}
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

export const obtenerInfoBasicaProducto = async (req: Request, res: Response) => {
    try {
        let { codProducto } = req.params

        let producto = await productoDao.getInfoBasicaProducto(codProducto)
        res.send({
            error: 0,
            producto: producto.length > 0 ? producto[0] : {}
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

export const obtenerColoresProducto = async (req: Request, res: Response) => {
    try {

        let { cod_producto } = req.params
        let colores = await generalService.getTableInformation('producto_color', 'cod_producto', cod_producto)

        res.send({
            error:0,
            colores
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

export const obtenerImagenesColoresProducto = async (req: Request, res: Response) => {
    try {

        let { cod_producto_color } = req.params
        let imagenes = await generalService.getTableInformation('producto_color_imagen', 'cod_producto_color', cod_producto_color)

        res.send({
            error:0,
            imagenes
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

export const cargarImagenProducto = async (req: Request, res: Response) => {
    try {


        let sampleFile;
        let uploadPath;

        console.log('**************')
        console.log(req.files)
        console.log(req.body)

        if (!req.files || Object.keys(req.files).length === 0 || !req.files.imagen) {
            return res.status(400).send('No files were uploaded.');
        }

        let files = Array.isArray(req.files.imagen) ? req.files.imagen : [req.files.imagen]

        for (const file of files) {
            let subirFile = await subirArchivo(file,'images')

            if(subirFile.error === 1) {
                return subirFile   
                break;
            }
            await productoDao.insertarImagenProductoColor({ 
                url:subirFile.nombre || '' , 
                cod_producto_color:req.body.cod_producto_color 
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