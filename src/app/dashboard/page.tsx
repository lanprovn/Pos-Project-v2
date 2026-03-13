"use client";

import { useOrderStore, type Order } from "@/store/useOrderStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { RevenueChart } from "@/components/ui/charts/RevenueChart";
import { formatCurrency } from "@/lib/utils";
import { ShoppingBag, DollarSign, Calendar, TrendingUp, Users, Package } from "lucide-react";
import { useMemo, useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useAuthStore, type User } from "@/store/useAuthStore";
import { useRouter } from "next/navigation";
import { useProductStore, type Product } from "@/store/useProductStore";
import Image from "next/image";
import { getOrders } from "@/app/actions/order";
import { getProducts } from "@/app/actions/product";
import { getUsers } from "@/app/actions/auth";

export default function DashboardPage() {
    const { orders, setOrders } = useOrderStore();
    const { user } = useAuthStore();
    const { products, setProducts } = useProductStore();
    const [staffList, setStaffList] = useState<User[]>([]);
    const router = useRouter();

    useEffect(() => {
        if (!user || user.role !== 'admin') {
            router.push("/");
            return;
        }

        const hydrate = async () => {
            const [orderRes, prodRes, userRes] = await Promise.all([
                getOrders(1000), // Get enough for stats
                getProducts(),
                getUsers()
            ]);

            if (orderRes.success) setOrders(orderRes.orders as unknown as Order[]);
            if (prodRes.success && prodRes.products) {
                setProducts(prodRes.products as unknown as Product[]);
            }
            if (userRes.success) setStaffList((userRes.users as any[]).map(u => ({ ...u, createdAt: new Date(u.createdAt).toISOString() })) as User[]);
        };
        hydrate();
    }, [user, router, setOrders, setProducts]);

    const stats = useMemo(() => {
        if (!user || user.role !== 'admin') {
            return { todayRevenue: 0, monthRevenue: 0, todayOrdersCount: 0, chartData: [], topProducts: [] };
        }

        const today = new Date().toISOString().split('T')[0];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        const completedOrders = orders.filter(o => o.status === 'completed');

        // Revenue today
        const todayOrders = completedOrders.filter(o => o.date.startsWith(today));
        const todayRevenue = todayOrders.reduce((acc, curr) => acc + curr.total, 0);

        // Revenue this month
        const monthOrders = completedOrders.filter(o => {
            const d = new Date(o.date);
            return d.getMonth() === currentMonth && d.getFullYear() === currentYear;
        });
        const monthRevenue = monthOrders.reduce((acc, curr) => acc + curr.total, 0);

        // Chart Data (7 days)
        const chartData = [];
        for (let i = 6; i >= 0; i--) {
            const d = new Date();
            d.setDate(d.getDate() - i);
            const dateStr = d.toISOString().split('T')[0];
            const dayName = d.toLocaleDateString('vi-VN', { weekday: 'short' });
            const dayRevenue = completedOrders
                .filter(o => o.date.startsWith(dateStr))
                .reduce((acc, curr) => acc + curr.total, 0);
            chartData.push({ name: dayName, total: dayRevenue });
        }

        // Top Products calculation
        const productSales: Record<string, { name: string, quantity: number, total: number }> = {};
        completedOrders.forEach(order => {
            order.items.forEach(item => {
                const name = item.name;
                if (!productSales[name]) {
                    productSales[name] = { name, quantity: 0, total: 0 };
                }
                productSales[name].quantity += item.quantity;
                productSales[name].total += item.price * item.quantity;
            });
        });

        const topProducts = Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);

        return { todayRevenue, monthRevenue, todayOrdersCount: todayOrders.length, chartData, topProducts };
    }, [orders, user]);

    if (!user || user.role !== 'admin') return null;

    return (
        <div className="flex h-screen bg-background overflow-hidden premium-gradient">
            <Sidebar />

            <main className="flex-1 flex flex-col p-6 overflow-hidden overflow-y-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold tracking-tight">Trung tâm Quản trị</h1>
                        <p className="text-muted-foreground text-sm">Chào mừng anh Lân, hệ thống đang vận hành ổn định.</p>
                    </div>
                    <div className="bg-white/50 backdrop-blur-sm border border-black/5 rounded-2xl px-4 py-2 flex items-center gap-3">
                        <div className="flex -space-x-2">
                            {staffList.slice(0, 3).map((u) => (
                                <div key={u.id} className="w-8 h-8 rounded-full border-2 border-white bg-slate-200 overflow-hidden relative">
                                    <Image
                                        src={u.avatar || `https://ui-avatars.com/api/?name=${u.name}`}
                                        alt={u.name}
                                        fill
                                        className="object-cover"
                                        unoptimized
                                    />
                                </div>
                            ))}
                        </div>
                        <span className="text-xs font-bold text-slate-600">
                            {staffList.filter(s => s.role === 'staff' && s.status === 'active').length} Nhân viên đang hoạt động
                        </span>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                    {/* Stat Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm relative overflow-hidden group"
                    >
                        <div className="p-3 bg-primary/10 w-fit rounded-xl mb-4 text-primary">
                            <DollarSign size={24} />
                        </div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Doanh thu hôm nay</p>
                        <h3 className="text-2xl font-bold tracking-tight mb-2">{formatCurrency(stats.todayRevenue)}</h3>
                        <div className="text-slate-400 text-xs font-medium">{stats.todayOrdersCount} đơn hàng</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm relative overflow-hidden group"
                    >
                        <div className="p-3 bg-blue-500/10 w-fit rounded-xl mb-4 text-blue-500">
                            <Calendar size={24} />
                        </div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Doanh thu tháng</p>
                        <h3 className="text-2xl font-bold tracking-tight mb-2">{formatCurrency(stats.monthRevenue)}</h3>
                        <div className="text-slate-400 text-xs font-medium">Tháng {new Date().getMonth() + 1}</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm relative overflow-hidden group"
                    >
                        <div className="p-3 bg-purple-500/10 w-fit rounded-xl mb-4 text-purple-500">
                            <Users size={24} />
                        </div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Tổng nhân sự</p>
                        <h3 className="text-2xl font-bold tracking-tight mb-2">{staffList.length}</h3>
                        <div className="text-slate-400 text-xs font-medium">Admin & Staff</div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-white p-6 rounded-3xl border border-black/5 shadow-sm relative overflow-hidden group"
                    >
                        <div className="p-3 bg-orange-500/10 w-fit rounded-xl mb-4 text-orange-500">
                            <Package size={24} />
                        </div>
                        <p className="text-muted-foreground text-xs font-bold uppercase tracking-wider mb-1">Kho hàng</p>
                        <h3 className="text-2xl font-bold tracking-tight mb-2">{products.length}</h3>
                        <div className="text-orange-500 text-xs font-bold">{products.filter(p => p.stock < 10).length} món sắp hết</div>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8 flex-1">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="lg:col-span-2 bg-white p-8 rounded-3xl border border-black/5 shadow-sm flex flex-col"
                    >
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <TrendingUp className="text-emerald-500" />
                                    Biểu đồ Doanh thu
                                </h3>
                                <p className="text-sm text-muted-foreground">Phân tích dòng tiền 7 ngày gần nhất</p>
                            </div>
                        </div>
                        <div className="flex-1 w-full min-h-[300px]">
                            <RevenueChart data={stats.chartData} />
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="bg-white p-8 rounded-3xl border border-black/5 shadow-sm flex flex-col"
                    >
                        <div className="mb-8 overflow-hidden">
                            <h3 className="text-lg font-bold">Món bán chạy nhất</h3>
                            <p className="text-sm text-muted-foreground">TOP 5 sản phẩm theo số lượng</p>
                        </div>

                        <div className="space-y-6 flex-1">
                            {stats.topProducts.map((p, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className="w-8 h-8 rounded-lg bg-secondary flex items-center justify-center font-bold text-slate-500 text-sm shrink-0">
                                        #{idx + 1}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate">{p.name}</p>
                                        <div className="w-full bg-secondary h-1.5 rounded-full mt-2 overflow-hidden">
                                            <div
                                                className="bg-primary h-full rounded-full"
                                                style={{ width: `${stats.topProducts[0].quantity > 0 ? (p.quantity / stats.topProducts[0].quantity) * 100 : 0}%` }}
                                            />
                                        </div>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <span className="text-sm font-bold">{p.quantity}</span>
                                        <p className="text-[10px] text-muted-foreground uppercase font-bold">Lượt bán</p>
                                    </div>
                                </div>
                            ))}
                            {stats.topProducts.length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-muted-foreground text-sm italic py-12">
                                    <ShoppingBag size={40} className="mb-2 opacity-20" />
                                    Chưa có dữ liệu bán hàng.
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            </main>
        </div>
    );
}
