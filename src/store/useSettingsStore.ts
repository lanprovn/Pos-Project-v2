import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface StoreSettings {
    name: string;
    address: string;
    phone: string;
    logo?: string; // URL hoặc Base64
    currency: string;
    taxRate: number; // Phần trăm thuế (0-100)
    wifiPassword?: string;
}

export interface PrinterSettings {
    pageSize: '80mm' | '58mm' | 'A4';
    autoPrint: boolean;
    showLogo: boolean;
    showFooter: boolean;
    footerMessage: string;
}

export interface PaymentSettings {
    bankName: string;      // e.g., "MBBank"
    bankId: string;        // e.g., "970422" or "MB" (for VietQR)
    accountNumber: string;
    accountName: string;
    qrTemplate: 'compact' | 'qr_only' | 'print'; // VietQR template
}

interface SettingsStore {
    storeInfo: StoreSettings;
    printer: PrinterSettings;
    payment: PaymentSettings;

    updateStoreInfo: (info: Partial<StoreSettings>) => void;
    updatePrinterSettings: (settings: Partial<PrinterSettings>) => void;
    updatePaymentSettings: (settings: Partial<PaymentSettings>) => void;
    resetSettings: () => void;
}

const DEFAULT_STORE_INFO: StoreSettings = {
    name: "Lân Coffee",
    address: "TP. Thủ Đức",
    phone: "0768562386",
    logo: "/logo.png",
    currency: "VND",
    taxRate: 0,
    wifiPassword: "khongcomatkhau",
};

const DEFAULT_PRINTER_SETTINGS: PrinterSettings = {
    pageSize: '80mm',
    autoPrint: false,
    showLogo: true,
    showFooter: true,
    footerMessage: "Cảm ơn và hẹn gặp lại!",
};

const DEFAULT_PAYMENT_SETTINGS: PaymentSettings = {
    bankName: "VietinBank",
    bankId: "icb", // VietinBank Bin/ID cho VietQR
    accountNumber: "0768562386",
    accountName: "LE HOANG NGOC LAN",
    qrTemplate: 'compact'
};

export const useSettingsStore = create<SettingsStore>()(
    persist(
        (set) => ({
            storeInfo: DEFAULT_STORE_INFO,
            printer: DEFAULT_PRINTER_SETTINGS,
            payment: DEFAULT_PAYMENT_SETTINGS,

            updateStoreInfo: (info) =>
                set((state) => ({
                    storeInfo: { ...state.storeInfo, ...info }
                })),

            updatePrinterSettings: (settings) =>
                set((state) => ({
                    printer: { ...state.printer, ...settings }
                })),

            updatePaymentSettings: (settings) =>
                set((state) => ({
                    payment: { ...state.payment, ...settings }
                })),

            resetSettings: () =>
                set({
                    storeInfo: DEFAULT_STORE_INFO,
                    printer: DEFAULT_PRINTER_SETTINGS,
                    payment: DEFAULT_PAYMENT_SETTINGS
                }),
        }),
        {
            name: 'pos-settings-storage',
        }
    )
);
