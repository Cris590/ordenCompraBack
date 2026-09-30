import axios from "axios";
import { INuevaECategoria, IRespuestaCreacionECategoria } from "../../interfaces/api/ecommerce";
import { logIntegracionesEcommerce } from "../../helpers/logger";
import { guardarLogIntegracionWoo } from "./general_ecommerce";
const WOOCOMERCE_URL = process.env.WOOCOMERCE_URL

const api = axios.create({
    baseURL: WOOCOMERCE_URL,
    auth: {
        username: process.env.WOOCOMERCE_CLIENT_KEY!,
        password: process.env.WOOCOMERCE_CLIENT_SECRET!
    }
});


export const crearCategoriaWoo = async (
    categoria: INuevaECategoria
): Promise<IRespuestaCreacionECategoria> => {

    const url = `${WOOCOMERCE_URL}/products/categories`;

    try {

        const { data, status } = await api.post<IRespuestaCreacionECategoria>(
            "/products/categories",
            categoria
        );

        const log = {
            url,
            type: "post",
            request: categoria,
            response: data
        };

        logIntegracionesEcommerce.info(
            JSON.stringify(log)
        );

        await guardarLogIntegracionWoo({
            servicio: "crear_categoria",
            tipo: "POST",
            url,
            request: categoria,
            response: data,
            status,
            procesado: true
        });

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "post",
            request: categoria,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(
            JSON.stringify(log)
        );

        await guardarLogIntegracionWoo({
            servicio: "crear_categoria",
            tipo: "PUT",
            url,
            request: categoria,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message,
            procesado: false
        });

        throw e;
    }
};


export const actualizarCategoriaWoo = async (
    idCategoria: number,
    categoria: Partial<INuevaECategoria>
): Promise<IRespuestaCreacionECategoria> => {

    const url =
        `${WOOCOMERCE_URL}/products/categories/${idCategoria}`;

    try {

        const { data, status } = await api.put<IRespuestaCreacionECategoria>(
            `/products/categories/${idCategoria}`,
            categoria
        );

        const log = {
            url,
            type: "put",
            request: categoria,
            response: data
        };

        logIntegracionesEcommerce.info(
            JSON.stringify(log)
        );

        await guardarLogIntegracionWoo({
            servicio: "actualizar_categoria",
            tipo: "POST",
            url,
            request: categoria,
            response: data,
            status,
            procesado: true
        });

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "put",
            request: categoria,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(
            JSON.stringify(log)
        );

        await guardarLogIntegracionWoo({
            servicio: "actualizar_categoria",
            tipo: "PUT",
            url,
            request: categoria,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message,
            procesado: false
        });

        throw e;
    }
};


export const obtenerProductoVariacion = async (
    idProducto: number,
    idVariacion: Partial<INuevaECategoria>
): Promise<IRespuestaCreacionECategoria> => {

    const url = `${WOOCOMERCE_URL}/products/${idProducto}/variations/${idVariacion}`;

    try {

        const { data, status } = await api.get<IRespuestaCreacionECategoria>(
            `/products/${idProducto}/variations/${idVariacion}`
        );

        const log = {
            url,
            type: "get",
            response: data
        };

        logIntegracionesEcommerce.info(
            JSON.stringify(log)
        );

        await guardarLogIntegracionWoo({
            servicio: "obtener_variacion",
            tipo: "GET",
            url,
            response: data,
            status,
            procesado: true
        });

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "get",
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(JSON.stringify(log));
        await guardarLogIntegracionWoo({
            servicio: "obtener_variacion",
            tipo: "PUT",
            url,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message,
            procesado: false
        });

        throw e;
    }
};
