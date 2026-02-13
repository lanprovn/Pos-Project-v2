"use server";

import { prisma } from "@/lib/prisma";
import { revalidatePath } from "next/cache";

export async function getProducts(query?: string, category?: string) {
    try {
        const where: { name?: { contains: string; mode: 'insensitive' }; categoryName?: string } = {};
        if (query) {
            where.name = { contains: query, mode: 'insensitive' };
        }
        if (category && category !== 'All') {
            where.categoryName = category;
        }

        const products = await prisma.product.findMany({
            where,
            orderBy: { createdAt: 'desc' },
        });
        return { success: true, products };
    } catch (error) {
        console.error("Error fetching products:", error);
        return { success: false, error: "Failed to fetch products" };
    }
}

export async function createProductAction(data: { name: string; price: number; costPrice?: number; sku?: string; barcode?: string; category: string; image: string; stock: number; unit?: string; description?: string; options?: object[] }) {
    try {
        const product = await prisma.product.create({
            data: {
                name: data.name,
                price: data.price,
                costPrice: data.costPrice,
                sku: data.sku,
                barcode: data.barcode,
                categoryName: data.category,
                image: data.image,
                stock: data.stock,
                unit: data.unit || 'Món',
                description: data.description,
                options: data.options,
            }
        });
        revalidatePath("/");
        revalidatePath("/inventory");
        return { success: true, product };
    } catch {
        return { success: false, error: "Failed to create product" };
    }
}

export async function updateProductAction(id: string, data: { name?: string; price?: number; costPrice?: number; sku?: string; barcode?: string; category?: string; image?: string; stock?: number; unit?: string; description?: string; options?: object[] }) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: {
                name: data.name,
                price: data.price,
                costPrice: data.costPrice,
                sku: data.sku,
                barcode: data.barcode,
                categoryName: data.category,
                image: data.image,
                stock: data.stock,
                unit: data.unit,
                description: data.description,
                options: data.options,
            }
        });
        revalidatePath("/");
        revalidatePath("/inventory");
        return { success: true, product };
    } catch {
        return { success: false, error: "Failed to update product" };
    }
}

export async function restockProductAction(id: string, quantity: number) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: { stock: { increment: quantity } }
        });
        revalidatePath("/");
        revalidatePath("/inventory");
        return { success: true, product };
    } catch {
        return { success: false, error: "Lỗi khi nhập hàng" };
    }
}

export async function updateStockAction(id: string, diff: number) {
    try {
        const product = await prisma.product.update({
            where: { id },
            data: { stock: { increment: diff } }
        });
        revalidatePath("/");
        revalidatePath("/inventory");
        return { success: true, product };
    } catch {
        return { success: false, error: "Failed to update stock" };
    }
}

export async function deleteProductAction(id: string) {
    try {
        await prisma.product.delete({ where: { id } });
        revalidatePath("/");
        revalidatePath("/inventory");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete product" };
    }
}

export async function getCategories() {
    try {
        const categories = await prisma.category.findMany();
        return { success: true, categories };
    } catch {
        return { success: false, error: "Failed to fetch categories" };
    }
}

export async function createCategory(data: { name: string; icon?: string }) {
    try {
        const category = await prisma.category.create({
            data: {
                name: data.name,
                icon: data.icon,
            }
        });
        revalidatePath("/inventory");
        return { success: true, category };
    } catch {
        return { success: false, error: "Failed to create category" };
    }
}

export async function deleteCategory(id: string) {
    try {
        await prisma.category.delete({ where: { id } });
        revalidatePath("/inventory");
        return { success: true };
    } catch {
        return { success: false, error: "Failed to delete category" };
    }
}

export async function updateCategory(id: string, name: string) {
    try {
        const category = await prisma.category.update({
            where: { id },
            data: { name }
        });
        revalidatePath("/inventory");
        return { success: true, category };
    } catch {
        return { success: false, error: "Failed to update category" };
    }
}
