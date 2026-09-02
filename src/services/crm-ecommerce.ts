import { Request, Response } from 'express';
// @ts-ignore
const DEV = process.env.DEV || ''

import * as generalService from './general'
import * as crmEcommerceDao from '../databases/crm-ecommerce'
import * as ecommerceIntegration from './ecommerce/_index'
import { borrarArchivo, subirArchivo } from '../helpers/subir-archivo';
import { IEditarProductoModelo, IProductoNuevoCrm } from '../interfaces/crm-ecommerce';
import { INuevaVariacionWoo, INuevoEProductoWoo, IRespuestaCreacionEProducto } from '../interfaces/api/ecommerce';
import { createExcelFile } from '../helpers/crearExcel';
import fs from 'fs';
import path from 'path';

export const crearCategoria = async (req: Request, res: Response) => {
    try {
        const categoria = req.body
        const nuevaCategoria = await crmEcommerceDao.crearCategoria(categoria)

        res.send({
            error: 0,
            id: nuevaCategoria[0],
            msg: {
                icon: 'success',
                text: 'Categoria creada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear la categoria'
            }
        })
    }

}

export const editarCategoria = async (req: Request, res: Response) => {
    try {
        const codCategoria = req.params.cod_categoria
        const categoria = req.body
        const categoriaActualizada = await crmEcommerceDao.actualizarCategoriaCrm(+codCategoria, categoria)

        const categoriaCrm = await generalService.getTableInformationCrm('categorias', 'id', codCategoria)
        console.log('---------')
        console.log(categoriaCrm

        )
        if (categoriaCrm[0].id_woo) {
            await ecommerceIntegration.actualizarCategoriaWoo(categoriaCrm[0].id_woo, { name: categoria.categoria })
        }

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Categoria actualizada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al actualizar la categoria'
            }
        })
    }

}

export const crearSubCategoria = async (req: Request, res: Response) => {
    try {
        const {
            id_categoria,
            sub_categoria
        } = req.body
        const nuevaSubCategoria = await crmEcommerceDao.crearSubCategoriaCrm({
            id_categoria,
            sub_categoria
        })

        res.send({
            error: 0,
            id: nuevaSubCategoria[0],
            msg: {
                icon: 'success',
                text: 'Sub Categoria creada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear la categoria'
            }
        })
    }

}

export const editarSubCategoria = async (req: Request, res: Response) => {
    try {
        const codSubCategoria = req.params.cod_sub_categoria
        const { sub_categoria } = req.body
        const subCategoriaActualizada = await crmEcommerceDao.actualizarSubCategoriaCrm(+codSubCategoria, { sub_categoria })

        const subCategoria = await generalService.getTableInformationCrm('sub_categorias', 'id', codSubCategoria)
        if (subCategoria[0].id_woo) {
            await ecommerceIntegration.actualizarCategoriaWoo(subCategoria[0].id_woo, { name: sub_categoria })
        }

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Sub Categoria actualizada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al actualizar la categoria'
            }
        })
    }

}


export const sincronizarCategoriaEcommerce = async (req: Request, res: Response) => {
    try {
        const codCategoria = req.params.cod_categoria
        const categoriaInfo = await generalService.getTableInformationCrm('categorias', 'id', codCategoria)

        let estaSincronizado = false
        if (categoriaInfo.length > 0) {
            estaSincronizado = !!categoriaInfo[0].id_woo
        } else {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'No existe categoria.'
                }
            })
        }

        if (!estaSincronizado) {
            const categoriaWoo = await ecommerceIntegration.crearCategoriaWoo({
                name: categoriaInfo[0].categoria
            })

            await crmEcommerceDao.actualizarCategoriaCrm(+codCategoria, { id_woo: categoriaWoo.id })

        }


        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Categoria sincronizada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al sincronizar en ecommerce'
            }
        })
    }

}


export const sincronizarSubCategoriaEcommerce = async (req: Request, res: Response) => {
    try {
        const codSubCategoria = req.params.cod_sub_categoria
        const subCategoriaInfo = await crmEcommerceDao.subCategoriaInfo(codSubCategoria)
        if (subCategoriaInfo.length == 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'No existe Subcategoria.'
                }
            })
        }

        if (!subCategoriaInfo[0].id_woocategoria) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'La categoria debe estar asociada antes de asociar la subcategoria.'
                }
            })
        }

        let estaSincronizado = !!subCategoriaInfo[0].id_woo_subcategoria

        if (!estaSincronizado) {
            const subCategoriaWoo = await ecommerceIntegration.crearCategoriaWoo({
                name: subCategoriaInfo[0].sub_categoria,
                parent: subCategoriaInfo[0].id_woocategoria
            })

            await crmEcommerceDao.actualizarSubCategoriaCrm(+codSubCategoria, { id_woo: subCategoriaWoo.id })

        }


        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Sub Categoria sincronizada correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al sincronizar en ecommerce'
            }
        })
    }

}


