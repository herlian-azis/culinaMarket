'use client';

import { useState, useMemo } from 'react';
import { useSearchParams } from 'next/navigation';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';

interface Product {
    id: string;
    name: string;
    price: number;
    category: string;
    image_url?: string;
}

interface ShopGridProps {
    products: Product[];
}

export default function ShopGrid({ products }: ShopGridProps) {
    const [activeCategory, setActiveCategory] = useState('All');
    const searchParams = useSearchParams();
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [products]);

    // Filter products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // 1. Filter by Category
        if (activeCategory !== 'All') {
            filtered = filtered.filter(p => p.category === activeCategory);
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery));
        }

        return filtered;
    }, [products, activeCategory, searchQuery]);

    return (
        <div>
            {/* Category Filter */}
            <div className="mb-8 flex flex-wrap gap-2">
                {categories.map((cat) => (
                    <Button
                        key={cat}
                        onClick={() => setActiveCategory(cat)}
                        variant={activeCategory === cat ? 'brand' : 'outline'}
                        className={`rounded-full ${activeCategory !== cat ? 'bg-white text-gray-600 border-gray-200' : ''}`}
                        size="sm"
                    >
                        {cat}
                    </Button>
                ))}
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
                {filteredProducts.length > 0 ? (
                    filteredProducts.map((product) => (
                        <ProductCard
                            key={product.id}
                            id={product.id}
                            name={product.name}
                            price={Number(product.price)}
                            category={product.category}
                            image={product.image_url}
                        />
                    ))
                ) : (
                    <div className="col-span-full py-12 text-center">
                        <p className="text-gray-500 text-lg mb-4">No products found in this category.</p>
                        <Button
                            variant="ghost"
                            onClick={() => setActiveCategory('All')}
                            className="text-culina-green hover:text-emerald-700 hover:bg-emerald-50"
                        >
                            View all products
                        </Button>
                    </div>
                )}
            </div>

            {/* Stats */}
            <div className="mt-8 text-center text-xs text-gray-400">
                Showing {filteredProducts.length} of {products.length} items
            </div>
        </div>
    );
}
