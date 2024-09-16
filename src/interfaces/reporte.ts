export interface IUsuarioOrdenPorEntidadSql {
    cedula: string;
    nombre: string;
    sexo: string;
    email: string;
    cargo_entidad: string;
    entidad: string;
    nit: string;
    productos?: string;  // Puede ser null si no hay un pedido
    fecha_creacion?: string;
    direccion?: string;
    ciudad?: string;
    cedula_creador?: string;
    nombre_creador?: string;
    no_contrato?: string;
}

export interface IUsuarioProductosFormateados extends Omit<IUsuarioOrdenPorEntidadSql, 'productos'> {
    productos?: IProductoOrden[]
}


export interface IProductoOrden {

    cod_producto: number;
    nombre: string;
    talla: string;
    cod_color_producto: number;
    color: string;
    imagen: string;
    cantidad: number;
    tiene_color: number;
    tiene_talla: number;
    cod_categoria: number;
    categoria: string;

}

export interface IUsuarioReporteDetalle {
    cedula: string;
    nombre: string;
    sexo: string;
    email: string;
    cargo_entidad: string;
    entidad: string;
    nit: string;
    fecha_creacion?: string;
    direccion?: string;
    ciudad?: string;
    cedula_creador?: string;
    nombre_creador?: string;
    orden_completa?: number;
    cod_producto?: number;
    nombre_producto?: string;
    color?: string;
    talla?: string;
    cantidad?: number;
    categoria?: string;
    descripcion_producto?: string;
    productos?: any
}

export interface IUsuarioBonos {
    cedula: string,
    nombre: string,
    nombre_entidad: string,
    no_contrato: string,
    sexo: string,
    fecha_gestionada: string,
    cod_orden: string,
    productos: string,
}