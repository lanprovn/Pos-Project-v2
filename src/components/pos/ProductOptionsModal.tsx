"use client";

import { useState, useCallback } from "react";
import type { Product, ProductOption, OptionValue } from "@/store/useProductStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Check, Plus, Minus } from "lucide-react";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";

interface ProductOptionsModalProps {
    isOpen: boolean;
    onClose: () => void;
    product: Product | null;
    initialOptions?: OptionValue[];
    mode?: 'add' | 'edit';
    onAddToCart: (product: Product, options: OptionValue[], quantity: number) => void;
}

export function ProductOptionsModal({
    isOpen,
    onClose,
    product,
    initialOptions = [],
    mode = 'add',
    onAddToCart
}: ProductOptionsModalProps) {
    // State is initialized directly from props.
    // In POS Page, we use a different 'key' for the modal to force a remount when product changes.
    const normalizedOptions: ProductOption[] = (Array.isArray(product?.options) 
        ? product?.options 
        : (typeof product?.options === 'string' ? JSON.parse(product.options as any) : [])
    ).filter((opt: ProductOption) => !['Size', 'Kích thước'].includes(opt.name));

    const [selectedOptions, setSelectedOptions] = useState<OptionValue[]>(() => {
        if (mode === 'edit') return initialOptions;

        const defaultOpts: OptionValue[] = [];
        normalizedOptions.forEach((opt: ProductOption) => {
            if (opt.type === 'single' && opt.required && opt.values.length > 0) {
                defaultOpts.push(opt.values[0]);
            }
        });
        return defaultOpts;
    });

    const [quantity, setQuantity] = useState(1);

    const handleOptionToggle = (option: ProductOption, value: OptionValue) => {
        if (option.type === 'single') {
            const otherOptions = selectedOptions.filter(
                sel => !option.values.some(v => v.name === sel.name)
            );
            setSelectedOptions([...otherOptions, value]);
        } else {
            const exists = selectedOptions.some(sel => sel.name === value.name);
            if (exists) {
                setSelectedOptions(selectedOptions.filter(sel => sel.name !== value.name));
            } else {
                setSelectedOptions([...selectedOptions, value]);
            }
        }
    };

    const isOptionSelected = useCallback((value: OptionValue) => {
        return selectedOptions.some(sel => sel.name === value.name);
    }, [selectedOptions]);

    const handleConfirm = () => {
        if (product) {
            onAddToCart(product, selectedOptions, quantity);
        }
        onClose();
    };

    if (!isOpen || !product) return null;

    const basePrice = product.price;
    const optionsTotal = selectedOptions.reduce((sum, opt) => sum + opt.price, 0);
    const unitPrice = basePrice + optionsTotal;
    const totalPrice = unitPrice * quantity;

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4">
                <motion.div
                    initial={{ opacity: 0, y: 100 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 100 }}
                    transition={{ type: "spring", damping: 25, stiffness: 200 }}
                    className="bg-white w-full max-w-lg rounded-t-[3rem] sm:rounded-[3rem] shadow-2xl overflow-hidden flex flex-col h-[90dvh] sm:h-auto sm:max-h-[90vh] mt-auto sm:mt-0 relative"
                >
                    {/* Header with Image - Deep refinement */}
                    <div className="relative h-56 md:h-64 bg-gray-100 shrink-0">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-x-0 bottom-0 h-2/3 bg-gradient-to-t from-black/90 via-black/40 to-transparent flex items-end p-8 md:p-10">
                            <div className="text-white w-full">
                                <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest mb-3 border border-white/20">Sản phẩm chất lượng</span>
                                <h2 className="text-2xl md:text-4xl font-black tracking-tighter leading-tight mb-1">{product.name}</h2>
                                <p className="text-primary text-xl font-black">{formatCurrency(basePrice)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-6 right-6 bg-white/10 hover:bg-white/20 text-white p-3 rounded-full backdrop-blur-xl transition-all border border-white/10 active:scale-90"
                        >
                            <X size={24} strokeWidth={2.5} />
                        </button>
                    </div>

                    {/* Options List - Premium list items */}
                    <div className="flex-1 overflow-y-auto p-6 md:p-10 space-y-10 bg-gray-50/30">
                        {normalizedOptions && normalizedOptions.length > 0 ? (
                            normalizedOptions.map((option) => (
                                <div key={option.id} className="space-y-4">
                                    <div className="flex items-center gap-2 mb-4">
                                        <div className="w-1.5 h-6 bg-primary rounded-full" />
                                        <h3 className="font-black text-sm text-slate-800 uppercase tracking-widest">
                                            {option.name} {option.required && <span className="text-red-500">*</span>}
                                        </h3>
                                    </div>
                                    <div className="grid grid-cols-1 gap-3">
                                        {option.values.map((val) => {
                                            const selected = isOptionSelected(val);
                                            return (
                                                <motion.div
                                                    key={val.name}
                                                    whileTap={{ scale: 0.98 }}
                                                    onClick={() => handleOptionToggle(option, val)}
                                                    className={cn(
                                                        "group flex items-center justify-between p-5 rounded-[2rem] border-2 transition-all duration-300 cursor-pointer",
                                                        selected
                                                            ? "border-primary bg-primary/[0.03] shadow-xl shadow-primary/5"
                                                            : "border-black/[0.03] bg-white hover:border-primary/30"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-4">
                                                        <div className={cn(
                                                            "w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all duration-500",
                                                            option.type === 'single' ? "rounded-full" : "rounded-xl",
                                                            selected 
                                                                ? "bg-primary border-primary rotate-0 scale-100" 
                                                                : "border-black/5 bg-gray-50 -rotate-90 scale-90"
                                                        )}>
                                                            {selected && <Check size={16} className="text-white stroke-[3px]" />}
                                                        </div>
                                                        <span className={cn("text-lg font-bold tracking-tight transition-colors", selected ? "text-primary" : "text-slate-600")}>
                                                            {val.name}
                                                        </span>
                                                    </div>
                                                    <span className={cn("text-sm font-black px-4 py-2 rounded-2xl transition-all", 
                                                        selected ? "bg-primary/10 text-primary" : "bg-gray-100 text-muted-foreground")}>
                                                        {val.price > 0 ? `+${formatCurrency(val.price)}` : 'Free'}
                                                    </span>
                                                </motion.div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                                <div className="p-6 bg-gray-100 rounded-full text-gray-400">
                                    <Plus size={32} className="rotate-45" />
                                </div>
                                <div>
                                    <p className="text-slate-800 font-black text-lg">Món cơ bản</p>
                                    <p className="text-muted-foreground text-sm">Sản phẩm này không có tùy chọn thêm.</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls - Elite Checkout Feel */}
                    <div className="p-8 md:p-10 border-t border-black/[0.03] bg-white backdrop-blur-xl space-y-6 shrink-0 shadow-[0_-20px_40px_rgba(0,0,0,0.02)]">
                        {/* Quantity with new ultra-premium selector */}
                        <div className="flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="font-black text-xs uppercase tracking-widest text-muted-foreground mb-1">Số lượng đặt</span>
                                <span className="text-2xl font-black tracking-tighter">Chọn số lượng</span>
                            </div>
                            <div className="flex items-center gap-2 bg-gray-100 p-2 rounded-[2rem]">
                                <button
                                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                    className="w-12 h-12 rounded-full bg-white shadow-sm flex items-center justify-center hover:bg-red-50 hover:text-red-500 transition-all active:scale-90"
                                >
                                    <Minus size={20} strokeWidth={3} />
                                </button>
                                <span className="font-black text-2xl w-12 text-center tabular-nums">{quantity}</span>
                                <button
                                    onClick={() => setQuantity(quantity + 1)}
                                    className="w-12 h-12 rounded-full bg-primary text-white shadow-lg shadow-primary/20 flex items-center justify-center hover:bg-primary/90 transition-all active:scale-95"
                                >
                                    <Plus size={20} strokeWidth={3} />
                                </button>
                            </div>
                        </div>

                        {/* Add/Update Button - Shimmering Premium */}
                        <button
                            onClick={handleConfirm}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-black py-5 rounded-[2.5rem] shadow-[0_20px_40px_-10px_rgba(59,130,246,0.3)] flex items-center justify-between px-10 transition-all active:scale-[0.98] group relative overflow-hidden"
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:animate-shimmer" />
                            <span className="text-xl tracking-tight">{mode === 'edit' ? 'Cập nhật món' : 'Thêm vào đơn'}</span>
                            <div className="flex flex-col items-end">
                                <div className="text-[10px] uppercase font-black opacity-60 tracking-widest leading-none mb-1">Tổng cộng</div>
                                <div className="text-2xl tracking-tighter">{formatCurrency(totalPrice)}</div>
                            </div>
                        </button>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>

    );
}

// Separate Initialization logic for cleaner state management
export function ProductOptionsModalControlled(props: ProductOptionsModalProps) {
    return <ProductOptionsModal {...props} />;
}
