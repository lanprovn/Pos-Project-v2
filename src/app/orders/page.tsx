"use client";

import { useOrderStore } from "@/store/useOrderStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Printer, Calendar, Clock, ArrowRight, User } from "lucide-react";
import { useState, useRef } from "react";
import { useReactToPrint } from "react-to-print";
import { InvoicePrint } from "@/components/invoice/InvoicePrint";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";

import type { Order } from "@/store/useOrderStore";

export default function OrdersPage() {
    const { orders } = useOrderStore();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
    });

    const filteredOrders = orders.filter(o =>
        o.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const onPrintInvoice = (order: Order) => {
        setSelectedOrder(order);
        setTimeout(() => {
            handlePrint();
        }, 100);
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden premium-gradient">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6 overflow-hidden">
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Lịch sử Đơn hàng</h1>
                        <p className="text-muted-foreground text-sm">Xem lại và in hóa đơn các giao dịch cũ.</p>
                    </div>

                    <div className="relative w-72">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm theo mã đơn..."
                            className="w-full bg-white border border-black/5 shadow-sm rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </header>

                <div className="flex gap-6 h-full overflow-hidden">
                    {/* Orders List */}
                    <div className="w-1/3 flex-col flex overflow-hidden bg-white rounded-3xl border border-black/5 shadow-sm">
                        <div className="p-4 border-b border-black/5 font-semibold text-muted-foreground">
                            Danh sách ({filteredOrders.length})
                        </div>
                        <div className="overflow-y-auto flex-1 p-2 space-y-2">
                            {filteredOrders.length === 0 ? (
                                <div className="text-center p-8 text-muted-foreground">Chưa có đơn hàng nào</div>
                            ) : (
                                filteredOrders.map(order => (
                                    <div
                                        key={order.id}
                                        onClick={() => setSelectedOrder(order)}
                                        className={cn(
                                            "p-4 rounded-xl border cursor-pointer transition-all hover:bg-secondary/50",
                                            selectedOrder?.id === order.id
                                                ? "bg-primary/5 border-primary/50 shadow-sm"
                                                : "bg-white border-black/5"
                                        )}
                                    >
                                        <div className="flex justify-between items-start mb-2">
                                            <span className="font-bold text-sm">{order.id}</span>
                                            <span className={cn(
                                                "text-xs px-2 py-0.5 rounded-full border",
                                                order.status === 'completed'
                                                    ? "text-emerald-600 bg-emerald-50 border-emerald-200"
                                                    : "text-red-600 bg-red-50 border-red-200"
                                            )}>
                                                {order.status === 'completed' ? 'Thành công' : 'Đã hủy'}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-end">
                                            <div className="text-xs text-muted-foreground flex flex-col gap-1">
                                                <span className="flex items-center gap-1"><Calendar size={12} /> {new Date(order.date).toLocaleDateString()}</span>
                                                <span className="flex items-center gap-1"><Clock size={12} /> {new Date(order.date).toLocaleTimeString()}</span>
                                            </div>
                                            <span className="font-bold text-primary">{formatCurrency(order.total)}</span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    {/* Order Details */}
                    <div className="flex-1 bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col overflow-hidden">
                        {selectedOrder ? (
                            <>
                                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-secondary/20">
                                    <div>
                                        <h2 className="text-xl font-bold flex items-center gap-2">
                                            Chi tiết đơn hàng
                                            <span className="text-base font-normal text-muted-foreground">#{selectedOrder.id}</span>
                                        </h2>
                                        <p className="text-sm text-muted-foreground mt-1 flex items-center gap-2">
                                            <User size={14} /> Thu ngân: {user?.name || "Admin"}
                                        </p>
                                    </div>
                                    <button
                                        onClick={() => onPrintInvoice(selectedOrder)}
                                        className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-sm transition-all active:scale-95"
                                    >
                                        <Printer size={18} />
                                        In hóa đơn
                                    </button>
                                </div>

                                <div className="flex-1 overflow-y-auto p-6">
                                    <table className="w-full text-left border-collapse">
                                        <thead className="text-muted-foreground text-sm">
                                            <tr>
                                                <th className="font-medium p-3 border-b">Sản phẩm</th>
                                                <th className="font-medium p-3 border-b text-center">Đơn giá</th>
                                                <th className="font-medium p-3 border-b text-center">SL</th>
                                                <th className="font-medium p-3 border-b text-right">Thành tiền</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedOrder.items.map((item) => (
                                                <tr key={item.id} className="border-b border-dashed border-black/5 last:border-0 hover:bg-secondary/10">
                                                    <td className="p-3">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-secondary">
                                                                <Image
                                                                    src={item.image || "/placeholder.png"}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                            <span className="font-medium">{item.name}</span>
                                                        </div>
                                                    </td>
                                                    <td className="p-3 text-center text-muted-foreground">{formatCurrency(item.price)}</td>
                                                    <td className="p-3 text-center font-medium">x{item.quantity}</td>
                                                    <td className="p-3 text-right font-bold">{formatCurrency(item.price * item.quantity)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>

                                <div className="p-6 bg-secondary/20 border-t border-black/5">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-muted-foreground">Tổng số lượng</span>
                                        <span className="font-medium">
                                            {selectedOrder.items.reduce((a, b) => a + b.quantity, 0)} món
                                        </span>
                                    </div>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-muted-foreground">Hình thức thanh toán</span>
                                        <span className="font-medium uppercase">{selectedOrder.paymentMethod || 'Tiền mặt'}</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xl font-bold mt-4 pt-4 border-t border-black/10">
                                        <span>Tổng tiền</span>
                                        <span className="text-primary">{formatCurrency(selectedOrder.total)}</span>
                                    </div>
                                </div>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground opacity-50">
                                <ArrowRight className="w-12 h-12 mb-4" />
                                <p>Chọn một đơn hàng để xem chi tiết</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>

            {/* Hidden Print Component */}
            <div className="hidden">
                <InvoicePrint ref={printRef} order={selectedOrder} />
            </div>
        </div>
    );
}
