
import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        const { data, error } = await supabase
            .from('recipes')
            .select(`
                *,
                recipe_ingredients (
                    quantity_required,
                    unit,
                    products:products!recipe_ingredients_product_id_fkey (
                        id,
                        name,
                        price,
                        image_url
                    )
                )
            `);

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Recipes API Error:', error);
        return NextResponse.json({ error: 'Failed to fetch recipes' }, { status: 500 });
    }
}
