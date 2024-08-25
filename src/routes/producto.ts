import dotenv from 'dotenv';
import express from 'express';
import * as productoService from '../services/producto';

dotenv.config();

export const router = express.Router();

router.get('/obtener', productoService.obtenerProductos);
router.get('/detalle/:codProducto', productoService.obtenerProductoEditar);
router.get('/info_basica/:codProducto', productoService.obtenerInfoBasicaProducto);
router.post('/crear_producto', productoService.crearProducto);
router.put('/editar_producto/:codProducto', productoService.editarProducto);

router.get('/obtener_tallas/:codProducto', productoService.obtenerTallasProducto);

router.post('/cargar_imagen_producto', productoService.cargarImagenProducto);
router.get('/obtener_colores_producto/:cod_producto', productoService.obtenerColoresProducto);

router.get('/obtener_imagenes_colores/:cod_producto_color', productoService.obtenerImagenesColoresProducto);
router.post('/borrar_imagen_producto', productoService.borrarImagenProducto);

router.post('/crear_color_producto', productoService.crearColorProducto);
router.post('/editar_color_producto/:cod_producto_color', productoService.editarColorProducto);
router.delete('/borrar_color_producto/:cod_producto_color', productoService.borrarColorProducto);