export const obtenerProductosCrm = async (req: Request, res: Response) => {
    try {
        const filtros = {
            page: Number(req.query.page ?? 1),
            perPage: Number(req.query.pp ?? 20),
            buscar: req.query.buscar?.toString().trim(),
            idCategoria: req.query.idCategoria ? Number(req.query.idCategoria) : undefined,
            idSubCategoria: req.query.idSubCategoria ? Number(req.query.idSubCategoria) : undefined
        };

        const [productos, total] = await Promise.all([
            crmEcommerceDao.obtenerProductosCrm(filtros),
            crmEcommerceDao.totalProductosCrm(filtros)
        ]);

        const totalPages = Math.ceil(total / filtros.perPage);

        res.send({
            data: productos,
            pagination: {
                page: filtros.page,
                perPage: filtros.perPage,
                count: productos.length,
                total,
                totalPages,
                hasNext: filtros.page < totalPages,
                hasPrevious: filtros.page > 1
            }
        });
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener los productos, comuniquese con el administrador'
            }
        })
    }

}

export const descargarExcelImpresionProductos = async (req: any, res: Response) => {
    try {

        const {
            buscar, idCategoria, idSubCategoria
        } = req.body
        const productos = await crmEcommerceDao.obtenerProductosCrmFiltros(buscar, idCategoria, idSubCategoria)

        

        let arreglo: any[] = []
       
        const now = new Date();
        const timestamp = now.toISOString().replace(/[-:.TZ]/g, '');
        const filePath = path.join(process.cwd(), `uploads/reportes/${timestamp}.xlsx`)

        await createExcelFile(productos, filePath)
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
                text: 'Error al generar reporte de los productos'
            }
        })
    }


}



export const obtenerProductosListadoCrm = async (req: Request, res: Response) => {
    try {
        const codigoModelo = req.params.codigo_modelo
        const productos = await crmEcommerceDao.obtenerProductosListadoCrm(codigoModelo)
        res.send({
           productos,
            error: 0
        });
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener los productos, comuniquese con el administrador'
            }
        })
    }

}



export const obtenerDetalleProductosCrm = async (req: Request, res: Response) => {
    try {
        const codigoModelo = req.params.codigo_modelo

        const [tallas, colores] = await Promise.all([
            crmEcommerceDao.obtenerTallasPorProducto(codigoModelo),
            crmEcommerceDao.obtenerColoresPorProducto(codigoModelo)
        ]);

        res.send({
            tallas,
            colores,
            error: 0
        });
    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener los productos, comuniquese con el administrador'
            }
        })
    }

}


export const obtenerColoresProductoCrm = async (req: Request, res: Response) => {
    try {

        const codigoModelo = req.params.codigo_modelo
        const coloresPosibles = await crmEcommerceDao.coloresProductoPosibles(codigoModelo)
        const colores = await crmEcommerceDao.obtenerColoresPorProducto(codigoModelo)


        const coloresParaCrear = []
        for (const colorCreado of coloresPosibles) {
            const existeColor = colores.some((color) => color.codigo_color === colorCreado.color)
            if (!existeColor) {
                coloresParaCrear.push(colorCreado.color)
            }
        }

        res.send({
            error: 0,
            coloresParaCrear,
            colores
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al obtener los colores del producto, comuniquese con el administrador'
            }
        })
    }

}


