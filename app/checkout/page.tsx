'use client';

import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { CreditCard, Truck, ShieldCheck, ShoppingBag, MapPin } from 'lucide-react';
import Image from 'next/image';
import { supabase } from '@/lib/supabase';

export default function CheckoutPage() {
    const { items, totalPrice, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);

    // Shipping form state
    const [shipping, setShipping] = useState({
        name: '',
        email: '',
        address: '',
        city: '',
        postalCode: ''
    });

    // Saved addresses state
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

    // Fetch saved addresses
    useEffect(() => {
        if (user) {
            const fetchAddresses = async () => {
                const { data } = await supabase
                    .from('addresses')
                    .select('*')
                    .eq('user_id', user.id)
                    .order('is_default', { ascending: false });

                if (data && data.length > 0) {
                    setSavedAddresses(data);
                    // Standard auto-select default behavior if desired:
                    const defaultAddr = data.find((a: any) => a.is_default);
                    if (defaultAddr) selectAddress(defaultAddr);
                }
            };
            fetchAddresses();
        }
    }, [user]);

    const selectAddress = (addr: any) => {
        setSelectedAddressId(addr.id);
        setShipping(prev => ({
            ...prev,
            name: addr.recipient_name || '',
            address: addr.address_line || '',
            city: addr.city || '',
            postalCode: addr.postal_code || '',
            // Don't overwrite email as it's from auth usually
        }));
    };

    // Payment form state
    const [payment, setPayment] = useState({
        cardNumber: '',
        expiry: '',
        cvc: ''
    });

    // Validation errors
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Pre-fill email for logged-in users
    useEffect(() => {
        if (user?.email) {
            setShipping(prev => ({ ...prev, email: user.email || '' }));
        }
    }, [user]);


    // Validate shipping form
    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!shipping.name.trim()) {
            newErrors.name = 'Nama wajib diisi';
        }

        if (!shipping.email.trim()) {
            newErrors.email = 'Email wajib diisi';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(shipping.email)) {
            newErrors.email = 'Format email tidak valid';
        }

        if (!shipping.address.trim()) {
            newErrors.address = 'Alamat wajib diisi';
        }

        if (!shipping.city.trim()) {
            newErrors.city = 'Kota wajib diisi';
        }

        if (!shipping.postalCode.trim()) {
            newErrors.postalCode = 'Kode pos wajib diisi';
        } else if (!/^\d{5}$/.test(shipping.postalCode)) {
            newErrors.postalCode = 'Kode pos harus 5 digit';
        }

        if (!payment.cardNumber.trim()) {
            newErrors.cardNumber = 'Nomor kartu wajib diisi';
        } else if (!/^\d{16}$/.test(payment.cardNumber.replace(/\s/g, ''))) {
            newErrors.cardNumber = 'Nomor kartu harus 16 digit';
        }

        if (!payment.expiry.trim()) {
            newErrors.expiry = 'Tanggal kadaluarsa wajib diisi';
        } else if (!/^\d{2}\/\d{2}$/.test(payment.expiry)) {
            newErrors.expiry = 'Format: MM/YY';
        }

        if (!payment.cvc.trim()) {
            newErrors.cvc = 'CVC wajib diisi';
        } else if (!/^\d{3,4}$/.test(payment.cvc)) {
            newErrors.cvc = 'CVC harus 3-4 digit';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setIsProcessing(true);

        // Save order to DB if user is logged in
        if (user) {
            try {
                console.log('Creating order for user:', user.id);

                const { data: order, error: orderError } = await supabase
                    .from('orders')
                    .insert({
                        user_id: user.id,
                        status: 'Pending',
                        total_amount: totalPrice
                    })
                    .select()
                    .single();

                console.log('Order result:', { order, orderError });

                if (orderError) {
                    console.error('Order creation failed:', orderError);
                    alert('Error creating order: ' + orderError.message);
                } else if (order) {
                    // Insert order items
                    const { error: itemsError } = await supabase.from('order_items').insert(
                        items.map(item => ({
                            order_id: order.id,
                            product_id: item.id,
                            quantity: item.quantity,
                            price_at_purchase: item.price
                        }))
                    );

                    if (itemsError) {
                        console.error('Order items creation failed:', itemsError);
                    }

                    // Insert shipping info
                    const { error: shippingError } = await supabase.from('order_shipping').insert({
                        order_id: order.id,
                        name: shipping.name,
                        email: shipping.email,
                        address: shipping.address,
                        city: shipping.city,
                        postal_code: shipping.postalCode
                    });

                    if (shippingError) {
                        console.error('Shipping info creation failed:', shippingError);
                    } else {
                        console.log('Order created successfully:', order.id);
                    }
                }
            } catch (err) {
                console.error('Error saving order:', err);
            }
        }

        // Simulate processing
        await new Promise(resolve => setTimeout(resolve, 1500));

        clearCart();
        router.push('/checkout/success');
        setIsProcessing(false);
    };

    if (items.length === 0) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Navbar />
                <main className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
                    <div className="flex flex-col items-center justify-center text-center">
                        <div className="h-24 w-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                            <ShoppingBag className="w-12 h-12 text-gray-400" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Your cart is empty</h1>
                        <p className="mt-2 text-gray-500">Go add some delicious ingredients first!</p>
                        <button
                            onClick={() => router.push('/shop')}
                            className="mt-6 px-6 py-3 bg-culina-green text-white font-medium rounded-full hover:bg-emerald-600 transition-colors"
                        >
                            Back to Shop
                        </button>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
                <div className="lg:grid lg:grid-cols-12 lg:gap-x-12 lg:items-start">

                    {/* Left Column: Forms */}
                    <div className="lg:col-span-7">
                        <form onSubmit={handleCheckout} className="space-y-8">

                            {savedAddresses.length > 0 && (
                                <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                    <div className="flex items-center gap-3 mb-6">
                                        <div className="h-10 w-10 rounded-full bg-emerald-50 flex items-center justify-center text-emerald-600">
                                            <MapPin className="w-5 h-5" />
                                        </div>
                                        <h2 className="text-lg font-bold text-gray-900">Saved Addresses</h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {savedAddresses.map((addr) => (
                                            <div
                                                key={addr.id}
                                                onClick={() => selectAddress(addr)}
                                                className={`cursor-pointer border rounded-xl p-4 transition-all relative ${selectedAddressId === addr.id
                                                        ? 'border-culina-green bg-emerald-50 ring-1 ring-culina-green'
                                                        : 'border-gray-200 hover:border-emerald-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-semibold text-gray-900">{addr.label}</span>
                                                    {addr.is_default && <span className="text-xs text-emerald-600 font-medium">Default</span>}
                                                </div>
                                                <p className="text-sm font-medium text-gray-900">{addr.recipient_name}</p>
                                                <p className="text-sm text-gray-500 mt-1">{addr.address_line}, {addr.city} {addr.postal_code}</p>
                                                <p className="text-sm text-gray-500">{addr.phone_number}</p>
                                            </div>
                                        ))}
                                    </div>
                                </section>
                            )}

                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                                        <Truck className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Shipping Information</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="name" className="block text-sm font-medium text-gray-700">Full Name</label>
                                        <input
                                            type="text"
                                            id="name"
                                            value={shipping.name}
                                            onChange={(e) => setShipping(prev => ({ ...prev, name: e.target.value }))}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="John Doe"
                                        />
                                        {errors.name && <p className="mt-1 text-xs text-red-500">{errors.name}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email Address</label>
                                        <input
                                            type="email"
                                            id="email"
                                            value={shipping.email}
                                            onChange={(e) => setShipping(prev => ({ ...prev, email: e.target.value }))}
                                            disabled={!!user}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${user ? 'bg-gray-100 cursor-not-allowed' : 'bg-white'} ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="you@example.com"
                                        />
                                        {user && <p className="mt-1 text-xs text-green-600">✓ Logged in as {user.email}</p>}
                                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email}</p>}
                                    </div>

                                    <div className="sm:col-span-2">
                                        <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                                        <input
                                            type="text"
                                            id="address"
                                            value={shipping.address}
                                            onChange={(e) => setShipping(prev => ({ ...prev, address: e.target.value }))}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="123 Main St"
                                        />
                                        {errors.address && <p className="mt-1 text-xs text-red-500">{errors.address}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="city" className="block text-sm font-medium text-gray-700">City</label>
                                        <input
                                            type="text"
                                            id="city"
                                            value={shipping.city}
                                            onChange={(e) => setShipping(prev => ({ ...prev, city: e.target.value }))}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.city ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="Jakarta"
                                        />
                                        {errors.city && <p className="mt-1 text-xs text-red-500">{errors.city}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="postal-code" className="block text-sm font-medium text-gray-700">Postal Code</label>
                                        <input
                                            type="text"
                                            id="postal-code"
                                            value={shipping.postalCode}
                                            onChange={(e) => setShipping(prev => ({ ...prev, postalCode: e.target.value }))}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.postalCode ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="10110"
                                            maxLength={5}
                                        />
                                        {errors.postalCode && <p className="mt-1 text-xs text-red-500">{errors.postalCode}</p>}
                                    </div>
                                </div>
                            </section>

                            {/* Payment Information */}
                            <section className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="h-10 w-10 rounded-full bg-purple-50 flex items-center justify-center text-purple-600">
                                        <CreditCard className="w-5 h-5" />
                                    </div>
                                    <h2 className="text-lg font-bold text-gray-900">Payment Details</h2>
                                </div>

                                <div className="grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-4">
                                    <div className="sm:col-span-2">
                                        <label htmlFor="card-number" className="block text-sm font-medium text-gray-700">Card Number</label>
                                        <input
                                            type="text"
                                            id="card-number"
                                            value={payment.cardNumber}
                                            onChange={(e) => {
                                                // Remove non-digits and format with spaces every 4 digits
                                                const value = e.target.value.replace(/\D/g, '').slice(0, 16);
                                                const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ');
                                                setPayment(prev => ({ ...prev, cardNumber: formatted }));
                                            }}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.cardNumber ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="0000 0000 0000 0000"
                                            maxLength={19}
                                        />
                                        {errors.cardNumber && <p className="mt-1 text-xs text-red-500">{errors.cardNumber}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="expiration-date" className="block text-sm font-medium text-gray-700">Expiration Date (MM/YY)</label>
                                        <input
                                            type="text"
                                            id="expiration-date"
                                            value={payment.expiry}
                                            onChange={(e) => {
                                                // Remove non-digits and format as MM/YY
                                                let value = e.target.value.replace(/\D/g, '').slice(0, 4);
                                                if (value.length >= 2) {
                                                    value = value.slice(0, 2) + '/' + value.slice(2);
                                                }
                                                setPayment(prev => ({ ...prev, expiry: value }));
                                            }}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.expiry ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="MM/YY"
                                            maxLength={5}
                                        />
                                        {errors.expiry && <p className="mt-1 text-xs text-red-500">{errors.expiry}</p>}
                                    </div>

                                    <div>
                                        <label htmlFor="cvc" className="block text-sm font-medium text-gray-700">CVC</label>
                                        <input
                                            type="text"
                                            id="cvc"
                                            value={payment.cvc}
                                            onChange={(e) => setPayment(prev => ({ ...prev, cvc: e.target.value }))}
                                            className={`mt-1 block w-full rounded-lg shadow-sm sm:text-sm py-2.5 px-3 border bg-white text-gray-900 placeholder:text-gray-400 focus:border-culina-green focus:ring-culina-green ${errors.cvc ? 'border-red-500' : 'border-gray-300'}`}
                                            placeholder="123"
                                            maxLength={4}
                                        />
                                        {errors.cvc && <p className="mt-1 text-xs text-red-500">{errors.cvc}</p>}
                                    </div>
                                </div>
                            </section>

                            <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-xl border border-gray-200 text-sm text-gray-500">
                                <ShieldCheck className="w-5 h-5 text-gray-400" />
                                <p>Every transaction on CulinaMarket is secure and encrypted.</p>
                            </div>

                        </form>
                    </div>

                    {/* Right Column: Order Summary */}
                    <div className="lg:col-span-5 mt-8 lg:mt-0">
                        <div className="sticky top-24 bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
                            <h2 className="text-lg font-bold text-gray-900 mb-6">Order Summary</h2>

                            <ul className="divide-y divide-gray-100 mb-6">
                                {items.map((item) => (
                                    <li key={item.id} className="flex py-4 gap-4">
                                        <div className="h-16 w-16 bg-gray-50 rounded-lg flex-shrink-0 overflow-hidden relative border border-gray-100">
                                            {item.image ? (
                                                <Image
                                                    src={item.image}
                                                    alt={item.name}
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                />
                                            ) : (
                                                <div className="flex h-full w-full items-center justify-center text-lg">🥕</div>
                                            )}
                                        </div>
                                        <div className="flex flex-1 justify-between">
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900">{item.name}</h3>
                                                <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                            </div>
                                            <p className="text-sm font-medium text-gray-900">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </li>
                                ))}
                            </ul>

                            <dl className="space-y-4 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Subtotal</dt>
                                    <dd className="text-sm font-medium text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</dd>
                                </div>
                                <div className="flex items-center justify-between">
                                    <dt className="text-sm text-gray-600">Shipping</dt>
                                    <dd className="text-sm font-medium text-gray-900">Free</dd>
                                </div>
                                <div className="flex items-center justify-between border-t border-gray-100 pt-4">
                                    <dt className="text-base font-bold text-gray-900">Total</dt>
                                    <dd className="text-base font-bold text-culina-green">Rp {totalPrice.toLocaleString('id-ID')}</dd>
                                </div>
                            </dl>

                            <button
                                onClick={handleCheckout}
                                disabled={isProcessing}
                                className="mt-8 w-full rounded-xl bg-culina-green px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-culina-green focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                            >
                                {isProcessing ? 'Processing...' : 'Confirm Order'}
                            </button>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
}
