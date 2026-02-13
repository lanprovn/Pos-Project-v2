import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Promotion {
    id: string;
    code: string;
    name: string;
    type: 'percentage' | 'fixed';
    value: number;
    minOrderValue: number;
    description: string;
    isActive: boolean;
    startTime?: string;
    endTime?: string;
}

interface PromotionStore {
    promotions: Promotion[];
    activeVoucher: Promotion | null;
    setPromotions: (promotions: Promotion[]) => void;
    applyVoucher: (code: string, currentTotal: number) => { success: boolean; message: string };
    getHappyHourDiscount: () => number;
    clearVoucher: () => void;
}

export const usePromotionStore = create<PromotionStore>()(
    persist(
        (set, get) => ({
            promotions: [],
            activeVoucher: null,
            setPromotions: (promotions) => set({ promotions }),
            applyVoucher: (code, currentTotal) => {
                const promo = get().promotions.find(p => p.code.toUpperCase() === code.toUpperCase() && p.isActive);

                if (!promo) return { success: false, message: 'Mã giảm giá không tồn tại hoặc đã hết hạn' };
                if (currentTotal < promo.minOrderValue) {
                    return { success: false, message: `Đơn hàng tối thiểu phải từ ${promo.minOrderValue.toLocaleString()}đ` };
                }

                set({ activeVoucher: promo });
                return { success: true, message: `Đã áp dụng mã: ${promo.name}` };
            },
            getHappyHourDiscount: () => {
                const now = new Date();
                const currentTime = now.getHours() * 100 + now.getMinutes();

                const happyHour = get().promotions.find(p =>
                    p.code.toUpperCase() === 'HAPPYHOUR' &&
                    p.isActive &&
                    p.startTime &&
                    p.endTime
                );

                if (happyHour) {
                    const [startH, startM] = happyHour.startTime!.split(':').map(Number);
                    const [endH, endM] = happyHour.endTime!.split(':').map(Number);
                    const startTime = startH * 100 + startM;
                    const endTime = endH * 100 + endM;

                    if (currentTime >= startTime && currentTime <= endTime) {
                        return happyHour.value;
                    }
                }
                return 0;
            },
            clearVoucher: () => set({ activeVoucher: null })
        }),
        {
            name: 'promotions-storage',
        }
    )
);
