"use client";

import { useSettingsStore } from "@/store/useSettingsStore";
import { formatCurrency, cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Check, Wallet, QrCode, ArrowLeft } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface PaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    subtotal: number;
    discount: number;
    totalAmount: number;
    onComplete: (paymentMethod: 'cash') => void;
    mode?: 'pos' | 'kiosk';
}

/**
 * PaymentModal component.
 * Note: We rely on the 'key' prop in the parent to handle state reset on open/close.
 */
export function PaymentModal({ isOpen, onClose, subtotal, discount, totalAmount, onComplete, mode = 'pos' }: PaymentModalProps) {
    const { payment } = useSettingsStore();
    const [paymentMethod] = useState<'cash'>('cash');
    const [cashReceived, setCashReceived] = useState<string>('');

    if (!isOpen) return null;

    const numericCashReceived = parseInt(cashReceived.replace(/\D/g, '') || '0');
    const changeAmount = numericCashReceived - totalAmount;

    // Quick cash suggestions
    const suggestions = [
        totalAmount,
        Math.ceil(totalAmount / 10000) * 10000,
        Math.ceil(totalAmount / 50000) * 50000,
        Math.ceil(totalAmount / 100000) * 100000,
        500000
    ].filter((v, i, a) => a.indexOf(v) === i && v >= totalAmount).sort((a, b) => a - b);

    const canComplete =
        (mode === 'kiosk' && paymentMethod === 'cash') ||
        (mode === 'pos' && paymentMethod === 'cash' && numericCashReceived >= totalAmount);

    // QR logic removed

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 20 }}
                className="bg-background w-full max-w-6xl h-[100dvh] sm:h-[min(90vh,750px)] rounded-none sm:rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col md:flex-row relative"
            >
                {/* Close button for mobile inside the modal top right */}
                <button 
                    onClick={onClose}
                    className="absolute right-4 top-4 z-10 p-2 bg-gray-100 rounded-full sm:hidden"
                >
                    <ArrowLeft size={20} className="rotate-90" />
                </button>

                {/* Left Side: Summary */}
                <div className="w-full md:w-[380px] bg-gray-50/50 p-6 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-black/[0.03] shrink-0">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary">
                            <Wallet size={20} />
                        </div>
                        <h2 className="text-xl font-black uppercase tracking-tight">Thanh toán</h2>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="bg-white p-6 rounded-[2rem] border border-black/[0.03] shadow-xl shadow-black/[0.02] space-y-4">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Tiền hàng</span>
                                <span className="font-bold">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground font-medium">Giảm giá ({discount}%)</span>
                                <span className="text-emerald-500 font-bold">-{formatCurrency((subtotal * discount) / 100)}</span>
                            </div>
                            <div className="pt-4 border-t border-black/[0.05] flex flex-col gap-1">
                                <p className="text-[10px] text-muted-foreground uppercase font-black tracking-widest leading-none">Tổng cộng phí</p>
                                <p className="text-3xl md:text-5xl font-black text-primary tracking-tighter transition-all">{formatCurrency(totalAmount)}</p>
                            </div>
                        </div>

                        {paymentMethod === 'cash' && mode === 'pos' && (
                            <div className="px-2 space-y-3">
                                <div className="flex justify-between items-center text-sm">
                                    <span className="text-muted-foreground font-medium">Khách đưa</span>
                                    <span className="font-black text-lg">{formatCurrency(numericCashReceived)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-3 border-t border-black/[0.05]">
                                    <span className="text-muted-foreground font-medium">Tiền thừa trả khách</span>
                                    <span className={cn("font-black text-2xl tracking-tighter", changeAmount < 0 ? "text-gray-300" : "text-emerald-500")}>
                                        {formatCurrency(Math.max(0, changeAmount))}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="hidden md:flex items-center gap-2 text-muted-foreground hover:text-black transition-colors mt-auto font-bold text-sm"
                    >
                        <ArrowLeft size={18} /> Hủy & Quay lại
                    </button>
                </div>

                {/* Right Side: Payment Input */}
                <div className="flex-1 flex flex-col bg-white">
                    <div className="flex-1 p-6 md:p-12 overflow-y-auto flex flex-col">
                        {mode === 'pos' ? (
                            <div className="space-y-10 w-full max-w-md mx-auto my-auto">
                                <div className="text-center md:text-left">
                                    <h3 className="text-lg font-black text-slate-800 mb-2">Nhập số tiền mặt</h3>
                                    <p className="text-sm text-muted-foreground">Nhập số tiền khách vừa đưa cho bạn</p>
                                </div>

                                <div className="relative group">
                                    <div className="absolute inset-0 bg-primary/5 rounded-[2.5rem] blur-2xl group-hover:blur-3xl transition-all opacity-0 group-focus-within:opacity-100" />
                                    <div className="relative">
                                        <input
                                            type="text"
                                            autoFocus
                                            inputMode="numeric"
                                            className="w-full text-4xl md:text-6xl font-black p-8 md:p-10 rounded-[2.5rem] border-2 border-black/[0.03] focus:border-primary focus:outline-none bg-gray-50/50 text-center tracking-tighter"
                                            placeholder="0"
                                            value={cashReceived ? parseInt(cashReceived).toLocaleString('de-DE') : ''}
                                            onChange={(e) => {
                                                const val = e.target.value.replace(/\./g, '');
                                                if (!isNaN(Number(val))) setCashReceived(val);
                                            }}
                                        />
                                        <span className="absolute right-8 top-1/2 -translate-y-1/2 text-primary/30 font-black text-2xl">₫</span>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                    {suggestions.slice(0, 6).map((amount) => (
                                        <button
                                            key={amount}
                                            onClick={() => setCashReceived(amount.toString())}
                                            className="py-4 px-4 rounded-3xl border border-black/[0.05] hover:border-primary hover:bg-primary/5 hover:text-primary transition-all font-black text-sm shadow-sm active:scale-95"
                                        >
                                            {formatCurrency(amount)}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full text-center space-y-6 max-w-sm mx-auto">
                                <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary relative">
                                    <div className="absolute inset-0 bg-primary/20 rounded-full animate-ping" />
                                    <Wallet size={48} className="relative z-10" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-slate-800 tracking-tight">Thanh toán tại quầy</h3>
                                    <p className="text-muted-foreground mt-2">
                                        Vui lòng nhấn &quot;Hoàn tất đặt đơn&quot; và hỗ trợ khách thanh toán tại quầy thu ngân.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action */}
                    <div className="p-6 md:p-8 border-t border-black/[0.03] bg-gray-50/30 backdrop-blur-md">
                        <button
                            disabled={!canComplete}
                            onClick={() => onComplete(paymentMethod)}
                            className="w-full py-5 rounded-[2rem] bg-primary hover:bg-primary/90 disabled:opacity-30 disabled:scale-95 text-white font-black text-xl shadow-[0_20px_40px_-5px_rgba(59,130,246,0.3)] flex items-center justify-center gap-3 transition-all active:scale-[0.98] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <Check size={28} className="stroke-[3]" />
                            <span>
                                {mode === 'kiosk' && paymentMethod === 'cash' ? 'Xác nhận đơn hàng' : 'Hoàn tất giao dịch'}
                            </span>
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
