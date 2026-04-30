import dotenv from 'dotenv';
import express from 'express';
import * as controlAccesosService from '../services/control-accesos';

dotenv.config();

export const router = express.Router();
router.get('/usuarios/', controlAccesosService.getUsuariosAplicacion);
router.put('/actualizar_usuario/:codUsuario', controlAccesosService.editarUsuario);