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
router.get('/detalle_cargo_bono_producto/:codCargoBonoProducto', entidadService.detalleCargoBonoProducto);

router.post('/crear_cargo',entidadService.crearCargoEntidad)
router.post('/crear_cargo_bono_producto',entidadService.crearCargoBonosProducto)

router.put('/editar_cargo/:codCargoEntidad', entidadService.editarCargoEntidad);
router.put('/editar_cargo_bono/:codCargoBonoProducto', entidadService.editarCargoBonoEntidad);

router.post('/cargar_usuarios',entidadService.cargarUsuariosEntidad)
router.post('/crear_usuario_entidad',entidadService.crearUsuarioEntidad)
router.put('/editar_usuario_entidad/:codUsuario',entidadService.editarUsuarioEntidad)

router.post('/crear_usuario_administrador',entidadService.crearUsuarioAplicacionCompleta)

router.get('/resumen_productos/:codEntidad', entidadService.resumenProductosEntidad);
router.get('/prueba_correo', entidadService.pruebasCorreo);

router.get('/obtener_categorias_crm', entidadService.obtenerCategoriasCrm);
router.get('/obtener_subcategorias_crm/:idCategoria', entidadService.obtenerSubCategoriasCrm);
router.get('/obtener_productos_asociados_crm/:codCargoBonosProductos', entidadService.obtenerProductosAsociados);

router.post('/asociar_subcategoria_bonos_producto',entidadService.asociarSubCategoriaBonosProducto)

router.put('/editar_asociacion/:codProductoAsociadoCategoria', entidadService.editarAsociacionSubcategoriaBonosProducto);
router.delete('/borrar_asociacion/:codProductoAsociadoCategoria', entidadService.borrarAsociacion);

router.get('/obtener_template_cargo_bono/:codCargoBonosProductos', entidadService.obtenerTemplateCargoBono);
router.put('/guardar_template_cargo_bono/:codTemplateCargoBonosProducto',entidadService.guardarTemplateCargoBono)
router.get('/generar_bonos_template/:codTemplateCargoBonosProducto',entidadService.generarBonosTemplate)



