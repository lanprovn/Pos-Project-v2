"use client";

import { useState } from "react";
import { Plus, X, Edit2, Trash2, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

interface CategoryManagerProps {
    isOpen: boolean;
    onClose: () => void;
    categories: { id: string; name: string }[];
    onAdd: (name: string) => Promise<void>;
    onUpdate: (id: string, name: string) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function CategoryManager({ isOpen, onClose, categories, onAdd, onUpdate, onDelete }: CategoryManagerProps) {
    const [newCategory, setNewCategory] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editValue, setEditValue] = useState("");

    const handleAdd = async () => {
        if (!newCategory.trim()) return;
        await onAdd(newCategory.trim());
        setNewCategory("");
    };

    const handleUpdate = async (id: string) => {
        if (!editValue.trim()) return;
        await onUpdate(id, editValue.trim());
        setEditingId(null);
    };

    const startEdit = (id: string, name: string) => {
        setEditingId(id);
        setEditValue(name);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-md rounded-3xl shadow-2xl overflow-hidden border border-white/20"
            >
                <div className="p-6 border-b border-black/5 flex justify-between items-center bg-secondary/30">
                    <h3 className="font-bold text-lg">Quản lý Danh mục</h3>
                    <button onClick={onClose} className="p-2 hover:bg-black/5 rounded-full transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-6">
                    {/* Add New */}
                    <div className="flex gap-2 mb-6">
                        <input
                            type="text"
                            placeholder="Tên danh mục mới..."
                            className="flex-1 px-4 py-2 rounded-xl border border-black/10 focus:outline-none focus:ring-2 focus:ring-primary/50"
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                        />
                        <button
                            onClick={handleAdd}
                            disabled={!newCategory.trim()}
                            className="bg-primary text-white px-4 py-2 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors font-medium flex items-center gap-2"
                        >
                            <Plus size={18} /> Thêm
                        </button>
                    </div>

                    {/* List */}
                    <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2">
                        <AnimatePresence mode="popLayout">
                            {categories.map((cat) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    key={cat.id}
                                    className="flex items-center justify-between p-3 bg-secondary/30 rounded-xl group border border-transparent hover:border-black/5 transition-all"
                                >
                                    {editingId === cat.id ? (
                                        <div className="flex-1 flex gap-2 mr-2">
                                            <input
                                                autoFocus
                                                className="flex-1 bg-white px-2 py-1 rounded-lg border border-primary text-sm focus:outline-none"
                                                value={editValue}
                                                onChange={(e) => setEditValue(e.target.value)}
                                                onKeyDown={(e) => e.key === 'Enter' && handleUpdate(cat.id)}
                                            />
                                            <button onClick={() => handleUpdate(cat.id)} className="text-emerald-500 hover:bg-emerald-50 p-1 rounded-md">
                                                <Check size={16} />
                                            </button>
                                            <button onClick={() => setEditingId(null)} className="text-muted-foreground hover:bg-black/5 p-1 rounded-md">
                                                <X size={16} />
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <span className={cn("font-medium", cat.id === 'cat_all' && "text-muted-foreground italic")}>
                                                {cat.name}
                                            </span>
                                            {cat.id !== 'cat_all' && (
                                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button onClick={() => startEdit(cat.id, cat.name)} className="p-1.5 text-muted-foreground hover:text-primary hover:bg-white rounded-lg transition-colors">
                                                        <Edit2 size={16} />
                                                    </button>
                                                    <button onClick={async () => await onDelete(cat.id)} className="p-1.5 text-muted-foreground hover:text-destructive hover:bg-white rounded-lg transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
