"use client";

import React from "react";
import { formatCurrency, cn } from "@/lib/utils";
import Image from "next/image";
import { Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface Product {
    id: string;
    name: string;
    price: number;
    categoryName: string;
    image: string;
    stock: number;
}

interface ProductTableProps {
    products: Product[];
    onEdit: (product: Product) => void;
    onDelete: (id: string) => void;
}

export function ProductTable({ products, onEdit, onDelete }: ProductTableProps) {
    if (products.length === 0) {
        return (
            <div className="text-center py-20 bg-white rounded-3xl border border-black/5 shadow-sm">
                <p className="text-muted-foreground">Chưa có sản phẩm nào. Hãy thêm mới!</p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-3xl border border-black/5 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full">
                    <thead className="bg-gray-50/50 border-b border-black/5">
                        <tr>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Hình ảnh</th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tên sản phẩm</th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Danh mục</th>
                            <th className="py-4 px-6 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wider">Giá bán</th>
                            <th className="py-4 px-6 text-center text-xs font-semibold text-muted-foreground uppercase tracking-wider">Tồn kho</th>
                            <th className="py-4 px-6 text-right text-xs font-semibold text-muted-foreground uppercase tracking-wider">Thao tác</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-black/5">
                        {products.map((product) => (
                            <motion.tr
                                key={product.id}
                                layoutId={`product-${product.id}`}
                                className="group hover:bg-gray-50/50 transition-colors"
                            >
                                <td className="py-4 px-6">
                                    <div className="relative w-12 h-12 rounded-xl overflow-hidden border border-black/5">
                                        <Image
                                            src={product.image}
                                            alt={product.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="font-semibold text-foreground">{product.name}</span>
                                </td>
                                <td className="py-4 px-6">
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-50 text-blue-700">
                                        {product.categoryName}
                                    </span>
                                </td>
                                <td className="py-4 px-6 font-medium font-mono text-primary">
                                    {formatCurrency(product.price)}
                                </td>
                                <td className="py-4 px-6 text-center">
                                    <span className={cn(
                                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                                        product.stock > 10 ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
                                    )}>
                                        {product.stock}
                                    </span>
                                </td>
                                <td className="py-4 px-6 text-right">
                                    <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => onEdit(product)}
                                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                            title="Sửa"
                                        >
                                            <Edit size={18} />
                                        </button>
                                        <button
                                            onClick={() => {
                                                if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
                                                    onDelete(product.id);
                                                }
                                            }}
                                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Xóa"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </td>
                            </motion.tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
