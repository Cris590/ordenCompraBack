

import { Request, Response } from 'express';
import * as generalService from './general'
import * as solicitudDotacionDao from '../databases/solicitud_dotacion'
import { RequestToken } from '../interfaces/express';



export const obtenerOrdenesPendientes = async (req: Request, res: Response) => {
    try {
        let request = req as RequestToken
        let { user } = request.auth
        let ordenes = await solicitudDotacionDao.obtenerOrdenesPendientes(user.cod_entidad)
        res.send({
            error: 0,
            ordenes
        })

    } catch (e: any) {
        console.log('***********')
        console.log(e)
        res.send({
            error: 1,
            msg: {
                icon: 'error',
                text: 'Error al consultar las entidades'
            }
        })
    }

}