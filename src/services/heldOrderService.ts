import { heldOrderRepo } from "@/repositories/heldOrderRepo";

export class HeldOrderService {
    async getAllHeldOrders() {
        const orders = await heldOrderRepo.findAll();
        return orders.map(o => ({
            ...o,
            items: JSON.parse(o.items as string || '[]')
        }));
    }

    async saveOrder(data: any) {
        return await heldOrderRepo.create({
            customerName: data.customerName,
            items: JSON.stringify(data.items),
            total: data.total,
            subtotal: data.subtotal,
            discount: data.discount,
            diningOption: data.diningOption,
        });
    }

    async deleteOrder(id: string) {
        return await heldOrderRepo.delete(id);
    }
}

export const heldOrderService = new HeldOrderService();
