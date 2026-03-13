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
    onComplete: (paymentMethod: 'cash' | 'transfer') => void;
    mode?: 'pos' | 'kiosk';
}

/**
 * PaymentModal component.
 * Note: We rely on the 'key' prop in the parent to handle state reset on open/close.
 */
export function PaymentModal({ isOpen, onClose, subtotal, discount, totalAmount, onComplete, mode = 'pos' }: PaymentModalProps) {
    const { payment } = useSettingsStore();
    const [paymentMethod, setPaymentMethod] = useState<'cash' | 'transfer'>('cash');
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
        paymentMethod === 'transfer' ||
        (mode === 'kiosk' && paymentMethod === 'cash') ||
        (mode === 'pos' && paymentMethod === 'cash' && numericCashReceived >= totalAmount);

    // VietQR URL
    const qrUrl = `https://img.vietqr.io/image/${payment.bankId}-${payment.accountNumber}-compact.png?amount=${totalAmount}&addInfo=POS Payment&accountName=${encodeURIComponent(payment.accountName)}`;

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-background w-full max-w-6xl h-[100dvh] md:h-[min(90vh,700px)] rounded-none md:rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
            >
                {/* Left Side: Summary */}
                <div className="w-full md:w-1/3 bg-secondary/30 p-4 md:p-8 flex flex-col border-b md:border-b-0 md:border-r border-black/5 shrink-0">
                    <h2 className="text-xl font-bold mb-6">Thanh toán</h2>

                    <div className="flex-1 space-y-4">
                        <div className="bg-white p-5 rounded-2xl border border-black/5 shadow-sm space-y-3">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Tiền hàng</span>
                                <span className="font-medium">{formatCurrency(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Giảm giá ({discount}%)</span>
                                <span className="text-red-500">-{formatCurrency((subtotal * discount) / 100)}</span>
                            </div>
                            <div className="pt-3 border-t border-black/5 flex justify-between items-end">
                                <div>
                                    <p className="text-[10px] text-muted-foreground mb-0.5 uppercase font-black tracking-widest">Tổng cộng</p>
                                    <p className="text-2xl md:text-4xl font-black text-primary leading-none transition-all">{formatCurrency(totalAmount)}</p>
                                </div>
                            </div>
                        </div>

                        {paymentMethod === 'cash' && mode === 'pos' && (
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span className="text-muted-foreground">Khách đưa</span>
                                    <span className="font-bold">{formatCurrency(numericCashReceived)}</span>
                                </div>
                                <div className="flex justify-between items-center pt-4 border-t border-black/5">
                                    <span className="text-muted-foreground">Tiền thừa</span>
                                    <span className={cn("font-bold text-xl", changeAmount < 0 ? "text-destructive" : "text-emerald-500")}>
                                        {formatCurrency(Math.max(0, changeAmount))}
                                    </span>
                                </div>
                            </div>
                        )}

                        {paymentMethod === 'cash' && mode === 'kiosk' && (
                            <div className="p-4 bg-orange-50 text-orange-600 rounded-xl border border-orange-100 text-sm">
                                <p className="font-medium">Vui lòng thanh toán tại quầy thu ngân sau khi đặt đơn.</p>
                            </div>
                        )}
                    </div>

                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-muted-foreground hover:text-black transition-colors mt-auto"
                    >
                        <ArrowLeft size={20} /> Quay lại
                    </button>
                </div>

                {/* Right Side: Payment Methods */}
                <div className="flex-1 flex flex-col bg-white">
                    {/* Tabs */}
                    <div className="flex border-b border-black/5">
                        <button
                            onClick={() => setPaymentMethod('cash')}
                            className={cn(
                                "flex-1 py-6 flex flex-col items-center gap-2 transition-all border-b-2",
                                paymentMethod === 'cash'
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent hover:bg-secondary/50 text-muted-foreground"
                            )}
                        >
                            <Wallet size={24} />
                            <span className="font-bold">{mode === 'kiosk' ? 'Tại quầy (Tiền mặt)' : 'Tiền mặt'}</span>
                        </button>
                        <button
                            onClick={() => setPaymentMethod('transfer')}
                            className={cn(
                                "flex-1 py-6 flex flex-col items-center gap-2 transition-all border-b-2",
                                paymentMethod === 'transfer'
                                    ? "border-primary text-primary bg-primary/5"
                                    : "border-transparent hover:bg-secondary/50 text-muted-foreground"
                            )}
                        >
                            <QrCode size={24} />
                            <span className="font-bold">Chuyển khoản</span>
                        </button>
                    </div>

                    {/* Checkbox Content */}
                    <div className="flex-1 p-4 md:p-8 overflow-y-auto">
                        {paymentMethod === 'cash' ? (
                            mode === 'pos' ? (
                                <div className="space-y-8 max-w-md mx-auto">
                                    <div>
                                        <label className="block text-sm font-medium text-muted-foreground mb-2">Nhập số tiền khách đưa</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                autoFocus
                                                className="w-full text-3xl font-bold p-4 rounded-xl border border-black/10 focus:outline-none focus:ring-4 focus:ring-primary/20 bg-secondary/20"
                                                placeholder="0"
                                                value={cashReceived ? parseInt(cashReceived).toLocaleString('de-DE') : ''}
                                                onChange={(e) => {
                                                    const val = e.target.value.replace(/\./g, '');
                                                    if (!isNaN(Number(val))) setCashReceived(val);
                                                }}
                                            />
                                            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₫</span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        {suggestions.slice(0, 4).map((amount) => (
                                            <button
                                                key={amount}
                                                onClick={() => setCashReceived(amount.toString())}
                                                className="py-3 px-4 rounded-xl border border-black/10 hover:border-primary hover:bg-primary/5 hover:text-primary transition-all font-medium"
                                            >
                                                {formatCurrency(amount)}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                                    <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center text-primary mb-4">
                                        <Wallet size={48} />
                                    </div>
                                    <h3 className="text-2xl font-bold text-slate-800">Thanh toán tại quầy</h3>
                                    <p className="text-muted-foreground max-w-xs">
                                        Vui lòng nhấn &quot;Hoàn tất đặt đơn&quot; và thanh toán tại quầy thu ngân.
                                    </p>
                                </div>
                            )
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full space-y-6">
                                <div className="bg-white p-4 rounded-2xl shadow-lg border border-black/5 relative w-72 h-72">
                                    <Image
                                        src={qrUrl}
                                        alt="VietQR"
                                        fill
                                        className="object-contain"
                                        unoptimized
                                    />
                                </div>
                                <div className="text-center space-y-1">
                                    <p className="font-bold text-lg">{payment.accountName}</p>
                                    <p className="text-muted-foreground">{payment.bankName} - {payment.accountNumber}</p>
                                    <p className="font-bold text-primary text-xl mt-2">{formatCurrency(totalAmount)}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Bottom Action */}
                    <div className="p-6 border-t border-black/5 bg-secondary/10">
                        <button
                            disabled={!canComplete}
                            onClick={() => onComplete(paymentMethod)}
                            className="w-full py-4 rounded-xl bg-primary hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-lg shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all"
                        >
                            <Check size={24} />
                            {mode === 'kiosk' && paymentMethod === 'cash' ? 'Hoàn tất đặt đơn' : 'Hoàn tất thanh toán'}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
