"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getTables() {
    try {
        const tables = await prisma.table.findMany({
            orderBy: { number: 'asc' }
        });
        return { success: true, data: tables };
    } catch {
        return { success: false, error: "Failed to fetch tables" };
    }
}

export async function updateTableStatus(id: string, status: string) {
    try {
        const table = await prisma.table.update({
            where: { id },
            data: { status }
        });
        revalidatePath("/pos");
        return { success: true, data: table };
    } catch {
        return { success: false, error: "Failed to update table status" };
    }
}

export async function releaseTableGroup(tableId: string) {
    try {
        const table = await prisma.table.findUnique({ where: { id: tableId } });
        if (!table) return { success: false, error: "Bàn không tồn tại" };

        const masterId = table.parentTableId || tableId;

        await prisma.$transaction([
            // Release the master table
            prisma.table.update({
                where: { id: masterId },
                data: { status: 'available', parentTableId: null }
            }),
            // Release all children
            prisma.table.updateMany({
                where: { parentTableId: masterId },
                data: { status: 'available', parentTableId: null }
            })
        ]);

        revalidatePath("/");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to release table group" };
    }
}
