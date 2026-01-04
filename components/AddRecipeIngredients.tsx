'use client';

import { useCart } from '@/context/CartContext';
import { Button } from '@/components/ui/Button';

// Accept any structure from the API to handle both array and object returns from Supabase relations
interface Props {
    ingredients: any[];
}

export default function AddRecipeIngredients({ ingredients }: Props) {
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

    return (
        <Button
            onClick={handleAddAll}
            className="w-full py-6 font-bold text-base shadow-sm"
            size="lg"
            variant="brand"
        >
            Add All Ingredients
        </Button>
    );
}
