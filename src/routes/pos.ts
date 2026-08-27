import dotenv from 'dotenv';
import express from 'express';
import * as posService from '../services/pos';

dotenv.config();

export const router = express.Router();

router.get('/obtener_medios_pagos', posService.obtenerMediosPago);
router.get('/obtener_cliente_por_documento/:documento', posService.obtenerClientePorDocumento);
router.get('/obtener_tiendas_pos_usuario', posService.obtenerTiendasPosUsuario);
router.get('/vendedores_crm', posService.obtenerVendedoresCrm);
router.get('/vendedores_por_tienda', posService.obtenerVendedoresPorTienda);
router.get('/obtener_info_producto/:codigo', posService.obtenerInfoProductoVenta);


router.post('/obtener_ventas_crm/', posService.obtenerVentasPos);
router.post('/obtener_ventas_pendientes_pos/', posService.obtenerVentasRetomarCrm);

router.post('/crear_venta/', posService.crearVentaPos);
router.put('/editar_venta/:id_venta', posService.editarVentaPos);

router.get('/obtener_venta_detalle/:id_venta', posService.obtenerVentaDetalle);
router.get('/generar_factura_pdf/:id_venta', posService.generarFactura);
router.get('/cancelar_factura_pos/:id_venta', posService.cancelarFacturaPos);

router.get('/obtener_tipos_documento/', posService.obtenerTiposDocumento);
router.get('/obtener_clientes/', posService.obtenerClientesPos);
router.put('/actualizar_cliente_crm/:idCliente', posService.actualizarClienteCrm);
router.post('/crear_cliente_crm/', posService.crearClienteCrm);
router.get('/obtener_venta_retomar/:id_venta', posService.obtenerVentaParaRemotar);
router.post('/obtener_inventario_pos/', posService.obtenerInventariosPos);

router.get('/inventario_codigo/:codigo/:id_tienda', posService.obtenerInventarioPorCodigo);
router.get('/busqueda_inventario_codigo/:codigo', posService.busquedaInventarioCodigo);

router.post('/transferir_producto_entre_bodegas/', posService.transferirProductosEntreBodegas);
router.post('/obtener_historial_translados/', posService.obtenerHistorialTraslados);

router.post('/entrada_salida_inventario/', posService.entradaSalidaInventario );



