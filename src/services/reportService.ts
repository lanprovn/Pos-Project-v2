import { orderRepo } from "@/repositories/orderRepo";

export class ReportService {
    async getDailyRevenueReport() {
        const start = new Date();
        start.setHours(0, 0, 0, 0);

        const end = new Date();
        end.setHours(23, 59, 59, 999);

        const orders = await orderRepo.findByDateRange(start, end, "completed");

        const totalRevenue = orders.reduce((sum, order) => sum + order.total, 0);
        const orderCount = orders.length;

        // Group by payment method
        const paymentSummary = orders.reduce((acc, order) => {
            const method = order.paymentMethod || "Tiền mặt";
            acc[method] = (acc[method] || 0) + order.total;
            return acc;
        }, {} as Record<string, number>);

        // Group by product sales
        const productSales: Record<string, { name: string; quantity: number; total: number }> = {};
        orders.forEach(order => {
            const items = JSON.parse(order.items as string || '[]') as any[];
            items.forEach((item: any) => {
                const productId = item.id || item.productId || "unknown";
                if (!productSales[productId]) {
                    productSales[productId] = { name: item.name || "Không tên", quantity: 0, total: 0 };
                }
                productSales[productId].quantity += item.quantity || 1;
                productSales[productId].total += (item.price || 0) * (item.quantity || 1);
            });
        });

        // Detail list
        const orderDetails = orders.map(order => {
            const items = JSON.parse(order.items as string || '[]') as any[];
            return {
                id: order.id,
                total: order.total,
                time: order.date.toISOString(),
                paymentMethod: order.paymentMethod,
                itemsCount: items.reduce((sum, item) => sum + (item.quantity || 1), 0)
            };
        });

        return {
            totalRevenue,
            orderCount,
            paymentSummary,
            productSales: Object.values(productSales).sort((a, b) => b.quantity - a.quantity),
            orderDetails,
            date: new Date().toISOString(),
        };
    }
}

export const reportService = new ReportService();
