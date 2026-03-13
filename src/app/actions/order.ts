"use server";

import { orderService } from "@/services/orderService";
import { tableService } from "@/services/tableService";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { createOrderSchema, updatePaymentStatusSchema, updateOrderStatusSchema, tableIdSchema, mergeTablesSchema, idSchema } from "@/lib/validations";
import { z } from "zod";

export const createOrder = createSafeAction(
    createOrderSchema,
    async (data) => {
        const order = await orderService.createOrder(data);
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { order };
    }
);

export const updateOrderPaymentStatus = createSafeAction(
    updatePaymentStatusSchema,
    async ({ orderId, status, paymentMethod }) => {
        const order = await orderService.updatePaymentStatus(orderId, status, paymentMethod);
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { order };
    }
);

export const getActiveOrderForTable = createSafeAction(
    tableIdSchema,
    async ({ tableId }) => {
        const order = await orderService.getActiveOrderForTable(tableId);
        return { order };
    }
);

export const updateOrderStatusAction = createSafeAction(
    updateOrderStatusSchema,
    async ({ id, fulfillmentStatus }) => {
        const order = await orderService.updateOrderItems(id, { fulfillmentStatus });
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { order };
    }
);

export const getOrders = createSafeAction(
    z.any(),
    async ({ limit }) => {
        const orders = await orderService.getAllOrders(limit);
        return { orders };
    }
);

export const updateOrder = createSafeAction(
    z.object({ id: z.string(), data: z.any() }),
    async ({ id, data }) => {
        const order = await orderService.updateOrderItems(id, data);
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        return { order };
    }
);

export const moveOrder = createSafeAction(
    z.object({ fromTableId: z.string(), toTableId: z.string() }),
    async ({ fromTableId, toTableId }) => {
        await tableService.moveOrder(fromTableId, toTableId);
        revalidatePath("/");
        revalidatePath("/orders");
        return true;
    }
);

export const mergeOrders = createSafeAction(
    mergeTablesSchema,
    async ({ sourceTableId, targetTableId }) => {
        await tableService.mergeOrders(sourceTableId, targetTableId);
        revalidatePath("/");
        revalidatePath("/orders");
        return true;
    }
);

export const cancelOrder = createSafeAction(
    z.object({ orderId: z.string(), reason: z.string(), staffName: z.string() }),
    async ({ orderId, reason, staffName }) => {
        const updatedOrder = await orderService.cancelOrder(orderId, reason, staffName);
        revalidatePath("/");
        revalidatePath("/orders");
        revalidatePath("/dashboard");
        revalidatePath("/pos");
        return { data: updatedOrder };
    }
);
