import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Customer {
    id: string;
    name: string;
    phone: string;
    points: number;
    tier: string;
    totalSpent: number;
}

interface CustomerStore {
    customers: Customer[];
    setCustomers: (customers: Customer[]) => void;
    addCustomer: (customer: Customer) => void;
}

export const useCustomerStore = create<CustomerStore>()(
    persist(
        (set) => ({
            customers: [],
            setCustomers: (customers) => set({ customers }),
            addCustomer: (customer) => set((state) => ({ customers: [...state.customers, customer] })),
        }),
        {
            name: 'customers-storage',
        }
    )
);
