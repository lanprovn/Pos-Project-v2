import { prisma } from "@/lib/prisma";

export class HeldOrderRepository {
    async findAll() {
        return await prisma.heldOrder.findMany({
            orderBy: { createdAt: 'desc' },
        });
    }

    async create(data: any) {
        return await prisma.heldOrder.create({
            data
        });
    }

    async delete(id: string) {
        return await prisma.heldOrder.delete({
            where: { id },
        });
    }

    async findById(id: string) {
        return await prisma.heldOrder.findUnique({
            where: { id }
        });
    }
}

export const heldOrderRepo = new HeldOrderRepository();
