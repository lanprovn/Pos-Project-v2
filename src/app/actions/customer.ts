"use server";

import { customerService } from "@/services/customerService";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { emptySchema, phoneSchema, createCustomerSchema, idSchema } from "@/lib/validations";

export const getCustomers = createSafeAction(
    emptySchema,
    async () => {
        const customers = await customerService.getAllCustomers();
        return { customers };
    }
);

export const findCustomerByPhone = createSafeAction(
    phoneSchema,
    async ({ phone }) => {
        const customer = await customerService.getByPhone(phone);
        return { customer };
    }
);

export const createCustomer = createSafeAction(
    createCustomerSchema,
    async (data) => {
        const customer = await customerService.createCustomer(data);
        revalidatePath("/customers");
        return { customer };
    }
);

export const updateCustomerTier = createSafeAction(
    idSchema,
    async ({ id }) => {
        await customerService.updateTier(id);
        return true;
    }
);
