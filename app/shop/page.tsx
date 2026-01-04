import Navbar from '@/components/Navbar';
import ShopGrid from '@/components/ShopGrid';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Suspense } from 'react';

async function getProducts() {
    const { data, error } = await supabase
        .from('products')
        .select('id, name, price, stock_quantity, image_url, category')
        .eq('is_deleted', false)
        .order('name');

    if (error) {
        console.error('Failed to fetch products:', error);
        return [];
    }
    return data || [];
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
                    <Suspense fallback={<div className="py-20 text-center">Loading products...</div>}>
                        <ShopGrid products={products} />
                    </Suspense>
                </div>
            </main>
        </div>
    );
}
