import axios from "axios";
import { INuevaECategoria, IRespuestaCreacionECategoria, IRespuestaCreacionEProducto} from "../../interfaces/api/ecommerce";
import { UploadedFile } from "express-fileupload";
import { logIntegracionesEcommerce } from "../../helpers/logger";
import fs from 'fs';
import { generateRandomNumber } from "../../helpers/general";
const WORDPRESS_URL = process.env.WORDPRESS_URL || ''

const apiWordpress = axios.create({
    baseURL: WORDPRESS_URL,
    auth: {
        username: process.env.WORDPRESS_USERNAME!,
        password: process.env.WORDPRESS_PASS!
    }
});

export interface IRespuestaSubirImagenWoo {
    id: number;
    source_url: string;
}

export const subirImagenWoo = async (
    imagen: UploadedFile
): Promise<IRespuestaSubirImagenWoo> => {

    const url = `${WORDPRESS_URL}/media`;

    try {
        console.log('----- >', 
            {
                baseURL: WORDPRESS_URL,
                auth: {
                    username: process.env.WORDPRESS_USERNAME!,
                    password: process.env.WORDPRESS_PASS!
                }
            }
        )

        const buffer = fs.readFileSync(imagen.tempFilePath);

        console.log({
            isBuffer: Buffer.isBuffer(imagen.data),
            length: imagen.data.length,
            mimetype: imagen.mimetype,
            name: imagen.name
        });
        const { data } = await apiWordpress.post<IRespuestaSubirImagenWoo>(
            "/media",
            buffer,
            {
                headers: {
                    "Content-Type": imagen.mimetype,
                    "Content-Disposition": `attachment; filename="${generateRandomNumber(3) + '_' + imagen.name }"`
                }
            }
        );

        const log = {
            url,
            type: "post",
            request: {
                nombre: generateRandomNumber(3) + '_' + imagen.name,
                mimetype: imagen.mimetype,
                size: imagen.size,
                data:buffer
            },
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
            request: {
                nombre: imagen.name,
                mimetype: imagen.mimetype,
                size: imagen.size
            },
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