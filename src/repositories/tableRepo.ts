import { prisma } from "@/lib/prisma";

export class TableRepository {
    async findById(id: string) {
        return await prisma.table.findUnique({
            where: { id }
        });
    }

    async update(id: string, data: any) {
        return await prisma.table.update({
            where: { id },
            data
        });
    }

    async updateMany(where: any, data: any) {
        return await prisma.table.updateMany({
            where,
            data
        });
    }

    async findAll() {
        return await prisma.table.findMany({
            orderBy: { number: 'asc' }
        });
    }
}

export const tableRepo = new TableRepository();
