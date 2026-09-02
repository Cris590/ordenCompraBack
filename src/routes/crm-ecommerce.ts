import dotenv from 'dotenv';
import express from 'express';
import {router as webhookRouter} from './webhook_ecommerce/webhook_ecommerce'
import * as crmEcommerceService from '../services/crm-ecommerce';

dotenv.config();

export const router = express.Router();

// WEBHOOK
router.use('/webhook_woocomerce', webhookRouter);

router.post('/crear_categoria_crm/', crmEcommerceService.crearCategoria);
router.put('/editar_categoria_crm/:cod_categoria', crmEcommerceService.editarCategoria);
router.post('/crear_sub_categoria_crm/', crmEcommerceService.crearSubCategoria);
router.put('/editar_sub_categoria_crm/:cod_sub_categoria', crmEcommerceService.editarSubCategoria);
router.get('/sincronizar_categoria_ecommerce/:cod_categoria', crmEcommerceService.sincronizarCategoriaEcommerce);
router.get('/sincronizar_subcategoria_ecommerce/:cod_sub_categoria', crmEcommerceService.sincronizarSubCategoriaEcommerce);

router.get('/obtener_productos_crm/', crmEcommerceService.obtenerProductosCrm);
router.post('/descargar_excel_impresion_productos/', crmEcommerceService.descargarExcelImpresionProductos );
router.get('/obtener_detalles_producto/:codigo_modelo', crmEcommerceService.obtenerDetalleProductosCrm);

router.get('/obtener_colores_producto_crm/:codigo_modelo', crmEcommerceService.obtenerColoresProductoCrm);
router.post('/crear_color_producto_crm/', crmEcommerceService.crearColorProductoCrm);
router.put('/editar_color_producto_crm/:cod_producto_color', crmEcommerceService.editarColorProductoCrm);

router.get('/obtener_imagenes_colores/:cod_producto_color', crmEcommerceService.obtenerImagenesColoresProducto);
router.post('/cargar_imagen_producto', crmEcommerceService.cargarImagenProducto);
router.post('/borrar_imagen_producto', crmEcommerceService.borrarImagenProducto);

router.get('/obtener_tallas/:codigo_modelo', crmEcommerceService.obtenerTallasProducto);

router.get('/obtener_tallajes', crmEcommerceService.obtenerTallas);
router.post('/crear-tallaje', crmEcommerceService.crearTallaje);
router.put('/editar-tallaje/:cod_tallaje', crmEcommerceService.editarTallaje);
router.get('/obtener_tallajes_activas', crmEcommerceService.obtenerTallasActivas);

router.post('/editar_producto', crmEcommerceService.editarProductoCrm);
router.post('/crear_producto', crmEcommerceService.crearProductoCrm);
