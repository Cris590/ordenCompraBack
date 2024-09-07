import { Request, Response } from 'express';
import * as ordenCompraDao from '../databases/orden_compra'
import * as productoDao from '../databases/producto'

import * as generalService from '../services/general'


export const obtenerProductos = async (req: Request, res: Response) => {
    try {
        let { codUsuario} = req.params
        let categoriasEntidadUsuario = await ordenCompraDao.getUsuariosEntidad(+codUsuario)
        if(categoriasEntidadUsuario.length  === 0){
            return res.send({
                error:1,
                msg:{
                    icon:'error',
                    text:'No hay categorias parametrizada para entidad, por lo tanto no hay productos para mostrar'
                }
            })
        }

        let categoriaValidacion = await  validarCategoriasActivas(categoriasEntidadUsuario[0].cod_categorias)
        let categorias = categoriaValidacion.map((categoria)=> (categoria.cod_categoria))
        
          
        let sexo = categoriasEntidadUsuario[0].sexo
        let productos = await ordenCompraDao.getProductosEntidades(categorias, sexo)
        
        let productosResumen = []
        for (const producto of productos) {
            let coloresProducto: {cod_producto_color:number, color:string , color_descripcion:string, imagenes?: string[]}[] = []
            if (producto.tiene_color) {
                let coloresAux = await ordenCompraDao.getColoresProducto(producto.cod_producto)
                
                for (const colorProducto of coloresAux) {
                    let imagenes = await ordenCompraDao.getImagenesPorColor(colorProducto.cod_producto_color)
                    
                    coloresProducto.push({
                        ...colorProducto,
                        imagenes:(imagenes.length > 0) ? imagenes.map(({url})=>url):[]
                    })
                }
                
            }

            productosResumen.push ({
                ...producto,
                colores: producto.tiene_color ? coloresProducto : undefined,
                talla: producto.tiene_talla ? JSON.parse(producto.talla || '') : undefined,
            })
        }
        res.send({
            error: 0,
            productos:productosResumen,
            categorias:categoriaValidacion
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

export const obtenerProductoDetalle = async (req: Request, res: Response) => {
    try {
        let { codProducto} = req.params
        let productos = await ordenCompraDao.getProductoDetalleMostrar(+codProducto)
        if(productos.length === 0){
            return res.send({
                error:1,
                msg:{
                    icon:'error',
                    text:'No hay producto con este código'
                }
            })
        }

        let producto = productos[0]
        let productoDetalle:any = {}
        
        let coloresProducto: {cod_producto_color:number, color:string , color_descripcion:string, imagenes?: string[]}[] = []
        if (producto.tiene_color) {
            let coloresAux = await ordenCompraDao.getColoresProducto(producto.cod_producto)
            
            for (const colorProducto of coloresAux) {
                let imagenes = await ordenCompraDao.getImagenesPorColor(colorProducto.cod_producto_color)
                
                coloresProducto.push({
                    ...colorProducto,
                    imagenes:(imagenes.length > 0) ? imagenes.map(({url})=>url):[]
                })
            }
            
        }

        productoDetalle = {
            ...producto,
            colores: producto.tiene_color ? coloresProducto : undefined,
            talla: producto.tiene_talla ? JSON.parse(producto.talla || '') : undefined,
        }
      
        res.send({
            error: 0,
            producto:productoDetalle,
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

const validarCategoriasActivas = async ( categoriasString : string) =>{
    try {
        let categorias = JSON.parse(categoriasString) as {cod_categoria:number, cantidad:string}[]
        let categoriasActivas:{ cod_categoria:number, cantidad:number, nombre:string }[] = []
        for (const categoria of categorias) {
           let categoriaActiva = await ordenCompraDao.getCategoriaActiva(categoria.cod_categoria)
           if(categoriaActiva.length > 0 ){
            categoriasActivas.push({
                cod_categoria:categoria.cod_categoria,
                cantidad:+categoria.cantidad,
                nombre:categoriaActiva[0].nombre
            })
           } 
        }
        
        return categoriasActivas
    } catch (e) {
        return []
    }
}