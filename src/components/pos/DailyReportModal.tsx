"use client";

import { motion, AnimatePresence } from "framer-motion";
import { X, TrendingUp, ShoppingBag, CreditCard, DollarSign, Package, ClipboardList, Clock, Printer } from "lucide-react";
import { useState, useEffect, useCallback, useRef } from "react";
import { getStaffDailyRevenueAction } from "@/app/actions/report";
import { formatCurrency, cn } from "@/lib/utils";
import { useReactToPrint } from "react-to-print";
import { DailyReportPrint } from "./DailyReportPrint";

interface DailyReportModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface ProductSale {
    name: string;
    quantity: number;
    total: number;
    unit?: string;
}

interface OrderDetail {
    id: string;
    total: number;
    time: string;
    paymentMethod: string;
    itemsCount: number;
}

interface ReportData {
    totalRevenue: number;
    orderCount: number;
    paymentSummary: Record<string, number>;
    productSales: ProductSale[];
    orderDetails: OrderDetail[];
    date: string;
}

export function DailyReportModal({ isOpen, onClose }: DailyReportModalProps) {
    const [reportData, setReportData] = useState<ReportData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [activeTab, setActiveTab] = useState<'summary' | 'orders'>('summary');

    const printRef = useRef<HTMLDivElement>(null);
    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const handleFetchReport = useCallback(async () => {
        setIsLoading(true);
        setActiveTab('summary');
        const result = await getStaffDailyRevenueAction();
        if (result.success && result.data) {
            setReportData(result.data as ReportData);
        }
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (isOpen) {
            // Delay execution to avoid cascading renders warning
            const timer = setTimeout(() => {
                handleFetchReport();
            }, 0);
            return () => clearTimeout(timer);
        }
    }, [isOpen, handleFetchReport]);

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm shadow-black">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: 20 }}
                    className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl"
                >
                    {/* Header */}
                    <div className="p-6 border-b border-black/5 flex flex-col gap-4 bg-gradient-to-r from-primary/5 to-transparent">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                                    <TrendingUp size={24} />
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold">Báo cáo kết ca</h2>
                                    <p className="text-xs text-muted-foreground">Tổng hợp doanh thu & giao dịch trong ngày</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={() => handlePrint()}
                                    disabled={!reportData || isLoading}
                                    className="p-2.5 bg-secondary hover:bg-secondary-dark rounded-xl transition-all text-foreground/80 hover:text-primary flex items-center gap-2 border border-black/5 shadow-sm"
                                    title="In báo cáo"
                                >
                                    <Printer size={20} />
                                    <span className="hidden sm:inline text-xs font-bold">In báo cáo</span>
                                </button>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-secondary rounded-full transition-colors text-muted-foreground hover:text-foreground"
                                >
                                    <X size={20} />
                                </button>
                            </div>
                        </div>

                        {/* Tabs */}
                        <div className="flex p-1 bg-secondary/50 rounded-xl w-fit">
                            <button
                                onClick={() => setActiveTab('summary')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    activeTab === 'summary' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Tổng quan
                            </button>
                            <button
                                onClick={() => setActiveTab('orders')}
                                className={cn(
                                    "px-4 py-1.5 rounded-lg text-sm font-bold transition-all",
                                    activeTab === 'orders' ? "bg-white shadow-sm text-primary" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                Chi tiết đơn
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {isLoading ? (
                            <div className="flex flex-col items-center justify-center py-20 space-y-4">
                                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                                <p className="text-sm text-muted-foreground">Đang tải báo cáo...</p>
                            </div>
                        ) : reportData ? (
                            <div className="space-y-6">
                                {activeTab === 'summary' ? (
                                    <>
                                        {/* Stats Grid */}
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="p-5 rounded-2xl bg-primary text-white space-y-2 shadow-lg shadow-primary/20">
                                                <div className="flex items-center justify-between opacity-80">
                                                    <span className="text-sm font-medium">Tổng doanh thu</span>
                                                    <DollarSign size={18} />
                                                </div>
                                                <div className="text-2xl font-black">
                                                    {formatCurrency(reportData.totalRevenue)}
                                                </div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-white border border-black/5 space-y-2 shadow-sm">
                                                <div className="flex items-center justify-between text-muted-foreground">
                                                    <span className="text-sm font-medium">Số đơn hàng</span>
                                                    <ShoppingBag size={18} />
                                                </div>
                                                <div className="text-2xl font-bold text-foreground">
                                                    {reportData.orderCount} đơn
                                                </div>
                                            </div>
                                        </div>

                                        {/* Payment breakdown */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                                <CreditCard size={16} /> Thanh toán
                                            </h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                {Object.entries(reportData.paymentSummary).map(([method, amount]) => (
                                                    <div key={method} className="flex items-center justify-between p-3 rounded-xl bg-secondary/50 border border-black/5 text-sm">
                                                        <span className="font-medium text-muted-foreground capitalize">{method}</span>
                                                        <span className="font-bold">{formatCurrency(amount)}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Product breakdown */}
                                        <div className="space-y-3">
                                            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                                <Package size={16} /> Các món đã bán
                                            </h3>
                                            <div className="border border-black/5 rounded-2xl overflow-hidden divide-y divide-black/5">
                                                {reportData.productSales.map((item, index) => (
                                                    <div key={index} className="flex items-center justify-between p-4 hover:bg-secondary/30 transition-colors">
                                                        <div className="flex-1 min-w-0 pr-4">
                                                            <div className="font-bold text-sm truncate">{item.name}</div>
                                                            <div className="text-xs text-muted-foreground">Số lượng: {item.quantity} {item.unit || 'phần'}</div>
                                                        </div>
                                                        <div className="text-sm font-bold text-primary">
                                                            {formatCurrency(item.total)}
                                                        </div>
                                                    </div>
                                                ))}
                                                {reportData.productSales.length === 0 && (
                                                    <div className="p-8 text-center text-sm text-muted-foreground">
                                                        Chưa có dữ liệu sản phẩm
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    /* Orders list */
                                    <div className="space-y-4">
                                        <div className="flex items-center justify-between">
                                            <h3 className="text-sm font-bold flex items-center gap-2 text-foreground/80">
                                                <ClipboardList size={16} /> Danh sách đơn hàng
                                            </h3>
                                            <span className="text-[10px] bg-secondary px-2 py-0.5 rounded font-bold">{reportData.orderDetails.length} giao dịch</span>
                                        </div>
                                        <div className="space-y-2">
                                            {reportData.orderDetails.map((order) => (
                                                <div key={order.id} className="p-4 rounded-2xl border border-black/5 hover:border-primary/20 hover:bg-primary/5 transition-all group">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <div>
                                                            <div className="text-sm font-bold group-hover:text-primary transition-colors">#{order.id.slice(-6).toUpperCase()}</div>
                                                            <div className="text-[10px] text-muted-foreground flex items-center gap-1 mt-0.5 uppercase tracking-wider font-medium">
                                                                <Clock size={10} /> {new Date(order.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                                                                <span className="mx-1">•</span>
                                                                {order.paymentMethod || 'Tiền mặt'}
                                                            </div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="text-sm font-black text-foreground">{formatCurrency(order.total)}</div>
                                                            <div className="text-[10px] text-muted-foreground">{order.itemsCount} món</div>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                            {reportData.orderDetails.length === 0 && (
                                                <div className="p-20 text-center text-sm text-muted-foreground italic">
                                                    Không có đơn hàng nào trong ngày
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="text-center py-20 text-sm text-muted-foreground italic">
                                Không có dữ liệu báo cáo
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="p-6 bg-secondary/30 flex items-center justify-between border-t border-black/5">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-widest font-bold items-center flex gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Cập nhật: {new Date().toLocaleTimeString()}
                        </p>
                        <button
                            onClick={handleFetchReport}
                            className="bg-white border border-black/5 px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:shadow-md transition-all active:scale-95"
                        >
                            Làm mới
                        </button>
                    </div>
                </motion.div>

                {/* Hidden Print Component */}
                <div className="hidden">
                    <DailyReportPrint ref={printRef} reportData={reportData} />
                </div>
            </div>
        </AnimatePresence>
    );
}
