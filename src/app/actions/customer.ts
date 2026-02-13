"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getCustomers() {
    try {
        const customers = await prisma.customer.findMany({
            orderBy: { totalSpent: 'desc' },
        });
        return { success: true, customers };
    } catch (error) {
        console.error("Error fetching customers:", error);
        return { success: false, error: "Failed to fetch customers" };
    }
}

export async function findCustomerByPhone(phone: string) {
    try {
        const customer = await prisma.customer.findUnique({
            where: { phone },
        });
        return { success: true, customer };
    } catch (error) {
        console.error("Error finding customer:", error);
        return { success: false, error: "Failed to find customer" };
    }
}

export async function createCustomer(data: { name: string; phone: string }) {
    try {
        const customer = await prisma.customer.create({
            data: {
                name: data.name,
                phone: data.phone,
                points: 0,
                tier: "Silver",
                totalSpent: 0,
            },
        });
        revalidatePath("/customers");
        return { success: true, customer };
    } catch (error) {
        console.error("Error creating customer:", error);
        return { success: false, error: "Failed to create customer" };
    }
}

export async function updateCustomerTier(id: string) {
    try {
        const customer = await prisma.customer.findUnique({ where: { id } });
        if (!customer) return;

        let newTier = "Silver";
        if (customer.totalSpent > 5000000) newTier = "Diamond";
        else if (customer.totalSpent > 1000000) newTier = "Gold";

        if (customer.tier !== newTier) {
            await prisma.customer.update({
                where: { id },
                data: { tier: newTier }
            });
        }
        return { success: true };
    } catch (error) {
        console.error("Error updating customer tier:", error);
        return { success: false };
    }
}
