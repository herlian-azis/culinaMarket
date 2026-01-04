import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to access auth.users
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET() {
    try {
        // Try to get users from auth.users (requires service role key)
        const { data: authUsers, error } = await supabaseAdmin.auth.admin.listUsers();

        if (error) {
            console.error('Error fetching auth users:', error);

            // Fallback: Try to fetch from public.users table
            const { data: publicUsers, error: publicError } = await supabaseAdmin
                .from('users')
                .select('*')
                .order('created_at', { ascending: false });

            if (publicError) {
                throw publicError;
            }

            return NextResponse.json(publicUsers || []);
        }

        // Map auth.users to simplified format
        const users = authUsers.users.map(user => ({
            id: user.id,
            email: user.email || '',
            name: user.user_metadata?.name || '',
            is_admin: user.user_metadata?.is_admin || false,
            created_at: user.created_at,
            last_sign_in_at: user.last_sign_in_at
        }));

        return NextResponse.json(users);
    } catch (error) {
        console.error('Error fetching users:', error);
        return NextResponse.json([], { status: 500 });
    }
}
