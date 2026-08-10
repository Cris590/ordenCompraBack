export interface INuevaECategoria{
    name:string,
    parent?:number
}

export interface IRespuestaCreacionECategoria{
    id: number,
    name: string,
    slug: string,
    parent: number
}

export interface INuevoEProducto {
    name: string;
    type?: "simple" | "variable";
    regular_price?: string;
    description?: string;
    short_description?: string;
    sku?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    categories: {
        id: number;
    }[];
    images?: {
        src: string;
    }[];
}

export interface IRespuestaCreacionEProducto {
    id: number;
    name: string;
    slug: string;
    sku: string;
    type: string;
    status: string;
    regular_price: string;
    stock_quantity: number | null;
    permalink: string;
}