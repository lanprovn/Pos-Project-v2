"use client";

import { useState, useEffect } from "react";
import { ProductTable } from "@/components/admin/ProductTable";
import ProductForm from "@/components/admin/ProductForm";
import { Plus, Search } from "lucide-react";
import { deleteProductAction } from "@/app/actions/product";
import { useRouter } from "next/navigation";

interface Product {
    id: string;
    name: string;
    price: number;
    categoryName: string;
    image: string;
    stock: number;
    description?: string;
}

export default function ProductManagement({ initialProducts }: { initialProducts: Product[] }) {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>(initialProducts);

    useEffect(() => {
        setProducts(initialProducts);
    }, [initialProducts]);
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState<Product | undefined>(undefined);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("All");

    // Filter products client-side for instant feedback
    const filteredProducts = products.filter(product => {
        const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === "All" || product.categoryName === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleAdd = () => {
        setEditingProduct(undefined);
        setIsFormOpen(true);
    };

    const handleEdit = (product: Product) => {
        setEditingProduct(product);
        setIsFormOpen(true);
    };

    const handleDelete = async (id: string) => {
        const result = await deleteProductAction(id);
        if (result.success) {
            // Optimistic update
            setProducts(products.filter(p => p.id !== id));
            router.refresh();
        } else {
            alert("Xóa thất bại: " + result.error);
        }
    };

    const handleSuccess = () => {
        router.refresh(); // Refresh server data
        // We could also re-fetch or update local state if we returned the new product from server action
    };

    const CATEGORIES = ["All", "Coffee", "Tea", "Freeze", "Food", "Other"];

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Quản lý món</h1>
                    <p className="text-muted-foreground mt-1">Danh sách thực đơn và quản lý kho hàng</p>
                </div>
                <button
                    onClick={handleAdd}
                    className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-2xl font-bold shadow-lg shadow-primary/30 hover:bg-primary/90 hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={20} strokeWidth={2.5} />
                    <span>Thêm món mới</span>
                </button>
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 bg-white p-4 rounded-3xl border border-black/5 shadow-sm">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input
                        type="text"
                        placeholder="Tìm kiếm món ăn..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-3 rounded-xl bg-gray-50 border-transparent focus:bg-white focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                    />
                </div>
                <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0">
                    {CATEGORIES.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setSelectedCategory(cat)}
                            className={`px-4 py-2.5 rounded-xl font-semibold whitespace-nowrap transition-all ${selectedCategory === cat
                                ? "bg-black text-white shadow-md"
                                : "bg-gray-50 text-gray-600 hover:bg-gray-100"
                                }`}
                        >
                            {cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Table */}
            <ProductTable
                products={filteredProducts}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            {/* Modal */}
            <ProductForm
                isOpen={isFormOpen}
                onClose={() => setIsFormOpen(false)}
                productToEdit={editingProduct}
                onSuccess={handleSuccess}
            />
        </div>
    );
}
