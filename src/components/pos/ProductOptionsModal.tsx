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
    const normalizedOptions: ProductOption[] = Array.isArray(product?.options) 
        ? product?.options 
        : (typeof product?.options === 'string' ? JSON.parse(product.options as any) : []);

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
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                >
                    {/* Header with Image */}
                    <div className="relative h-48 bg-secondary">
                        <Image
                            src={product.image}
                            alt={product.name}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent flex items-end p-6">
                            <div className="text-white">
                                <h2 className="text-2xl font-bold">{product.name}</h2>
                                <p className="text-white/80 font-medium">{formatCurrency(basePrice)}</p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white p-2 rounded-full backdrop-blur-md transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Options List */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {normalizedOptions && normalizedOptions.length > 0 ? (
                            normalizedOptions.map((option) => (
                                <div key={option.id}>
                                    <h3 className="font-bold text-sm text-muted-foreground uppercase tracking-wider mb-3">
                                        {option.name} {option.required && <span className="text-destructive">*</span>}
                                    </h3>
                                    <div className="grid grid-cols-1 gap-2">
                                        {option.values.map((val) => {
                                            const selected = isOptionSelected(val);
                                            return (
                                                <div
                                                    key={val.name}
                                                    onClick={() => handleOptionToggle(option, val)}
                                                    className={cn(
                                                        "flex items-center justify-between p-3 rounded-xl border cursor-pointer transition-all",
                                                        selected
                                                            ? "border-primary bg-primary/5 shadow-md shadow-primary/10"
                                                            : "border-black/5 hover:bg-secondary"
                                                    )}
                                                >
                                                    <div className="flex items-center gap-3">
                                                        <div className={cn(
                                                            "w-5 h-5 rounded-full border flex items-center justify-center transition-colors",
                                                            option.type === 'single' ? "rounded-full" : "rounded-md",
                                                            selected ? "bg-primary border-primary" : "border-black/20 bg-white"
                                                        )}>
                                                            {selected && <Check size={12} className="text-white" />}
                                                        </div>
                                                        <span className={cn("font-medium", selected && "text-primary")}>
                                                            {val.name}
                                                        </span>
                                                    </div>
                                                    <span className="text-sm font-semibold text-muted-foreground">
                                                        {val.price > 0 ? `+${formatCurrency(val.price)}` : 'Miễn phí'}
                                                    </span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center text-muted-foreground py-8">
                                <p>Sản phẩm này không có tùy chọn thêm.</p>
                            </div>
                        )}
                    </div>

                    {/* Footer Controls */}
                    <div className="p-6 border-t border-black/5 bg-secondary/30 space-y-4">
                        {/* Quantity */}
                        {mode === 'add' && (
                            <div className="flex items-center justify-between bg-white p-2 rounded-xl border border-black/5">
                                <span className="font-medium text-sm text-muted-foreground ml-2">Số lượng</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-8 h-8 rounded-lg bg-secondary hover:bg-black/5 flex items-center justify-center transition-colors"
                                    >
                                        <Minus size={16} />
                                    </button>
                                    <span className="font-bold w-6 text-center">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(quantity + 1)}
                                        className="w-8 h-8 rounded-lg bg-secondary hover:bg-black/5 flex items-center justify-center transition-colors"
                                    >
                                        <Plus size={16} />
                                    </button>
                                </div>
                            </div>
                        )}

                        {/* Add/Update Button */}
                        <button
                            onClick={handleConfirm}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-between px-6 transition-all active:scale-[0.98]"
                        >
                            <span className="text-lg">{mode === 'edit' ? 'Cập nhật món' : 'Thêm vào giỏ'}</span>
                            <div className="flex items-center gap-2">
                                <span className="text-sm font-normal opacity-80 decoration-slice">
                                    {quantity} x {formatCurrency(unitPrice)} =
                                </span>
                                <span className="text-xl">{formatCurrency(totalPrice)}</span>
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
