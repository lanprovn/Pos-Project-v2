"use server";

import { reportService } from "@/services/reportService";
import { createSafeAction } from "@/lib/create-safe-action";
import { emptySchema } from "@/lib/validations";

export const getStaffDailyRevenueAction = createSafeAction(
    emptySchema,
    async () => {
        const reportData = await reportService.getDailyRevenueReport();
        return { data: reportData };
    }
);
