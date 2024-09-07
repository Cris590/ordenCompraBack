import dotenv from 'dotenv';
import express from 'express';
import * as ordenCompraService from '../services/orden_compra';

dotenv.config();

export const router = express.Router();

router.get('/productos/:codUsuario', ordenCompraService.obtenerProductos);
router.get('/producto_detalle/:codProducto', ordenCompraService.obtenerProductoDetalle);