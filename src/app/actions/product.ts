"use server";

import { productService } from "@/services/productService";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { 
    emptySchema, 
    idSchema, 
    productSchema, 
    updateProductSchema,
    adjustStockSchema,
    categorySchema,
    updateCategorySchema
} from "@/lib/validations";
import { z } from "zod";

export const getProducts = createSafeAction(
    z.any(),
    async ({ query, category }) => {
        const products = await productService.getAllProducts(query, category);
        return { products };
    }
);

export const createProductAction = createSafeAction(
    productSchema,
    async (data) => {
        const product = await productService.createProduct(data);
        revalidatePath("/");
        revalidatePath("/inventory");
        return { product };
    }
);

export const updateProductAction = createSafeAction(
    z.object({ id: z.string(), data: z.any() }), // Simplified for now
    async ({ id, data }) => {
        const product = await productService.updateProduct(id, data);
        revalidatePath("/");
        revalidatePath("/inventory");
        return { product };
    }
);

export const restockProductAction = createSafeAction(
    adjustStockSchema,
    async ({ id, quantity }) => {
        const product = await productService.adjustStock(id, quantity);
        revalidatePath("/");
        revalidatePath("/inventory");
        return { product };
    }
);

export const updateStockAction = createSafeAction(
    adjustStockSchema,
    async ({ id, diff }) => {
        const product = await productService.adjustStock(id, diff || 0);
        revalidatePath("/");
        revalidatePath("/inventory");
        return { product };
    }
);

export const deleteProductAction = createSafeAction(
    idSchema,
    async ({ id }) => {
        await productService.deleteProduct(id);
        revalidatePath("/");
        revalidatePath("/inventory");
        return true;
    }
);

export const getCategories = createSafeAction(
    emptySchema,
    async () => {
        const categories = await productService.getAllCategories();
        return { categories };
    }
);

export const createCategory = createSafeAction(
    categorySchema,
    async (data) => {
        const category = await productService.createCategory(data);
        revalidatePath("/inventory");
        return { category };
    }
);

export const updateCategory = createSafeAction(
    updateCategorySchema,
    async ({ id, name }) => {
        const category = await productService.updateCategory(id, name);
        revalidatePath("/inventory");
        return { category };
    }
);

export const deleteCategory = createSafeAction(
    idSchema,
    async ({ id }) => {
        await productService.deleteCategory(id);
        revalidatePath("/inventory");
        return true;
    }
);
