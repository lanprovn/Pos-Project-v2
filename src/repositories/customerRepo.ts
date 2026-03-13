import { prisma } from "@/lib/prisma";

export class CustomerRepository {
    async findById(id: string) {
        return await prisma.customer.findUnique({
            where: { id }
        });
    }

    async findByPhone(phone: string) {
        return await prisma.customer.findUnique({
            where: { phone }
        });
    }

    async create(data: any) {
        return await prisma.customer.create({
            data
        });
    }

    async update(id: string, data: any) {
        return await prisma.customer.update({
            where: { id },
            data
        });
    }

    async findAll() {
        return await prisma.customer.findMany({
            orderBy: { totalSpent: 'desc' },
        });
    }

    async updateStats(id: string, totalSpent: number, points: number) {
        return await prisma.customer.update({
            where: { id },
            data: {
                totalSpent: { increment: totalSpent },
                points: { increment: points }
            }
        });
    }
}

export const customerRepo = new CustomerRepository();
