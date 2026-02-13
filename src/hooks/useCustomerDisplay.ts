"use client";

import { useEffect, useState } from 'react';
import type { CartItem } from '@/store/useCartStore';

interface CartState {
    items: CartItem[];
    total: number;
}

export const useCustomerDisplay = () => {
    const [cartState, setCartState] = useState<CartState>({ items: [], total: 0 });

    useEffect(() => {
        const channel = new BroadcastChannel('pos_cart_channel');

        channel.onmessage = (event) => {
            if (event.data.type === 'CART_UPDATE') {
                setCartState(event.data.payload);
            }
        };

        // Cleanup
        return () => {
            channel.close();
        };
    }, []);

    return cartState;
};
