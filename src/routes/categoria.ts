import dotenv from 'dotenv';
import express from 'express';
import * as categoriaService from '../services/categoria';

dotenv.config();

export const router = express.Router();

router.get('/obtener-todas', categoriaService.obtenerCategorias);
router.get('/obtener-activas', categoriaService.obtenerCategoriasActivas);
router.get('/detalle-categoria/:codCategoria', categoriaService.obtenerDetalleCategoria);
router.post('/crear-categoria', categoriaService.crearCategoria);
router.put('/editar-categoria/:codCategoria', categoriaService.editarCategoria);

router.get('/productos-categoria/:codCategoria', categoriaService.productosCategoria);
