import { Request, Response } from 'express';
import * as generalService from './general'
import * as productoDao from '../databases/producto'
import { IProductoDetalle } from '../interfaces/producto';
import { borrarArchivo, subirArchivo } from '../helpers/subir-archivo';



export const obtenerProductos = async (req: Request, res: Response) => {
    try {
        let productos = await productoDao.getProductos()
        let productosResumen = []
        for (const producto of productos) {
            let colorProducto: {color:string , color_descripcion:string}[] = []
            if (producto.tiene_color) {
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


export const crearProducto = async (req: Request, res: Response) => {
    try {

        if(!req.body.nombre || !req.body.cod_categoria){
            return res.send({
                error:1,
                msg:{
                    type:'error',
                    message:'Los parametros son obligatorios'
                }
            })
        }

        let producto = await productoDao.crearProducto(req.body)
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Producto creado correctamente'
            },
            cod_producto: producto[0]
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

export const editarProducto = async (req: Request, res: Response) => {
    try {

        let { codProducto } = req.params

        if(req.body.talla){
            req.body.talla = JSON.stringify(req.body.talla)
        }
        let producto = await productoDao.actualizarProducto(req.body, +codProducto)
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Producto editado correctamente'
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

export const obtenerColoresProducto = async (req: Request, res: Response) => {
    try {

        let { cod_producto } = req.params
        let colores = await generalService.getTableInformation('producto_color', 'cod_producto', cod_producto)
        let producto = await generalService.getTableInformation('producto','cod_producto',cod_producto)

        res.send({
            error:0,
            colores,
            tiene_color:producto[0].tiene_color
        })
       

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener colores por producto'
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

export const borrarImagenProducto = async (req: Request, res: Response) => {
    try {

        if(!req.body.url || !req.body.cod_producto_color_imagen){
            return res.send({
                error:1,
                msg:{
                    type:'error',
                    message:'Los parametros son obligatorios'
                }
            })
        }
        await borrarArchivo(req.body.url)
        await productoDao.borrarImagenProductoColor(req.body.cod_producto_color_imagen)
        
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Se ha borrado la imagen correctamente'
            }
        })
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al borrar la imagen, comuniquese con el administrador'
            }
        })
    }

}

export const crearColorProducto = async (req: Request, res: Response) => {
    try {

        if(!req.body.cod_producto || !req.body.color || !req.body.color_descripcion){
            return res.send({
                error:1,
                msg:{
                    type:'error',
                    message:'Los parametros son obligatorios'
                }
            })
        }
        let data = req.body
        let response = await productoDao.insertarProductoColor(data)
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Color creado correctamente'
            }
        })
        
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear el color para este producto, comuniquese con el administrador!'
            }
        })
    }
}

export const editarColorProducto = async (req: Request, res: Response) => {
    try {

        if(!req.body.cod_producto || !req.body.color || !req.body.color_descripcion || !req.params.cod_producto_color){
            return res.send({
                error:1,
                msg:{
                    type:'error',
                    message:'Los parametros son obligatorios'
                }
            })
        }
        let data = req.body
        let response = await productoDao.editarProductoColor(data, +req.params.cod_producto_color)
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Color editado correctamente'
            }
        })
        
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar el color para este producto, comuniquese con el administrador!'
            }
        })
    }
}

export const borrarColorProducto = async (req: Request, res: Response) => {
    try {

        let { cod_producto_color } = req.params
        if( !req.params.cod_producto_color ){
            return res.send({
                error:1,
                msg:{
                    type:'error',
                    message:'Los parametros son obligatorios'
                }
            })
        }
        
        let imagenesProducto = await generalService.getTableInformation('producto_color_imagen', 'cod_producto_color',cod_producto_color)

        for (const imagen of imagenesProducto) {
            await borrarArchivo(imagen.url)
            await productoDao.borrarImagenProductoColor(imagen.cod_producto_color_imagen)
        }

        await productoDao.borrarProductoColor(+cod_producto_color)
        
        res.send({
            error: 0,
            msg:{
                icon:'success',
                text:'Se ha borrado el color y todas las imagenes asociadas a este'
            }
        })
        
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al editar el color para este producto, comuniquese con el administrador!'
            }
        })
    }
}



export const obtenerTallasProducto = async (req: Request, res: Response) => {
    try {
        let { codProducto } = req.params

        let producto = await generalService.getTableInformation('producto','cod_producto', codProducto)
        res.send({
            error: 0,
            tallas: producto.length > 0 ? JSON.parse(producto[0].talla) : [],
            tiene_talla: producto[0].tiene_talla
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
