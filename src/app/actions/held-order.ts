"use server";

import { heldOrderService } from "@/services/heldOrderService";
import { createSafeAction } from "@/lib/create-safe-action";
import { emptySchema, heldOrderSchema, idSchema } from "@/lib/validations";

export const getHeldOrders = createSafeAction(
    emptySchema,
    async () => {
        const orders = await heldOrderService.getAllHeldOrders();
        return { orders };
    }
);

export const saveHeldOrder = createSafeAction(
    heldOrderSchema,
    async (data) => {
        const order = await heldOrderService.saveOrder(data);
        return { order };
    }
);

export const deleteHeldOrder = createSafeAction(
    idSchema,
    async ({ id }) => {
        await heldOrderService.deleteOrder(id);
        return true;
    }
);
