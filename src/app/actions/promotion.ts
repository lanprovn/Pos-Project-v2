"use server";

import { prisma } from "@/lib/prisma";

export async function getPromotions() {
    try {
        const promotions = await prisma.promotion.findMany({
            orderBy: { name: 'asc' },
        });
        return { success: true, promotions };
    } catch (error) {
        console.error("Error fetching promotions:", error);
        return { success: false, error: "Failed to fetch promotions" };
    }
}

export async function validateVoucher(code: string) {
    try {
        const promotion = await prisma.promotion.findFirst({
            where: {
                code: { equals: code, mode: 'insensitive' },
                type: 'Voucher',
                isActive: true,
            },
        });

        if (!promotion) return { success: false, error: "Voucher không tồn tại hoặc đã hết hạn" };

        // Check expiration

        return { success: true, promotion };
    } catch (error) {
        console.error("Error validating voucher:", error);
        return { success: false, error: "Lỗi hệ thống khi kiểm tra voucher" };
    }
}
