'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import {
    LayoutDashboard,
    ShoppingCart,
    Package,
    Users,
    ChefHat,
    Menu,
    X,
    LogOut,
    ChevronRight
} from 'lucide-react';

const navItems = [
    { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/admin/orders', label: 'Orders', icon: ShoppingCart },
    { href: '/admin/products', label: 'Products', icon: Package },
    { href: '/admin/recipes', label: 'Recipes', icon: ChefHat },
    { href: '/admin/users', label: 'Users', icon: Users },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const { user, loading, signOut } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const [collapsed, setCollapsed] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
                return;
            }

            // Check if user is admin (via user metadata)
            const adminStatus = user.user_metadata?.is_admin === true;
            setIsAdmin(adminStatus);

            if (!adminStatus) {
                router.push('/');
            }
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading || !isAdmin) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-100">
            {/* Mobile sidebar backdrop */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={`fixed top-0 left-0 z-50 h-full bg-gray-900 transform transition-all duration-300 
                ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                ${collapsed ? 'lg:w-[80px]' : 'lg:w-64'} lg:translate-x-0`}
            >
                <div className="flex flex-col h-full">
                    {/* Logo */}
                    <div className={`flex items-center h-16 px-6 border-b border-gray-800 ${collapsed ? 'justify-center' : 'justify-between'}`}>
                        {!collapsed ? (
                            <Link href="/admin" className="text-xl font-bold text-white whitespace-nowrap overflow-hidden">
                                Culina<span className="text-emerald-500">Admin</span>
                            </Link>
                        ) : (
                            <Link href="/admin" className="text-xl font-bold text-white">
                                C<span className="text-emerald-500">A</span>
                            </Link>
                        )}
                        <button
                            onClick={() => setSidebarOpen(false)}
                            className="lg:hidden text-gray-400 hover:text-white"
                        >
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Navigation */}
                    <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto overflow-x-hidden">
                        {navItems.map((item) => {
                            const isActive = pathname === item.href;
                            return (
                                <Link
                                    key={item.href}
                                    href={item.href}
                                    onClick={() => setSidebarOpen(false)}
                                    title={collapsed ? item.label : ''}
                                    className={`flex items-center px-4 py-3 rounded-lg transition-all duration-300 ${isActive
                                        ? 'bg-emerald-600 text-white'
                                        : 'text-gray-400 hover:bg-gray-800 hover:text-white'
                                        } ${collapsed ? 'justify-center' : 'gap-3'}`}
                                >
                                    <item.icon className="w-5 h-5 min-w-[20px]" />
                                    {!collapsed && (
                                        <>
                                            <span className="font-medium whitespace-nowrap overflow-hidden">{item.label}</span>
                                            {isActive && <ChevronRight className="w-4 h-4 ml-auto" />}
                                        </>
                                    )}
                                </Link>
                            );
                        })}
                    </nav>

                    {/* User section */}
                    <div className="px-4 py-4 border-t border-gray-800">
                        <div className={`flex items-center px-4 py-3 mb-2 ${collapsed ? 'justify-center' : 'gap-3'}`}>
                            <div className="h-8 w-8 min-w-[32px] rounded-full bg-emerald-600 flex items-center justify-center text-white text-sm font-bold">
                                {user?.email?.charAt(0).toUpperCase()}
                            </div>
                            {!collapsed && (
                                <div className="flex-1 min-w-0 transition-opacity duration-300">
                                    <p className="text-sm font-medium text-white truncate">{user?.email}</p>
                                    <p className="text-xs text-gray-400">Admin</p>
                                </div>
                            )}
                        </div>
                        <button
                            onClick={handleSignOut}
                            className={`flex items-center w-full px-4 py-3 text-gray-400 hover:bg-gray-800 hover:text-white rounded-lg transition-colors ${collapsed ? 'justify-center' : 'gap-3'}`}
                            title={collapsed ? 'Sign Out' : ''}
                        >
                            <LogOut className="w-5 h-5 min-w-[20px]" />
                            {!collapsed && <span className="font-medium whitespace-nowrap">Sign Out</span>}
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main content */}
            <div className={`transition-all duration-300 ${collapsed ? 'lg:pl-[80px]' : 'lg:pl-64'}`}>
                {/* Top bar */}
                <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200 flex items-center px-6">
                    <button
                        onClick={() => setSidebarOpen(true)}
                        className="lg:hidden text-gray-600 hover:text-gray-900 mr-4"
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Desktop Collapse Button */}
                    <button
                        onClick={() => setCollapsed(!collapsed)}
                        className="hidden lg:flex items-center justify-center w-8 h-8 rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 hover:text-gray-900 transition-colors mr-4"
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    <div className="flex-1" />
                    <Link href="/" className="text-sm text-gray-500 hover:text-emerald-600">
                        ← Back to Store
                    </Link>
                </header>

                {/* Page content */}
                <main className="p-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
