'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, ShoppingBag } from 'lucide-react';

type UserData = {
    id: string;
    email: string;
    created_at: string;
    user_metadata: {
        name?: string;
        is_admin?: boolean;
    };
    order_count?: number;
};

export default function AdminUsersPage() {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        // Fetch orders to get user order counts
        const { data: orders } = await supabase
            .from('orders')
            .select('user_id');

        // Count orders per user
        const orderCounts: Record<string, number> = {};
        orders?.forEach(o => {
            orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
        });

        // Get unique user IDs from orders
        const userIds = [...new Set(orders?.map(o => o.user_id) || [])];

        // For now, create placeholder user data based on orders
        // In production, you would need admin privileges to list auth.users
        const userData: UserData[] = userIds.map(id => ({
            id,
            email: `User ${id.slice(0, 8)}`,
            created_at: new Date().toISOString(),
            user_metadata: {},
            order_count: orderCounts[id] || 0
        }));

        setUsers(userData);
        setLoading(false);
    };

    const filteredUsers = users.filter(u =>
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-gray-900">Users</h1>
                <p className="text-gray-500">View users who have placed orders</p>
            </div>

            {/* Search */}
            <div className="relative max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                    type="text"
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                />
            </div>

            {/* Users Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredUsers.map((user) => (
                    <div key={user.id} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center">
                                <User className="w-6 h-6 text-gray-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-medium text-gray-900 truncate">
                                    {user.user_metadata?.name || user.email}
                                </p>
                                <p className="text-sm text-gray-500 truncate">ID: {user.id.slice(0, 8)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                            <ShoppingBag className="w-4 h-4" />
                            <span>{user.order_count} orders</span>
                        </div>
                    </div>
                ))}
            </div>

            {filteredUsers.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No users found</p>
                    <p className="text-sm mt-1">Users will appear here after they place orders</p>
                </div>
            )}

            {/* Note */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-4 text-sm text-yellow-800">
                <strong>Note:</strong> This page shows users based on order data. For full user management,
                you would need to use Supabase Service Role or Admin API to access auth.users directly.
            </div>
        </div>
    );
}
