import { BaseModel } from "../base.model";
export interface ISetting{
    _id: string;
    name: string;
    description: string;
    logo: string;
    itbis: number;
    rnc: string;
    address: string;
    min_product_notify: number;
    max_invoice_pending: number;
    email: string;
    phone: string;
    print_sale_point: boolean;
    representant_name: string;
    invoice_message: string;
    facebook?: string;
    instagram?: string;
    whatsapp? : string;
    twitter?: string;
    is_saas: boolean;
    free_shipping_order_value?: string;
    returned_arrare_days?: string;
    
    background_color?: string;
    text_color?: string;
    primary_background_color?: string;
    primary_text_color?: string;

    purchase_message: string
}

export class SettingModel extends BaseModel implements ISetting{
    _id: '';
    name: string;
    rnc: string;
    email: string;
    min_product_notify: number;
    max_invoice_pending: number;
    itbis: number;
    address: string;
    print_sale_point: boolean;
    phone: string;
    description: string;
    logo: string;
    is_saas: boolean;
    invoice_message: string;

    representant_name: string;
    facebook?: string;
    instagram?: string;
    twitter?: string;
    whatsapp? : string;
    free_shipping_order_value?: string;
    returned_arrare_days?: string;
    
    background_color?: string;
    text_color?: string;
    primary_background_color?: string;
    primary_text_color?: string;
    purchase_message: string

    constructor(){
        super();
        this.background_color = '#FFFFF';
        this.text_color = 'rgba(255, 255, 255, 0.87)';
        this.primary_background_color = '#00bcd4';
        this.primary_text_color = '#FFFFF';
    }
}