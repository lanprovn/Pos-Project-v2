export interface Order {
    id: string;
    total: number;
    subtotal: number;
    discount: number;
    paymentMethod: string;
    diningOption: string;
    status: string;
    fulfillmentStatus: string;
    customerId?: string | null;
    tableId?: string | null;
    items: any[] | string;
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}
