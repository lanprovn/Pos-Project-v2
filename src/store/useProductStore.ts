import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, ProductOption, OptionValue } from '@/types/product';

export type { Product, ProductOption, OptionValue };

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
