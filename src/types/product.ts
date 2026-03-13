export interface OptionValue {
    id: string;
    name: string;
    price: number;
}

export interface ProductOption {
    id: string;
    name: string;
    values: OptionValue[];
    required: boolean;
    multiple: boolean;
    type?: 'single' | 'multiple';
}

export interface Product {
    id: string;
    name: string;
    category: string;
    price: number;
    costPrice?: number | null;
    sku?: string | null;
    barcode?: string | null;
    image: string;
    stock: number;
    unit?: string | null;
    description?: string | null;
    options?: ProductOption[] | string;
    createdAt?: Date;
    updatedAt?: Date;
}
