/* eslint-disable no-console */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Seeding started with EXACT menu levels and split Hot/Cold products...');

    // Clear existing data
    await prisma.order.deleteMany({});
    await prisma.heldOrder.deleteMany({});
    await prisma.table.deleteMany({});
    await prisma.product.deleteMany({});
    await prisma.category.deleteMany({});
    await prisma.shiftSession.deleteMany({});
    await prisma.promotion.deleteMany({});
    await prisma.customer.deleteMany({});
    await prisma.user.deleteMany({});

    // Create tables (9 tables as requested)
    const tables = Array.from({ length: 9 }).map((_, i) => ({
        id: `table_${i + 1}`,
        number: i + 1,
        status: 'available',
    }));
    await prisma.table.createMany({ data: tables });

    // Seed Users
    await prisma.user.createMany({
        data: [
            { name: 'Lê Hoàng Ngọc Lân', username: 'admin', role: 'admin', password: '123' },
            { name: 'Nhân viên 01', username: 'staff', role: 'staff', password: '123' },
        ]
    });

    // Seed Categories EXACTLY as per Image (ALL CAPS)
    const categoryData = [
        { name: 'COFFEE', icon: 'Coffee' },
        { name: 'SINH TỐ', icon: 'IceCream' },
        { name: 'NƯỚC NGỌT', icon: 'Milk' },
        { name: 'NƯỚC ÉP', icon: 'Apple' },
        { name: 'NƯỚC GIẢI KHÁT', icon: 'GlassWater' },
    ];

    for (const cat of categoryData) {
        await prisma.category.create({
            data: cat
        });
    }

    const menuItems = [
        // COFFEE
        { name: 'Cà phê đá', price: 20000, category: 'COFFEE', image: '/img/gallery/ca-phe-da.png' },
        { name: 'Cà phê nóng', price: 20000, category: 'COFFEE', image: '/img/gallery/ca-phe-nong.png' },
        { name: 'Cà phê sữa đá', price: 23000, category: 'COFFEE', image: '/img/gallery/ca-phe-sua-da.jpeg' },
        { name: 'Cà phê sữa nóng', price: 23000, category: 'COFFEE', image: '/img/gallery/ca-phe-sua-nong.webp' },
        { name: 'Sữa tươi cà phê', price: 23000, category: 'COFFEE', image: '/img/gallery/sua-tuoi-ca-phe.png' },
        { name: 'Bạc xỉu đá', price: 25000, category: 'COFFEE', image: '/img/gallery/bac-xiu.jpg' },
        { name: 'Bạc xỉu nóng', price: 25000, category: 'COFFEE', image: '/img/gallery/bac-xiu-nong.jpeg' },

        // SINH TỐ
        { name: 'Sinh tố Bơ', price: 35000, category: 'SINH TỐ', image: '/img/gallery/sinh-to-bo.png' },
        { name: 'Sinh tố Dâu', price: 35000, category: 'SINH TỐ', image: '/img/gallery/sinh-to-dau.jpeg' },
        { name: 'Sinh tố Mãng cầu', price: 35000, category: 'SINH TỐ', image: '/img/gallery/sinh-to-mang-cau.webp' },
        { name: 'Sinh tố Sapo', price: 35000, category: 'SINH TỐ', image: '/img/gallery/sinh-to-sapo.jpg' },

        // NƯỚC NGỌT
        { name: 'Sting', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/sting.jpg' },
        { name: 'Bò cụng', price: 22000, category: 'NƯỚC NGỌT', image: '/img/gallery/bo-cung.jpeg' },
        { name: 'C2', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/c-2.jpg' },
        { name: 'Bí đao', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/tra-bi-dao.jpg' },
        { name: 'Coca Cola', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/co-ca.webp' },
        { name: 'Trà Ô Long', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/o-long.jpg' },
        { name: 'Pepsi', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/pep-si.jpg' },
        { name: '7up', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/7-up.png' },
        { name: 'Xá xị', price: 18000, category: 'NƯỚC NGỌT', image: '/img/gallery/sa-xi.png' },
        { name: 'Nước suối', price: 12000, category: 'NƯỚC NGỌT', image: '/img/gallery/nuoc-suoi.jpg' },

        // NƯỚC ÉP
        { name: 'Nước ép Ổi', price: 30000, category: 'NƯỚC ÉP', image: '/img/gallery/nuoc-ep-oi.png' },
        { name: 'Nước ép Thơm', price: 30000, category: 'NƯỚC ÉP', image: '/img/gallery/nuoc-ep-thom.png' },
        { name: 'Nước ép Cà rốt', price: 30000, category: 'NƯỚC ÉP', image: '/img/gallery/nuoc-ep-ca-rot.avif' },

        // NƯỚC GIẢI KHÁT
        { name: 'Cacao đá', price: 25000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/cacao-sua-da.jpg' },
        { name: 'Cacao nóng', price: 25000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/cacao-sua-nong.png' },
        { name: 'Cacao đá xay', price: 35000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/cacao-da-xay.jpg' },
        { name: 'Đá chanh', price: 20000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/da-chanh.jpg' },
        { name: 'Chanh muối', price: 20000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/chanh-muoi.jpg' },
        { name: 'Lipton đá', price: 23000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/lipton-da.jpg' },
        { name: 'Lipton nóng', price: 23000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/lipton-nong.png' },
        { name: 'Cam vắt', price: 30000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/cam-vat.png' },
        { name: 'Xí muội', price: 20000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/nuoc-xi-muoi.jpg' },
        { name: 'Chanh dây', price: 23000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/chanh-day.png' },
        { name: 'Sữa chua chanh dây', price: 30000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/sua-chua-chanh-dây.jpg' },
        { name: 'Sữa chua việt quất', price: 30000, category: 'NƯỚC GIẢI KHÁT', image: '/img/gallery/sua-chua-viet-quat.webp' },
    ];

    for (const item of menuItems) {
        await prisma.product.create({
            data: {
                name: item.name,
                price: item.price,
                categoryName: item.category,
                image: item.image,
                stock: 999,
                options: (item.category === 'COFFEE' || item.category === 'SINH TỐ' || item.category === 'NƯỚC GIẢI KHÁT') ? JSON.stringify([
                    {
                        id: "opt_size",
                        name: "Size",
                        type: "single",
                        required: true,
                        values: [
                            { name: "M", price: 0 },
                            { name: "L", price: 5000 },
                        ]
                    }
                ]) : "[]"
            }
        });
    }

    // Seed Promotions
    await prisma.promotion.createMany({
        data: [
            {
                code: 'GIAM10',
                name: 'Ưu đãi Khai trương',
                type: 'percentage',
                value: 10,
                minOrderValue: 0,
                description: 'Giảm 10% cho toàn bộ hóa đơn',
                isActive: true
            }
        ]
    });

    console.log('Seed data updated successfully!');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
