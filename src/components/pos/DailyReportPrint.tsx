"use client";

import React, { forwardRef } from "react";
import { formatCurrency } from "@/lib/utils";

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

interface DailyReportPrintProps {
    reportData: ReportData | null;
}

export const DailyReportPrint = forwardRef<HTMLDivElement, DailyReportPrintProps>(
    ({ reportData }, ref) => {
        if (!reportData) return null;

        const dateStr = new Date(reportData.date).toLocaleDateString('vi-VN');
        const timeStr = new Date().toLocaleTimeString('vi-VN');

        return (
            <div ref={ref} className="p-8 bg-white text-black text-sm font-mono w-[80mm] mx-auto">
                <div className="text-center mb-6">
                    <h1 className="text-xl font-bold uppercase mb-1">Báo Cáo Doanh Thu</h1>
                    <p className="text-sm">Lân Coffee POS</p>
                    <div className="border-b border-dashed border-black my-2" />
                    <p className="text-xs italic">Ngày: {dateStr} - Giờ in: {timeStr}</p>
                </div>

                <div className="space-y-4">
                    {/* Summary */}
                    <div className="space-y-1">
                        <div className="flex justify-between font-bold">
                            <span>TỔNG DOANH THU:</span>
                            <span>{formatCurrency(reportData.totalRevenue)}</span>
                        </div>
                        <div className="flex justify-between">
                            <span>Tổng đơn hàng:</span>
                            <span>{reportData.orderCount} đơn</span>
                        </div>
                    </div>

                    <div className="border-b border-dashed border-black my-2" />

                    {/* Payment Summary */}
                    <div className="space-y-1">
                        <p className="font-bold underline uppercase">Thanh toán:</p>
                        {Object.entries(reportData.paymentSummary).map(([method, amount]) => (
                            <div key={method} className="flex justify-between pl-2">
                                <span className="capitalize">{method}:</span>
                                <span>{formatCurrency(amount)}</span>
                            </div>
                        ))}
                    </div>

                    <div className="border-b border-dashed border-black my-2" />

                    {/* Top Products */}
                    <div className="space-y-1">
                        <p className="font-bold underline uppercase">Món đã bán:</p>
                        <table className="w-full text-[11px]">
                            <thead>
                                <tr className="border-b border-black">
                                    <th className="text-left py-1">Tên</th>
                                    <th className="text-center py-1">SL</th>
                                    <th className="text-right py-1">Tiền</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reportData.productSales.map((item, index) => (
                                    <tr key={index}>
                                        <td className="py-1">{item.name}</td>
                                        <td className="text-center py-1">{item.quantity}</td>
                                        <td className="text-right py-1">{formatCurrency(item.total).replace('₫', '')}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    <div className="border-b border-dashed border-black my-2" />

                    {/* Order Details List */}
                    <div className="space-y-1">
                        <p className="font-bold underline uppercase">Danh sách đơn:</p>
                        {reportData.orderDetails.map((order) => (
                            <div key={order.id} className="flex justify-between text-[10px] pl-1">
                                <span>#{order.id.slice(-4).toUpperCase()} ({new Date(order.time).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })})</span>
                                <span>{formatCurrency(order.total)}</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="mt-8 text-center text-[10px]">
                    <div className="border-b border-dashed border-black mb-2" />
                    <p>Cảm ơn anh đã làm việc chăm chỉ!</p>
                    <p>Chúc một ca làm việc tốt lành.</p>
                </div>
            </div>
        );
    }
);

DailyReportPrint.displayName = "DailyReportPrint";
