import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from './useCartStore';

export interface Order {
    id: string;
    items: CartItem[];
    total: number;
    subtotal: number;
    discount: number;
    date: string; // ISO string
    status: 'completed' | 'refunded' | 'cancelled';
    cancellationReason?: string;
    cancelledAt?: string;
    cancelledBy?: string;
    fulfillmentStatus: 'pending' | 'preparing' | 'ready' | 'delivered';
    paymentMethod: 'cash' | 'transfer' | 'card';
    diningOption: 'dine-in' | 'take-away';
    tableId?: string;
}

interface OrderStore {
    orders: Order[];
    addOrder: (order: Omit<Order, 'id' | 'date' | 'status' | 'fulfillmentStatus'>) => void;
    setOrders: (orders: Order[]) => void;
    updateOrderStatus: (id: string, fulfillmentStatus: Order['fulfillmentStatus']) => void;
    getOrders: () => Order[];
    getOrderById: (id: string) => Order | undefined;
}

export const useOrderStore = create<OrderStore>()(
    persist(
        (set, get) => ({
            orders: [],
            addOrder: (orderData) => {
                const newOrder: Order = {
                    ...orderData,
                    id: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                    date: new Date().toISOString(),
                    status: 'completed',
                    fulfillmentStatus: 'pending',
                };
                set((state) => ({
                    orders: [newOrder, ...state.orders],
                }));
            },
            setOrders: (orders) => set({ orders }),
            updateOrderStatus: (id, fulfillmentStatus) => {
                set((state) => ({
                    orders: state.orders.map((o) =>
                        o.id === id ? { ...o, fulfillmentStatus } : o
                    ),
                }));
            },
            getOrders: () => get().orders,
            getOrderById: (id) => get().orders.find((o) => o.id === id),
        }),
        {
            name: 'order-storage',
        }
    )
);
