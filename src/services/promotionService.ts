import { promotionRepo } from "@/repositories/promotionRepo";

export class PromotionService {
    async getAllPromotions() {
        return await promotionRepo.findAll();
    }

    async validateVoucher(code: string) {
        const promotion = await promotionRepo.findActiveByCode(code, 'Voucher');
        if (!promotion) {
            throw new Error("Voucher không tồn tại hoặc đã hết hạn");
        }
        
        // Add expiration logic here if needed
        // const now = new Date();
        // if (promotion.endDate && now > promotion.endDate) throw new Error("Voucher đã hết hạn");

        return promotion;
    }
}

export const promotionService = new PromotionService();
