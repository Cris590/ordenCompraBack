export interface IProductoResumen {
    cod_producto:number,
    nombre:string,
    talla?:string,
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


export interface IProductoEditar{
    nombre?: string,
    cod_categoria?: number,
    cod_tallaje?: number,
    activo?: boolean,
    talla?:string[],
    tiene_color?: boolean,
    tiene_talla?: boolean
}

export interface IProductoMostrar{
    cod_producto:number,
    nombre:string,
    tiene_color: boolean,
    tiene_talla: boolean,
    colores:IColorProductoBD[],
    talla:string[]
}