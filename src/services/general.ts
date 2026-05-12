
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

export const getTableInformationCrm = async (table: string, parameter: string | null = null, value: string | null | number = null) => {
    try {
        const data = await generalDao.getTableInformationCrm(table, parameter, value);
        return data
    } catch (e: any) {
        logErrorApp.error(`ERROR === { servicio:'general_service',error:${String(e)}  }`) 
        throw new Error("Error: " + e.message)
    }
}



export const getEntidadesEntregaBonos = async (activo:boolean = true) => {
    try {
        const entidades = await generalDao.getEntidadesEntregaBonos(activo)
        return entidades
    } catch (e: any) {
        logErrorApp.error(`ERROR === { servicio:'entidades_entrega_bonos',error:${String(e)}  }`) 
        throw new Error("Error: " + e.message)
    }
}