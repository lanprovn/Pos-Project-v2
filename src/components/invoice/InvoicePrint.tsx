import { useTableStore } from '@/store/useTableStore';
import { useSettingsStore } from '@/store/useSettingsStore';
import { formatCurrency } from '@/lib/utils';
import React from 'react';
import type { Order } from '@/store/useOrderStore';

interface InvoicePrintProps {
    order: Order | null;
}

export const InvoicePrint = React.forwardRef<HTMLDivElement, InvoicePrintProps>(
    ({ order }, ref) => {
        const { storeInfo, printer } = useSettingsStore();
        const { tables } = useTableStore();

        if (!order) return null;

        const table = tables.find(t => t.id === order.tableId);

        return (
            <div ref={ref} className={`print:block p-2 font-sans text-black ${printer.pageSize === '58mm' ? 'w-[58mm]' : 'w-[80mm]'} mx-auto bg-white`}>
                {/* Header Section */}
                <div className="text-center mb-4">
                    <h1 className="text-xl font-bold uppercase tracking-tight leading-tight">{storeInfo.name}</h1>
                    <p className="text-[12px] leading-tight mt-1">ĐC: {storeInfo.address}</p>
                    <p className="text-[12px] leading-tight">Hotline: {storeInfo.phone}</p>
                </div>

                <div className="text-center my-4">
                    <h2 className="text-lg font-bold uppercase tracking-wide">HÓA ĐƠN THANH TOÁN</h2>
                </div>

                {/* Info Section */}
                <div className="text-[13px] mb-4 space-y-1">
                    <div className="flex justify-between">
                        <span>Số phiếu: <span className="font-semibold">#{order.id.slice(-4).toUpperCase()}</span></span>
                        <span>Bàn: <span className="font-bold">{table ? table.name.toUpperCase() : 'MANG VỀ'}</span></span>
                    </div>
                    <div className="text-[12px]">
                        Vào: {new Date(order.date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })} {new Date(order.date).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        Ra: {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}
                    </div>
                </div>

                {/* Table Header */}
                <div className="border-y border-black py-1 mb-2 flex text-[13px] font-bold">
                    <div className="flex-1">Tên món</div>
                    <div className="w-8 text-center">SL</div>
                    <div className="w-16 text-right">Đ.Giá</div>
                    <div className="w-16 text-right">T.Tiền</div>
                </div>

                {/* Items List */}
                <div className="space-y-2 mb-4">
                    {order.items.map((item) => (
                        <div key={item.cartId} className="flex text-[13px] items-start">
                            <div className="flex-1 pr-2">
                                <div className="font-medium leading-tight">{item.name}</div>
                                {item.selectedOptions && item.selectedOptions.length > 0 && (
                                    <div className="text-[11px] italic text-gray-700">
                                        + {item.selectedOptions.map(o => o.name).join(", ")}
                                    </div>
                                )}
                            </div>
                            <div className="w-8 text-center">{item.quantity}</div>
                            <div className="w-16 text-right">{formatCurrency(item.price).replace('₫', '')}</div>
                            <div className="w-16 text-right">{formatCurrency(item.price * item.quantity).replace('₫', '')}</div>
                        </div>
                    ))}
                </div>

                {/* Summary Section */}
                <div className="border-t border-black pt-2 space-y-1">
                    <div className="flex justify-between text-[13px]">
                        <span>Tổng tiền món:</span>
                        <span className="font-bold">{formatCurrency(order.subtotal).replace('₫', '')}</span>
                    </div>
                    {order.discount > 0 && (
                        <div className="flex justify-between text-[13px]">
                            <span>Giảm giá ({order.discount}%):</span>
                            <span>-{formatCurrency((order.subtotal * order.discount) / 100).replace('₫', '')}</span>
                        </div>
                    )}
                    <div className="flex justify-between items-center pt-2 mt-2 border-t border-black border-double border-b-0">
                        <span className="text-sm font-bold uppercase">THANH TOÁN:</span>
                        <span className="text-xl font-bold">{formatCurrency(order.total).replace('₫', '')}</span>
                    </div>
                </div>

                {/* Footer Section */}
                <div className="text-center text-[12px] mt-8 space-y-1 italic pt-4 border-t border-dashed border-gray-300">
                    <p>Cảm ơn quý khách & Hẹn gặp lại!</p>
                    {storeInfo.wifiPassword && (
                        <p>Wifi: {storeInfo.name} - Pass: {storeInfo.wifiPassword}</p>
                    )}
                </div>
            </div>
        );
    }
);

InvoicePrint.displayName = "InvoicePrint";