export const crearColorProductoCrm = async (req: Request, res: Response) => {
    try {
        const {
            codigo_color,
            color,
            nombre_color,
            codigo_modelo
        } = req.body

        const camposFaltantes = [];

        if (!codigo_color) camposFaltantes.push("codigo_color");
        if (!color) camposFaltantes.push("color");
        if (!nombre_color) camposFaltantes.push("nombre_color");
        if (!codigo_modelo) camposFaltantes.push("codigo_modelo");

        if (camposFaltantes.length > 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: "error",
                    text: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`
                }
            });
        }

        const validarColor = await crmEcommerceDao.obtenerColorProductoPorCodigo(codigo_modelo, codigo_color)
        if (validarColor.length > 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: "error",
                    text: `Ya existe un color con el código ${codigo_color}`
                }
            });
        }

        const nuevoColor = await crmEcommerceDao.crearColorProductoCrm({
            codigo_color,
            color,
            nombre_color,
            codigo_modelo,
            activo: true
        })

        res.send({
            error: 0,
            id: nuevoColor[0],
            msg: {
                icon: 'success',
                text: 'Color creado correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear el color en CRM'
            }
        })
    }

}

export const editarColorProductoCrm = async (req: Request, res: Response) => {
    try {
        const id = req.params.cod_producto_color
        const {
            codigo_color,
            color,
            nombre_color
        } = req.body

        const camposFaltantes = [];

        if (!codigo_color) camposFaltantes.push("codigo_color");
        if (!color) camposFaltantes.push("color");
        if (!nombre_color) camposFaltantes.push("nombre_color");

        if (camposFaltantes.length > 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: "error",
                    text: `Faltan campos obligatorios: ${camposFaltantes.join(", ")}`
                }
            });
        }
        await crmEcommerceDao.actualizarColorProductoCrm(+id, {
            codigo_color,
            color,
            nombre_color,
        })

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Color actualizado correctamente'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al actualizar el color'
            }
        })
    }

}

export const obtenerImagenesColoresProducto = async (req: Request, res: Response) => {
    try {

        let { cod_producto_color } = req.params
        let imagenes = await generalService.getTableInformationCrm('producto_color_imagen', 'cod_producto_color', cod_producto_color)
        res.send({
            error: 0,
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
            let subirFile = await subirArchivo(file, 'images')

            if (subirFile.error === 1) {
                return subirFile
                break;
            }
            await crmEcommerceDao.insertarImagenProductoColorCrm({
                url: subirFile.nombre || '',
                cod_producto_color: req.body.cod_producto_color
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

        if (!req.body.url || !req.body.cod_producto_color_imagen) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Los parametros son obligatorios'
                }
            })
        }
        await borrarArchivo(req.body.url)
        await crmEcommerceDao.borrarImagenProductoColorCrm(req.body.cod_producto_color_imagen)

        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Se ha borrado la imagen correctamente'
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

export const obtenerTallasProducto = async (req: Request, res: Response) => {
    try {
        const codigoModelo = req.params.codigo_modelo

        let tallas = await crmEcommerceDao.tallajesProductoPosibles(codigoModelo)
        res.send({
            error: 0,
            tallas: tallas.map((talla) => talla.talla),
            cod_tallaje: tallas.length > 0 ? tallas[0].cod_tallaje : 0
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


export const obtenerTallas = async (req: Request, res: Response) => {
    try {
        let tallajes = await generalService.getTableInformationCrm('tallaje')

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
        let tallajes = await crmEcommerceDao.getTallasActivasCrm()
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
            await crmEcommerceDao.crearImagenTallajeCrm({
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
            let tallajeInfo = await generalService.getTableInformationCrm('tallaje', 'cod_tallaje', cod_tallaje)
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
        await crmEcommerceDao.editarTallajeCrm(data, +cod_tallaje)

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

export const editarProductoCrm = async (req: Request, res: Response) => {
    try {

        const producto = req.body as IEditarProductoModelo
        const tallasCreadas = await crmEcommerceDao.tallajesProductoPosibles(producto.codigo_modelo)
        let coloresCreados = await crmEcommerceDao.coloresProductoPosibles(producto.codigo_modelo) as { color: string }[]

        const coloresNuevos = producto.colores.filter((color) => !coloresCreados.map((colorCreado) => colorCreado.color).includes(color))
        const tallasNuevas = producto.tallas.filter((talla) => !tallasCreadas.map((tallaCreada) => tallaCreada.talla).includes(talla))

        let productosNuevos: IProductoNuevoCrm[] = []

        /** Si hay color nuevo, debe crear para todas las tallas creadas registro */
        for (const colorNuevo of coloresNuevos) {
            for (const talla of tallasCreadas.map((talla) => talla.talla)) {

                const categoria = String(producto.id_categoria).padStart(2, '0');
                const subCategoria = String(producto.id_sub_categoria);
                let subCategoriaInicio: string;
                let subCategoriaFin: string;

                if (subCategoria.length <= 2) {
                    subCategoriaInicio = subCategoria.padStart(2, '0');
                    subCategoriaFin = '00';
                } else {
                    subCategoriaInicio = subCategoria.slice(0, 2);
                    subCategoriaFin = subCategoria.slice(2).padStart(2, '0');
                }

                const lote = String(producto.lote).padStart(4, '0');

                const nuevoCodigo = `${categoria}${subCategoriaInicio}${colorNuevo}${subCategoriaFin}${talla}${lote}`;

                const nuevoProducto: IProductoNuevoCrm = {
                    id_categoria: producto.id_categoria,
                    id_sub_categoria: producto.id_sub_categoria,
                    codigo: nuevoCodigo,
                    descripcion: producto.descripcion,
                    precio_compra: producto.precio_compra,
                    precio_venta: producto.precio_venta,
                    activo: producto.activo,
                    talla: talla,
                    color: colorNuevo
                }

                productosNuevos.push(nuevoProducto)
            }
        }

        /**Crear productos, Colores nuevos */
        if (productosNuevos.length > 0) {
            await crmEcommerceDao.crearProductoCrm(productosNuevos)
        }


        productosNuevos = []
        /**Actualizo los colores despues de creados los nuevos */
        coloresCreados = await crmEcommerceDao.coloresProductoPosibles(producto.codigo_modelo) as { color: string }[]

        /** Tallas nuevas */
        for (const tallaNueva of tallasNuevas) {
            for (const colorNuevo of coloresCreados.map((color) => color.color)) {
                const categoria = String(producto.id_categoria).padStart(2, '0');
                const subCategoria = String(producto.id_sub_categoria);
                let subCategoriaInicio: string;
                let subCategoriaFin: string;

                if (subCategoria.length <= 2) {
                    subCategoriaInicio = subCategoria.padStart(2, '0');
                    subCategoriaFin = '00';
                } else {
                    subCategoriaInicio = subCategoria.slice(0, 2);
                    subCategoriaFin = subCategoria.slice(2).padStart(2, '0');
                }
                const lote = String(producto.lote).padStart(4, '0');
                const nuevoCodigo = `${categoria}${subCategoriaInicio}${colorNuevo}${subCategoriaFin}${tallaNueva}${lote}`;

                const nuevoProducto: IProductoNuevoCrm = {
                    id_categoria: producto.id_categoria,
                    id_sub_categoria: producto.id_sub_categoria,
                    codigo: nuevoCodigo,
                    descripcion: producto.descripcion,
                    precio_compra: producto.precio_compra,
                    precio_venta: producto.precio_venta,
                    activo: producto.activo,
                    talla: tallaNueva,
                    color: colorNuevo
                }

                productosNuevos.push(nuevoProducto)
            }
        }
        /**Crear productos, tallas nuevas */
        if (productosNuevos.length > 0) {
            await crmEcommerceDao.crearProductoCrm(productosNuevos)
        }
        /** Actualizar el resto de valores editables */
        const productoEdicion = {
            cod_tallaje: producto.cod_tallaje,
            descripcion: producto.descripcion,
            precio_compra: producto.precio_compra,
            precio_venta: producto.precio_venta
        }
        await crmEcommerceDao.actualizarProductoCrm(producto.codigo_modelo, productoEdicion)

        let productoWoo
        if (producto.sincronizar_ecommerce) {
            productoWoo = await crearProductoWoo(producto)
        }
        res.send({
            error: 0,
            msg: {
                icon: 'success',
                text: 'Productos editados correctamente.'
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

export const crearProductoCrm = async (req: Request, res: Response) => {
    try {

        const producto = req.body as IEditarProductoModelo

        const validarExistenciaProducto = await generalService.getTableInformationCrm('productos', 'codigo_modelo', producto.codigo_modelo)
        if (validarExistenciaProducto.length > 0) {
            return res.send({
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Ya existe un producto con este código, por favor validar nuevamente.'
                }
            })
        }

        let productosNuevos: IProductoNuevoCrm[] = []
        for (const color of producto.colores) {
            for (const talla of producto.tallas) {

                const categoria = String(producto.id_categoria).padStart(2, '0');
                const subCategoria = String(producto.id_sub_categoria);
                let subCategoriaInicio: string;
                let subCategoriaFin: string;

                if (subCategoria.length <= 2) {
                    subCategoriaInicio = subCategoria.padStart(2, '0');
                    subCategoriaFin = '00';
                } else {
                    subCategoriaInicio = subCategoria.slice(0, 2);
                    subCategoriaFin = subCategoria.slice(2).padStart(2, '0');
                }

                const lote = String(producto.lote).padStart(4, '0');

                const nuevoCodigo = `${categoria}${subCategoriaInicio}${color}${subCategoriaFin}${talla}${lote}`;

                const nuevoProducto: IProductoNuevoCrm = {
                    id_categoria: producto.id_categoria,
                    id_sub_categoria: producto.id_sub_categoria,
                    codigo: nuevoCodigo,
                    descripcion: producto.descripcion,
                    precio_compra: producto.precio_compra,
                    precio_venta: producto.precio_venta,
                    activo: producto.activo,
                    cod_tallaje: producto.cod_tallaje,
                    talla,
                    color
                }

                productosNuevos.push(nuevoProducto)
            }
        }

        /**Crear productos, Colores nuevos */
        if (productosNuevos.length > 0) {
            await crmEcommerceDao.crearProductoCrm(productosNuevos)
        }

        let productoWoo
        if (producto.sincronizar_ecommerce) {
            productoWoo = await crearProductoWoo(producto)
        }

        res.send({
            error: 0,
            productoWoo,
            msg: {
                icon: 'success',
                text: 'Productos creados correctamente.'
            }
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al crear los productos'
            }
        })
    }

}

const crearProductoWoo = async (producto: IEditarProductoModelo) => {
    try {

        const colores = await crmEcommerceDao.obtenerColorEImagenPorProducto(producto.codigo_modelo)
        const subcategoriaInfo = await generalService.getTableInformationCrm('sub_categorias', 'id', producto.id_sub_categoria)

        if (subcategoriaInfo.length === 0 || !subcategoriaInfo[0].id_woo) {
            return {
                error: 1,
                msg: {
                    icon: 'error',
                    text: 'Debes asociar la subcategoria al e-commerce antes de crear el producto.'
                }
            }
        }

        const nuevoProducto: INuevoEProductoWoo = {
            name: producto.descripcion,
            type: "variable",
            sku: producto.codigo_modelo,
            regular_price: String(producto.precio_venta),
            tax_status: "taxable",
            images: [
                {
                    "src": colores[0].url
                }
            ]
            ,
            categories: [
                {
                    id: subcategoriaInfo[0].id_woo
                }
            ],
            attributes: [
                {
                    "name": "Color",
                    "visible": true,
                    "variation": true,
                    "options": [...new Set(
                        colores.map((color) => color.nombre_color)
                    )]
                },
                {
                    "name": "Talla",
                    "visible": true,
                    "variation": true,
                    "options": producto.tallas
                }
            ]
        }

        let idWooPadre = 0
        const validarProducto = await generalService.getTableInformationCrm('productos', 'codigo_modelo', producto.codigo_modelo)
        console.log('Info validar producto')
        console.log(validarProducto)
        console.log('Vamos a validar', validarProducto.length > 0 && validarProducto[0].id_woo_producto)

        if (validarProducto.length > 0 && !!validarProducto[0].id_woo_producto) {
            idWooPadre = +validarProducto[0].id_woo_producto
            await ecommerceIntegration.actualizarProductoWoo(idWooPadre, nuevoProducto)
        } else {
            const productoWoo = await ecommerceIntegration.crearProductoWoo(nuevoProducto)
            await crmEcommerceDao.actualizarProductoCrm(producto.codigo_modelo, { id_woo_producto: productoWoo.id })
            idWooPadre = productoWoo.id
        }


        /**Crear variaciones */

        const variacionesWoo = await crearVariacionesWoo(producto, idWooPadre)

        return { variacionesWoo }

    } catch (e) {
        return e
    }
}

const crearVariacionesWoo = async (producto: IEditarProductoModelo, idPadreWoo: number) => {
    try {
        const productosCrm = await generalService.getTableInformationCrm('productos', 'codigo_modelo', producto.codigo_modelo)
        const coloresProducto = await crmEcommerceDao.obtenerColorEImagenPorProducto(producto.codigo_modelo)

        for (const productoCrm of productosCrm) {
            const colorProducto = coloresProducto.filter((color) => color.codigo_color === productoCrm.color)[0]
            const stockProducto = await crmEcommerceDao.obtenerInventarioProducto(productoCrm.id)
            
            const variacion: INuevaVariacionWoo = {
                regular_price: String(producto.precio_venta),
                sale_price: "",
                manage_stock: true,
                stock_quantity: stockProducto[0].stock,
                tax_status: "taxable",
                sku: productoCrm.codigo,
                image: {
                    src: colorProducto.url || undefined
                },
                attributes: [
                    {
                        name: "Color",
                        option: colorProducto.nombre_color
                    },
                    {
                        name: "Talla",
                        option: productoCrm.talla
                    }
                ]
            };
            if (!!productoCrm.id_woo_variante_producto) {
                await ecommerceIntegration.actualizarVariacionWoo(idPadreWoo, productoCrm.id_woo_variante_producto, variacion);
            } else {
                const variacionWoo = await ecommerceIntegration.crearVariacionWoo(idPadreWoo, variacion);
                await crmEcommerceDao.actualizarProductoIndividualCrm(productoCrm.id, { id_woo_variante_producto: variacionWoo.id })
            }
        }

    } catch (e) {
        console.log('ERROR CREANDO VARIACIONES WOO');
        console.log(e);
        throw e;
    }
}