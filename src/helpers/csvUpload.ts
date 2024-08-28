
import csv from 'csv-parser';
import fs from 'fs';

export const processCSVFile = <T>(filePath: string): Promise<T[]> => {
    return new Promise((resolve, reject) => {
        const results: T[] = [];

        fs.createReadStream(filePath)
            .pipe(csv())
            .on('data', (data) => {
                let dataAux = data as T
                let cleanedKey = cleanKeys(dataAux)
                results.push(cleanedKey as T);
            })
            .on('end', () => resolve(results))
            .on('error', (error) => reject(error));
    });
};

const cleanKeys = (row: any): { [key: string]: string } => {
    const cleanedRow: { [key: string]: string } = {};
    for (const key in row) {
      const cleanedKey = key.replace(/'/g, '').trim(); // Remove single quotes and trim any extra spaces
      cleanedRow[cleanedKey] = row[key];
    }
    return cleanedRow;
  };