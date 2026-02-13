"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { X, Lock } from "lucide-react";

interface PinVerificationModalProps {
    isOpen: boolean;
    onClose: () => void;
    onVerify: (pin: string) => Promise<boolean>;
    title?: string;
    description?: string;
}

export function PinVerificationModal({ isOpen, onClose, onVerify, title = "Xác thực quản lý", description = "Vui lòng nhập mã PIN để tiếp tục" }: PinVerificationModalProps) {
    const [pin, setPin] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");

    if (!isOpen) return null;

    const handleNumberClick = (num: number) => {
        if (pin.length < 6) {
            setPin(prev => prev + num);
            setError("");
        }
    };

    const handleClear = () => {
        setPin("");
        setError("");
    };

    const handleBackspace = () => {
        setPin(prev => prev.slice(0, -1));
        setError("");
    };

    const handleSubmit = async () => {
        if (pin.length === 0) return;

        setIsLoading(true);
        setError("");

        try {
            const success = await onVerify(pin);
            if (success) {
                setPin("");
                onClose();
            } else {
                setError("Mã PIN không chính xác");
                setPin("");
            }
        } catch {
            setError("Lỗi xác thực");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[150] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white w-full max-w-sm rounded-[2rem] shadow-2xl overflow-hidden"
            >
                <div className="p-6 text-center border-b border-black/5 bg-secondary/20">
                    <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4 text-primary">
                        <Lock size={24} />
                    </div>
                    <h3 className="text-xl font-bold">{title}</h3>
                    <p className="text-sm text-muted-foreground mt-1">{description}</p>
                </div>

                <div className="p-6">
                    <div className="flex justify-center gap-2 mb-8">
                        {[...Array(6)].map((_, i) => (
                            <div
                                key={i}
                                className={`w-4 h-4 rounded-full transition-all ${i < pin.length ? "bg-primary scale-110" : "bg-secondary border border-black/10"
                                    }`}
                            />
                        ))}
                    </div>

                    {error && (
                        <p className="text-center text-red-500 text-sm font-bold mb-4 animate-shake">
                            {error}
                        </p>
                    )}

                    <div className="grid grid-cols-3 gap-3">
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((num) => (
                            <button
                                key={num}
                                onClick={() => handleNumberClick(num)}
                                className="h-14 rounded-2xl bg-secondary/30 hover:bg-secondary text-xl font-bold transition-all active:scale-95"
                                disabled={isLoading}
                            >
                                {num}
                            </button>
                        ))}
                        <button
                            onClick={handleClear}
                            className="h-14 rounded-2xl bg-secondary/30 hover:bg-destructive/10 hover:text-destructive font-bold transition-all text-sm uppercase"
                            disabled={isLoading}
                        >
                            Xóa
                        </button>
                        <button
                            onClick={() => handleNumberClick(0)}
                            className="h-14 rounded-2xl bg-secondary/30 hover:bg-secondary text-xl font-bold transition-all active:scale-95"
                            disabled={isLoading}
                        >
                            0
                        </button>
                        <button
                            onClick={handleBackspace}
                            className="h-14 rounded-2xl bg-secondary/30 hover:bg-secondary flex items-center justify-center transition-all active:scale-95"
                            disabled={isLoading}
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-2 gap-3 mt-6">
                        <button
                            onClick={onClose}
                            className="py-3 rounded-xl border border-black/10 hover:bg-secondary font-bold transition-all"
                            disabled={isLoading}
                        >
                            Hủy
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={pin.length < 4 || isLoading}
                            className="py-3 rounded-xl bg-primary text-white font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isLoading ? "Đang xử lý..." : "Xác nhận"}
                        </button>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
