"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { LayoutGrid, ShoppingCart, Package, Settings, ChevronLeft, ChevronRight, LogOut, ClipboardList, Users, Coffee, TrendingUp } from "lucide-react";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/useAuthStore";
import Image from "next/image";
import { DailyReportModal } from "@/components/pos/DailyReportModal";

interface SidebarProps {
    isOpenMobile?: boolean;
    onCloseMobile?: () => void;
}

export function Sidebar({ isOpenMobile, onCloseMobile }: SidebarProps = {}) {
    const pathname = usePathname();
    const router = useRouter();
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isReportOpen, setIsReportOpen] = useState(false);
    const { user, logout, isAuthenticated } = useAuthStore();

    // Protect Routes & Redirect Logic
    useEffect(() => {
        if (!isAuthenticated && pathname !== "/login") {
            router.push("/login");
            return;
        }

        // Logic của anh: Admin KHÔNG vào bán hàng.
        // Nếu là admin và cố tình vào trang chủ (POS), đẩy sang Dashboard
        if (isAuthenticated && user?.role === 'admin' && pathname === "/") {
            router.push("/dashboard");
        }

        // Nếu là staff và cố tình vào các trang admin, đẩy về POS
        const adminPages = ["/dashboard", "/settings", "/users", "/inventory"];
        if (isAuthenticated && user?.role === 'staff' && adminPages.includes(pathname)) {
            router.push("/");
        }
    }, [isAuthenticated, user, router, pathname]);

    const handleLogout = () => {
        if (confirm("Bạn có chắc muốn đăng xuất?")) {
            logout();
            router.push("/login");
        }
    };

    if (!isAuthenticated && pathname !== "/login") return null;

    const menuItems = [
        {
            title: "Bán hàng",
            icon: ShoppingCart,
            href: "/",
            roles: ["staff"] // Admin không vào bán hàng theo yêu cầu của anh
        },
        {
            title: "Tổng quan",
            icon: LayoutGrid,
            href: "/dashboard",
            roles: ["admin"]
        },
        {
            title: "Đơn hàng",
            icon: ClipboardList,
            href: "/orders",
            roles: ["admin", "staff"]
        },
        {
            title: "Kho hàng",
            icon: Package,
            href: "/inventory",
            roles: ["admin"] // Cho admin quản lý kho thôi
        },
        {
            title: "Sản phẩm",
            icon: Coffee,
            href: "/admin/products",
            roles: ["admin"]
        },
        {
            title: "Nhân sự",
            icon: Users,
            href: "/users",
            roles: ["admin"]
        },
        {
            title: "Cấu hình",
            icon: Settings,
            href: "/settings",
            roles: ["admin"]
        },
    ];

    // Filter items based on role
    const filteredItems = menuItems.filter(item =>
        user && item.roles.includes(user.role)
    );

    return (
        <motion.aside
            initial={false}
            animate={{ 
                width: isCollapsed ? 80 : 280,
                x: (typeof window !== 'undefined' && window.innerWidth < 1024) ? (isOpenMobile ? 0 : -280) : 0
            }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className={cn(
                "h-screen bg-white border-r border-black/5 flex flex-col fixed inset-y-0 left-0 lg:static z-50 shadow-xl lg:shadow-black/5 transition-all",
                !isOpenMobile && "-translate-x-full lg:translate-x-0"
            )}
        >
            {/* Mobile Close Button */}
            <button
                onClick={onCloseMobile}
                className="lg:hidden absolute -right-12 top-6 bg-white p-3 rounded-full shadow-lg border border-black/5"
            >
                <ChevronLeft size={24} />
            </button>
            {/* Toggle Button */}
            <button
                onClick={() => setIsCollapsed(!isCollapsed)}
                className="absolute -right-3 top-8 bg-white border border-black/10 rounded-full p-1.5 hover:bg-secondary transition-colors shadow-sm z-30"
            >
                {isCollapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
            </button>

            {/* Logo Area */}
            <div className={cn("p-6 flex items-center justify-center", isCollapsed ? "mb-4" : "mb-0")}>
                <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center shadow-lg shadow-primary/30 relative overflow-hidden">
                    <Image
                        src="/logo.png"
                        alt="Logo"
                        fill
                        className="object-contain p-2"
                        unoptimized
                    />
                </div>
                {!isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="ml-3"
                    >
                        <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600">
                            Lân Coffee
                        </h1>
                        <p className="text-xs text-muted-foreground font-medium">POS System</p>
                    </motion.div>
                )}
            </div>

            {/* Navigation */}
            <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
                {filteredItems.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={cn(
                                "flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden font-medium",
                                isActive
                                    ? "bg-primary text-white shadow-lg shadow-primary/25 font-bold"
                                    : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                            )}
                        >
                            <item.icon
                                size={22}
                                className={cn("relative z-10 shrink-0", isActive ? "stroke-[2.5px]" : "stroke-2")}
                            />
                            {!isCollapsed && (
                                <span className="relative z-10 whitespace-nowrap">{item.title}</span>
                            )}
                        </Link>
                    );
                })}

                {/* Nút báo cáo doanh thu nhanh cho staff */}
                <button
                    onClick={() => setIsReportOpen(true)}
                    className={cn(
                        "w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-200 group relative overflow-hidden font-medium text-muted-foreground hover:bg-primary/10 hover:text-primary mt-4 border border-dashed border-primary/20",
                        isCollapsed && "justify-center"
                    )}
                >
                    <TrendingUp size={22} className="relative z-10 shrink-0" />
                    {!isCollapsed && <span className="relative z-10 whitespace-nowrap font-bold">Doanh thu ngày</span>}
                </button>
            </nav>

            <DailyReportModal isOpen={isReportOpen} onClose={() => setIsReportOpen(false)} />



            {/* User Profile & Logout */}
            <div className="p-4 border-t border-black/5 bg-secondary/30">
                <div className={cn("flex items-center gap-3", isCollapsed ? "justify-center" : "")}>
                    <div className="w-10 h-10 rounded-full bg-white border border-black/5 overflow-hidden shrink-0 relative">
                        <Image
                            src={user?.avatar || `https://ui-avatars.com/api/?name=${user?.name || 'User'}&background=random`}
                            alt={user?.name || "User Avatar"}
                            fill
                            className="object-cover"
                            unoptimized
                        />
                    </div>
                    {!isCollapsed && (
                        <div className="flex-1 overflow-hidden">
                            <h4 className="text-sm font-bold truncate">{user?.name || "Guest"}</h4>
                            <p className="text-xs text-muted-foreground capitalize">{user?.role || "Unknown"}</p>
                        </div>
                    )}
                    {!isCollapsed && (
                        <button
                            onClick={handleLogout}
                            className="p-2 hover:bg-destructive/10 text-muted-foreground hover:text-destructive rounded-xl transition-colors"
                            title="Đăng xuất"
                        >
                            <LogOut size={18} />
                        </button>
                    )}
                </div>
            </div>
        </motion.aside>
    );
}
