export interface IFiltrosVentasPOS {
  id_tienda: string;
  fecha_inicial: string;
  fecha_final: string;
  documento_cliente: string;
}


export interface PagoVentaRequest {
  metodo_pago: string;
  valor: number;
}

export interface IVentaDetallePOS {
    productos: IProductoVentaPOS[];
    metodos_pago: PagoVentaRequest[];
    codigo: string;
    fecha: string;
    pago_bono: string;
    neto: string;
    impuesto: string;
    total: string;
    factura_valida: string;
    descuento: string;
    cliente: string;
    documento_cliente: string;
    sufijo: string;
    tipo_documento: string;
    usuario: string;
    tienda: string;
    bono: string | null;
    total_sin_descuento: string;
    total_productos: number;
}


export interface IProductoVentaPOS {
    codigo: string;
    descripcion: string;
    cantidad: string;
    precio: string;
    total: string;
}