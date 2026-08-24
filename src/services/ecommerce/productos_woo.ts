import axios from "axios";
import {
    IActualizarProductoWoo,
    IActualizarVariacionWoo,
    INuevaECategoria,
    INuevaVariacionWoo,
    INuevoEProductoWoo,
    IRespuestaCreacionECategoria,
    IRespuestaCreacionEProducto,
    IRespuestaCreacionEVariacion
} from "../../interfaces/api/ecommerce";
import { logIntegracionesEcommerce } from "../../helpers/logger";

const WOOCOMMERCE_URL = process.env.WOOCOMERCE_URL

const api = axios.create({
    baseURL: WOOCOMMERCE_URL,
    auth: {
        username: process.env.WOOCOMERCE_CLIENT_KEY!,
        password: process.env.WOOCOMERCE_CLIENT_SECRET!
    }
});



export const crearProductoWoo = async (
    producto: INuevoEProductoWoo
): Promise<IRespuestaCreacionEProducto> => {

    const url = `${WOOCOMMERCE_URL}/products`;

    try {

        const { data } = await api.post<IRespuestaCreacionEProducto>(
            "/products",
            producto
        );

        const log = {
            url,
            type: "post",
            request: producto,
            response: data
        };

        logIntegracionesEcommerce.info(JSON.stringify(log));

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "post",
            request: producto,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(JSON.stringify(log));

        throw e;
    }
};


export const crearVariacionWoo = async (
    idProductoWoo: number,
    variacion: INuevaVariacionWoo
): Promise<IRespuestaCreacionEVariacion> => {

    const url = `${WOOCOMMERCE_URL}/products/${idProductoWoo}/variations`;

    try {

        const { data } = await api.post<IRespuestaCreacionEVariacion>(
            `/products/${idProductoWoo}/variations`,
            variacion
        );

        const log = {
            url,
            type: "post",
            request: variacion,
            response: data
        };

        logIntegracionesEcommerce.info(
            JSON.stringify(log)
        );

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "post",
            request: variacion,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(
            JSON.stringify(log)
        );

        throw e;
    }
};


export const actualizarProductoWoo = async (
    idProductoWoo: number,
    producto: IActualizarProductoWoo
): Promise<IRespuestaCreacionEProducto> => {
    
    const url = `${WOOCOMMERCE_URL}/products/${idProductoWoo}`;

    try {

        const { data } = await api.put<IRespuestaCreacionEProducto>(
            `/products/${idProductoWoo}`,
            producto
        );

        const log = {
            url,
            type: "put",
            request: producto,
            response: data
        };

        console.log('------ Vamos a actualizar producto ------')
        console.log(producto)
        console.log(log)
    
        logIntegracionesEcommerce.info(
            JSON.stringify(log)
        );

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "put",
            request: producto,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(
            JSON.stringify(log)
        );

        throw e;
    }
};


export const actualizarVariacionWoo = async (
    idProductoWoo: number,
    idVariacionWoo: number,
    variacion: IActualizarVariacionWoo
): Promise<IRespuestaCreacionEVariacion> => {

    const url =
        `${WOOCOMMERCE_URL}/products/${idProductoWoo}/variations/${idVariacionWoo}`;

    try {

        const { data } = await api.put<IRespuestaCreacionEVariacion>(
            `/products/${idProductoWoo}/variations/${idVariacionWoo}`,
            variacion
        );

        const log = {
            url,
            type: "put",
            request: variacion,
            response: data
        };

        
        console.log('------ Vamos a actualizar variacion ------')
        console.log(variacion)
        console.log(log)

        logIntegracionesEcommerce.info(
            JSON.stringify(log)
        );

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "put",
            request: variacion,
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(
            JSON.stringify(log)
        );

        throw e;
    }
};