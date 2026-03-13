"use client";

import { useState } from "react";
import type { Product, OptionValue, ProductOption } from "@/store/useProductStore";
import { X, Upload, Save, Barcode, Package, Layers, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import Image from "next/image";

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    editProduct?: Product | null;
    categories: { id: string; name: string }[];
    onAdd: (data: any) => Promise<void>;
    onUpdate: (id: string, data: any) => Promise<void>;
}

export function ProductForm({ isOpen, onClose, editProduct, categories, onAdd, onUpdate }: ProductFormProps) {

    // Default values
    const defaultProduct: Partial<Product> = {
        name: "",
        category: "Coffee",
        price: 0,
        costPrice: 0,
        stock: 0,
        sku: "",
        barcode: "",
        image: "/img/gallery/coffee-cup.png",
        unit: "Món",
        description: "",
        options: []
    };

    // Form State - Initialized directly from props because we use 'key' to remount
    const [formData, setFormData] = useState<Partial<Product>>(editProduct || defaultProduct);
    const [options, setOptions] = useState<ProductOption[]>(() => {
        if (!editProduct?.options) return [];
        return Array.isArray(editProduct.options) 
            ? editProduct.options 
            : JSON.parse(editProduct.options as any);
    });

    const handleAddOption = () => {
        setOptions([
            ...options,
            {
                id: `opt_${Date.now()}`,
                name: "",
                type: "single",
                required: false,
                multiple: false,
                values: [{ id: `val_${Date.now()}`, name: "", price: 0 }]
            }
        ]);
    };

    const handleRemoveOption = (index: number) => {
        const newOptions = [...options];
        newOptions.splice(index, 1);
        setOptions(newOptions);
    };

    const handleOptionChange = (index: number, field: keyof ProductOption, value: string | boolean) => {
        const newOptions = [...options];
        newOptions[index] = { ...newOptions[index], [field]: value } as ProductOption;
        setOptions(newOptions);
    };

    const handleAddValue = (optionIndex: number) => {
        const newOptions = [...options];
        newOptions[optionIndex].values.push({ id: `val_${Date.now()}`, name: "", price: 0 });
        setOptions(newOptions);
    };

    const handleRemoveValue = (optionIndex: number, valueIndex: number) => {
        const newOptions = [...options];
        newOptions[optionIndex].values.splice(valueIndex, 1);
        setOptions(newOptions);
    };

    const handleValueChange = (optionIndex: number, valueIndex: number, field: keyof OptionValue, value: string | number) => {
        const newOptions = [...options];
        newOptions[optionIndex].values[valueIndex] = { ...newOptions[optionIndex].values[valueIndex], [field]: value } as OptionValue;
        setOptions(newOptions);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name || !formData.price || !formData.category) return;

        const cleanedOptions = options.filter(opt => opt.name.trim()).map(opt => ({
            ...opt,
            values: opt.values.filter(v => v.name.trim())
        }));

        const productData = { ...formData, options: cleanedOptions };

        if (editProduct) {
            await onUpdate(editProduct.id, productData);
        } else {
            // Remove id from productData if it exists (though it shouldn't for new products)
            const { id: _id, ...newProductData } = productData as any;
            await onAdd(newProductData);
        }
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, y: 50, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-3xl rounded-3xl shadow-2xl overflow-hidden border border-white/20 flex flex-col max-h-[90vh]"
            >
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-secondary/30">
                    <div>
                        <h3 className="font-bold text-xl">{editProduct ? "Chỉnh sửa Sản phẩm" : "Thêm Sản phẩm mới"}</h3>
                        <p className="text-sm text-muted-foreground p-1">Điền đầy đủ thông tin chi tiết.</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={24} />
                    </button>
                </div>

                <div className="overflow-y-auto flex-1 p-8">
                    <form id="product-form" onSubmit={handleSubmit} className="space-y-8">
                        <div className="flex gap-8">
                            <div className="w-1/3 space-y-4">
                                <label className="text-sm font-medium text-muted-foreground block">Hình ảnh</label>
                                <div className="aspect-square bg-secondary/50 rounded-2xl overflow-hidden border-2 border-dashed border-black/10 flex items-center justify-center relative group hover:border-primary/50 transition-colors">
                                    {formData.image ? (
                                        <div className="relative w-full h-full">
                                            <Image
                                                src={formData.image}
                                                alt={formData.name || "Product Image"}
                                                fill
                                                className="object-cover"
                                                unoptimized
                                            />
                                        </div>
                                    ) : (
                                        <Upload className="text-muted-foreground w-8 h-8" />
                                    )}
                                </div>
                                <div>
                                    <label className="text-xs font-medium text-muted-foreground mb-1 block">URL Hình ảnh</label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 rounded-lg border border-black/10 text-xs focus:outline-none focus:ring-2 focus:ring-primary/50"
                                        placeholder="https://..."
                                        value={formData.image || ""}
                                        onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                    />
                                </div>
                            </div>

                            <div className="flex-1 space-y-4">
                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Tên sản phẩm *</label>
                                    <input
                                        required
                                        type="text"
                                        className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20"
                                        value={formData.name || ""}
                                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                        placeholder="VD: Cà phê sữa đá"
                                    />
                                </div>

                                <div>
                                    <label className="text-sm font-medium text-muted-foreground mb-1 block">Danh mục *</label>
                                    <div className="relative">
                                        <Layers className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                        <select
                                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20 appearance-none"
                                            value={formData.category || "Coffee"}
                                            onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                        >
                                            {categories.filter(c => c.id !== 'cat_all').map(c => (
                                                <option key={c.id} value={c.name}>{c.name}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Giá bán *</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₫</span>
                                            <input
                                                required
                                                type="number"
                                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20 font-semibold text-primary"
                                                value={formData.price || 0}
                                                onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Giá vốn</label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">₫</span>
                                            <input
                                                type="number"
                                                className="w-full pl-8 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20"
                                                value={formData.costPrice || 0}
                                                onChange={(e) => setFormData({ ...formData, costPrice: Number(e.target.value) })}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-span-2">
                                        <label className="text-sm font-medium text-muted-foreground mb-1 block">Đơn vị tính (VD: Lon, Chai, Ly, Món)</label>
                                        <input
                                            type="text"
                                            className="w-full px-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20"
                                            placeholder="Lon, Chai, Ly..."
                                            value={formData.unit || ""}
                                            onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Options Section */}
                        <div className="pt-6 border-t border-black/5">
                            <div className="flex justify-between items-center mb-4">
                                <h4 className="font-bold text-lg">Tùy chọn (Size, Topping)</h4>
                                <button type="button" onClick={handleAddOption} className="text-sm text-primary font-bold hover:bg-primary/10 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1">
                                    <Plus size={16} /> Thêm nhóm
                                </button>
                            </div>

                            <div className="space-y-4">
                                {options.map((option, optIdx) => (
                                    <div key={optIdx} className="bg-secondary/20 p-4 rounded-2xl border border-black/5 relative group">
                                        <button type="button" onClick={() => handleRemoveOption(optIdx)} className="absolute top-2 right-2 p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive rounded-md opacity-0 group-hover:opacity-100 transition-all">
                                            <Trash2 size={16} />
                                        </button>

                                        <div className="flex gap-4 mb-3">
                                            <div className="flex-1">
                                                <input
                                                    type="text"
                                                    placeholder="Tên nhóm (VD: Size)"
                                                    className="w-full bg-white px-3 py-2 rounded-lg border border-black/10 text-sm font-bold"
                                                    value={option.name}
                                                    onChange={(e) => handleOptionChange(optIdx, 'name', e.target.value)}
                                                />
                                            </div>
                                            <div className="w-1/3">
                                                <select
                                                    className="w-full bg-white px-3 py-2 rounded-lg border border-black/10 text-sm"
                                                    value={option.type}
                                                    onChange={(e) => handleOptionChange(optIdx, 'type', e.target.value)}
                                                >
                                                    <option value="single">Chọn 1 (Radio)</option>
                                                    <option value="multiple">Chọn nhiều (Check)</option>
                                                </select>
                                            </div>
                                        </div>

                                        <div className="space-y-2 pl-4 border-l-2 border-dashed border-black/10">
                                            {option.values.map((val, valIdx) => (
                                                <div key={valIdx} className="flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        placeholder="Tên (VD: Lớn)"
                                                        className="flex-1 bg-white px-3 py-1.5 rounded-lg border border-black/10 text-sm"
                                                        value={val.name}
                                                        onChange={(e) => handleValueChange(optIdx, valIdx, 'name', e.target.value)}
                                                    />
                                                    <div className="relative w-24">
                                                        <span className="absolute left-2 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">Extra</span>
                                                        <input
                                                            type="number"
                                                            placeholder="0"
                                                            className="w-full bg-white pl-10 pr-2 py-1.5 rounded-lg border border-black/10 text-sm text-right"
                                                            value={val.price}
                                                            onChange={(e) => handleValueChange(optIdx, valIdx, 'price', Number(e.target.value))}
                                                        />
                                                    </div>
                                                    <button type="button" onClick={() => handleRemoveValue(optIdx, valIdx)} className="text-muted-foreground hover:text-destructive p-1"><X size={14} /></button>
                                                </div>
                                            ))}
                                            <button type="button" onClick={() => handleAddValue(optIdx)} className="text-xs text-primary font-medium hover:underline flex items-center gap-1 mt-2">
                                                <Plus size={12} /> Thêm lựa chọn
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {options.length === 0 && (
                                    <div className="text-center py-8 text-muted-foreground bg-secondary/10 rounded-xl border border-dashed border-black/5">
                                        Chưa có tùy chọn nào.
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Detailed Info (SKU, Stock) */}
                        <div className="grid grid-cols-3 gap-6 pt-6 border-t border-black/5">
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Mã SKU</label>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20"
                                        placeholder="AUTO"
                                        value={formData.sku || ""}
                                        onChange={(e) => setFormData({ ...formData, sku: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Barcode (Scan)</label>
                                <div className="relative">
                                    <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="text"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20"
                                        placeholder="Quét mã..."
                                        value={formData.barcode || ""}
                                        onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-muted-foreground mb-1 block">Tồn kho ban đầu</label>
                                <div className="relative">
                                    <Package className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                    <input
                                        type="number"
                                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20"
                                        value={formData.stock || 0}
                                        onChange={(e) => setFormData({ ...formData, stock: Number(e.target.value) })}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                <div className="p-6 border-t border-black/5 bg-secondary/30 flex justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-6 py-3 rounded-xl font-medium hover:bg-black/5 transition-colors"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        form="product-form"
                        type="submit"
                        className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-xl font-bold shadow-lg shadow-primary/20 transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Save size={18} />
                        {editProduct ? "Lưu thay đổi" : "Tạo sản phẩm"}
                    </button>
                </div>
            </motion.div>
        </div>
    );
}
