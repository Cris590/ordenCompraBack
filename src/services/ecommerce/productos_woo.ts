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

export const crearProductoWoo = async (
    producto: INuevoEProducto
): Promise<IRespuestaCreacionEProducto> => {
    const { data } = await api.post<IRespuestaCreacionEProducto>(
        "/products",
        producto
    );

    const log = {
        url: `${WOOCOMERCE_URL}/products`,
        type: "post",
        request: producto,
        response: data
    };

    logIntegracionesEcommerce.info(JSON.stringify(log));
    return data;
};

export const actualizarProductoWoo = async (
    idProducto: number,
    producto: Partial<INuevoEProducto>
): Promise<IRespuestaCreacionEProducto> => {
    const { data } = await api.put<IRespuestaCreacionEProducto>(
        `/products/${idProducto}`,
        producto
    );

    const log = {
        url: `${WOOCOMERCE_URL}/products/${idProducto}`,
        type: "put",
        request: producto,
        response: data
    };

    logIntegracionesEcommerce.info(JSON.stringify(log));

    return data;
};