export interface IEntidadResumen {
    cod_entidad:number,
    nombre:string,
    activo:1|0,
}

export interface IEntidadInfoBasica extends IEntidadResumen{
    nit:string,
    info_contrato:string,
    tipo_entrega_bono:string
}

export interface IUsuarioEntidad{
    cod_usuario:number,
    email:string,
    nombre:string,
    activo:1|0,
    sexo:string,
    cedula:string,
    cod_cargo_entidad:number,
    cod_orden:number,
    cargo_entidad:string,
    redimido?:boolean
}

export interface IUsuarioCarga {
    nombre: string,
    documento: string,
    email: string,
    cargo: string,
    lote: number,
    sexo: string,
    activo: number,
    password: string,
    codigo:string
}