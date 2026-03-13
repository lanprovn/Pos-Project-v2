"use client";

import { useState, useEffect, useRef } from "react";
import { createProductAction, updateProductAction } from "@/app/actions/product";
import { uploadImageAction } from "@/app/actions/upload";
import Image from "next/image";
import { Loader2, Upload, X } from "lucide-react";

import type { Product } from "@/types/product";

interface ProductFormProps {
    isOpen: boolean;
    onClose: () => void;
    productToEdit?: Product;
    onSuccess: () => void;
}

const CATEGORIES = ["Coffee", "Tea", "Freeze", "Food", "Other"];

export default function ProductForm({ isOpen, onClose, productToEdit, onSuccess }: ProductFormProps) {
    const [isLoading, setIsLoading] = useState(false);
    const [previewImage, setPreviewImage] = useState<string | null>(null);
    const [formData, setFormData] = useState({
        name: "",
        price: "",
        category: "Coffee",
        stock: "",
        description: "",
    });
    const [imageFile, setImageFile] = useState<File | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (productToEdit) {
            setFormData({
                name: productToEdit.name,
                price: productToEdit.price.toString(),
                category: productToEdit.category,
                stock: productToEdit.stock.toString(),
                description: productToEdit.description || "",
            });
            setPreviewImage(productToEdit.image);
        } else {
            resetForm();
        }
    }, [productToEdit, isOpen]);

    const resetForm = () => {
        setFormData({ name: "", price: "", category: "Coffee", stock: "", description: "" });
        setPreviewImage(null);
        setImageFile(null);
        if (fileInputRef.current) fileInputRef.current.value = "";
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            setImageFile(file);
            setPreviewImage(URL.createObjectURL(file));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            // Handle Image Upload
            let imageUrl = productToEdit?.image || "";

            if (imageFile) {
                const uploadData = new FormData();
                uploadData.append("file", imageFile);
                const uploadRes = await uploadImageAction(uploadData) as { success: boolean; url?: string; message?: string };
                if (uploadRes.success && uploadRes.url) {
                    imageUrl = uploadRes.url;
                } else {
                    alert("Lỗi upload ảnh: " + (uploadRes.message || "Unknown error"));
                    setIsLoading(false);
                    return;
                }
            }

            const payload = {
                name: formData.name,
                price: parseFloat(formData.price),
                category: formData.category,
                stock: parseInt(formData.stock),
                description: formData.description,
                image: imageUrl
            };

            let result;
            if (productToEdit) {
                result = await updateProductAction({ id: productToEdit.id, data: payload });
            } else {
                result = await createProductAction(payload);
            }

            if (result.success) {
                onSuccess();
                onClose();
            } else {
                const err = result as { success: false; error: string };
                alert("Lỗi: " + err.error);
            }
        } catch (err: unknown) {
            console.error(err);
            alert("Đã có lỗi xảy ra");
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-in fade-in zoom-in duration-200">
                <div className="p-6 border-b border-black/5 flex items-center justify-between sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">{productToEdit ? "Sửa món" : "Thêm món mới"}</h2>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Image Upload Section */}
                    <div className="flex justify-center">
                        <div className="relative group cursor-pointer w-40 h-40 rounded-2xl border-2 border-dashed border-gray-300 hover:border-primary transition-colors flex items-center justify-center overflow-hidden bg-gray-50">
                            <input
                                type="file"
                                ref={fileInputRef}
                                accept="image/*"
                                onChange={handleImageChange}
                                className="absolute inset-0 opacity-0 cursor-pointer z-20"
                            />
                            {previewImage ? (
                                <div className="relative w-full h-full">
                                    <Image src={previewImage} alt="Preview" fill className="object-cover" unoptimized />
                                </div>
                            ) : (
                                <div className="text-center p-4">
                                    <Upload className="mx-auto text-gray-400 mb-2 group-hover:text-primary transition-colors" />
                                    <span className="text-xs text-gray-500 font-medium">Tải ảnh lên</span>
                                </div>
                            )}
                            {previewImage && (
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                    <span className="text-white text-xs font-bold bg-black/50 px-3 py-1 rounded-full backdrop-blur-md">Đổi ảnh</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tên món</label>
                            <input
                                type="text"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium"
                                placeholder="VD: Cà phê sữa đá"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Danh mục</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium appearance-none bg-no-repeat bg-[right_1rem_center] bg-white text-gray-700"
                                style={{
                                    backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`,
                                    backgroundSize: "1.5em 1.5em"
                                }}
                            >
                                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                            </select>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Giá bán (VNĐ)</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.price}
                                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium font-mono"
                                placeholder="0"
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-semibold text-gray-700">Tồn kho</label>
                            <input
                                type="number"
                                required
                                min="0"
                                value={formData.stock}
                                onChange={(e) => setFormData({ ...formData, stock: e.target.value })}
                                className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium font-mono"
                                placeholder="100"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-gray-700">Mô tả</label>
                        <textarea
                            rows={3}
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all font-medium resize-none"
                            placeholder="Mô tả chi tiết về món ăn..."
                        />
                    </div>
                </form>

                <div className="p-6 border-t border-black/5 bg-gray-50/50 flex justify-end gap-3 sticky bottom-0 rounded-b-3xl">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isLoading}
                        className="px-6 py-2.5 rounded-xl font-semibold text-gray-600 hover:bg-white hover:shadow-sm border border-transparent hover:border-gray-200 transition-all"
                    >
                        Hủy bỏ
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading}
                        onClick={handleSubmit}
                        className="px-8 py-2.5 rounded-xl font-bold text-white bg-primary hover:bg-primary/90 shadow-lg shadow-primary/30 active:scale-95 transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {isLoading && <Loader2 size={18} className="animate-spin" />}
                        {productToEdit ? "Lưu thay đổi" : "Thêm mới"}
                    </button>
                </div>
            </div>
        </div>
    );
}
