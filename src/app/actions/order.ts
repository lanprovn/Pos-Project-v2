"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function createOrder(data: {
    items: object[];
    total: number;
    subtotal: number;
    discount: number;
    paymentMethod: string;
    diningOption: string;
    customerId?: string;
    tableId?: string;
    status?: string;
}) {
    try {
        const order = await prisma.order.create({
            data: {
                items: data.items,
                total: data.total,
                subtotal: data.subtotal,
                discount: data.discount,
                paymentMethod: data.paymentMethod,
                diningOption: data.diningOption,
                status: data.status || 'completed',
                fulfillmentStatus: 'ready', // Auto ready as there's no separate bar
                ...(data.customerId && { customerId: data.customerId }),
                ...(data.tableId && { tableId: data.tableId }),
            },
        });

        // Only update customer points if completed
        if (data.customerId && (data.status === 'completed' || !data.status)) {
            await prisma.customer.update({
                where: { id: data.customerId },
                data: {
                    totalSpent: { increment: data.total },
                    points: { increment: Math.floor(data.total / 10000) } // 10k = 1 point
                }
            });
        }

        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { success: true, order };
    } catch (error) {
        console.error("Error creating order:", error);
        return { success: false, error: "Failed to create order" };
    }
}

export async function updateOrderPaymentStatus(orderId: string, status: string, paymentMethod?: string) {
    try {
        const order = await prisma.order.update({
            where: { id: orderId },
            data: {
                status,
                ...(paymentMethod && { paymentMethod })
            },
            include: { customer: true }
        });

        if (status === 'completed') {
            // RELEASE TABLES
            if (order.tableId) {
                await prisma.$transaction([
                    prisma.table.update({
                        where: { id: order.tableId },
                        data: { status: 'available', parentTableId: null }
                    }),
                    prisma.table.updateMany({
                        where: { parentTableId: order.tableId },
                        data: { status: 'available', parentTableId: null }
                    })
                ]);
            }

            if (order.customerId) {
                await prisma.customer.update({
                    where: { id: order.customerId },
                    data: {
                        totalSpent: { increment: order.total },
                        points: { increment: Math.floor(order.total / 10000) }
                    }
                });
            }
        }

        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { success: true, order };
    } catch (error) {
        console.error("Error updating payment status:", error);
        return { success: false, error: "Failed to update payment status" };
    }
}

export async function getActiveOrderForTable(tableId: string) {
    try {
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        const effectiveTableId = table?.parentTableId || tableId;

        const order = await prisma.order.findFirst({
            where: {
                tableId: effectiveTableId,
                status: 'pending_payment'
            },
            orderBy: { date: 'desc' }
        });
        return { success: true, order };
    } catch {
        return { success: false, error: "Failed to fetch active order" };
    }
}

export async function updateOrderStatusAction(id: string, fulfillmentStatus: string) {
    try {
        const order = await prisma.order.update({
            where: { id },
            data: { fulfillmentStatus }
        });
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { success: true, order };
    } catch (error) {
        console.error("Error updating order status:", error);
        return { success: false, error: "Failed to update order" };
    }
}

export async function getOrders(limit: number = 50) {
    try {
        const orders = await prisma.order.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { customer: true }
        });
        return { success: true, orders };
    } catch (error) {
        console.error("Error fetching orders:", error);
        return { success: false, error: "Failed to fetch orders" };
    }
}

export async function updateOrder(id: string, data: {
    items: object[];
    total: number;
    subtotal: number;
    discount: number;
}) {
    try {
        const order = await prisma.order.update({
            where: { id },
            data: {
                items: data.items,
                total: data.total,
                subtotal: data.subtotal,
                discount: data.discount,
            },
        });
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { success: true, order };
    } catch (error) {
        console.error("Error updating order:", error);
        return { success: false, error: "Failed to update order" };
    }
}

export async function moveOrder(fromTableId: string, toTableId: string) {
    try {
        interface TableDB { id: string; parentTableId: string | null; status: string; number: number; name: string }
        const fromTable = await prisma.table.findUnique({ where: { id: fromTableId } }) as unknown as TableDB;
        if (!fromTable) return { success: false, error: "Bàn đi không tồn tại" };

        const masterTableId = fromTable.parentTableId || fromTableId;

        const order = await prisma.order.findFirst({
            where: { tableId: masterTableId, status: 'pending_payment' }
        });

        if (!order) {
            return { success: false, error: "Không tìm thấy đơn hàng đang chờ thanh toán" };
        }

        await prisma.$transaction([
            prisma.order.update({
                where: { id: order.id },
                data: { tableId: toTableId }
            }),
            prisma.table.update({
                where: { id: toTableId },
                data: { status: 'occupied', parentTableId: null }
            }),
            // Release all tables in the old group
            prisma.table.update({
                where: { id: masterTableId },
                data: { status: 'available', parentTableId: null }
            }),
            prisma.table.updateMany({
                where: { parentTableId: masterTableId },
                data: { status: 'available', parentTableId: null }
            })
        ]);

        revalidatePath("/");
        revalidatePath("/orders");
        return { success: true };
    } catch (error) {
        const err = error as Error;
        console.error("Move Order Error:", err);
        return { success: false, error: err.message || "Lỗi hệ thống khi chuyển bàn" };
    }
}

