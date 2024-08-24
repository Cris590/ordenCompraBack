
import * as generalDao from '../databases/general';
import { logErrorApp } from '../helpers/logger';

export const getTableInformation = async (table: string, parameter: string | null = null, value: string | null | number = null) => {
    try {
        const data = await generalDao.getTableInformation(table, parameter, value);
        return data
    } catch (e: any) {
        logErrorApp.error(`ERROR === { servicio:'general_service',error:${String(e)}  }`) 
        throw new Error("Error: " + e.message)
    }
}