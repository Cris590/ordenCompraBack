import dotenv from 'dotenv';
import express from 'express';
import * as entidadBonoService from '../services/entidad_bono';

dotenv.config();

export const router = express.Router();


router.post('/consultar_bonos/', entidadBonoService.consultarBonos);
router.get('/consultar_bono_usuario/:codUsuario', entidadBonoService.consultarBonoUsuario);
router.post('/redimir_bono_entrega/', entidadBonoService.redimirBonoEntrega);
router.get('/consultar_entidades/', entidadBonoService.consultarEntidadesEntregaBonos);

router.get('/buscar_bonos_cedula/:documento', entidadBonoService.buscarBonosCedula);
router.post('/obtener_bonos_usuario_redencion', entidadBonoService.obtenerBonosUsuarioRedencion);
router.post('/redimir_bonos_tienda', entidadBonoService.redimirBonosTienda);