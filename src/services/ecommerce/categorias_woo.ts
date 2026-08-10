import axios from "axios";
import { INuevaECategoria, INuevoEProducto, IRespuestaCreacionECategoria, IRespuestaCreacionEProducto} from "../../interfaces/api/ecommerce";
import { logIntegracionesEcommerce } from "../../helpers/logger";
const WOOCOMERCE_URL = process.env.WOOCOMERCE_URL

const api = axios.create({
    baseURL: WOOCOMERCE_URL,
    auth: {
        username: process.env.WOOCOMERCE_CLIENT_KEY!,
        password: process.env.WOOCOMERCE_CLIENT_SECRET!
    }
});

export const crearCategoriaWoo = async (categoria: INuevaECategoria): Promise<IRespuestaCreacionECategoria> => {
    const { data } = await api.post<IRespuestaCreacionECategoria>(
        "/products/categories",
        categoria
    );

    const log = {
        url:`${WOOCOMERCE_URL}/products/categories`,
        type:'post',
        request:categoria,
        response:data
    }
    logIntegracionesEcommerce.info(JSON.stringify(log))
    return data;
};

export const actualizarCategoriaWoo = async (
    idCategoria: number,
    categoria: Partial<INuevaECategoria>
): Promise<IRespuestaCreacionECategoria> => {
    const { data } = await api.put<IRespuestaCreacionECategoria>(
        `/products/categories/${idCategoria}`,
        categoria
    );

    const log = {
        url: `${WOOCOMERCE_URL}/products/categories/${idCategoria}`,
        type: "put",
        request: categoria,
        response: data
    };

    logIntegracionesEcommerce.info(JSON.stringify(log));

    return data;
};
