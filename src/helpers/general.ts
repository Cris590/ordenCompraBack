

import { randomBytes } from 'crypto'
const fs = require("fs");
const mime = require('mime-types');

export const generateRandomNumber = (digits: number) => {
    const numBytes = Math.ceil(digits / 2);
    const randomBytesCrypto = randomBytes(numBytes);
    const hexString = randomBytesCrypto.toString('hex');
    const randomNumber = parseInt(hexString, 16);
    const paddedNumber = ('0'.repeat(digits) + randomNumber).slice(-digits);
    return paddedNumber;
}

export const formatDate = (fecha: Date | null = null, hora = false, tipoSlash = false) => {

    let caracterSeparacion = (tipoSlash) ? '/' : '-'
    if (!fecha) {
        fecha = new Date();
    }
    let day = ('0' + fecha.getDate()).slice(-2);
    let month = ('0' + (fecha.getMonth() + 1)).slice(-2);
    let year = fecha.getFullYear();

    let hour = ('0' + fecha.getHours()).slice(-2);
    let minutes = ('0' + fecha.getMinutes()).slice(-2);
    let seconds = ('0' + fecha.getSeconds()).slice(-2);

    let fecha_formateada = year + caracterSeparacion + month + caracterSeparacion + day;
    if (hora) {
        fecha_formateada += '  ' + hour + ':' + minutes + ':' + seconds
    }

    return fecha_formateada

}

export const removeTildesAndSpecialChars = (str: string) => {
    // Map of special characters and their replacements
    const specialCharsMap: any = {
        "á": "a", "é": "e", "í": "i", "ó": "o", "ú": "u",
        "Á": "A", "É": "E", "Í": "I", "Ó": "O", "Ú": "U",
        "ü": "u", "Ü": "U"
    };

    // Replace letters with tildes with their equivalents without tildes
    str = str.replace(/[áéíóúÁÉÍÓÚüÜñÑ]/g, function (match) {
        return specialCharsMap[match];
    });

    // Remove special characters
    str = str.replace(/[^\w\s]/g, '');

    return str;
}

export const shortDateMonthYear = (dateString: string): string => {
    const date = new Date(dateString);
    const year = date.getFullYear().toString().slice(-2);
    const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is zero-based
    return `${month}/${year}`;
}

export const getFileBase64 = async (filePath: string, withoutType: boolean = false): Promise<string | null> => {
    return new Promise((resolve, reject) => {

        fs.access(filePath, fs.constants.F_OK, (err:any) => {
            if (err) {
                // File does not exist
                return resolve(null);
            }

            // Determine the MIME type of the file
            const mimeType = mime.lookup(filePath);

            // Read the file
            fs.readFile(filePath, (err: any, data: any) => {
                if (err) {
                    return reject('Error reading the file: ' + err);
                }

                // Convert the file buffer to a base64 string
                const base64File = data.toString('base64');

                // Construct the base64 data URI
                const dataUri = (withoutType) ? base64File : `data:${mimeType};base64,${base64File}`;

                // Resolve the promise with the base64 data URI
                resolve(dataUri);
            });

        })
    });
}