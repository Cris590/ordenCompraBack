
import * as posDao from '../../databases/crm-ecommerce'
import * as generalService from '../general'
import { actualizarVariacionWoo } from './productos_woo'


export const actualizarInventarioEcommerce = async (idProducto: number) => {
    try {
        // TODO: Solo para pruebas
        const ACTUALIZA_INVENTARIO_ECOMMERCE = process.env.ACTUALIZA_INVENTARIO_ECOMMERCE ||  'false';
        if(ACTUALIZA_INVENTARIO_ECOMMERCE === 'false') return false

        const productoDetalle = await generalService.getTableInformationCrm('productos', 'id', idProducto)
        if (productoDetalle[0].id_woo_variante_producto) {
            const inventario = await posDao.obtenerInventarioProductoBodegaActiva(idProducto)
            const idPadreWoo = productoDetalle[0].id_woo_producto
            const idVarianteWoo = productoDetalle[0].id_woo_variante_producto

            await actualizarVariacionWoo(idPadreWoo, idVarianteWoo, { stock_quantity: inventario[0].cantidad_disponible });
            return true
        }
        return false
    } catch (error) {
        return false
    }
}