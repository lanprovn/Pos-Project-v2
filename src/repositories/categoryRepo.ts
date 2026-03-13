import { prisma } from "@/lib/prisma";

export class CategoryRepository {
    async findAll() {
        return await prisma.category.findMany({
            orderBy: { name: 'asc' }
        });
    }

    async create(data: { name: string; icon?: string }) {
        return await prisma.category.create({
            data
        });
    }

    async update(id: string, name: string) {
        return await prisma.category.update({
            where: { id },
            data: { name }
        });
    }

    async delete(id: string) {
        return await prisma.category.delete({
            where: { id }
        });
    }
}

export const categoryRepo = new CategoryRepository();
