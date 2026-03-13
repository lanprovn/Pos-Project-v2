import { prisma } from "@/lib/prisma";
import { tableRepo } from "@/repositories/tableRepo";

export class TableService {
    async getAllTables() {
        return await tableRepo.findAll();
    }

    async updateStatus(id: string, status: string) {
        return await tableRepo.update(id, { status });
    }

    async releaseGroup(tableId: string) {
        const table = await tableRepo.findById(tableId);
        if (!table) throw new Error("Bàn không tồn tại");

        const masterId = table.parentTableId || tableId;

        return await prisma.$transaction([
            prisma.table.update({
                where: { id: masterId },
                data: { status: 'available', parentTableId: null }
            }),
            prisma.table.updateMany({
                where: { parentTableId: masterId },
                data: { status: 'available', parentTableId: null }
            })
        ]);
    }

    async moveOrder(fromTableId: string, toTableId: string) {
        return await prisma.$transaction(async (tx) => {
            const fromTable = await tx.table.findUnique({ where: { id: fromTableId } });
            if (!fromTable) throw new Error("Bàn đi không tồn tại");

            const masterTableId = fromTable.parentTableId || fromTableId;

            const order = await tx.order.findFirst({
                where: { tableId: masterTableId, status: 'pending_payment' }
            });

            if (!order) throw new Error("Không tìm thấy đơn hàng đang chờ thanh toán");

            await tx.order.update({
                where: { id: order.id },
                data: { tableId: toTableId }
            });

            await tx.table.update({
                where: { id: toTableId },
                data: { status: 'occupied', parentTableId: null }
            });

            // Release old group
            await tx.table.update({
                where: { id: masterTableId },
                data: { status: 'available', parentTableId: null }
            });

            await tx.table.updateMany({
                where: { parentTableId: masterTableId },
                data: { status: 'available', parentTableId: null }
            });

            return order;
        });
    }

    async mergeOrders(sourceTableId: string, targetTableId: string) {
        return await prisma.$transaction(async (tx) => {
            const sourceTable = await tx.table.findUnique({ where: { id: sourceTableId } });
            const targetTable = await tx.table.findUnique({ where: { id: targetTableId } });

            if (!sourceTable || !targetTable) throw new Error("Bàn không tồn tại");

            const sourceMasterId = sourceTable.parentTableId || sourceTableId;
            const targetMasterId = targetTable.parentTableId || targetTableId;

            if (sourceMasterId === targetMasterId) throw new Error("Hai bàn đã thuộc cùng một nhóm");

            const sourceOrder = await tx.order.findFirst({
                where: { tableId: sourceMasterId, status: 'pending_payment' }
            });
            const targetOrder = await tx.order.findFirst({
                where: { tableId: targetMasterId, status: 'pending_payment' }
            });

            if (!sourceOrder || !targetOrder) throw new Error("Không tìm thấy đủ đơn hàng để gộp");

            const mergedItems = [...(JSON.parse(sourceOrder.items as string || '[]')), ...(JSON.parse(targetOrder.items as string || '[]'))];
            const mergedSubtotal = sourceOrder.subtotal + targetOrder.subtotal;
            const mergedTotal = sourceOrder.total + targetOrder.total;

            await tx.order.update({
                where: { id: targetOrder.id },
                data: {
                    items: JSON.stringify(mergedItems),
                    subtotal: mergedSubtotal,
                    total: mergedTotal,
                }
            });

            await tx.order.delete({
                where: { id: sourceOrder.id }
            });

            // Point source group to target master
            await tx.table.update({
                where: { id: sourceMasterId },
                data: { status: 'occupied', parentTableId: targetMasterId }
            });

            await tx.table.updateMany({
                where: { parentTableId: sourceMasterId },
                data: { parentTableId: targetMasterId }
            });

            return targetOrder;
        });
    }
}

export const tableService = new TableService();
