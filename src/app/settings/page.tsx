"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { Save, RefreshCw, Printer, Store, MapPin, Phone, FileText, Check, CreditCard } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";

export default function SettingsPage() {
    const { storeInfo, printer, payment, updateStoreInfo, updatePrinterSettings, updatePaymentSettings, resetSettings } = useSettingsStore();
    const { user } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (user && user.role !== 'admin') {
            router.push("/");
        }
    }, [user, router]);

    // Local state for feedback
    const [saved, setSaved] = useState(false);

    if (!user || user.role !== 'admin') return null;

    const handleSave = () => {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden premium-gradient">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6 overflow-hidden overflow-y-auto">
                <header className="mb-8 flex justify-between items-end">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Cài đặt Hệ thống</h1>
                        <p className="text-muted-foreground text-sm">Cấu hình thông tin cửa hàng và thiết bị ngoại vi.</p>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                            <div className="p-2 bg-primary/10 rounded-xl">
                                <Store className="text-primary w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Thông tin Cửa hàng</h3>
                                <p className="text-sm text-muted-foreground">Thông tin sẽ hiển thị trên hóa đơn.</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Tên cửa hàng</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30 font-semibold"
                                    value={storeInfo.name}
                                    onChange={(e) => updateStoreInfo({ name: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Địa chỉ</label>
                                <div className="relative">
                                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30"
                                        value={storeInfo.address}
                                        onChange={(e) => updateStoreInfo({ address: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Số điện thoại</label>
                                <div className="relative">
                                    <Phone className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30"
                                        value={storeInfo.phone}
                                        onChange={(e) => updateStoreInfo({ phone: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Mật khẩu Wifi (In lên hóa đơn)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30"
                                    value={storeInfo.wifiPassword || ''}
                                    onChange={(e) => updateStoreInfo({ wifiPassword: e.target.value })}
                                    placeholder="Không hiển thị nếu để trống"
                                />
                            </div>
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                            <div className="p-2 bg-orange-500/10 rounded-xl">
                                <Printer className="text-orange-500 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Máy in & Hóa đơn</h3>
                                <p className="text-sm text-muted-foreground">Cấu hình mẫu in và khổ giấy.</p>
                            </div>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-2 block">Khổ giấy in</label>
                                <div className="grid grid-cols-3 gap-3">
                                    {['58mm', '80mm', 'A4'].map((size) => (
                                        <button
                                            key={size}
                                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                                            onClick={() => updatePrinterSettings({ pageSize: size as any })}
                                            className={`py-3 rounded-xl border font-medium transition-all ${printer.pageSize === size
                                                ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20'
                                                : 'bg-white border-black/10 hover:bg-secondary'
                                                }`}
                                        >
                                            {size}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                                    <span className="font-medium">Tự động in sau khi thanh toán</span>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-primary"
                                        checked={printer.autoPrint}
                                        onChange={(e) => updatePrinterSettings({ autoPrint: e.target.checked })}
                                    />
                                </label>

                                <label className="flex items-center justify-between p-4 bg-secondary/30 rounded-xl cursor-pointer hover:bg-secondary/50 transition-colors">
                                    <span className="font-medium">Hiển thị Logo quán</span>
                                    <input
                                        type="checkbox"
                                        className="w-5 h-5 accent-primary"
                                        checked={printer.showLogo}
                                        onChange={(e) => updatePrinterSettings({ showLogo: e.target.checked })}
                                    />
                                </label>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Lời chào cuối hóa đơn</label>
                                <div className="relative">
                                    <FileText className="absolute left-4 top-3.5 w-5 h-5 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30"
                                        value={printer.footerMessage}
                                        onChange={(e) => updatePrinterSettings({ footerMessage: e.target.value })}
                                        placeholder="VD: Cảm ơn quý khách!"
                                    />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 gap-8 max-w-6xl mt-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm"
                    >
                        <div className="flex items-center gap-3 mb-6 pb-4 border-b border-black/5">
                            <div className="p-2 bg-emerald-500/10 rounded-xl">
                                <CreditCard className="text-emerald-500 w-6 h-6" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Cấu hình Thanh toán (QR Code)</h3>
                                <p className="text-sm text-muted-foreground">Thông tin ngân hàng để tạo mã QR chuyển khoản VietQR.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Tên Ngân hàng</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30"
                                    value={payment.bankName}
                                    onChange={(e) => updatePaymentSettings({ bankName: e.target.value })}
                                    placeholder="VD: MBBank, Vietcombank"
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Mã Ngân hàng (BIN/BankID)</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30"
                                    value={payment.bankId}
                                    onChange={(e) => updatePaymentSettings({ bankId: e.target.value })}
                                    placeholder="VD: 970422 hoặc MB"
                                />
                                <p className="text-xs text-muted-foreground mt-1">Dùng &quot;MB&quot;, &quot;VCB&quot;, &quot;ACB&quot;... cho VietQR API.</p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Số Tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30 font-mono tracking-wide"
                                    value={payment.accountNumber}
                                    onChange={(e) => updatePaymentSettings({ accountNumber: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Tên Chủ Tài khoản</label>
                                <input
                                    type="text"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/30 uppercase"
                                    value={payment.accountName}
                                    onChange={(e) => updatePaymentSettings({ accountName: e.target.value })}
                                />
                            </div>
                        </div>
                    </motion.div>
                </div>

                <div className="mt-8 max-w-6xl flex justify-between items-center bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-white/20">
                    <button
                        onClick={() => {
                            if (confirm("Bạn có chắc chắn muốn đặt lại toàn bộ cài đặt về mặc định?")) {
                                resetSettings();
                            }
                        }}
                        className="text-destructive hover:bg-destructive/10 px-4 py-2 rounded-xl transition-colors text-sm font-medium flex items-center gap-2"
                    >
                        <RefreshCw size={16} />
                        Khôi phục mặc định
                    </button>

                    <button
                        onClick={handleSave}
                        className={`px-8 py-3 rounded-xl font-bold text-white transition-all flex items-center gap-2 shadow-lg ${saved ? "bg-emerald-500 shadow-emerald-500/20" : "bg-primary hover:bg-primary/90 shadow-primary/20"
                            }`}
                    >
                        {saved ? (
                            <>
                                <Check size={20} /> Đã lưu
                            </>
                        ) : (
                            <>
                                <Save size={20} /> Lưu thay đổi
                            </>
                        )}
                    </button>
                </div>
            </main>
        </div>
    );
}
