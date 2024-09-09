import dotenv from 'dotenv';
import express from 'express';
import * as ordenCompraService from '../services/orden_compra';

dotenv.config();

export const router = express.Router();

router.get('/productos/:codUsuario', ordenCompraService.obtenerProductos);
router.get('/producto_detalle/:codProducto', ordenCompraService.obtenerProductoDetalle);
router.post('/crear', ordenCompraService.crearOrdenCompra);
router.put('/actualizar/:codOrdenCompra', ordenCompraService.actualizarOrdenCompra);

router.get('/validar_orden/:codUsuario', ordenCompraService.validarOrdenUsuario);
router.get('/usuarios_coordinador_entidad/', ordenCompraService.usuariosOrdenesCoordinador);