"use client";

import { useState } from "react";
import type { Product } from "@/store/useProductStore";
import { X, PackagePlus, Save, Search } from "lucide-react";
import { motion } from "framer-motion";

interface StockImportModalProps {
    isOpen: boolean;
    onClose: () => void;
    products: Product[];
    onImport: (productId: string, quantity: number) => Promise<void>;
}

export function StockImportModal({ isOpen, onClose, products, onImport }: StockImportModalProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedProductId, setSelectedProductId] = useState<string>("");
    const [importQuantity, setImportQuantity] = useState<number>(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.category.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedProductId || importQuantity <= 0) return;

        setIsSubmitting(true);
        try {
            await onImport(selectedProductId, importQuantity);
            setSelectedProductId("");
            setImportQuantity(0);
            onClose();
        } catch (error) {
            console.error("Lỗi khi nhập hàng:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const selectedProduct = products.find(p => p.id === selectedProductId);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: 20 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-primary/5">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                            <PackagePlus size={24} />
                        </div>
                        <div>
                            <h3 className="font-bold text-xl">Nhập hàng</h3>
                            <p className="text-xs text-muted-foreground">Cập nhật số lượng tồn kho mới.</p>
                        </div>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors text-muted-foreground">
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    <div>
                        <label className="text-sm font-bold text-foreground mb-2 block">1. Chọn sản phẩm</label>
                        <div className="relative mb-2">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm nhanh sản phẩm..."
                                className="w-full bg-secondary/30 border border-black/5 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="max-h-48 overflow-y-auto border border-black/5 rounded-xl bg-secondary/10">
                            {filteredProducts.map(product => (
                                <button
                                    key={product.id}
                                    type="button"
                                    onClick={() => setSelectedProductId(product.id)}
                                    className={`w-full text-left p-3 flex justify-between items-center hover:bg-white transition-colors border-b border-black/5 last:border-0 ${selectedProductId === product.id ? 'bg-white ring-2 ring-primary ring-inset' : ''}`}
                                >
                                    <div>
                                        <p className="font-bold text-sm">{product.name}</p>
                                        <p className="text-[10px] text-muted-foreground uppercase">{product.category}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs font-medium">Hiện có: <span className="text-primary">{product.stock}</span></p>
                                        <p className="text-[10px] text-muted-foreground">{product.unit || 'Món'}</p>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {selectedProductId && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="space-y-4 pt-4 border-t border-dashed border-black/10"
                        >
                            <div>
                                <label className="text-sm font-bold text-foreground mb-2 block">
                                    2. Số lượng nhập ({selectedProduct?.unit || 'Món'})
                                </label>
                                <input
                                    required
                                    type="number"
                                    min="1"
                                    className="w-full px-4 py-3 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50 bg-secondary/20 font-bold text-lg text-primary"
                                    placeholder="Nhập số lượng..."
                                    value={importQuantity || ""}
                                    onChange={(e) => setImportQuantity(Number(e.target.value))}
                                />
                                {selectedProduct && importQuantity > 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Sau khi nhập: <span className="font-bold text-foreground">{selectedProduct.stock + importQuantity}</span> {selectedProduct.unit || 'Món'}
                                    </p>
                                )}
                            </div>
                        </motion.div>
                    )}

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={!selectedProductId || importQuantity <= 0 || isSubmitting}
                            className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95 ${!selectedProductId || importQuantity <= 0 ? 'bg-secondary text-muted-foreground cursor-not-allowed' : 'bg-primary text-white shadow-primary/20 hover:bg-primary/90'}`}
                        >
                            {isSubmitting ? (
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    <Save size={20} />
                                    Xác nhận nhập kho
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    );
}
