import { productRepo } from "@/repositories/productRepo";
import { categoryRepo } from "@/repositories/categoryRepo";
import type { Product } from "@/types/product";

export class ProductService {
    async getAllProducts(query?: string, category?: string) {
        const productsRaw = await productRepo.findAll(query, category);
        return productsRaw.map(p => {
            const { categoryName, ...rest } = p as any;
            return {
                ...rest,
                category: categoryName,
                options: p.options ? JSON.parse(p.options as string) : []
            };
        });
    }

    async createProduct(data: any) {
        // Business logic: ensure options is valid JSON string
        const { category, ...rest } = data;
        const formattedData = {
            ...rest,
            categoryName: category || "Uncategorized", // Map from UI 'category' to DB 'categoryName'
            options: data.options ? JSON.stringify(data.options) : "[]",
            unit: data.unit || 'Món'
        };
        return await productRepo.create(formattedData);
    }

    async updateProduct(id: string, data: any) {
        const { category, ...rest } = data;
        const formattedData: any = {
            ...rest,
            options: data.options ? JSON.stringify(data.options) : undefined,
        };
        if (category) {
            formattedData.categoryName = category;
        }
        // Remove undefined fields to prevent Prisma from wiping them if not intended
        Object.keys(formattedData).forEach(key => formattedData[key] === undefined && delete formattedData[key]);
        
        return await productRepo.update(id, formattedData);
    }

    async deleteProduct(id: string) {
        return await productRepo.delete(id);
    }

    async adjustStock(id: string, quantity: number) {
        return await productRepo.updateStock(id, quantity);
    }

    async getAllCategories() {
        return await categoryRepo.findAll();
    }

    async createCategory(data: any) {
        return await categoryRepo.create(data);
    }

    async updateCategory(id: string, name: string) {
        return await categoryRepo.update(id, name);
    }

    async deleteCategory(id: string) {
        return await categoryRepo.delete(id);
    }
}

export const productService = new ProductService();
