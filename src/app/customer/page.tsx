"use client";

import { useCustomerDisplay } from '@/hooks/useCustomerDisplay';
import { formatCurrency } from '@/lib/utils';
import Image from 'next/image';
import { ShoppingBag, Coffee, QrCode } from 'lucide-react';
import { useSettingsStore } from '@/store/useSettingsStore';
import { useEffect, useState } from 'react';

export default function CustomerDisplayPage() {
    const { items, total } = useCustomerDisplay();
    const { storeInfo, payment } = useSettingsStore();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        const timeout = setTimeout(() => setIsClient(true), 0);
        return () => clearTimeout(timeout);
    }, []);

    const finalTotal = total;

    // Generate VietQR URL
    const qrUrl = isClient && payment.bankId && payment.accountNumber && finalTotal > 0
        ? `https://img.vietqr.io/image/${payment.bankId}-${payment.accountNumber}-compact.png?amount=${finalTotal}&addInfo=${encodeURIComponent(`Thanh toan don hang ${storeInfo.name}`)}`
        : null;

    if (!isClient) {
        return <div className="h-screen w-full bg-slate-900 flex items-center justify-center text-white">Loading...</div>;
    }

    return (
        <div className="flex h-screen w-full bg-gray-50 overflow-hidden">
            {/* Left: Branding */}
            <div className="hidden lg:flex w-1/2 bg-slate-900 text-white flex-col justify-center items-center p-12 relative overflow-hidden">
                <div className="absolute inset-0 opacity-20 bg-[url('https://images.unsplash.com/photo-1509042239860-f550ce710b93?q=80&w=2574&auto=format&fit=crop')] bg-cover bg-center" />

                <div className="z-10 text-center space-y-6">
                    <div className="w-32 h-32 bg-white/10 rounded-full flex items-center justify-center mx-auto backdrop-blur-md mb-6 border border-white/20">
                        {storeInfo.logo ? (
                            <div className="relative w-24 h-24 rounded-full overflow-hidden">
                                <Image src={storeInfo.logo} alt="Logo" fill className="object-cover" unoptimized />
                            </div>
                        ) : (
                            <Coffee className="w-16 h-16 text-primary" />
                        )}
                    </div>
                    <h1 className="text-5xl font-bold tracking-tight text-white">{storeInfo.name}</h1>
                    <p className="text-xl text-gray-300 max-w-md mx-auto">
                        {storeInfo.address}
                    </p>
                    <p className="text-lg text-primary">{storeInfo.phone}</p>
                </div>

                <div className="absolute bottom-10 left-0 w-full text-center text-gray-500 text-sm">
                    Powered by Lân Coffee POS
                </div>
            </div>

            {/* Right: Order Summary */}
            <div className="w-full lg:w-1/2 flex flex-col h-full bg-white shadow-2xl overflow-hidden">
                <div className="p-8 border-b border-gray-100 flex items-center justify-between bg-white z-10 shadow-sm">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                            <ShoppingBag className="w-6 h-6 text-primary" />
                            Đơn hàng của bạn
                        </h2>
                        <p className="text-gray-500 mt-1">Vui lòng kiểm tra lại món đã chọn</p>
                    </div>
                    <div className="lg:hidden text-right">
                        <h1 className="font-bold text-lg">{storeInfo.name}</h1>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/50">
                    {items.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-gray-400 space-y-4 opacity-60">
                            <ShoppingBag className="w-20 h-20" />
                            <p className="text-xl font-medium">Xin chào quý khách!</p>
                            <p className="text-sm">Vui lòng gọi món tại quầy</p>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.cartId} className="flex items-start gap-4 p-4 rounded-xl border border-gray-200 bg-white shadow-sm transition-all duration-300">
                                <div className="relative w-24 h-24 rounded-lg overflow-hidden flex-shrink-0 bg-gray-100 border border-gray-100">
                                    <Image
                                        src={item.image || "/placeholder-food.png"}
                                        alt={item.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>

                                <div className="flex-1 min-w-0 flex flex-col justify-between h-24">
                                    <div>
                                        <h3 className="font-bold text-xl text-gray-900 truncate">{item.name}</h3>
                                        <div className="text-sm text-gray-500 mt-1 space-y-0.5 line-clamp-2">
                                            {item.selectedOptions.map((opt, idx) => (
                                                <span key={idx} className="block">• {opt.name}</span>
                                            ))}
                                        </div>
                                    </div>
                                    <div className="text-primary font-medium text-lg">
                                        {formatCurrency(item.price)} <span className="text-gray-400 text-sm">x {item.quantity}</span>
                                    </div>
                                </div>

                                <div className="text-right flex flex-col justify-between h-24">
                                    <span className="text-xl font-bold text-gray-900">
                                        {formatCurrency(item.price * item.quantity)}
                                    </span>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                <div className="p-8 bg-white border-t border-gray-100 space-y-6 pb-12 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                    <div className="flex items-center justify-between text-2xl border-b border-dashed border-gray-200 pb-6">
                        <span className="text-gray-500 font-medium">Tổng thanh toán</span>
                        <span className="font-bold text-4xl text-primary">{formatCurrency(finalTotal)}</span>
                    </div>

                    {qrUrl && (
                        <div className="flex items-center gap-6 p-4 bg-blue-50/50 rounded-2xl border border-blue-100">
                            <div className="w-32 h-32 bg-white p-2 rounded-xl shadow-sm border border-gray-200 flex-shrink-0 relative">
                                <Image
                                    src={qrUrl}
                                    alt="VietQR"
                                    fill
                                    className="object-contain rounded-lg"
                                    unoptimized
                                />
                            </div>
                            <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-2 text-blue-700 font-bold text-lg">
                                    <QrCode className="w-6 h-6" />
                                    Quét mã để thanh toán
                                </div>
                                <p className="text-gray-600">Ngân hàng: <span className="font-medium text-gray-900">{payment.bankName} ({payment.bankId})</span></p>
                                <p className="text-gray-600">Chủ TK: <span className="font-medium text-gray-900">{payment.accountName}</span></p>
                                <p className="text-gray-600">Số TK: <span className="font-medium text-gray-900">{payment.accountNumber}</span></p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
