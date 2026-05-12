import Knex from 'knex';
import config from '../../knexfile';

const db = Knex(config.development);
const dbCrm = Knex(config.crmbrt);

export const getTableInformation =async (table:string,parameter:string|null = null,value:string|null|number=null ) => {
    try {   
        let registroTable=[]
        if(parameter && (value || value == 0)){
            
            registroTable = await db.select().from(table)
            .where(parameter, value)     
        }else{
            registroTable = await db.select().from(table)
        }

        return registroTable;
        
        
    } catch (e) {
        console.log('** ERROR GRANDE **')
        console.log(config.development)
        console.log(e)
        throw new Error("Error en el servivio de obtener información " + e)
    }
}

export const getTableInformationActive =async (table:string,parameter:string|null = null,value:string|null|number=null ) => {
    try {   
        let registroTable=[]
        if(parameter && (value || value == 0)){
            
            registroTable = await db.select().from(table)
            .where(parameter, value)  
            .andWhere('active',1)   
        }else{
            registroTable = await db.select().from(table)
            .where('active',1)
        }

        return registroTable;
        
        
    } catch (e) {
        throw new Error("Error en el servivio de obtener información " + e)
    }
}

export const getEntidadesEntregaBonos = (activo:boolean = true) =>{
     return db
        .select('e.cod_entidad',
            db.raw("CONCAT(e.no_contrato, ' - ', e.nombre) as nombre"),
        )
        .from('entidad as e')
        .where('e.tipo_entrega_contrato',2)
        .andWhere('e.activo',activo)
}

export const getTableInformationCrm =async (table:string,parameter:string|null = null,value:string|null|number=null ) => {
    try {   
        let registroTable=[]
        if(parameter && (value || value == 0)){
            
            registroTable = await dbCrm.select().from(table)
            .where(parameter, value)     
        }else{
            registroTable = await dbCrm.select().from(table)
        }

        return registroTable;
        
        
    } catch (e) {
        console.log('** ERROR GRANDE **')
        console.log(config.development)
        console.log(e)
        throw new Error("Error en el servivio de obtener información " + e)
    }
}