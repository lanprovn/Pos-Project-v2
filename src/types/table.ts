export interface Table {
    id: string;
    number: number;
    name: string;
    status: 'available' | 'occupied' | 'reserved';
    capacity: number;
    parentTableId?: string | null;
    createdAt: Date;
    updatedAt: Date;
}
