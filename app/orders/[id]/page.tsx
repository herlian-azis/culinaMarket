'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type Order = {
    id: string;
    created_at: string;
    status: string;
    total_amount: number;
};

type OrderItem = {
    id: string;
    quantity: number;
    price_at_purchase: number;
    products: {
        id: string;
        name: string;
        image_url: string;
    };
};

type OrderShipping = {
    name: string;
    email: string;
    address: string;
    city: string;
    postal_code: string;
};

export default function OrderDetailPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const params = useParams();
    const orderId = params.id as string;

    const [order, setOrder] = useState<Order | null>(null);
    const [items, setItems] = useState<OrderItem[]>([]);
    const [shipping, setShipping] = useState<OrderShipping | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/login');
            return;
        }

        if (user && orderId) {
            fetchOrderDetails();
        }
    }, [user, authLoading, orderId, router]);

    const fetchOrderDetails = async () => {
        // Fetch order
        const { data: orderData } = await supabase
            .from('orders')
            .select('*')
            .eq('id', orderId)
            .eq('user_id', user?.id)
            .single();

        if (orderData) {
            setOrder(orderData);

            // Fetch order items with product info
            const { data: itemsData } = await supabase
                .from('order_items')
                .select('*, products(id, name, image_url)')
                .eq('order_id', orderId);

            if (itemsData) {
                setItems(itemsData as OrderItem[]);
            }

            // Fetch shipping info
            const { data: shippingData } = await supabase
                .from('order_shipping')
                .select('*')
                .eq('order_id', orderId)
                .single();

            if (shippingData) {
                setShipping(shippingData);
            }
        }

        setLoading(false);
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <Clock className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
            case 'Shipped':
                return 'bg-blue-100 text-blue-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 py-16">
                    <div className="flex items-center justify-center">
                        <div className="h-8 w-8 animate-spin rounded-full border-4 border-culina-green border-t-transparent"></div>
                    </div>
                </main>
            </div>
        );
    }

    if (!order) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="mx-auto max-w-4xl px-4 py-16 text-center">
                    <h1 className="text-xl font-bold text-gray-900">Order not found</h1>
                    <Link href="/orders" className="text-culina-green hover:underline mt-4 inline-block">
                        ← Back to Orders
                    </Link>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
                {/* Back Button */}
                <Link href="/orders" className="inline-flex items-center gap-2 text-gray-600 hover:text-culina-green mb-6">
                    <ArrowLeft className="w-4 h-4" />
                    Back to Orders
                </Link>

                {/* Order Header */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-xl font-bold text-gray-900">
                                Order #{order.id.slice(0, 8).toUpperCase()}
                            </h1>
                            <p className="text-sm text-gray-500">
                                {new Date(order.created_at).toLocaleDateString('id-ID', {
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                        <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ${getStatusColor(order.status)}`}>
                            {getStatusIcon(order.status)}
                            {order.status}
                        </span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Order Items */}
                    <div className="lg:col-span-2">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <Package className="w-5 h-5 text-gray-400" />
                                <h2 className="font-bold text-gray-900">Order Items</h2>
                            </div>

                            <div className="divide-y divide-gray-100">
                                {items.map((item) => (
                                    <div key={item.id} className="flex items-center gap-4 py-4">
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden relative flex-shrink-0">
                                            {item.products?.image_url ? (
                                                <Image
                                                    src={item.products.image_url}
                                                    alt={item.products.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-2xl">🥕</div>
                                            )}
                                        </div>
                                        <div className="flex-1">
                                            <h3 className="font-medium text-gray-900">{item.products?.name || 'Product'}</h3>
                                            <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                        </div>
                                        <p className="font-medium text-gray-900">
                                            Rp {(item.price_at_purchase * item.quantity).toLocaleString('id-ID')}
                                        </p>
                                    </div>
                                ))}
                            </div>

                            <div className="border-t border-gray-100 pt-4 mt-4">
                                <div className="flex justify-between items-center">
                                    <span className="font-bold text-gray-900">Total</span>
                                    <span className="text-xl font-bold text-culina-green">
                                        Rp {order.total_amount.toLocaleString('id-ID')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Shipping Info */}
                    <div className="lg:col-span-1">
                        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
                            <div className="flex items-center gap-3 mb-6">
                                <MapPin className="w-5 h-5 text-gray-400" />
                                <h2 className="font-bold text-gray-900">Shipping Info</h2>
                            </div>

                            {shipping ? (
                                <div className="space-y-3 text-sm">
                                    <div>
                                        <p className="text-gray-500">Name</p>
                                        <p className="font-medium text-gray-900">{shipping.name}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Email</p>
                                        <p className="font-medium text-gray-900">{shipping.email}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Address</p>
                                        <p className="font-medium text-gray-900">
                                            {shipping.address}, {shipping.city} {shipping.postal_code}
                                        </p>
                                    </div>
                                </div>
                            ) : (
                                <p className="text-sm text-gray-500">No shipping info available</p>
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}
