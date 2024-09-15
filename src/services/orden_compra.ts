import { Request, Response, text } from 'express';
import * as ordenCompraDao from '../databases/orden_compra'
import * as productoDao from '../databases/producto'

import * as generalService from '../services/general'
import { RequestToken } from '../interfaces/express';


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

export const crearOrdenCompra = async (req: Request, res: Response) => {
    try {

        const {
            cod_usuario,
            cod_usuario_creacion,
            productos
        } = req.body

        let ordenCompraUsuario = await generalService.getTableInformation('orden','cod_usuario',cod_usuario)
        if(ordenCompraUsuario.length > 0){
            return res.send({
                error:1,
                msg:{
                    icon:'error',
                    text:'Ya existe una orden de compra para este usuario'
                }
            })
        }

        let nuevaOrden = {
            cod_usuario,
            cod_usuario_creacion,
            productos:JSON.stringify(productos)
        }
        
        await ordenCompraDao.crearOrdenCompra(nuevaOrden)
        res.send({
            error:0,
            msg:{
                icon:'success',
                text:'Orden montada correctamente'
            } 
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al crear la categoria'
            } 
        })
    }

}

export const actualizarOrdenCompra = async (req: Request, res: Response) => {
    try {

        const {
            ciudad,
            direccion,
            observaciones
        } = req.body

        const { codOrdenCompra } = req.params
        if(!ciudad  || !direccion || !codOrdenCompra){
            return res.send({
                error:1,
                msg:{
                icon:'error',
                text:'Los parametros ciudad y dirección son obligatorios'
            }
            })
        }

    
        let ordenActualizar = {
           ciudad,
           direccion,
           observaciones
        }
        
        await ordenCompraDao.actualizarOrdenCompra( ordenActualizar , +codOrdenCompra)
        res.send({
            error:0,
            msg:{
                icon:'success',
                text:'Orden actualizada correctamente'
            } 
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al crear la categoria'
            } 
        })
    }

}

export const validarOrdenUsuario = async (request: Request, res: Response) => {
    try {
        let req = request as RequestToken
        let { codUsuario} = req.params

        if(req.auth.user.cod_usuario !== +codUsuario){
            let usuarioInfo = await generalService.getTableInformation('usuario','cod_usuario',codUsuario)
            if(usuarioInfo.length > 0 && 
                (
                    usuarioInfo[0].cod_perfil !== 3 || 
                    usuarioInfo[0].cod_entidad !== req.auth.user.cod_entidad
                )
            )
            {
                return res.send({
                    error: 0,
                    existe:0
                })
            }
        }
        let categoriasEntidadUsuario = await ordenCompraDao.getUsuariosEntidad(+codUsuario)
        let categoriaValidacion = await  validarCategoriasActivas(categoriasEntidadUsuario[0].cod_categorias)
        
        let orden = await ordenCompraDao.validarOrden(+codUsuario)
        
        if(orden.length > 0){
            orden[0].productos = JSON.parse(orden[0].productos)
        }

        let usuario = await ordenCompraDao.obtenerInfoUsuario(+codUsuario)

        res.send({
            error: 0,
            existe: (orden.length > 0) ? 1 : 0,
            orden:orden[0],
            categorias:categoriaValidacion,
            usuario:usuario[0]

        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al validar la orden del usuario'
            }
        })
    }

}

export const usuariosOrdenesCoordinador= async (request: Request, res: Response) => {
    try {
        let req = request as RequestToken
       
        if(req.auth.user.cod_perfil !== 2){
            return res.send({
                error: 1,
                msg:{
                    icon:'error',
                    text:'No tiene permisos para ver esta información'
                }
            })
        
        }
        let codEntidad = +req.auth.user.cod_entidad
        let usuarios = await ordenCompraDao.obtenerUsuariosCoordinador(codEntidad)
        let entidadInfo = await generalService.getTableInformation('entidad','cod_entidad',codEntidad)
        
        res.send({
            error: 0,
           usuarios,
           gestionada:(entidadInfo.length > 0) ? entidadInfo[0].gestionada : false,
           fecha_gestionada:(entidadInfo.length > 0) ? entidadInfo[0].fecha_gestionada : false,
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al validar la orden del usuario'
            }
        })
    }

}