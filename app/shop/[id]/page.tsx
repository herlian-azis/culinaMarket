'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useCart } from '@/context/CartContext';
import Image from 'next/image';
import Link from 'next/link';
import {
    ArrowLeft,
    ShoppingCart,
    Plus,
    Minus,
    Zap,
    Beef,
    Wheat,
    Droplets,
    Check,
    Package,
    Truck,
    Shield
} from 'lucide-react';

type Product = {
    id: string;
    name: string;
    price: number;
    category: string;
    stock_quantity: number;
    image_url?: string;
    description?: string;
    sku?: string;
    nutrition_info?: {
        calories?: string | number;
        protein?: string | number;
        carbs?: string | number;
        fat?: string | number;
    };
};

export default function ProductDetailPage() {
    const params = useParams();
    const id = params.id as string;
    const { addItem } = useCart();

    const [product, setProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [quantity, setQuantity] = useState(1);
    const [added, setAdded] = useState(false);

    useEffect(() => {
        if (id) {
            fetch(`/api/products/${id}`)
                .then(res => res.json())
                .then(data => {
                    setProduct(data);
                    setLoading(false);
                })
                .catch(() => setLoading(false));
        }
    }, [id]);

    const handleAddToCart = () => {
        if (!product) return;
        for (let i = 0; i < quantity; i++) {
            addItem({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image_url
            });
        }
        setAdded(true);
        setTimeout(() => setAdded(false), 2000);
    };

    const parseNutrition = (val: string | number | undefined) => {
        if (!val) return 0;
        const strVal = String(val);
        const match = strVal.match(/(\d+(\.\d+)?)/);
        return match ? parseFloat(match[0]) : 0;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex items-center justify-center h-[60vh]">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                </div>
            </div>
        );
    }

    if (!product) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <div className="flex flex-col items-center justify-center h-[60vh] text-center px-4">
                    <Package className="w-16 h-16 text-gray-300 mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Product Not Found</h1>
                    <p className="text-gray-500 mb-6">The product you're looking for doesn't exist.</p>
                    <Link href="/shop">
                        <Button>Back to Shop</Button>
                    </Link>
                </div>
            </div>
        );
    }

    const nutrition = product.nutrition_info || {};
    const inStock = product.stock_quantity > 0;
    const lowStock = product.stock_quantity > 0 && product.stock_quantity <= 10;

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Breadcrumb */}
                <Link
                    href="/shop"
                    className="inline-flex items-center gap-2 text-gray-500 hover:text-emerald-600 mb-8 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to Shop
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Left: Product Image */}
                    <div className="space-y-4">
                        <div className="relative aspect-square rounded-3xl overflow-hidden bg-white shadow-xl shadow-gray-200/50 border border-gray-100">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    priority
                                    unoptimized
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full bg-gray-100">
                                    <Package className="w-24 h-24 text-gray-300" />
                                </div>
                            )}

                            {/* Category Badge */}
                            <div className="absolute top-4 left-4">
                                <Badge className="bg-white/90 backdrop-blur-sm shadow-sm border-none text-gray-700">
                                    {product.category}
                                </Badge>
                            </div>

                            {/* Stock Badge */}
                            {lowStock && (
                                <div className="absolute top-4 right-4">
                                    <Badge variant="warning" className="bg-orange-500 text-white border-none">
                                        Only {product.stock_quantity} left
                                    </Badge>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right: Product Info */}
                    <div className="space-y-8">
                        {/* Title & Price */}
                        <div>
                            <p className="text-sm text-gray-500 mb-2">{product.sku || `SKU-${product.id.slice(0, 8)}`}</p>
                            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                {product.name}
                            </h1>
                            <div className="flex items-baseline gap-2">
                                <span className="text-4xl font-bold text-emerald-600">
                                    Rp {product.price.toLocaleString('id-ID')}
                                </span>
                            </div>
                        </div>

                        {/* Description */}
                        {product.description && (
                            <div>
                                <h3 className="text-sm font-semibold text-gray-900 mb-2">Description</h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {product.description}
                                </p>
                            </div>
                        )}

                        {/* Quantity & Add to Cart */}
                        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-lg shadow-gray-100/50">
                            <div className="flex items-center justify-between mb-6">
                                <span className="font-medium text-gray-900">Quantity</span>
                                <div className="flex items-center gap-3">
                                    <button
                                        onClick={() => setQuantity(Math.max(1, quantity - 1))}
                                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                    >
                                        <Minus className="w-4 h-4 text-gray-600" />
                                    </button>
                                    <span className="w-12 text-center font-bold text-gray-600 text-xl">{quantity}</span>
                                    <button
                                        onClick={() => setQuantity(Math.min(product.stock_quantity, quantity + 1))}
                                        className="w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                                    >
                                        <Plus className="w-4 h-4 text-gray-600" />
                                    </button>
                                </div>
                            </div>

                            <div className="flex items-center justify-between mb-6 pb-6 border-b border-gray-100">
                                <span className="text-gray-500">Subtotal</span>
                                <span className="text-2xl font-bold text-gray-900">
                                    Rp {(product.price * quantity).toLocaleString('id-ID')}
                                </span>
                            </div>

                            <Button
                                onClick={handleAddToCart}
                                disabled={!inStock}
                                className={`w-full py-6 text-lg font-bold transition-all ${added ? 'bg-green-500 hover:bg-green-600' : ''}`}
                                size="lg"
                            >
                                {!inStock ? (
                                    'Out of Stock'
                                ) : added ? (
                                    <>
                                        <Check className="w-5 h-5 mr-2" />
                                        Added to Cart!
                                    </>
                                ) : (
                                    <>
                                        <ShoppingCart className="w-5 h-5 mr-2" />
                                        Add to Cart
                                    </>
                                )}
                            </Button>

                            {/* Stock Info */}
                            <p className={`text-sm text-center mt-4 ${inStock ? 'text-green-600' : 'text-red-500'}`}>
                                {inStock ? `✓ ${product.stock_quantity} in stock` : '✕ Out of stock'}
                            </p>
                        </div>

                        {/* Features */}
                        <div className="grid grid-cols-3 gap-4">
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <Truck className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Free Delivery</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <Shield className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Quality Guarantee</p>
                            </div>
                            <div className="text-center p-4 bg-gray-50 rounded-xl">
                                <Package className="w-6 h-6 text-emerald-600 mx-auto mb-2" />
                                <p className="text-xs text-gray-600">Fresh Packaging</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Nutrition Info */}
                {product.nutrition_info && (
                    <div className="mt-16">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Nutrition Information</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-linear-to-br from-orange-50 to-amber-50 p-6 rounded-2xl text-center border border-orange-100">
                                <div className="w-12 h-12 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                                    <Zap className="w-6 h-6 text-orange-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{Math.round(parseNutrition(nutrition.calories))}</p>
                                <p className="text-sm text-gray-500">Calories</p>
                            </div>
                            <div className="bg-linear-to-br from-red-50 to-rose-50 p-6 rounded-2xl text-center border border-red-100">
                                <div className="w-12 h-12 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                                    <Beef className="w-6 h-6 text-red-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{Math.round(parseNutrition(nutrition.protein))}g</p>
                                <p className="text-sm text-gray-500">Protein</p>
                            </div>
                            <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-6 rounded-2xl text-center border border-amber-100">
                                <div className="w-12 h-12 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                                    <Wheat className="w-6 h-6 text-amber-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{Math.round(parseNutrition(nutrition.carbs))}g</p>
                                <p className="text-sm text-gray-500">Carbs</p>
                            </div>
                            <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl text-center border border-blue-100">
                                <div className="w-12 h-12 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                                    <Droplets className="w-6 h-6 text-blue-600" />
                                </div>
                                <p className="text-3xl font-bold text-gray-900">{Math.round(parseNutrition(nutrition.fat))}g</p>
                                <p className="text-sm text-gray-500">Fat</p>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
