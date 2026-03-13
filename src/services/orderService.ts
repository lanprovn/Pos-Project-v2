import { orderRepo } from "@/repositories/orderRepo";
import { tableRepo } from "@/repositories/tableRepo";
import { customerRepo } from "@/repositories/customerRepo";
import { productRepo } from "@/repositories/productRepo";
import { prisma } from "@/lib/prisma";

export class OrderService {
    async createOrder(data: any) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.create({
                data: {
                    items: JSON.stringify(data.items),
                    total: data.total,
                    subtotal: data.subtotal,
                    discount: data.discount,
                    paymentMethod: data.paymentMethod,
                    diningOption: data.diningOption,
                    status: data.status || 'completed',
                    fulfillmentStatus: 'ready',
                    ...(data.customerId && { customerId: data.customerId }),
                    ...(data.tableId && { tableId: data.tableId }),
                },
            });

            // Update customer points if completed
            if (data.customerId && (data.status === 'completed' || !data.status)) {
                await tx.customer.update({
                    where: { id: data.customerId },
                    data: {
                        totalSpent: { increment: data.total },
                        points: { increment: Math.floor(data.total / 10000) }
                    }
                });
            }

            return order;
        });
    }

    async updatePaymentStatus(orderId: string, status: string, paymentMethod?: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.update({
                where: { id: orderId },
                data: {
                    status,
                    ...(paymentMethod && { paymentMethod })
                }
            });

            if (status === 'completed') {
                // Release tables
                if (order.tableId) {
                    const table = await tx.table.findUnique({ where: { id: order.tableId } });
                    const masterId = table?.parentTableId || order.tableId;

                    await tx.table.update({
                        where: { id: masterId },
                        data: { status: 'available', parentTableId: null }
                    });

                    await tx.table.updateMany({
                        where: { parentTableId: masterId },
                        data: { status: 'available', parentTableId: null }
                    });
                }

                // Update customer points
                if (order.customerId) {
                    await tx.customer.update({
                        where: { id: order.customerId },
                        data: {
                            totalSpent: { increment: order.total },
                            points: { increment: Math.floor(order.total / 10000) }
                        }
                    });
                }
            }

            return order;
        });
    }

    async getActiveOrderForTable(tableId: string) {
        const table = await tableRepo.findById(tableId);
        const effectiveTableId = table?.parentTableId || tableId;

        const order = await orderRepo.findActiveByTable(effectiveTableId);
        if (!order) return null;

        return {
            ...order,
            items: JSON.parse(order.items as string || '[]')
        };
    }

    async getAllOrders(limit: number = 50) {
        const orders = await orderRepo.findAll(limit);
        return orders.map(o => ({
            ...o,
            items: JSON.parse(o.items as string)
        }));
    }

    async updateOrderItems(id: string, data: any) {
        return await orderRepo.update(id, {
            items: JSON.stringify(data.items),
            total: data.total,
            subtotal: data.subtotal,
            discount: data.discount,
        });
    }

    async cancelOrder(orderId: string, reason: string, staffName: string) {
        return await prisma.$transaction(async (tx) => {
            const order = await tx.order.findUnique({ where: { id: orderId } });
            if (!order) throw new Error("Không tìm thấy đơn hàng");
            if (order.status === 'cancelled') throw new Error("Đơn hàng đã bị hủy trước đó");

            const updatedOrder = await tx.order.update({
                where: { id: orderId },
                data: {
                    status: 'cancelled',
                    cancellationReason: reason,
                    cancelledAt: new Date(),
                    cancelledBy: staffName
                }
            });

            // Restock items
            const items = JSON.parse(order.items as string || '[]') as any[];
            for (const item of items) {
                if (item.id && item.quantity) {
                    const productExists = await tx.product.findUnique({ where: { id: item.id } });
                    if (productExists) {
                        await tx.product.update({
                            where: { id: item.id },
                            data: { stock: { increment: item.quantity } }
                        });
                    }
                }
            }

            // Release Table
            if (order.tableId) {
                const table = await tx.table.findUnique({ where: { id: order.tableId } });
                const masterId = table?.parentTableId || order.tableId;

                await tx.table.update({
                    where: { id: masterId },
                    data: { status: 'available', parentTableId: null }
                });

                await tx.table.updateMany({
                    where: { parentTableId: masterId },
                    data: { status: 'available', parentTableId: null }
                });
            }

            return updatedOrder;
        });
    }
}

export const orderService = new OrderService();
