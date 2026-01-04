'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, User, ShoppingBag, Mail, Calendar, Clock, Shield, ShieldCheck } from 'lucide-react';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

type UserData = {
    id: string;
    email: string;
    name: string;
    is_admin: boolean;
    created_at: string;
    last_sign_in_at: string | null;
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
        try {
            // Fetch users from auth.users via API route
            const res = await fetch('/api/admin/users');
            const usersData = await res.json();

            // Fetch orders to get user order counts
            const { data: orders } = await supabase
                .from('orders')
                .select('user_id');

            // Count orders per user
            const orderCounts: Record<string, number> = {};
            orders?.forEach(o => {
                orderCounts[o.user_id] = (orderCounts[o.user_id] || 0) + 1;
            });

            // Add order count to users
            const usersWithOrders = usersData.map((user: UserData) => ({
                ...user,
                order_count: orderCounts[user.id] || 0
            }));

            setUsers(usersWithOrders);
        } catch (error) {
            console.error('Error fetching users:', error);
        }
        setLoading(false);
    };

    const filteredUsers = users.filter(u =>
        u.id.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()) ||
        u.name?.toLowerCase().includes(search.toLowerCase())
    );

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatDateTime = (dateString: string | null) => {
        if (!dateString) return 'Never';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Users Management</h1>
                    <p className="text-gray-500">View and manage all registered users</p>
                </div>
                <div className="text-sm text-gray-500">
                    Total: <span className="font-semibold text-gray-900">{users.length}</span> users
                </div>
            </div>

            {/* Search */}
            <div className="flex-1">
                <Input
                    placeholder="Search by name, email, or ID..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                />
            </div>

            {/* Users Table */}
            <Card noPadding className="overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">User</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Orders</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Last Sign In</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white font-semibold text-sm">
                                                {user.name?.charAt(0).toUpperCase() || user.email.charAt(0).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">{user.name || 'Unnamed User'}</p>
                                                <p className="text-xs text-gray-500">ID: {user.id.slice(0, 8)}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            {user.email}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        {user.is_admin ? (
                                            <Badge variant="success">
                                                <ShieldCheck className="w-3 h-3 mr-1" />
                                                Admin
                                            </Badge>
                                        ) : (
                                            <Badge variant="secondary">
                                                <User className="w-3 h-3 mr-1" />
                                                Customer
                                            </Badge>
                                        )}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <ShoppingBag className="w-4 h-4 text-gray-400" />
                                            {user.order_count || 0}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Calendar className="w-4 h-4 text-gray-400" />
                                            {formatDate(user.created_at)}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-2 text-sm text-gray-600">
                                            <Clock className="w-4 h-4 text-gray-400" />
                                            {formatDateTime(user.last_sign_in_at)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {filteredUsers.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <User className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                                        <p>No users found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </Card>
        </div>
    );
}
