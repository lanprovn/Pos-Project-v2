const fs = require('fs');
const path = require('path');

const galleryDir = '/Users/ngoclan/Documents/Web-Project/pos-app/public/img/gallery';
const files = fs.readdirSync(galleryDir);

const products = [];

files.forEach(file => {
    const ext = path.extname(file).toLowerCase();
    if (!['.webp', '.png', '.jpg', '.jpeg'].includes(ext)) return;

    const nameLower = file.toLowerCase();

    // Filter out UI elements
    if (nameLower.includes('logo') ||
        nameLower.includes('bg') ||
        nameLower.includes('header') ||
        nameLower.includes('slide') ||
        nameLower.includes('curve') ||
        nameLower.includes('cta') ||
        ['location.png', 'order.png', 'pay.png', 'meals.png', 'noodles.png', 'app-store.svg', 'google-play.svg', 'logo.svg'].includes(nameLower)
    ) return;

    // Helper to capitalize and beautify name
    let displayName = file.replace(ext, '')
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');

    // Categorize
    let category = 'All';
    if (nameLower.includes('phin') || nameLower.includes('bac-xiu') || nameLower.includes('americano') || nameLower.includes('latte') || nameLower.includes('cappuccino') || nameLower.includes('espresso') || nameLower.includes('macchiato')) {
        category = 'Coffee';
    } else if (nameLower.includes('tra-') || nameLower.includes('tra_')) {
        category = 'Tea';
    } else if (nameLower.includes('freeze')) {
        category = 'Freeze';
    } else if (nameLower.includes('banh-') || nameLower.includes('cake') || nameLower.includes('donut') || nameLower.includes('mousse') || nameLower.includes('tiramisu') || nameLower.includes('croisaint') || nameLower.includes('choux')) {
        category = 'Food';
    } else if (['burger', 'pizza', 'steak', 'chicken', 'taco', 'sandwich', 'chowmein', 'soup'].some(food => nameLower.includes(food))) {
        category = 'Food';
    }

    // Assign price based on category
    let price = 29000;
    if (category === 'Coffee') price = 35000;
    if (category === 'Tea') price = 45000;
    if (category === 'Freeze') price = 55000;
    if (category === 'Food') price = 39000;

    products.push({
        name: displayName,
        price: price,
        categoryName: category,
        image: `/img/gallery/${file}`,
        stock: 100,
        options: (category === 'Coffee' || category === 'Tea' || category === 'Freeze') ? 'WITH_OPTIONS' : undefined
    });
});

console.log(JSON.stringify(products, null, 4));
