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

export interface INuevoEProductoWoo {
    name: string;
    type?: "simple" | "variable";
    regular_price?: string;
    description?: string;
    short_description?: string;
    sku?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    tax_status?: "taxable" | "shipping" | "none";
    categories: {
        id: number;
    }[];
    images?: {
        src: string;
    }[];
    attributes?: {
        name: string;
        visible: boolean;
        variation: boolean;
        options: string[];
    }[];
}

export interface INuevaVariacionWoo {
    regular_price?: string;
    sale_price?: string;
    sku?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    image?: {
        src: string;
    };
    tax_status?: "taxable" | "shipping" | "none";

    attributes: {
        name: string;
        option: string;
    }[];
}

export interface IRespuestaCreacionEProducto {
    id: number;
    name: string;
    slug: string;
    permalink: string;
    type: "simple" | "variable";
    status: string;
    sku: string;
    regular_price: string;
    sale_price: string;
    price: string;
    stock_quantity: number | null;
    stock_status: "instock" | "outofstock" | "onbackorder";
    manage_stock: boolean;
    image?: {
        src: string;
    };
    categories: {
        id: number;
        name: string;
        slug: string;
    }[];
    attributes: {
        id: number;
        name: string;
        slug: string;
        position: number;
        visible: boolean;
        variation: boolean;
        options: string[];
    }[];
    variations: number[];
}

export interface IRespuestaCreacionEVariacion {
    id: number;
    parent_id: number;

    date_created: string | null;
    date_modified: string | null;

    description: string;
    permalink: string;

    sku: string;

    price: string;
    regular_price: string;
    sale_price: string;

    on_sale: boolean;
    purchasable: boolean;

    virtual: boolean;
    downloadable: boolean;

    manage_stock: boolean;
    stock_quantity: number | null;

    stock_status: "instock" | "outofstock" | "onbackorder";

    weight: string;
    dimensions: {
        length: string;
        width: string;
        height: string;
    };

    shipping_class: string;
    shipping_class_id: number;

    image: {
        id: number;
        date_created: string;
        date_created_gmt: string;
        date_modified: string;
        date_modified_gmt: string;
        src: string;
        name: string;
        alt: string;
    } | null;

    attributes: {
        id: number;
        name: string;
        option: string;
    }[];

    tax_class: string;

    menu_order: number;
}

export interface IActualizarProductoWoo {
    name?: string;
    regular_price?: string;
    description?: string;
    short_description?: string;
    sku?: string;
    status?: "publish" | "draft" | "pending" | "private";
    categories?: {
        id: number;
    }[];
}

export interface IActualizarVariacionWoo {
    sku?: string;
    regular_price?: string;
    sale_price?: string;
    manage_stock?: boolean;
    stock_quantity?: number;
    status?: "publish" | "private";
    image?: {
        src: string;
    };
    attributes?: {
        name: string;
        option: string;
    }[];
}