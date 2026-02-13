"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore, mockLogin } from "@/store/useAuthStore";
import { Coffee, Lock, User, Loader2, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/store/useSettingsStore";

export default function LoginPage() {
    const router = useRouter();
    const { login } = useAuthStore();
    const { storeInfo } = useSettingsStore();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError(null);

        try {
            const result = await mockLogin(username, password);

            if (result.success && result.user) {
                login(result.user);
                router.push("/");
            } else {
                setError(result.error || "Đăng nhập thất bại");
            }
        } catch {
            setError("Đã có lỗi xảy ra. Vui lòng thử lại.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background Decoration */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[100px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-black/5 relative z-10"
            >
                {/* Header */}
                <div className="p-8 text-center bg-secondary/30 border-b border-black/5">
                    <div className="w-16 h-16 bg-white rounded-2xl shadow-lg flex items-center justify-center mx-auto mb-4">
                        <Coffee className="w-8 h-8 text-primary" />
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        {storeInfo.name}
                    </h1>
                    <p className="text-sm text-muted-foreground mt-2">Đăng nhập để bắt đầu bán hàng</p>
                </div>

                {/* Form */}
                <div className="p-8">
                    <form onSubmit={handleLogin} className="space-y-6">
                        <AnimatePresence>
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="bg-destructive/10 text-destructive text-sm px-4 py-3 rounded-xl flex items-center gap-2"
                                >
                                    <AlertCircle size={16} />
                                    {error}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Tài khoản</label>
                            <div className="relative">
                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <input
                                    type="text"
                                    required
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    placeholder="Nhập tên đăng nhập"
                                    className="w-full bg-secondary/30 border border-black/5 focus:bg-white rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-sm font-medium text-muted-foreground ml-1">Mật khẩu</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground w-5 h-5" />
                                <input
                                    type="password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Nhập mật khẩu"
                                    className="w-full bg-secondary/30 border border-black/5 focus:bg-white rounded-xl py-3 pl-12 pr-4 outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-4 rounded-xl shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {isLoading ? <Loader2 className="animate-spin w-5 h-5" /> : "Đăng Nhập"}
                        </button>
                    </form>
                </div>

                {/* Footer Mock Info */}
                <div className="p-4 bg-secondary/50 text-center text-xs text-muted-foreground border-t border-black/5">
                    <p>Tài khoản mẫu:</p>
                    <div className="flex justify-center gap-4 mt-1 font-mono">
                        <span>admin / admin123</span>
                        <span>staff / staff123</span>
                    </div>
                </div>
            </motion.div>
        </div>
    );
}
