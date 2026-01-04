'use client';

import { useState } from 'react';
import Navbar from '@/components/Navbar';
import ProfileForm from '@/components/ProfileForm';
import AddressManager from '@/components/AddressManager';
import { User, MapPin, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

import { useEffect } from 'react';

export default function ProfilePage() {
    const [activeTab, setActiveTab] = useState<'profile' | 'addresses'>('profile');
    const { signOut, user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        }
    }, [user, loading, router]);

    const handleSignOut = async () => {
        await signOut();
        router.push('/');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center bg-gray-50">Loading...</div>;
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col md:flex-row gap-8">
                    {/* Sidebar */}
                    <div className="w-full md:w-64 shrink-0">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                            <div className="p-6 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 font-bold text-xl">
                                        {user.email?.[0].toUpperCase()}
                                    </div>
                                    <div className="overflow-hidden">
                                        <p className="font-bold text-gray-900 truncate">My Account</p>
                                        <p className="text-xs text-gray-500 truncate">{user.email}</p>
                                    </div>
                                </div>
                            </div>
                            <nav className="p-2">
                                <button
                                    onClick={() => setActiveTab('profile')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${activeTab === 'profile'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <User className="w-5 h-5" />
                                    Profile Info
                                </button>
                                <button
                                    onClick={() => setActiveTab('addresses')}
                                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium ${activeTab === 'addresses'
                                        ? 'bg-emerald-50 text-emerald-600'
                                        : 'text-gray-600 hover:bg-gray-50'
                                        }`}
                                >
                                    <MapPin className="w-5 h-5" />
                                    Saved Addresses
                                </button>
                                <hr className="my-2 border-gray-100" />
                                <button
                                    onClick={handleSignOut}
                                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors text-sm font-medium text-red-600 hover:bg-red-50"
                                >
                                    <LogOut className="w-5 h-5" />
                                    Sign Out
                                </button>
                            </nav>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 md:p-8 min-h-[500px]">
                            <h1 className="text-2xl font-bold text-gray-900 mb-6">
                                {activeTab === 'profile' ? 'Profile Information' : 'My Addresses'}
                            </h1>

                            {activeTab === 'profile' ? (
                                <ProfileForm />
                            ) : (
                                <AddressManager />
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
