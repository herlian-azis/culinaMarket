'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Navbar from '@/components/Navbar';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import { ArrowLeft, Package, MapPin, Clock, CheckCircle, CircleX, Truck, ClipboardClock } from 'lucide-react';
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
    const { user, session, loading: authLoading } = useAuth();
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

        if (user && session && orderId) {
            fetchOrderDetails();
        }
    }, [user, session, authLoading, orderId, router]);

    const fetchOrderDetails = async () => {
        try {
            if (!session?.access_token) return;

            const res = await fetch(`/api/orders/${orderId}`, {
                headers: {
                    'Authorization': `Bearer ${session.access_token}`
                }
            });

            if (!res.ok) {
                if (res.status === 404) {
                    setOrder(null); // Will trigger "Order not found" UI
                }
                throw new Error('Failed to fetch order');
            }

            const data = await res.json();

            setOrder(data.order);
            setItems(data.items || []);
            setShipping(data.shipping);
        } catch (error) {
            console.error('Error fetching order details:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'Delivered':
                return <CheckCircle className="w-5 h-5 text-culina-green" />;
            case 'Processing':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'Shipped':
                return <Truck className="w-5 h-5 text-indigo-500" />;
            case 'Cancelled':
                return <CircleX className="w-5 h-5 text-red-500" />;
            case 'Pending':
                return <ClipboardClock className="w-5 h-5 text-yellow-500" />;
            default:
                return <Package className="w-5 h-5 text-gray-400" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'Delivered':
                return 'bg-green-100 text-green-800';
            case 'Processing':
                return 'bg-blue-100 text-blue-800';
            case 'Shipped':
                return 'bg-indigo-100 text-indigo-800';
            case 'Cancelled':
                return 'bg-red-100 text-red-800';
            case 'Pending':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
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

    const steps = [
        {
            id: 'Pending',
            label: 'Order Placed',
            date: order.created_at,
            icon: ClipboardClock,
            activeClass: 'bg-yellow-500 border-yellow-500 text-white',
            textClass: 'text-yellow-700',
            ringClass: 'ring-yellow-500/20'
        },
        {
            id: 'Processing',
            label: 'Processing',
            icon: Clock,
            activeClass: 'bg-blue-500 border-blue-500 text-white',
            textClass: 'text-blue-700',
            ringClass: 'ring-blue-500/20'
        },
        {
            id: 'Shipped',
            label: 'Shipped',
            icon: Truck,
            activeClass: 'bg-indigo-500 border-indigo-500 text-white',
            textClass: 'text-indigo-700',
            ringClass: 'ring-indigo-500/20'
        },
        {
            id: 'Delivered',
            label: 'Delivered',
            icon: CheckCircle,
            activeClass: 'bg-emerald-500 border-emerald-500 text-white',
            textClass: 'text-emerald-700',
            ringClass: 'ring-emerald-500/20'
        },
    ];

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
                    <div className="flex items-center justify-between mb-8">
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

                    {/* Timeline */}
                    {order.status !== 'Cancelled' ? (
                        <div className="relative py-8 px-4 sm:px-12">
                            {/* Desktop Progress Bar Background */}
                            <div className="absolute top-12 left-0 w-full h-0.5 bg-gray-100 hidden sm:block"></div>

                            {/* Active Progress Bar - Solid Color */}
                            <div
                                className="absolute top-12 left-0 h-0.5 bg-culina-green transition-all duration-700 ease-in-out hidden sm:block"
                                style={{
                                    width: `${Math.max(0, (['Pending', 'Processing', 'Shipped', 'Delivered'].indexOf(order.status) / 3) * 100)}%`
                                }}
                            ></div>

                            <div className="flex flex-col sm:flex-row justify-between relative z-10 gap-10 sm:gap-0">
                                {steps.map((step, index) => {
                                    const statusOrder = ['Pending', 'Processing', 'Shipped', 'Delivered'];
                                    const currentIndex = statusOrder.indexOf(order.status);
                                    const stepIndex = statusOrder.indexOf(step.id);
                                    const isCompleted = stepIndex <= currentIndex;
                                    const isCurrent = stepIndex === currentIndex;

                                    return (
                                        <div key={step.id} className="flex sm:flex-col items-center gap-6 sm:gap-0 group min-w-[100px]">
                                            {/* Icon Circle */}
                                            <div
                                                className={`
                                                    w-8 h-8 rounded-full flex items-center justify-center border-2 transition-all duration-300 relative z-10
                                                    ${isCompleted
                                                        ? step.activeClass
                                                        : 'bg-white border-gray-200 text-gray-300'
                                                    }
                                                    ${isCurrent ? `ring-4 ${step.ringClass} ring-offset-2` : ''}
                                                `}
                                            >
                                                <step.icon className="w-4 h-4" strokeWidth={2.5} />

                                                {/* Mobile Vertical Line */}
                                                {index < 3 && (
                                                    <div className={`absolute top-8 left-1/2 -translate-x-1/2 w-0.5 h-16 sm:hidden ${stepIndex < currentIndex ? 'bg-culina-green' : 'bg-gray-100'}`}></div>
                                                )}
                                            </div>

                                            {/* Text Content */}
                                            <div className="sm:text-center sm:mt-4 flex-1 sm:flex-none pt-1 sm:pt-0">
                                                <p className={`text-sm font-semibold transition-colors ${isCompleted ? step.textClass : 'text-gray-400'}`}>
                                                    {step.label}
                                                </p>
                                                {isCurrent && (
                                                    <p className={`text-xs font-medium mt-0.5 ${step.textClass}`}>
                                                        Current Status
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 rounded-xl p-6 flex items-center gap-4 border border-gray-100">
                            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-gray-400 shadow-sm border border-gray-100">
                                <CircleX className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Order Cancelled</h3>
                                <p className="text-sm text-gray-500">This order has been cancelled.</p>
                            </div>
                        </div>
                    )}
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
                                        <div className="h-16 w-16 bg-gray-100 rounded-lg overflow-hidden relative shrink-0">
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
