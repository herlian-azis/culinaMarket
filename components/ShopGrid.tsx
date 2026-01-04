'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useMemo, useState, useEffect } from 'react';
import ProductCard from '@/components/ProductCard';
import { Button } from '@/components/ui/Button';
import {
    ChevronDown,
    LayoutGrid,
    Carrot,
    Apple,
    Beef,
    Milk,
    Wheat,
    Fish,
    Coffee,
    Croissant,
    Candy,
    SearchX,
    X
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

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

const getCategoryIcon = (category: string) => {
    switch (category.toLowerCase()) {
        case 'all': return <LayoutGrid className="w-4 h-4" />;
        case 'vegetables': return <Carrot className="w-4 h-4" />;
        case 'fruits': return <Apple className="w-4 h-4" />;
        case 'meat & seafood': return <Beef className="w-4 h-4" />;
        case 'dairy & eggs': return <Milk className="w-4 h-4" />;
        case 'bakery': return <Croissant className="w-4 h-4" />;
        case 'pantry': return <Wheat className="w-4 h-4" />;
        case 'beverages': return <Coffee className="w-4 h-4" />;
        case 'snacks': return <Candy className="w-4 h-4" />;
        default: return <LayoutGrid className="w-4 h-4" />;
    }
};

export default function ShopGrid({ products: initialProducts }: ShopGridProps) {
    const searchParams = useSearchParams();
    const router = useRouter();
    const pathname = usePathname();

    const activeCategories = useMemo(() => {
        const cat = searchParams.get('category');
        return cat ? cat.split(',') : [];
    }, [searchParams]);

    const activeSort = searchParams.get('sort') || 'featured';
    const searchQuery = searchParams.get('q')?.toLowerCase() || '';

    const products = useMemo(() => {
        // Mock data logic... (assuming products prop is passed actually)
        return initialProducts;
    }, [initialProducts]);

    // Extract unique categories
    const categories = useMemo(() => {
        const cats = new Set(products.map(p => p.category).filter(Boolean));
        return ['All', ...Array.from(cats)];
    }, [products]);

    // Filter and Sort products
    const filteredProducts = useMemo(() => {
        let filtered = products;

        // 1. Filter by Category (Multi-select)
        if (activeCategories.length > 0) {
            filtered = filtered.filter(p => activeCategories.includes(p.category));
        }

        // 2. Filter by Search Query
        if (searchQuery) {
            filtered = filtered.filter(p => p.name.toLowerCase().includes(searchQuery));
        }

        // 3. Sort
        return [...filtered].sort((a, b) => {
            switch (activeSort) {
                case 'price-low':
                    return a.price - b.price;
                case 'price-high':
                    return b.price - a.price;
                case 'name-asc':
                    return a.name.localeCompare(b.name);
                default:
                    return 0; // featured/default order
            }
        });
    }, [products, activeCategories, searchQuery, activeSort]);

    // Pagination State
    const ITEMS_PER_PAGE = 12;
    const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);

    // Reset pagination when filters change
    useEffect(() => {
        setVisibleCount(ITEMS_PER_PAGE);
    }, [activeCategories.length, searchQuery, activeSort]);

    // Get visible products
    const visibleProducts = useMemo(() => {
        return filteredProducts.slice(0, visibleCount);
    }, [filteredProducts, visibleCount]);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + ITEMS_PER_PAGE);
    };

    const handleCategoryChange = (category: string) => {
        const params = new URLSearchParams(searchParams);

        if (category === 'All') {
            params.delete('category');
        } else {
            // Toggle logic
            let newCategories = [...activeCategories];
            if (newCategories.includes(category)) {
                newCategories = newCategories.filter(c => c !== category);
            } else {
                newCategories.push(category);
            }

            if (newCategories.length > 0) {
                params.set('category', newCategories.join(','));
            } else {
                params.delete('category');
            }
        }

        params.delete('page'); // Reset pagination (though we use client-side state now, safe to keep)
        router.push(`${pathname}?${params.toString()}`);
    };

    // Helper to remove a single category chip
    const removeCategory = (categoryToRemove: string) => {
        const params = new URLSearchParams(searchParams);
        const newCategories = activeCategories.filter(c => c !== categoryToRemove);

        if (newCategories.length > 0) {
            params.set('category', newCategories.join(','));
        } else {
            params.delete('category');
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleSortChange = (sort: string) => {
        const params = new URLSearchParams(searchParams);
        if (sort === 'featured') {
            params.delete('sort');
        } else {
            params.set('sort', sort);
        }
        router.push(`${pathname}?${params.toString()}`);
    };

    const handleClearAll = () => {
        router.push(pathname);
    };

    return (
        <div>
            {/* Filters Toolbar */}
            <div className="mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                {/* Category Filter */}
                <div className="flex flex-wrap gap-3">
                    {categories.map((cat) => {
                        const isActive = cat === 'All'
                            ? activeCategories.length === 0
                            : activeCategories.includes(cat);

                        return (
                            <Button
                                key={cat}
                                onClick={() => handleCategoryChange(cat)}
                                variant={isActive ? 'brand' : 'outline'}
                                leftIcon={getCategoryIcon(cat)}
                                className={`rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${!isActive
                                    ? 'bg-white text-gray-600 border-gray-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-700'
                                    : 'shadow-md'
                                    }`}
                                size="sm"
                            >
                                {cat}
                            </Button>
                        );
                    })}
                </div>

                {/* Sort Dropdown */}
                <div className="relative">
                    <select
                        value={activeSort}
                        onChange={(e) => handleSortChange(e.target.value)}
                        // style={{ WebkitAppearance: 'none', MozAppearance: 'none', appearance: 'none' }}
                        className="appearance-none bg-none block w-full sm:w-auto rounded-md border-gray-200 py-2 pl-4 pr-10 text-gray-700 border text-sm focus:ring-culina-green focus:border-culina-green sm:text-sm sm:leading-6 focus:outline-none bg-white hover:border-culina-green/50 transition-colors cursor-pointer"
                    >
                        <option value="featured">Featured</option>
                        <option value="price-low">Price: Low to High</option>
                        <option value="price-high">Price: High to Low</option>
                        <option value="name-asc">Name: A to Z</option>
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                        <ChevronDown className="h-4 w-4" />
                    </div>
                </div>
            </div>

            {/* Active Filters Chips */}
            <AnimatePresence>
                {(activeCategories.length > 0 || activeSort !== 'featured' || searchQuery) && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="flex flex-wrap items-center gap-2 mb-6"
                    >
                        <span className="text-sm text-gray-500 mr-2">Filters:</span>

                        {/* Search Chip */}
                        {searchQuery && (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => {
                                    // Keep cat and sort, remove q
                                    const params = new URLSearchParams(searchParams);
                                    params.delete('q');
                                    router.push(`${pathname}?${params.toString()}`);
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 border border-emerald-200 hover:bg-emerald-200 transition-colors"
                            >
                                <SearchX className="w-3 h-3" />
                                Search: "{searchQuery}"
                                <X className="w-3 h-3 ml-1 hover:text-emerald-900" />
                            </motion.button>
                        )}

                        {/* Category Chips (Loop through all active) */}
                        {activeCategories.map(cat => (
                            <motion.button
                                layout
                                key={cat}
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => removeCategory(cat)}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-200 hover:bg-blue-100 transition-colors"
                            >
                                {getCategoryIcon(cat)}
                                {cat}
                                <X className="w-3 h-3 ml-1 hover:text-blue-900" />
                            </motion.button>
                        ))}

                        {/* Sort Chip */}
                        {activeSort !== 'featured' && (
                            <motion.button
                                layout
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.8 }}
                                onClick={() => handleSortChange('featured')}
                                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-purple-50 text-purple-700 border border-purple-200 hover:bg-purple-100 transition-colors"
                            >
                                Sort: {activeSort === 'price-low' ? 'Low to High' : activeSort === 'price-high' ? 'High to Low' : 'A to Z'}
                                <X className="w-3 h-3 ml-1 hover:text-purple-900" />
                            </motion.button>
                        )}

                        {/* Clear All Link */}
                        <motion.button
                            layout
                            onClick={handleClearAll}
                            className="text-xs text-gray-500 hover:text-red-500 hover:underline ml-2"
                        >
                            Clear all filters
                        </motion.button>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Grid */}
            <motion.div
                layout
                className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8"
            >
                <AnimatePresence mode="popLayout">
                    {filteredProducts.length > 0 ? (
                        visibleProducts.map((product) => (
                            <motion.div
                                layout
                                key={product.id}
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                exit={{ opacity: 0, scale: 0.9 }}
                                transition={{ duration: 0.2 }}
                            >
                                <ProductCard
                                    id={product.id}
                                    name={product.name}
                                    price={Number(product.price)}
                                    category={product.category}
                                    image={product.image_url}
                                />
                            </motion.div>
                        ))
                    ) : (
                        <motion.div
                            layout
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.3 }}
                            className="col-span-full py-20 flex flex-col items-center justify-center text-center px-4"
                        >
                            <div className="bg-emerald-50 p-6 rounded-full mb-6">
                                <SearchX className="h-12 w-12 text-emerald-500" />
                            </div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">
                                No matches found
                            </h3>
                            <p className="text-gray-500 max-w-sm mx-auto mb-8">
                                We couldn't find any products matching your current filters. Try adjusting your search or category.
                            </p>
                            <Button
                                variant="brand"
                                onClick={handleClearAll}
                                className="min-w-[200px] shadow-lg shadow-emerald-200/50 hover:shadow-emerald-200/70"
                            >
                                Clear all filters
                            </Button>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* Pagination / Load More */}
            {filteredProducts.length > visibleCount && (
                <div className="mt-12 text-center">
                    <p className="text-sm text-gray-500 mb-4">
                        Showing {visibleCount} of {filteredProducts.length} products
                    </p>
                    <Button
                        variant="outline"
                        onClick={handleLoadMore}
                        className="min-w-[150px] rounded-full hover:bg-gray-50 transition-colors"
                    >
                        Load More
                    </Button>
                </div>
            )}

            {/* Stats */}
            <div className="mt-8 text-center text-xs text-gray-400">
                Showing {filteredProducts.length} of {products.length} items
            </div>
        </div>
    );
}
