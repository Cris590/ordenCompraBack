import dotenv from 'dotenv';
import express from 'express';
import * as entidadService from '../services/entidad';

dotenv.config();

export const router = express.Router();


router.get('/info_contrato', entidadService.informacionContrato);
router.get('/obtener', entidadService.obtenerEntidades);
router.post('/crear',entidadService.crearEntidad)
router.get('/info_basica/:codEntidad', entidadService.obtenerInfoBasicaEntidad);
router.put('/editar_entidad/:codEntidad', entidadService.editarEntidad);
router.get('/usuarios/:codEntidad', entidadService.obtenerUsuariosEntidad);
router.get('/usuario_coordinador/:codEntidad', entidadService.obtenerUsuarioCoordinadorEntidad);
router.get('/cargos/:codEntidad', entidadService.cargosPorEntidadResumen);
router.get('/detalle_cargo/:codCargoEntidad', entidadService.detalleCargoEntidad);

router.post('/crear_cargo',entidadService.crearCargoEntidad)
router.put('/editar_cargo/:codCargoEntidad', entidadService.editarCargoEntidad);

router.post('/cargar_usuarios',entidadService.cargarUsuariosEntidad)
router.post('/crear_usuario_entidad',entidadService.crearUsuarioEntidad)
router.put('/editar_usuario_entidad/:codUsuario',entidadService.editarUsuarioEntidad)

