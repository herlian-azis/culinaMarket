import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const createAuthClient = (request: Request) => {
    const authHeader = request.headers.get('Authorization');
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            global: {
                headers: { Authorization: authHeader || '' },
            },
        }
    );
};

export async function PUT(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createAuthClient(request);
    const { id } = await params;
    const body = await request.json();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // If setting as default, unset others
    if (body.is_default) {
        await supabase
            .from('addresses')
            .update({ is_default: false })
            .eq('user_id', user.id);
    }

    const { error } = await supabase
        .from('addresses')
        .update(body)
        .eq('id', id)
        .eq('user_id', user.id); // Ensure ownership

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}

export async function DELETE(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const supabase = createAuthClient(request);
    const { id } = await params;

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { error } = await supabase
        .from('addresses')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Ensure ownership

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
}
