"use server";

import { tableService } from "@/services/tableService";
import { revalidatePath } from "next/cache";
import { createSafeAction } from "@/lib/create-safe-action";
import { emptySchema, updateTableStatusSchema, releaseTableGroupSchema } from "@/lib/validations";

export const getTables = createSafeAction(
    emptySchema,
    async () => {
        const tables = await tableService.getAllTables();
        return { data: tables };
    }
);

export const updateTableStatus = createSafeAction(
    updateTableStatusSchema,
    async ({ id, status }) => {
        const table = await tableService.updateStatus(id, status);
        revalidatePath("/pos");
        return { data: table };
    }
);

export const releaseTableGroup = createSafeAction(
    releaseTableGroupSchema,
    async ({ tableId }) => {
        await tableService.releaseGroup(tableId);
        revalidatePath("/");
        return true;
    }
);
