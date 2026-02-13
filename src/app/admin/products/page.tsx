import { getProducts } from "@/app/actions/product";
import ProductManagement from "@/components/admin/ProductManagement";

export default async function AdminProductsPage() {
    const result = await getProducts();
    const initialProducts = (result.success && result.products)
        ? result.products.map(p => ({ ...p, description: p.description || undefined }))
        : [];

    return (
        <ProductManagement initialProducts={initialProducts} />
    );
}
