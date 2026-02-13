"use server";

import { prisma } from "@/lib/prisma";

export async function getHeldOrders() {
    try {
        const orders = await prisma.heldOrder.findMany({
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, orders };
    } catch (error) {
        console.error("Error fetching held orders:", error);
        return { success: false, error: "Failed to fetch held orders" };
    }
}

export async function saveHeldOrder(data: { customerName: string; items: object[]; total: number; subtotal: number; discount: number; diningOption: string }) {
    try {
        const order = await prisma.heldOrder.create({
            data: {
                customerName: data.customerName,
                items: data.items,
                total: data.total,
                subtotal: data.subtotal,
                discount: data.discount,
                diningOption: data.diningOption,
            },
        });
        return { success: true, order };
    } catch (error) {
        console.error("Error saving held order:", error);
        return { success: false, error: "Failed to save order" };
    }
}

export async function deleteHeldOrder(id: string) {
    try {
        await prisma.heldOrder.delete({
            where: { id },
        });
        return { success: true };
    } catch (error) {
        console.error("Error deleting held order:", error);
        return { success: false, error: "Failed to delete order" };
    }
}
