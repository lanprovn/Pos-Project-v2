"use client";

import { useCartStore } from "@/store/useCartStore";
import { formatCurrency, cn } from "@/lib/utils";
import { Plus, Minus, Search, ShoppingCart, CreditCard } from "lucide-react";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import type { Product, OptionValue } from "@/store/useProductStore";
import { useProductStore } from "@/store/useProductStore";
import { useOrderStore } from "@/store/useOrderStore";
import { useSettingsStore } from "@/store/useSettingsStore";
import { PaymentModal } from "@/components/pos/PaymentModal";
import { ProductOptionsModal } from "@/components/pos/ProductOptionsModal";
import Image from "next/image";

export default function OrderPage() {
    const { items, addItem, updateQuantity, total, clearCart } = useCartStore();
    const { products } = useProductStore();
    const { addOrder } = useOrderStore();
    const { storeInfo } = useSettingsStore();

    const [searchTerm, setSearchTerm] = useState("");
    const [activeCategory, setActiveCategory] = useState("All");
    const [notification, setNotification] = useState<string | null>(null);
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedProductForOptions, setSelectedProductForOptions] = useState<Product | null>(null);

    const filteredProducts = products.filter(p =>
        (activeCategory === "All" || p.category === activeCategory) &&
        p.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const handleProductClick = (product: Product) => {
        if (product.stock <= 0) return;
        if (product.options && product.options.length > 0) {
            setSelectedProductForOptions(product);
        } else {
            addItem(product);
            showNotification(`Đã thêm ${product.name}`);
        }
    };

    const handleAddToCartFromModal = (product: Product, options: OptionValue[], quantity: number) => {
        for (let i = 0; i < quantity; i++) {
            addItem(product, options);
        }
        showNotification(`Đã thêm ${quantity} x ${product.name}`);
    };

    const showNotification = (msg: string) => {
        setNotification(msg);
        setTimeout(() => setNotification(null), 2000);
    };

    const handleCheckoutClick = () => {
        if (items.length === 0) return;
        setIsPaymentModalOpen(true);
    };

    const handlePaymentComplete = (paymentMethod: 'cash' | 'transfer') => {
        const orderData = {
            items: [...items],
            total: total(),
            subtotal: total(),
            discount: 0,
            diningOption: 'dine-in' as const,
            paymentMethod: paymentMethod,
        };
        addOrder(orderData);
        clearCart();
        setIsPaymentModalOpen(false);
        showNotification("Đặt món thành công! Vui lòng đợi trong giây lát.");
    };

    return (
        <div className="flex h-screen bg-background overflow-hidden font-sans">
            <main className="flex-1 flex flex-col p-8 overflow-hidden bg-slate-50">
                <header className="flex justify-between items-center mb-8">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/20 relative overflow-hidden">
                            <Image
                                src={storeInfo.logo || "/logo.png"}
                                alt="Logo"
                                fill
                                className="object-contain p-2"
                                unoptimized
                            />
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold tracking-tight text-slate-800">{storeInfo.name}</h1>
                            <p className="text-muted-foreground">Xin chào quý khách, chúc quý khách ngon miệng!</p>
                        </div>
                    </div>
                </header>

                <div className="flex justify-between items-center gap-4 mb-8">
                    <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                        {["All", "Coffee", "Tea", "Freeze", "Food"].map((cat) => (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className={cn(
                                    "px-8 py-3 rounded-2xl text-base font-bold transition-all shadow-sm whitespace-nowrap",
                                    activeCategory === cat
                                        ? "bg-primary text-white shadow-lg shadow-primary/30 scale-105"
                                        : "bg-white text-slate-600 hover:bg-white/80 border border-slate-100"
                                )}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>

                    <div className="relative w-80 hidden md:block">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Tìm món yêu thích..."
                            className="w-full bg-white border-none shadow-sm rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-primary/20 text-lg placeholder:text-muted-foreground/50"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto pr-2 pb-20">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                        {filteredProducts.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                whileHover={{ y: -4, scale: 1.02 }}
                                whileTap={{ scale: 0.98 }}
                                className={cn(
                                    "bg-white rounded-3xl overflow-hidden shadow-sm hover:shadow-xl transition-all cursor-pointer group border border-transparent hover:border-primary/20",
                                    product.stock === 0 && "opacity-60 grayscale cursor-not-allowed"
                                )}
                                onClick={() => handleProductClick(product)}
                            >
                                <div className="aspect-[4/3] relative overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.name}
                                        fill
                                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                                        unoptimized
                                    />
                                    {product.stock === 0 && (
                                        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
                                            <span className="text-white font-bold bg-red-500 px-4 py-1 rounded-full">Hết hàng</span>
                                        </div>
                                    )}
                                    <div className="absolute bottom-3 right-3 bg-white/90 backdrop-blur-sm p-2 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity translate-y-2 group-hover:translate-y-0 z-10">
                                        <Plus className="w-6 h-6 text-primary" />
                                    </div>
                                </div>
                                <div className="p-5">
                                    <h3 className="font-bold text-lg text-slate-800 mb-1 line-clamp-1">{product.name}</h3>
                                    <p className="text-primary font-extrabold text-xl">{formatCurrency(product.price)}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </main>

            <aside className="w-[400px] bg-white shadow-2xl z-20 flex flex-col border-l border-slate-100">
                <div className="p-6 bg-primary text-white flex items-center justify-between shadow-lg shadow-primary/10 z-10">
                    <h2 className="text-2xl font-bold flex items-center gap-3">
                        <ShoppingCart className="w-6 h-6" />
                        Giỏ hàng
                    </h2>
                    <span className="bg-white/20 px-3 py-1 rounded-full font-bold">{items.reduce((a, b) => a + b.quantity, 0)} món</span>
                </div>

                <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
                    <AnimatePresence mode="popLayout">
                        {items.length === 0 ? (
                            <div className="h-full flex flex-col items-center justify-center text-muted-foreground/50 space-y-4">
                                <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center">
                                    <ShoppingCart className="w-10 h-10" />
                                </div>
                                <p className="text-lg font-medium">Bạn chưa chọn món nào</p>
                            </div>
                        ) : (
                            items.map((item) => (
                                <motion.div
                                    layout
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    key={item.cartId}
                                    className="flex gap-4 p-4 bg-slate-50 rounded-2xl border border-slate-100"
                                >
                                    <div className="w-20 h-20 rounded-xl overflow-hidden relative shadow-sm bg-white shrink-0">
                                        <Image
                                            src={item.image || "/placeholder.png"}
                                            alt={item.name}
                                            fill
                                            className="object-cover"
                                            unoptimized
                                        />
                                    </div>
                                    <div className="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h4 className="font-bold text-slate-800 line-clamp-1">{item.name}</h4>
                                            {item.selectedOptions && item.selectedOptions.length > 0 && (
                                                <p className="text-xs text-muted-foreground mt-1">
                                                    {item.selectedOptions.map(o => o.name).join(", ")}
                                                </p>
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between mt-2">
                                            <p className="text-primary font-bold">{formatCurrency(item.price)}</p>

                                            <div className="flex items-center gap-3 bg-white rounded-lg p-1 shadow-sm border border-slate-100">
                                                <button onClick={() => updateQuantity(item.cartId, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"><Minus size={14} /></button>
                                                <span className="text-sm font-bold w-4 text-center">{item.quantity}</span>
                                                <button onClick={() => updateQuantity(item.cartId, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center rounded-md hover:bg-slate-100 text-slate-600"><Plus size={14} /></button>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </AnimatePresence>
                </div>

                <div className="p-6 bg-slate-50 border-t border-slate-100">
                    <div className="space-y-3 mb-6">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Tạm tính</span>
                            <span>{formatCurrency(total())}</span>
                        </div>
                        <div className="flex justify-between text-2xl font-bold text-slate-800 pt-4 border-t border-slate-200">
                            <span>Tổng tiền</span>
                            <span className="text-primary">{formatCurrency(total())}</span>
                        </div>
                    </div>

                    <button
                        onClick={handleCheckoutClick}
                        disabled={items.length === 0}
                        className="w-full bg-primary hover:bg-primary/90 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold py-5 rounded-2xl text-xl shadow-lg shadow-primary/25 transition-all active:scale-[0.98] flex items-center justify-center gap-3"
                    >
                        <CreditCard className="w-6 h-6" />
                        Đặt món ngay
                    </button>
                    <p className="text-center text-xs text-muted-foreground mt-4">Vui lòng kiểm tra kỹ món trước khi đặt</p>
                </div>
            </aside>

            <ProductOptionsModal
                isOpen={!!selectedProductForOptions}
                onClose={() => setSelectedProductForOptions(null)}
                product={selectedProductForOptions}
                onAddToCart={handleAddToCartFromModal}
            />

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                subtotal={total()}
                discount={0}
                totalAmount={total()}
                onComplete={handlePaymentComplete}
                mode="kiosk"
            />

            <AnimatePresence>
                {notification && (
                    <motion.div
                        initial={{ opacity: 0, y: 50, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-md text-white px-8 py-4 rounded-full shadow-2xl z-50 flex items-center gap-3"
                    >
                        <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                            <ShoppingCart className="w-4 h-4 text-white" />
                        </div>
                        <span className="font-bold text-lg">{notification}</span>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
