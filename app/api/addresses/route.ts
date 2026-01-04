import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Helper to create an authenticated Supabase client for the request
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

export async function GET(request: Request) {
    const supabase = createAuthClient(request);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('user_id');

    if (!userId) {
        return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Verify the token belongs to the requested user_id ideally, 
    // but RLS will handle not returning data if token doesn't match data owner.
    // However, we filter by user_id to be explicit.

    // Actually, calling auth.getUser() first is safer to get the real ID from token.
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data, error } = await supabase
        .from('addresses')
        .select('*')
        .eq('user_id', user.id) // Use token's user id for security
        .order('is_default', { ascending: false })
        .order('created_at', { ascending: false });

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}

export async function POST(request: Request) {
    const supabase = createAuthClient(request);
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Unset defaults if this new one is default
    if (body.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
    }

    const { data, error } = await supabase
        .from('addresses')
        .insert([{ ...body, user_id: user.id }]) // Force user_id from token
        .select()
        .single();

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data);
}
