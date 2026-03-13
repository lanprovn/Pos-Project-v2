"use server";

import { promotionService } from "@/services/promotionService";
import { createSafeAction } from "@/lib/create-safe-action";
import { emptySchema, validateVoucherSchema } from "@/lib/validations";

export const getPromotions = createSafeAction(
    emptySchema,
    async () => {
        const promotions = await promotionService.getAllPromotions();
        return { promotions };
    }
);

export const validateVoucher = createSafeAction(
    validateVoucherSchema,
    async ({ code }) => {
        const promotion = await promotionService.validateVoucher(code);
        return { promotion };
    }
);
