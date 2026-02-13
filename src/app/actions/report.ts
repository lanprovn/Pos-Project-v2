"use server";
import { prisma } from "@/lib/prisma";

interface CartItem {
    id?: string;
    productId?: string;
    name?: string;
    price: number;
    quantity: number;
    unit?: string;
}

export async function getStaffDailyRevenueAction() {
    try {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        // Lấy tất cả các đơn hàng hoàn thành trong ngày
        const orders = await prisma.order.findMany({
            where: {
                date: {
                    gte: start,
                    lte: end,
                },
                status: "completed",
            },
            orderBy: {
                date: 'desc'
            }
        });

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;

        // Tổng hợp theo phương thức thanh toán
        const paymentSummary = orders.reduce((acc, order) => {
            const method = order.paymentMethod || "Tiền mặt";
            acc[method] = (acc[method] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);

        // Tổng hợp số lượng sản phẩm bán ra
        const productSales: Record<string, { name: string; quantity: number; total: number }> = {};

        orders.forEach(order => {
            const items = (order.items as unknown as CartItem[]) || [];
            items.forEach((item: CartItem) => {
                const productId = item.id || item.productId || "unknown";
                if (!productSales[productId]) {
                    productSales[productId] = { name: item.name || "Không tên", quantity: 0, total: 0 };
                }
                productSales[productId].quantity += item.quantity || 1;
                productSales[productId].total += (item.price || 0) * (item.quantity || 1);
            });
        });

        // Chi tiết đơn hàng
        const orderDetails = orders.map(order => ({
            id: order.id,
            total: order.total,
            time: order.date.toISOString(),
            paymentMethod: order.paymentMethod,
            itemsCount: ((order.items as unknown as CartItem[]) || []).reduce((sum, item) => sum + (item.quantity || 1), 0)
        }));

        return {
            success: true,
            data: {
                totalRevenue,
                orderCount,
                paymentSummary,
                productSales: Object.values(productSales).sort((a, b) => b.quantity - a.quantity),
                orderDetails,
                date: new Date().toISOString(),
            },
        };
    } catch (error) {
        console.error("Error generating daily report:", error);
        return { success: false, error: "Không thể tải báo cáo doanh thu" };
    }
}
