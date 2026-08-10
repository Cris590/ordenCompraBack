import dotenv from 'dotenv';
import express from 'express';
import * as controlAccesosService from '../services/control-accesos';

dotenv.config();

export const router = express.Router();
router.get('/usuarios/', controlAccesosService.getUsuariosAplicacion);
router.put('/actualizar_usuario/:codUsuario', controlAccesosService.editarUsuario);
router.get('/obtener_perfiles/', controlAccesosService.obtenerPerfilesAplicacion);
router.post('/crear_usuario/', controlAccesosService.crearUsuario);