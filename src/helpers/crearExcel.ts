// @ts-ignore
import * as xl from 'excel4node';
import fs from 'fs';

// Define la función general para generar el archivo Excel
export const createExcelFile = (data: any[], filePath: string) => {

    return new Promise((resolve, reject) => {
        const wb = new xl.Workbook();
        const ws = wb.addWorksheet('Sheet 1');

        const headers = Object.keys(data[0] || {});

        headers.forEach((header, index) => {
            ws.cell(1, index + 1).string(header);
        });

        data.forEach((item, rowIndex) => {
            headers.forEach((header, colIndex) => {
                const value = item[header] !== undefined ? item[header] : '';
                ws.cell(rowIndex + 2, colIndex + 1).string(value ? value.toString() : '');
            });
        });

        wb.write(filePath, (err:any) => {
            if (err) {
                reject(err);
            } else {
                resolve(true);
            }
        });
    });

};