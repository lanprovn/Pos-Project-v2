import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem, DiningOption } from './useCartStore';

export interface HeldOrder {
    id: string;
    customerName?: string;
    items: CartItem[];
    diningOption: DiningOption;
    discount: number;
    subtotal: number;
    total: number;
    createdAt: string;
    tableId?: string;
}

interface HoldOrderStore {
    heldOrders: HeldOrder[];
    setHeldOrders: (orders: HeldOrder[]) => void;
    addHeldOrder: (order: HeldOrder) => void;
    removeHeldOrder: (id: string) => void;
}

export const useHoldOrderStore = create<HoldOrderStore>()(
    persist(
        (set) => ({
            heldOrders: [],
            setHeldOrders: (heldOrders) => set({ heldOrders }),
            addHeldOrder: (order) => set((state) => ({ heldOrders: [order, ...state.heldOrders] })),
            removeHeldOrder: (id) => set((state) => ({
                heldOrders: state.heldOrders.filter((o) => o.id !== id),
            })),
        }),
        {
            name: 'held-orders-storage',
        }
    )
);
