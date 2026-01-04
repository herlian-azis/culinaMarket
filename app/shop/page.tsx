
import Navbar from '@/components/Navbar';
import ShopGrid from '@/components/ShopGrid';
import Link from 'next/link';
import { getBaseUrl } from '@/lib/utils';

async function getProducts() {
    const res = await fetch(`${getBaseUrl()}/api/products`, { cache: 'no-store' });
    if (!res.ok) {
        return [];
    }
    return res.json();
}

export default async function ShopPage() {
    const products = await getProducts();

    return (
        <div className="min-h-screen bg-culina-off-white pb-20">
            <Navbar />

            <main className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    {/* Header */}
                    <div className="mb-8">
                        <nav className="mb-4 flex items-center text-sm text-gray-500">
                            <Link href="/" className="hover:text-gray-900 transition-colors">Home</Link>
                            <span className="mx-2">/</span>
                            <span className="text-gray-900 font-medium">Shop</span>
                        </nav>
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            All Products
                        </h1>
                        <p className="mt-2 text-gray-600 max-w-2xl">
                            Explore our collection of fresh, organic, and premium ingredients curated for your kitchen.
                        </p>
                    </div>

                    {/* Client Grid with Filtering */}
                    <ShopGrid products={products} />
                </div>
            </main>
        </div>
    );
}