export async function mergeOrders(sourceTableId: string, targetTableId: string) {
    try {
        interface TableDB { id: string; parentTableId: string | null; status: string; number: number; name: string }
        const sourceTable = await prisma.table.findUnique({ where: { id: sourceTableId } }) as unknown as TableDB;
        const targetTable = await prisma.table.findUnique({ where: { id: targetTableId } }) as unknown as TableDB;

        if (!sourceTable || !targetTable) return { success: false, error: "Bàn không tồn tại" };

        const sourceMasterId = sourceTable.parentTableId || sourceTableId;
        const targetMasterId = targetTable.parentTableId || targetTableId;

        if (sourceMasterId === targetMasterId) return { success: false, error: "Hai bàn đã thuộc cùng một nhóm" };

        const sourceOrder = await prisma.order.findFirst({
            where: { tableId: sourceMasterId, status: 'pending_payment' }
        });
        const targetOrder = await prisma.order.findFirst({
            where: { tableId: targetMasterId, status: 'pending_payment' }
        });

        if (!sourceOrder || !targetOrder) return { success: false, error: "Không tìm thấy đủ đơn hàng để gộp" };

        const mergedItems = [...(sourceOrder.items as unknown as object[]), ...(targetOrder.items as unknown as object[])];
        const mergedSubtotal = sourceOrder.subtotal + targetOrder.subtotal;
        const mergedTotal = sourceOrder.total + targetOrder.total;

        await prisma.$transaction([
            prisma.order.update({
                where: { id: targetOrder.id },
                data: {
                    items: mergedItems,
                    subtotal: mergedSubtotal,
                    total: mergedTotal,
                }
            }),
            prisma.order.delete({
                where: { id: sourceOrder.id }
            }),
            // All tables that were in source group now point to targetMasterId
            prisma.table.update({
                where: { id: sourceMasterId },
                data: { status: 'occupied', parentTableId: targetMasterId }
            }),
            prisma.table.updateMany({
                where: { parentTableId: sourceMasterId },
                data: { parentTableId: targetMasterId }
            })
        ]);

        revalidatePath("/");
        revalidatePath("/orders");
        return { success: true };
    } catch (error) {
        console.error("Merge Order Error:", error);
        return { success: false, error: "Lỗi hệ thống khi gộp bàn" };
    }
}

export async function cancelOrder(orderId: string, reason: string, staffName: string) {
    try {
        const order = await prisma.order.findUnique({ where: { id: orderId } });

        if (!order) return { success: false, error: "Không tìm thấy đơn hàng" };
        if (order.status === 'cancelled') return { success: false, error: "Đơn hàng đã bị hủy trước đó" };

        const updatedOrder = await prisma.order.update({
            where: { id: orderId },
            data: {
                status: 'cancelled',
                cancellationReason: reason,
                cancelledAt: new Date(),
                cancelledBy: staffName
            }
        });

        // Restock items
        const items = order.items as unknown as { id?: string; quantity?: number }[];
        for (const item of items) {
            if (item.id && item.quantity) {
                const productExists = await prisma.product.findUnique({ where: { id: item.id } });
                if (productExists) {
                    await prisma.product.update({
                        where: { id: item.id },
                        data: { stock: { increment: item.quantity } }
                    });
                }
            }
        }

        // Release Table if any
        if (order.tableId) {
            interface TableDB { id: string; parentTableId: string | null; status: string; number: number; name: string }
            const table = await prisma.table.findUnique({ where: { id: order.tableId } }) as unknown as TableDB;
            // Determine the master table ID for the group
            const masterId = table?.parentTableId || order.tableId;

            await prisma.$transaction(async (prismaTx) => {
                // Release the master table
                await prismaTx.table.update({
                    where: { id: masterId },
                    data: { status: 'available', parentTableId: null }
                });

                // Release all child tables associated with the master table
                await prismaTx.table.updateMany({
                    where: { parentTableId: masterId },
                    data: { status: 'available', parentTableId: null }
                });
            });
        }

        // Revalidate paths
        try {
            revalidatePath("/");
            revalidatePath("/orders");
            revalidatePath("/dashboard");
            revalidatePath("/pos");
        } catch (e) {
            console.error("[cancelOrder] Revalidation Error:", e);
        }

        return { success: true, data: updatedOrder };
    } catch (error) {
        const err = error as Error;
        return { success: false, error: err.message || "Lỗi hệ thống khi hủy đơn" };
    }
}
