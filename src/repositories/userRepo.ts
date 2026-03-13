import { prisma } from "@/lib/prisma";

export class UserRepository {
    async findById(id: string) {
        return await prisma.user.findUnique({
            where: { id }
        });
    }

    async findByUsername(username: string) {
        return await prisma.user.findUnique({
            where: { username }
        });
    }

    async findAll() {
        return await prisma.user.findMany({
            orderBy: { createdAt: 'desc' }
        });
    }

    async create(data: any) {
        return await prisma.user.create({ data });
    }

    async update(id: string, data: any) {
        return await prisma.user.update({
            where: { id },
            data
        });
    }

    async delete(id: string) {
        return await prisma.user.delete({
            where: { id }
        });
    }
}

export const userRepo = new UserRepository();
