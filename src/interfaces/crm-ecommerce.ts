
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

export interface FiltroBusquedaPedidosEcommerce {
    page: number;
    perPage: number;
    documento?: string;
    numeroPedido?: string;
    codEstadoPedido?: number;
    fechaDesde?: string;
    fechaHasta?: string;
    estadoFinal?: boolean;
}

export interface INuevoSeguimientoPedidoEcommerce{
    cod_ecommerce_pedido:number,
    cod_ecommerce_estado_pedido:number,
    descripcion:string
}

export interface IPedidoEcommerceGestion {
    cod_ecommerce_pedido: number;
    id_woocommerce: number;
    numero_pedido: string;

    subtotal: number;
    descuento: number;
    impuesto: number;
    envio: number;
    total: number;

    metodo_pago: string | null;
    codigo_metodo_pago: string | null;

    estado_woocommerce: string;
    estado_final: boolean;
    cod_ecommerce_estado_pedido: number;

    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface IClienteEcommerceGestion {
    cod_ecommerce_cliente: number;
    id_woocommerce: number | null;

    nombre_cliente: string;
    documento: string;
    email: string;
    telefono: string;

    fecha_creacion: string;
    fecha_actualizacion: string;
}

export interface IDireccionEcommerceGestion {
    cod_ecommerce_direccion: number;

    nombre_cliente: string;
    direccion: string;
    direccion_2: string | null;
    ciudad: string;
    departamento: string;
    codigo_postal: string | null;
    telefono: string;

    fecha_creacion: string;
}

export interface ISeguimientoPedidoEcommerce {
    descripcion: string;
    codigo_estado: string;
    descripcion_estado_pedido: string;
    fecha_creacion: string;
}

export interface IEstadoPermitidoPedidoEcommerce {
    descripcion: string;
    codigo: string;
    estado_woocommerce: string;
    estado_final: boolean;
}

export interface IGestionPedidoEcommerce {
    pedido: IPedidoEcommerceGestion;
    cliente: IClienteEcommerceGestion | null;
    direccionFacturacion: IDireccionEcommerceGestion | null;
    direccionEnvio: IDireccionEcommerceGestion | null;
    seguimientos: ISeguimientoPedidoEcommerce[];
    estadosPermitidos: IEstadoPermitidoPedidoEcommerce[];
}


export interface IAsignacionTienda{
    id_tienda: number, 
    cantidad: number
}
export interface IAsignacionNuevoInventario{
    id_producto: number,
    asignaciones: IAsignacionTienda[]
}

export interface INuevoSeguimientoPedidoEcommerce{    
    cod_ecommerce_pedido: number,
    cod_ecommerce_estado_pedido: number,
    descripcion: string,
    inventario?: IAsignacionNuevoInventario[] | []
}  