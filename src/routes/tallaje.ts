import dotenv from 'dotenv';
import express from 'express';
import * as tallajeService from '../services/tallaje';

dotenv.config();

export const router = express.Router();

router.get('/obtener', tallajeService.obtenerTallas);
router.post('/crear-tallaje', tallajeService.crearTallaje);
router.put('/editar-tallaje/:cod_tallaje', tallajeService.editarTallaje);
router.get('/obtener-activas', tallajeService.obtenerTallasActivas);