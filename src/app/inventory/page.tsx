"use client";

import type { Product } from "@/store/useProductStore";
import { useProductStore } from "@/store/useProductStore";
import { deleteProductAction, getCategories, createCategory, updateCategory, deleteCategory, createProductAction, updateProductAction, restockProductAction } from "@/app/actions/product";
import { Sidebar } from "@/components/layout/Sidebar";
import { formatCurrency, cn } from "@/lib/utils";
import { Search, Plus, Edit2, Trash2, Layers } from "lucide-react";
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import { CategoryManager } from "@/components/inventory/CategoryManager";
import { ProductForm } from "@/components/inventory/ProductForm";
import { StockImportModal } from "@/components/inventory/StockImportModal";
import Image from "next/image";

export default function InventoryPage() {
    const { products, updateStock } = useProductStore();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);

    useEffect(() => {
        const fetchCategories = async () => {
            const res = await getCategories();
            if (res.success && res.categories) {
                setCategories(res.categories);
            }
        };
        fetchCategories();
    }, []);

    const isAdmin = user?.role === 'admin';

    // Modal States
    const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
    const [isProductModalOpen, setIsProductModalOpen] = useState(false);
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);

    const filteredProducts = products.filter(p =>
        (activeCategory === "All" || p.category === activeCategory) &&
        (p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            p.category.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    const handleEditProduct = (product: Product) => {
        if (!isAdmin) return;
        setEditingProduct(product);
        setIsProductModalOpen(true);
    };

    const handleAddNew = () => {
        if (!isAdmin) return;
        setEditingProduct(null);
        setIsProductModalOpen(true);
    };

    const handleAddCategory = async (name: string) => {
        const res = await createCategory({ name });
        if (res.success && res.category) {
            setCategories([...categories, res.category]);
        }
    };

    const handleUpdateCategory = async (id: string, name: string) => {
        const res = await updateCategory({ id, name });
        if (res.success && res.category) {
            setCategories(categories.map(c => c.id === id ? res.category! : c));
        }
    };

    const handleDeleteCategory = async (id: string) => {
        const res = await deleteCategory({ id });
        if (res.success) {
            setCategories(categories.filter(c => c.id !== id));
        }
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden premium-gradient">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6 overflow-hidden">
                {/* Header */}
                <header className="flex justify-between items-center mb-8">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <h1 className="text-2xl font-bold tracking-tight">Quản lý Kho hàng</h1>
                        </div>
                        <p className="text-muted-foreground text-sm">
                            {isAdmin
                                ? "Cập nhật tồn kho, giá vốn và danh mục sản phẩm."
                                : "Xem danh sách tồn kho và thông tin sản phẩm."}
                        </p>
                    </div>

                    <div className="flex gap-3">
                        <div className="relative w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Tìm tên sản phẩm..."
                                className="w-full bg-secondary/50 border border-white/5 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/50 text-sm"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        {isAdmin && (
                            <>
                                <button
                                    onClick={() => setIsCategoryModalOpen(true)}
                                    className="bg-white hover:bg-secondary text-foreground px-4 py-2 rounded-xl flex items-center gap-2 border border-black/5 transition-all"
                                >
                                    <Layers size={18} />
                                    Danh mục
                                </button>
                                <button
                                    onClick={() => setIsImportModalOpen(true)}
                                    className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-200 transition-all active:scale-95"
                                >
                                    <Plus size={20} />
                                    Nhập hàng
                                </button>
                                <button
                                    onClick={handleAddNew}
                                    className="bg-primary hover:bg-primary/90 text-white px-4 py-2 rounded-xl flex items-center gap-2 shadow-lg shadow-primary/20 transition-all active:scale-95"
                                >
                                    <Plus size={20} />
                                    Thêm mới
                                </button>
                            </>
                        )}
                    </div>
                </header>

                {/* Inventory Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-muted-foreground text-xs mb-1 font-bold uppercase tracking-wider">Tổng sản phẩm</p>
                        <h3 className="text-2xl font-bold">{products.length}</h3>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-muted-foreground text-xs mb-1 font-bold uppercase tracking-wider">Giá trị kho (Vốn)</p>
                        <h3 className="text-2xl font-bold text-primary">
                            {isAdmin
                                ? formatCurrency(products.reduce((acc, p) => acc + (p.costPrice || 0) * p.stock, 0))
                                : "******"}
                        </h3>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-muted-foreground text-xs mb-1 font-bold uppercase tracking-wider">Cần nhập thêm</p>
                        <h3 className="text-2xl font-bold text-orange-500">
                            {products.filter(p => p.stock > 0 && p.stock <= 10).length}
                        </h3>
                    </div>
                    <div className="bg-white p-5 rounded-3xl border border-black/5 shadow-sm">
                        <p className="text-muted-foreground text-xs mb-1 font-bold uppercase tracking-wider">Hết hàng</p>
                        <h3 className="text-2xl font-bold text-destructive">
                            {products.filter(p => p.stock === 0).length}
                        </h3>
                    </div>
                </div>

                {/* Filters */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                    {categories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => setActiveCategory(cat.name)}
                            className={cn(
                                "px-4 py-1.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap",
                                activeCategory === cat.name
                                    ? "bg-primary text-white shadow-md shadow-primary/20"
                                    : "bg-white border border-black/5 hover:bg-secondary"
                            )}
                        >
                            {cat.name}
                        </button>
                    ))}
                </div>

                {/* Product Table */}
                <div className="flex-1 overflow-hidden bg-white rounded-3xl border border-black/5 shadow-sm flex flex-col">
                    <div className="overflow-y-auto flex-1">
                        <table className="w-full text-left border-collapse">
                            <thead className="sticky top-0 bg-secondary/50 backdrop-blur-md z-10">
                                <tr>
                                    <th className="p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider border-b border-black/5">Sản phẩm</th>
                                    <th className="p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider border-b border-black/5">Giá vốn</th>
                                    <th className="p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider border-b border-black/5">Giá bán</th>
                                    <th className="p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider border-b border-black/5">Tồn kho / Đơn vị</th>
                                    <th className="p-4 font-bold text-muted-foreground text-[10px] uppercase tracking-wider border-b border-black/5 text-right">Thao tác</th>
                                </tr>
                            </thead>
                            <tbody>
                                <AnimatePresence mode="popLayout">
                                    {filteredProducts.map((product) => (
                                        <motion.tr
                                            layout
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            exit={{ opacity: 0 }}
                                            key={product.id}
                                            className="group hover:bg-secondary/30 transition-colors border-b border-dashed border-black/5 last:border-0"
                                        >
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-10 h-10 rounded-lg overflow-hidden relative bg-secondary">
                                                        <Image
                                                            src={product.image}
                                                            alt={product.name}
                                                            fill
                                                            className="object-cover"
                                                            unoptimized
                                                        />
                                                    </div>
                                                    <div>
                                                        <span className="font-bold text-sm block">{product.name}</span>
                                                        <span className="text-xs text-muted-foreground">{product.category}</span>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="p-4 text-xs font-medium">
                                                {formatCurrency(product.costPrice || 0)}
                                            </td>
                                            <td className="p-4 font-bold text-sm text-primary">
                                                {formatCurrency(product.price)}
                                            </td>
                                            <td className="p-4">
                                                <div className="flex items-center gap-3">
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => updateStock(product.id, -1)}
                                                            className="w-7 h-7 rounded-md bg-white border border-black/10 flex items-center justify-center hover:bg-secondary active:scale-90 transition-all font-bold"
                                                        >
                                                            -
                                                        </button>
                                                    )}
                                                    <span className={cn(
                                                        "font-bold text-sm",
                                                        product.stock === 0 ? "text-destructive" : product.stock <= 10 ? "text-orange-400" : "text-emerald-500"
                                                    )}>
                                                        {product.stock}
                                                    </span>
                                                    <span className="text-[10px] text-muted-foreground font-mono uppercase">
                                                        {product.unit || 'món'}
                                                    </span>
                                                    {isAdmin && (
                                                        <button
                                                            onClick={() => updateStock(product.id, 1)}
                                                            className="w-7 h-7 rounded-md bg-white border border-black/10 flex items-center justify-center hover:bg-secondary active:scale-90 transition-all font-bold"
                                                        >
                                                            +
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                            {isAdmin && (
                                                <td className="p-4 text-right">
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => handleEditProduct(product)}
                                                            className="p-2 rounded-lg text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors"
                                                            title="Chỉnh sửa"
                                                        >
                                                            <Edit2 size={16} />
                                                        </button>
                                                        <button
                                                            onClick={async () => {
                                                                if (confirm("Bạn có chắc chắn muốn xóa sản phẩm này?")) {
                                                                    await deleteProductAction({ id: product.id });
                                                                }
                                                            }}
                                                            className="p-2 rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                                                            title="Xóa"
                                                        >
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            )}
                                        </motion.tr>
                                    ))}
                                </AnimatePresence>
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>

            <CategoryManager
                isOpen={isCategoryModalOpen}
                onClose={() => setIsCategoryModalOpen(false)}
                categories={categories}
                onAdd={handleAddCategory}
                onUpdate={handleUpdateCategory}
                onDelete={handleDeleteCategory}
            />

            <ProductForm
                key={isProductModalOpen ? (editingProduct?.id || 'new') : 'closed'}
                isOpen={isProductModalOpen}
                onClose={() => setIsProductModalOpen(false)}
                editProduct={editingProduct}
                categories={categories}
                onAdd={async (data) => {
                    const res = await createProductAction({ ...data, category: data.category });
                    if (res.success) {
                        // Optimistic update or refetch? RevalidatePath handles refetch on next visit, but local state update is better.
                        // Since products come from store (which is now likely stale if we don't update it), 
                        // we should probably trigger a refetch of products in store or update it.
                        // But wait, useProductStore.products is used for rendering list.
                        // I should update useProductStore.products too!
                        // But I removed addProduct from store?
                        // I can import useProductStore and use setState? Or fetchProducts action?
                        window.location.reload(); // Simplest for now since we rely on revalidatePath
                    }
                }}
                onUpdate={async (id, data) => {
                    const res = await updateProductAction({ id, data });
                    if (res.success) {
                        window.location.reload();
                    }
                }}
            />
            <StockImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                products={products}
                onImport={async (productId, quantity) => {
                    const res = await restockProductAction({ id: productId, quantity });
                    if (res.success) {
                        window.location.reload();
                    }
                }}
            />
        </div>
    );
}
