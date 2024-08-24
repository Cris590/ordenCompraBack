import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import fileUpload from 'express-fileupload';

import { v2 as cloudinary } from 'cloudinary';


export const subirArchivo = async (file: fileUpload.UploadedFile, nombreCarpeta: string = '', extensionesValidas = ['jpg', 'png', 'jpeg', 'gif']) => {
    try {


        // Configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME || '',
            api_key: process.env.CLOUDINARY_KEY || '',
            api_secret: process.env.CLOUDINARY_SECRET || '' // Click 'View API Keys' above to copy your API secret
        });



        // Validar las extensiones

        let extensionArchivo = file.name.split('.').at(-1) || ''
        if (!extensionesValidas.includes(extensionArchivo)) {
            return {
                error: 1,
                nombre: '',
                msg: {
                    type: 'error',
                    message: 'La Extensión de uno de los archivos no es válida'
                }
            }
        }



        // Cargar Archivos

        extensionArchivo = file.name.split('.').at(-1) || ''
        let nombreTemporal = uuidv4() + '.' + extensionArchivo

        // Use the mv() method to place the file somewhere on your server

        // Upload an image
        const uploadResult = await cloudinary.uploader.upload(
            file.tempFilePath, {
            folder: 'orden_compra',
        })

        console.log(uploadResult);

        // Optimize delivery by resizing and applying auto-format and auto-quality
        const optimizeUrl = cloudinary.url('orden_compra', {
            fetch_format: 'auto',
            quality: 'auto'
        });

        return {
            error: 0,
            nombre: uploadResult.secure_url
        }




        return {
            error: 1,
        }

    } catch (e) {
        return {
            error: 1,
            nombre: '',
            msg: {
                type: 'error',
                message: 'Error al subir el archivo, comuniquese con el administrador'
            }
        }
    }

}

export const borrarArchivo = async (img: string) => {
    try {

        const idImagen = img.split('/').at(-1)?.split('.')[0] || ''

        console.log('-------------')
        console.log(idImagen)
        // Configuration
        cloudinary.config({
            cloud_name: process.env.CLOUDINARY_NAME || '',
            api_key: process.env.CLOUDINARY_KEY || '',
            api_secret: process.env.CLOUDINARY_SECRET || '' // Click 'View API Keys' above to copy your API secret
        });

        cloudinary.uploader.destroy('orden_compra/' + idImagen)

        return {
            error: 1,
        }

    } catch (e) {
        console.log('**************')
        console.log(e)
        return {
            error: 1,
            nombre: '',
            msg: {
                type: 'error',
                message: 'Error al borrar el archivo, comuniquese con el administrador'
            }
        }
    }

}