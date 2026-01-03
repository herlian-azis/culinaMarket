'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

interface Ingredient {
    quantity_required: number;
    unit: string;
    products: {
        id: string;
        name: string;
        price: number;
        image_url?: string;
    };
}

interface RecipeProps {
    id: string;
    title: string;
    description: string;
    difficulty: string;
    prep_time: number;
    image: string;
    ingredients: Ingredient[];
}

export default function RecipeCard({ id, title, description, difficulty, prep_time, image, ingredients }: RecipeProps) {
    const { addItem } = useCart();

    const handleAddAll = () => {
        ingredients.forEach(ing => {
            if (ing.products) {
                addItem({
                    id: ing.products.id,
                    name: ing.products.name,
                    price: ing.products.price,
                    image: ing.products.image_url
                });
            }
        });
    };

    const totalPrice = ingredients.reduce((sum, ing) => {
        return sum + (ing.products ? Number(ing.products.price) : 0);
    }, 0);

    return (
        <Card noPadding className="group overflow-hidden hover:shadow-lg transition-all">
            {/* Image Link */}
            {/* Image */}
            <Link href={`/recipes/${id}`} className="aspect-video w-full relative bg-gray-100 block">
                {image ? (
                    <Image src={image} alt={title} fill className="object-cover" unoptimized />
                ) : (
                    <div className="flex items-center justify-center h-full text-gray-300">No Image</div>
                )}
                <div className="absolute top-3 left-3 flex gap-2">
                    <Badge className="bg-white/90 backdrop-blur-sm shadow-sm border-none">
                        {prep_time} mins
                    </Badge>
                    <Badge
                        variant={
                            difficulty === 'Easy' ? 'success' :
                                difficulty === 'Medium' ? 'warning' : 'error'
                        }
                        className="bg-white/90 backdrop-blur-sm shadow-sm border-none"
                    >
                        {difficulty}
                    </Badge>
                </div>
            </Link>

            {/* Content */}
            <div className="p-5">
                <h3 className="text-lg font-bold text-gray-900 mb-2">
                    <Link href={`/recipes/${id}`} className="hover:text-culina-green transition-colors">
                        {title}
                    </Link>
                </h3>
                <p className="text-sm text-gray-500 mb-4 line-clamp-2">{description}</p>

                {/* Ingredients Preview */}
                <div className="mb-4 space-y-2">
                    <p className="text-xs font-semibold text-gray-900 uppercase tracking-wider">Includes:</p>
                    <div className="flex flex-wrap gap-2">
                        {ingredients.map((ing, i) => (
                            <span key={i} className="px-2 py-1 bg-gray-50 border border-gray-100 rounded text-xs text-gray-600">
                                {ing.products?.name || 'Unknown Item'}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Footer Action */}
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-100">
                    <div>
                        <p className="text-xs text-gray-400">Total Bundle Price</p>
                        <p className="text-lg font-bold text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</p>
                    </div>
                    <Button
                        onClick={handleAddAll}
                        size="sm"
                        variant="brand"
                        className="rounded-full" // Keep it pill shaped to match design preference or remove to standardise? I'll keep it pill for now as it looks better in card footers often.
                    >
                        Add All
                    </Button>
                </div>
            </div>
        </Card>
    );
}
