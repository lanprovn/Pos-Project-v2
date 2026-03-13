import { prisma } from "@/lib/prisma";
import type { Product } from "@/types/product";

export class ProductRepository {
    async findAll(query?: string, category?: string) {
        const where: any = {};
        if (query) {
            where.name = { contains: query, mode: 'insensitive' };
        }
        if (category && category !== 'All') {
            where.categoryName = category;
        }

        return await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
    }

    async findById(id: string) {
        return await prisma.product.findUnique({
            where: { id }
        });
    }

    async create(data: any) {
        return await prisma.product.create({
            data
        });
    }

    async update(id: string, data: any) {
        return await prisma.product.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.product.delete({
            where: { id }
        });
    }

    async updateStock(id: string, diff: number) {
        return await prisma.product.update({
            where: { id },
            data: { stock: { increment: diff } }
        });
    }
}

export const productRepo = new ProductRepository();
