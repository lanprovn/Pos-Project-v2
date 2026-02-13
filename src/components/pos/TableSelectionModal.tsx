"use client";

import React from 'react';
import { motion } from 'framer-motion';
import { X, Utensils, Timer } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTableStore, type Table } from '@/store/useTableStore';

interface TableSelectionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSelect: (table: Table) => void;
    selectionMode?: 'default' | 'move' | 'merge';
    sourceTableId?: string;
}

export const TableSelectionModal: React.FC<TableSelectionModalProps> = ({
    isOpen, onClose, onSelect, selectionMode = 'default', sourceTableId
}) => {
    const { tables, selectedTableId } = useTableStore();

    // Filtering logic based on mode
    const filteredTables = tables.filter(t => {
        if (selectionMode === 'move') return t.status === 'available' && t.id !== sourceTableId;
        if (selectionMode === 'merge') return t.status === 'occupied' && t.id !== sourceTableId;
        return true;
    });

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={onClose}
                className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="relative bg-white w-full max-w-2xl rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
            >
                <div className="p-8 border-b border-black/5 flex justify-between items-center bg-secondary/10">
                    <div>
                        <h2 className="text-2xl font-bold flex items-center gap-3">
                            <Utensils className="text-primary" />
                            {selectionMode === 'move' ? 'Chọn bàn muốn chuyển đến' :
                                selectionMode === 'merge' ? 'Chọn bàn muốn gộp vào' :
                                    'Sơ đồ bàn'}
                        </h2>
                        <p className="text-muted-foreground text-sm">
                            {selectionMode === 'move' ? 'Vui lòng chọn bàn trống' :
                                selectionMode === 'merge' ? 'Vui lòng chọn bàn đang có khách' :
                                    'Vui lòng chọn bàn để phục vụ tại chỗ'}
                        </p>
                    </div>
                    <button onClick={onClose} className="p-3 hover:bg-white rounded-full transition-all shadow-sm">
                        <X size={24} />
                    </button>
                </div>

                <div className="p-8 overflow-y-auto flex-1 bg-gray-50/50">
                    {filteredTables.length > 0 ? (
                        <div className="grid grid-cols-3 gap-6">
                            {filteredTables.map((table) => (
                                <motion.button
                                    key={table.id}
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    onClick={() => onSelect(table)}
                                    className={cn(
                                        "relative h-36 rounded-[2rem] border-2 transition-all flex flex-col items-center justify-center gap-2 shadow-sm",
                                        table.status === 'available'
                                            ? "bg-white border-black/5 hover:border-primary/50 hover:bg-primary/5"
                                            : table.status === 'occupied'
                                                ? "bg-amber-50 border-amber-200 text-amber-700"
                                                : "bg-red-50 border-red-200 text-red-700",
                                        selectedTableId === table.id && "ring-4 ring-primary/20 border-primary bg-primary/5"
                                    )}
                                >
                                    <span className="text-3xl font-black">{table.number}</span>
                                    <span className="text-[10px] font-bold uppercase tracking-widest opacity-60">{table.name}</span>

                                    {table.status === 'occupied' && (
                                        <div className="absolute top-4 right-4 text-amber-500">
                                            <Timer size={16} className="animate-pulse" />
                                        </div>
                                    )}

                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[10px] font-black uppercase mt-1",
                                        table.status === 'available' ? "bg-emerald-100 text-emerald-600" :
                                            table.status === 'occupied' ? "bg-amber-200 text-amber-800" : "bg-red-200 text-red-800"
                                    )}>
                                        {table.status === 'available' ? 'Trống' :
                                            table.status === 'occupied' ? 'Có khách' : 'Đã đặt'}
                                    </div>
                                </motion.button>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-64 text-center space-y-4">
                            <div className="w-20 h-20 bg-secondary/20 rounded-full flex items-center justify-center">
                                <Utensils size={40} className="text-muted-foreground opacity-20" />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold">Chưa có dữ liệu bàn</h3>
                                <p className="text-muted-foreground text-sm max-w-[250px] mx-auto">
                                    Vui lòng kiểm tra lại cấu hình hoặc liên hệ quản trị viên để thiết lập sơ đồ bàn.
                                </p>
                            </div>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-secondary text-secondary-foreground rounded-xl text-sm font-bold hover:bg-secondary/80 transition-all"
                            >
                                Thử tải lại trang
                            </button>
                        </div>
                    )}
                </div>

                <div className="p-8 border-t border-black/5 bg-white flex justify-between items-center text-sm shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
                    <div className="flex gap-6">
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-lg bg-emerald-500 shadow-sm shadow-emerald-200" />
                            <span className="font-bold text-gray-600">Sẵn sàng</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="w-4 h-4 rounded-lg bg-amber-500 shadow-sm shadow-amber-200" />
                            <span className="font-bold text-gray-600">Đang dùng</span>
                        </div>
                    </div>
                    <div className="flex justify-center w-full">
                        <button
                            onClick={onClose}
                            className="px-12 py-3 bg-secondary text-secondary-foreground rounded-2xl font-bold hover:bg-secondary/80 transition-all shadow-sm"
                        >
                            Đóng cửa sổ
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
};
