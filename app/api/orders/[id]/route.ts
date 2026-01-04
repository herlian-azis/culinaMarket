import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const createAuthClient = (request: Request) => {
    const authHeader = request.headers.get('Authorization');
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: {
                    Authorization: authHeader || '',
                },
            },
        }
    );
};

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id } = await params;
    const supabase = createAuthClient(request);

    // 1. Authenticate User
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Fetch Order
    const { data: orderData, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .eq('user_id', user.id)
        .single();

    if (orderError || !orderData) {
        return NextResponse.json({ error: 'Order not found' }, { status: 404 });
    }

    // 3. Fetch Items with Products
    const { data: itemsData, error: itemsError } = await supabase
        .from('order_items')
        .select('*, products(id, name, image_url)')
        .eq('order_id', id);

    if (itemsError) {
        return NextResponse.json({ error: 'Failed to fetch items' }, { status: 500 });
    }

    // 4. Fetch Shipping Info
    const { data: shippingData, error: shippingError } = await supabase
        .from('order_shipping')
        .select('*')
        .eq('order_id', id)
        .single();

    // shippingData might be null if not set, that's okay, but we shouldn't error out generally unless query failed badly
    if (shippingError && shippingError.code !== 'PGRST116') { // PGRST116 is "no rows returned" for single()
        console.error('Shipping fetch error', shippingError);
    }

    return NextResponse.json({
        order: orderData,
        items: itemsData,
        shipping: shippingData
    });
}
