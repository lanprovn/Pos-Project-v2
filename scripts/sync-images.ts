/* eslint-disable no-console */
import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';

// Setup Prisma with Adapter (for Cloudinary sync)
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

cloudinary.config({
    cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
});

const GALLERY_DIR = path.join(process.cwd(), 'public', 'img', 'gallery');

async function syncImages() {
    console.log('--- Bắt đầu đồng bộ ảnh lên Cloudinary ---');

    if (!fs.existsSync(GALLERY_DIR)) {
        console.error('Không tìm thấy thư mục public/img/gallery');
        return;
    }

    const files = fs.readdirSync(GALLERY_DIR);
    const imageMapping: Record<string, string> = {};

    for (const file of files) {
        if (file.match(/\.(webp|png|jpg|jpeg|svg)$/)) {
            const filePath = path.join(GALLERY_DIR, file);
            const publicPath = `/img/gallery/${file}`;

            console.log(`Đang tải lên: ${file}...`);

            try {
                const result = await cloudinary.uploader.upload(filePath, {
                    folder: 'pos-coffee-gallery',
                    use_filename: true,
                    unique_filename: false,
                });

                imageMapping[publicPath] = result.secure_url;
                console.log(`✅ Thành công: ${result.secure_url}`);
            } catch (err) {
                console.error(`❌ Lỗi khi tải lên ${file}:`, err);
            }
        }
    }

    console.log('\n--- Cập nhật Database ---');

    const products = await prisma.product.findMany();
    let updatedCount = 0;

    for (const product of products) {
        if (imageMapping[product.image]) {
            await prisma.product.update({
                where: { id: product.id },
                data: { image: imageMapping[product.image] }
            });
            updatedCount++;
        }
    }

    console.log(`Đã cập nhật ${updatedCount} sản phẩm trong database.`);
    console.log('--- Hoàn tất! ---');

    await prisma.$disconnect();
    await pool.end();
}

syncImages();
