import { prisma } from "@/lib/prisma";

export class OrderRepository {
    async create(data: any) {
        return await prisma.order.create({
            data
        });
    }

    async findById(id: string) {
        return await prisma.order.findUnique({
            where: { id },
            include: { customer: true }
        });
    }

    async findActiveByTable(tableId: string) {
        return await prisma.order.findFirst({
            where: {
                tableId,
                status: 'pending_payment'
            },
            orderBy: { date: 'desc' }
        });
    }

    async findByDateRange(start: Date, end: Date, status?: string) {
        return await prisma.order.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
                ...(status && { status }),
            },
            orderBy: { date: 'desc' }
        });
    }

    async findAll(limit: number = 50) {
        return await prisma.order.findMany({
            take: limit,
            orderBy: { date: 'desc' },
            include: { customer: true }
        });
    }

    async update(id: string, data: any) {
        return await prisma.order.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.order.delete({
            where: { id }
        });
    }
}

export const orderRepo = new OrderRepository();
