import Knex from 'knex';
import config from '../../knexfile';

const db = Knex(config.development);

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