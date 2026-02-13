import { create } from 'zustand';
import { persist } from 'zustand/middleware';

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
    costPrice?: number;
    sku?: string;
    barcode?: string;
    image: string;
    stock: number;
    unit?: string;
    description?: string;
    options?: ProductOption[];
}

interface ProductStore {
    products: Product[];
    setProducts: (products: Product[]) => void;
    updateStock: (id: string, diff: number) => void;
}

export const useProductStore = create<ProductStore>()(
    persist(
        (set) => ({
            products: [],
            setProducts: (products) => set({ products }),
            updateStock: (id, diff) => set((state) => ({
                products: state.products.map(p =>
                    p.id === id ? { ...p, stock: Math.max(0, p.stock + diff) } : p
                )
            })),
        }),
        {
            name: 'product-storage',
        }
    )
);
