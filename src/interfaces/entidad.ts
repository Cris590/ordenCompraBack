export interface IEntidadResumen {
    cod_entidad:number,
    nombre:string,
    activo:1|0,
}

export interface IEntidadInfoBasica extends IEntidadResumen{
    nit:string,
    info_contrato:string
}