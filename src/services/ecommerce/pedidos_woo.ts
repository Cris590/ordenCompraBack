import axios from "axios";
import {
    IRespuestaActualizacionPedidoWoo
} from "../../interfaces/api/ecommerce";
import { logIntegracionesEcommerce } from "../../helpers/logger";
import { guardarLogIntegracionWoo } from "./general_ecommerce";

const WOOCOMMERCE_URL = process.env.WOOCOMERCE_URL

const api = axios.create({
    baseURL: WOOCOMMERCE_URL,
    auth: {
        username: process.env.WOOCOMERCE_CLIENT_KEY!,
        password: process.env.WOOCOMERCE_CLIENT_SECRET!
    }
});



export const actualizarEstadoPedidoWoo = async (idPedido: number, estado:string): Promise<IRespuestaActualizacionPedidoWoo> => {

    const url = `${WOOCOMMERCE_URL}/orders/${idPedido}`;

    try {

        const { data, status} = await api.put<IRespuestaActualizacionPedidoWoo>(
                    `/orders/${idPedido}`,
                    {status:estado}
                );

        const log = {
            url,
            type: "put",
            request: {status:estado},
            response: data
        };

        logIntegracionesEcommerce.info(JSON.stringify(log));
        await guardarLogIntegracionWoo({
            servicio: "actualizar_estado_pedido",
            tipo: "POST",
            url,
            request:  {status:estado},
            response: data,
            status,
            procesado: true
        });

        

        return data;

    } catch (e: any) {

        const log = {
            url,
            type: "put",
            request: {status:estado},
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message
        };

        logIntegracionesEcommerce.error(JSON.stringify(log));

         await guardarLogIntegracionWoo({
            servicio: "actualizar_estado_pedido",
            tipo: "POST",
            url,
            request: {status:estado},
            response: e.response?.data ?? null,
            status: e.response?.status ?? null,
            error: e.message,
            procesado:false
        });

        throw e;
    }
};