import express, { Request, Response } from 'express';
import * as generalService from './general'
import * as categoriaDao from '../databases/categoria'
import { ICategoria } from '../interfaces/categoria';
import * as productoDao from '../databases/producto'


export const obtenerCategorias = async (req: Request, res: Response) => {
    try {
        let categorias  = await generalService.getTableInformation('categoria')
        let categoriaDetalle = categorias.map((categoria)=>({
            ...categoria,
            sexo:JSON.parse(categoria.sexo)
        }))
        res.send({
            error:0,
            categorias:categoriaDetalle
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al consultar las categorias'
            } 
        })
    }

}

export const obtenerCategoriasActivas = async (req: Request, res: Response) => {
    try {
        let categorias  = await categoriaDao.obtenerCategoriasActivas()
        let categoriaDetalle = categorias.map((categoria)=>({
            ...categoria,
            sexo:JSON.parse(categoria.sexo)
        }))
        res.send({
            error:0,
            categorias:categoriaDetalle
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al consultar las categorias'
            } 
        })
    }

}

export const obtenerDetalleCategoria = async (req: Request, res: Response) => {
    try {
        let { codCategoria } = req.params

        let categoria  = await generalService.getTableInformation('categoria','cod_categoria',codCategoria)
        let categoriaDetalle = categoria.map((categoria)=>({
            ...categoria,
            sexo:JSON.parse(categoria.sexo)
        }))
        res.send({
            error:0,
            categoria:categoria.length > 0 ? categoriaDetalle[0] : {}
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al consultar la categoria'
            } 
        })
    }

}

export const crearCategoria = async (req: Request, res: Response) => {
    try {

        const {
            nombre,
            sexo,
            activo
        } = req.body

        let newCategoria:ICategoria = {
            nombre,
            sexo:JSON.stringify(sexo),
            activo
        }
        
        await categoriaDao.crearCategoria(newCategoria)
        res.send({
            error:0,
            msg:{
                icon:'success',
                text:'Categoria Creada correctamente'
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

export const editarCategoria = async (req: Request, res: Response) => {
    try {

        const { codCategoria } = req.params
        const {
            nombre,
            sexo,
            activo
        } = req.body

        let categoriaEditar:ICategoria = {
            nombre,
            sexo:JSON.stringify(sexo),
            activo
        }
        
        await categoriaDao.actualizarCategoria(categoriaEditar, +codCategoria)
        res.send({
            error:0,
            msg:{
                icon:'success',
                text:'Categoria Actualizada correctamente'
            } 
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al consultar las categorias'
            } 
        })
    }

}

export const productosCategoria = async (req: Request, res: Response) => {
    try {

        const { codCategoria } = req.params
        
        let productos = await categoriaDao.productosCategoria(+codCategoria)
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
            error:0,
            productos: productosResumen
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg:{
                icon:'error',
                text:'Error al consultar las categorias'
            } 
        })
    }

}