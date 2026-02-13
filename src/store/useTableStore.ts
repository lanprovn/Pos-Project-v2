import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Table {
    id: string;
    number: number;
    name: string;
    status: 'available' | 'occupied' | 'reserved';
    currentOrderId?: string;
    parentTableId?: string | null;
}

interface TableStore {
    tables: Table[];
    selectedTableId: string | null;
    setTables: (tables: Table[]) => void;
    setSelectedTable: (id: string | null) => void;
    updateTableStatus: (id: string, status: Table['status'], orderId?: string, parentId?: string | null) => void;
    getTableByNumber: (num: number) => Table | undefined;
}

export const useTableStore = create<TableStore>()(
    persist(
        (set, get) => ({
            tables: [],
            selectedTableId: null,
            setTables: (tables) => set({ tables }),
            setSelectedTable: (id) => set({ selectedTableId: id }),
            updateTableStatus: (id, status, orderId, parentId) => set((state) => ({
                tables: state.tables.map(t => t.id === id ? { ...t, status, currentOrderId: orderId, parentTableId: parentId } : t)
            })),
            getTableByNumber: (num) => get().tables.find(t => t.number === num),
        }),
        {
            name: 'table-storage',
        }
    )
);
