export interface IOrdenWooCommerce {
    id: number;
    parent_id: number;
    status: string;
    currency: string;
    version: string;
    prices_include_tax: boolean;
    date_created: string;
    date_modified: string;
    discount_total: string;
    discount_tax: string;
    shipping_total: string;
    shipping_tax: string;
    cart_tax: string;
    total: string;
    total_tax: string;
    customer_id: number;
    order_key: string;

    billing: IDireccionWooCommerce;
    shipping: IDireccionWooCommerce;

    payment_method: string;
    payment_method_title: string;
    transaction_id: string;
    customer_ip_address: string;
    customer_user_agent: string;
    created_via: string;
    customer_note: string;

    date_completed: string | null;
    date_paid: string | null;
    cart_hash: string;
    number: string;

    meta_data: IMetaDataWooCommerce[];
    line_items: ILineaOrdenWooCommerce[];
    tax_lines: ITaxLineWooCommerce[];
    shipping_lines: IShippingLineWooCommerce[];
    fee_lines: IFeeLineWooCommerce[];
    coupon_lines: ICouponLineWooCommerce[];
    refunds: IRefundWooCommerce[];

    payment_url: string;
    is_editable: boolean;
    needs_payment: boolean;
    needs_processing: boolean;

    date_created_gmt: string;
    date_modified_gmt: string;
    date_completed_gmt: string | null;
    date_paid_gmt: string | null;

    currency_symbol: string;

    _links: ILinksWooCommerce;
}

export interface IDireccionWooCommerce {
    first_name: string;
    last_name: string;
    company: string;
    address_1: string;
    address_2: string;
    city: string;
    state: string;
    postcode: string;
    country: string;
    email?: string;
    phone: string;
}

export interface IMetaDataWooCommerce {
    id: number;
    key: string;
    value: string;
}

export interface ILineaOrdenWooCommerce {
    id: number;
    name: string;
    product_id: number;
    variation_id: number;
    quantity: number;
    tax_class: string;
    subtotal: string;
    subtotal_tax: string;
    total: string;
    total_tax: string;
    taxes: ITax[];
    meta_data: IMetaDataWooCommerce[];
    sku: string;
    global_unique_id: string;
    price: number;
    image: IImagenWooCommerce;
    parent_name: string;
}

export interface ITax {
    id?: number;
    total?: string;
    subtotal?: string;
}

export interface IImagenWooCommerce {
    id: number;
    src: string;
}

export interface ITaxLineWooCommerce {
    id: number;
    rate_code?: string;
    rate_id?: number;
    label?: string;
    compound?: boolean;
    tax_total?: string;
    shipping_tax_total?: string;
    rate_percent?: number;
}

export interface IShippingLineWooCommerce {
    id: number;
    method_title: string;
    method_id: string;
    instance_id: string;
    total: string;
    total_tax: string;
    taxes: ITax[];
    tax_status: string;
    meta_data: IMetaDataWooCommerce[];
}

export interface IFeeLineWooCommerce {
    id: number;
    name?: string;
    tax_class?: string;
    tax_status?: string;
    total?: string;
    total_tax?: string;
    taxes?: ITax[];
    meta_data?: IMetaDataWooCommerce[];
}

export interface ICouponLineWooCommerce {
    id: number;
    code?: string;
    discount?: string;
    discount_tax?: string;
    meta_data?: IMetaDataWooCommerce[];
}

export interface IRefundWooCommerce {
    id: number;
    reason?: string;
    total?: string;
}

export interface ILinksWooCommerce {
    self: ILinkWooCommerce[];
    collection: ILinkWooCommerce[];
    email_templates?: ILinkWooCommerce[];
    customer?: ILinkWooCommerce[];
}

export interface ILinkWooCommerce {
    href: string;
    targetHints?: {
        allow: string[];
    };
}