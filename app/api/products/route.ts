import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
    try {
        // Fetch from Supabase via REST API (more reliable than direct DB connection in this context)
        // Fetch from Supabase via REST API
        const { data, error } = await supabase
            .from('products')
            .select('*');

        if (error) throw error;

        return NextResponse.json(data);
    } catch (error) {
        console.error('Database connection failed:', error);

        // Fallback Mock Data (Safety Net)
        const MOCK_PRODUCTS = [
            // Vegetables & Fruits
            { id: '1', name: 'Fresh Organic Spinach', price: 15000, category: 'Vegetables', stock_quantity: 45, image_url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=600&q=80' },
            { id: '2', name: 'Red Cherry Tomatoes', price: 22000, category: 'Vegetables', stock_quantity: 30, image_url: 'https://images.unsplash.com/photo-1546470427-f5b9cdd45a95?auto=format&fit=crop&w=600&q=80' },
            { id: '3', name: 'Ripe Avocado (Australia)', price: 35000, category: 'Fruits', stock_quantity: 25, image_url: 'https://images.unsplash.com/photo-1523049673856-428631a84f25?auto=format&fit=crop&w=600&q=80' },
            { id: '4', name: 'Sweet Bananas (Bunch)', price: 18000, category: 'Fruits', stock_quantity: 50, image_url: 'https://images.unsplash.com/photo-1571771896612-410d50223c53?auto=format&fit=crop&w=600&q=80' },
            { id: '5', name: 'Fresh Garlic Bulb', price: 5000, category: 'Vegetables', stock_quantity: 100, image_url: 'https://images.unsplash.com/photo-1615485925694-a035aa0f471a?auto=format&fit=crop&w=600&q=80' },

            // Pantry & Grains
            { id: '6', name: 'Barilla Spaghetti No.5', price: 25000, category: 'Pantry', stock_quantity: 60, image_url: 'https://images.unsplash.com/photo-1551462147-37885acc36f1?auto=format&fit=crop&w=600&q=80' },
            { id: '7', name: 'Premium Jasmine Rice (5kg)', price: 85000, category: 'Pantry', stock_quantity: 20, image_url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80' },
            { id: '8', name: 'Extra Virgin Olive Oil', price: 120000, category: 'Pantry', stock_quantity: 15, image_url: 'https://images.unsplash.com/photo-1474979266404-7eaacbcdccef?auto=format&fit=crop&w=600&q=80' },

            // Protein & Dairy
            { id: '9', name: 'Fresh Salmon Fillet (200g)', price: 75000, category: 'Meat & Seafood', stock_quantity: 12, image_url: 'https://images.unsplash.com/photo-1599084993091-1cb5c0721cc6?auto=format&fit=crop&w=600&q=80' },
            { id: '10', name: 'Organic Chicken Breast (500g)', price: 45000, category: 'Meat & Seafood', stock_quantity: 18, image_url: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=600&q=80' },
            { id: '11', name: 'Farm Fresh Eggs (10pcs)', price: 28000, category: 'Dairy & Eggs', stock_quantity: 40, image_url: 'https://images.unsplash.com/photo-1506976785307-8732e854ad03?auto=format&fit=crop&w=600&q=80' },
            { id: '12', name: 'Whole Milk (1L)', price: 22000, category: 'Dairy & Eggs', stock_quantity: 35, image_url: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?auto=format&fit=crop&w=600&q=80' },
        ];

        return NextResponse.json(MOCK_PRODUCTS, { status: 200 });
    }
}
