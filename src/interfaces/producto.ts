export interface IProductoResumen {
    cod_producto:number,
    nombre:string,
    talla?:string,
    color?:string,
    categoria:string,
    cod_categoria?:string,
    tiene_talla:boolean,
    tiene_color:boolean,
    sexo:string
}

export interface IColorProductoBD {
    color:string,
    imagenes:string[],
    color_descripcion:string
}

export interface IProductoDetalle extends IProductoResumen{
    color_detalle?:IColorProductoBD[],
    talla_detalle?:string[],
    sexo_detalle:string[]
    
}