import { create } from 'zustand';
import type { OptionValue, Product } from '@/types/product';

export interface CartItem {
    id: string; // Product ID
    cartId: string; // Unique ID for cache handling (Product ID + Options Key)
    name: string;
    price: number;
    basePrice: number; // Giá gốc của sản phẩm
    quantity: number;
    image?: string;
    selectedOptions: OptionValue[];
    note?: string;
}

export type DiningOption = 'dine-in' | 'take-away';

interface CartStore {
    items: CartItem[];
    diningOption: DiningOption;
    discount: number; // Percentage
    addItem: (product: Product, options?: OptionValue[]) => void;
    removeItem: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    updateItemOptions: (cartId: string, options: OptionValue[]) => void;
    updateItemNote: (cartId: string, note: string) => void;
    setDiningOption: (option: DiningOption) => void;
    setDiscount: (discount: number) => void;
    clearCart: () => void;
    loadCart: (items: CartItem[], diningOption: DiningOption, discount: number) => void;
    subtotal: () => number;
    total: () => number;
    broadcast: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
    items: [],
    diningOption: 'dine-in',
    discount: 0,
    addItem: (product, options = []) => {
        const currentItems = get().items;
        const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
        const finalPrice = product.price + optionsTotal;

        const sortedOptionsKey = options
            .map(o => o.name)
            .sort()
            .join('|');

        const cartId = `${product.id}-${sortedOptionsKey || 'default'}`;
        const existingItem = currentItems.find((item) => item.cartId === cartId);

        let newItems;
        if (existingItem) {
            newItems = currentItems.map((item) =>
                item.cartId === cartId
                    ? { ...item, quantity: item.quantity + 1 }
                    : item
            );
        } else {
            newItems = [
                ...currentItems,
                {
                    id: product.id,
                    cartId,
                    name: product.name,
                    image: product.image,
                    basePrice: product.price,
                    price: finalPrice,
                    quantity: 1,
                    selectedOptions: options
                }
            ];
        }

        set({ items: newItems });
        get().broadcast();
    },
    removeItem: (cartId) => {
        const newItems = get().items.filter((item) => item.cartId !== cartId);
        set({ items: newItems });
        get().broadcast();
    },
    updateQuantity: (cartId, quantity) => {
        const newItems = get().items.map((item) =>
            item.cartId === cartId ? { ...item, quantity: Math.max(0, quantity) } : item
        );
        set({ items: newItems });
        get().broadcast();
    },
    updateItemOptions: (cartId, options) => {
        const currentItems = get().items;
        const targetItem = currentItems.find(item => item.cartId === cartId);
        if (!targetItem) return;

        const optionsTotal = options.reduce((sum, opt) => sum + opt.price, 0);
        const finalPrice = targetItem.basePrice + optionsTotal;

        const sortedOptionsKey = options
            .map(o => o.name)
            .sort()
            .join('|');

        const newCartId = `${targetItem.id}-${sortedOptionsKey || 'default'}`;

        let newItems;
        if (newCartId === cartId) {
            newItems = currentItems.map(item =>
                item.cartId === cartId
                    ? { ...item, selectedOptions: options, price: finalPrice }
                    : item
            );
        } else {
            const existingItemWithNewOptions = currentItems.find(item => item.cartId === newCartId);
            if (existingItemWithNewOptions) {
                newItems = currentItems
                    .map(item => {
                        if (item.cartId === newCartId) {
                            return { ...item, quantity: item.quantity + targetItem.quantity };
                        }
                        return item;
                    })
                    .filter(item => item.cartId !== cartId);
            } else {
                newItems = currentItems.map(item =>
                    item.cartId === cartId
                        ? { ...item, cartId: newCartId, selectedOptions: options, price: finalPrice }
                        : item
                );
            }
        }

        set({ items: newItems });
        get().broadcast();
    },
    updateItemNote: (cartId, note) => {
        set((state) => ({
            items: state.items.map(item => item.cartId === cartId ? { ...item, note } : item)
        }));
        get().broadcast();
    },
    setDiningOption: (option) => {
        set({ diningOption: option });
        get().broadcast();
    },
    setDiscount: (discount) => {
        set({ discount: Math.min(100, Math.max(0, discount)) });
        get().broadcast();
    },
    clearCart: () => {
        set({ items: [], diningOption: 'dine-in', discount: 0 });
        get().broadcast();
    },
    loadCart: (items, diningOption, discount) => {
        set({ items, diningOption, discount });
        get().broadcast();
    },
    subtotal: () => {
        return get().items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    },
    total: () => {
        const subtotal = get().subtotal();
        const discountAmount = (subtotal * get().discount) / 100;
        return subtotal - discountAmount;
    },
    // Helper to broadcast state to other tabs
    broadcast: () => {
        const { items, total, subtotal, discount, diningOption } = get();
        const channel = new BroadcastChannel('pos_cart_channel');
        channel.postMessage({
            type: 'CART_UPDATE',
            payload: {
                items,
                diningOption,
                discount,
                subtotal: subtotal(),
                total: total()
            }
        });
        channel.close();
    }
}));
