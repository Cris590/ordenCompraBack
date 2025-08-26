import dotenv from 'dotenv';
import express from 'express';
import * as entidadBonoService from '../services/entidad_bono';

dotenv.config();

export const router = express.Router();


router.post('/consultar_bonos/', entidadBonoService.consultarBonos);
router.get('/consultar_bono_usuario/:codUsuario', entidadBonoService.consultarBonoUsuario);
router.post('/redimir_bono_entrega/', entidadBonoService.redimirBonoEntrega);