const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const products = await prisma.product.findMany({
        select: {
            name: true,
            categoryName: true
        }
    });
    console.log('Products:', JSON.stringify(products, null, 2));

    const categories = await prisma.category.findMany();
    console.log('Categories:', JSON.stringify(categories, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
