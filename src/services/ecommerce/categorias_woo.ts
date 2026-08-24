import axios from "axios";
import { INuevaECategoria, IRespuestaCreacionECategoria, IRespuestaCreacionEProducto} from "../../interfaces/api/ecommerce";
import { logIntegracionesEcommerce } from "../../helpers/logger";
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

        const { data } = await api.post<IRespuestaCreacionECategoria>(
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

        const { data } = await api.put<IRespuestaCreacionECategoria>(
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

        throw e;
    }
};
