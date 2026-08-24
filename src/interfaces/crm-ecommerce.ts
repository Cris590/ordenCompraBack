
export interface IProductoResumenCrm{
    id_categoria:number,
    categoria:string,
    id_sub_categoria:number,
    sub_categoria:string,
    codigo_auxiliar:string,
    descripcion:string,
    precio_compra:number,
    precio_venta:number,
    lote:string,
    total_colores:number,
    total_tallas:number
}

export interface IPaginationProductoCRM {
    page: number;
    perPage: number;
    count: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
}

export interface IPaginatedProductsCrmResponse {
    data: IProductoResumenCrm[];
    pagination: IPaginationProductoCRM;
}

export interface ICrearProductoColorCrm{
       codigo_color:string,
       color:string,
       nombre_color:string,
       codigo_modelo:string,
       activo:boolean,
}

export interface IActualizarProductoCrm{
       precio_compra?:number,
       precio_venta?:number,
       cod_tallaje?:number,
        id_woo_producto?:number,
       id_woo_variante_producto?:number
}


export interface IActualizarProductoColorCrm{
       codigo_color:string,
       color:string,
       nombre_color:string,
}

export interface IEditarProductoModelo {
  id_categoria: number;
  id_sub_categoria: number;
  activo: number;
  descripcion: string;
  precio_compra: number;
  precio_venta: number;
  lote: string;
  codigo_modelo: string;
  colores: string[];
  tallas: string[];
  cod_tallaje: number;
  nuevo_producto?:boolean;
  sincronizar_ecommerce?:boolean
}

export interface IProductoNuevoCrm {
  id_categoria: number;
  id_sub_categoria: number;
  codigo:string,
  descripcion:string,
  precio_compra:number,
  precio_venta: number;
  activo: number;
  talla:string;
  color:string;
  cod_tallaje?:number
}