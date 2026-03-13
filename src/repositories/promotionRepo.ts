import { prisma } from "@/lib/prisma";

export class PromotionRepository {
    async findAll() {
        return await prisma.promotion.findMany({
            orderBy: { name: 'asc' },
        });
    }

    async findActiveByCode(code: string, type: string = 'Voucher') {
        return await prisma.promotion.findFirst({
            where: {
                code: { equals: code },
                type: type,
                isActive: true,
            },
        });
    }

    async create(data: any) {
        return await prisma.promotion.create({ data });
    }

    async update(id: string, data: any) {
        return await prisma.promotion.update({
            where: { id },
            data
        });
    }
}

export const promotionRepo = new PromotionRepository();
