'use client';

import { useCart } from '@/context/CartContext';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { X, ShoppingBag, Image as ImageIcon } from 'lucide-react';

export default function CartDrawer() {
    const { items, removeItem, updateQuantity, totalPrice, isOpen, setIsOpen, clearCart } = useCart();
    const pathname = usePathname();
    const drawerRef = useRef<HTMLDivElement>(null);

    // Close on route change
    useEffect(() => {
        setIsOpen(false);
    }, [pathname, setIsOpen]);

    // Close on escape key
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsOpen(false);
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [setIsOpen]);

    // Close on outside click
    const handleBackdropClick = (e: React.MouseEvent) => {
        // If the drawer content exists and the click target is NOT inside it, close.
        if (drawerRef.current && !drawerRef.current.contains(e.target as Node)) {
            setIsOpen(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-[60] flex justify-end transition-all"
            onClick={handleBackdropClick}
        >
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/30 backdrop-blur-sm animate-in fade-in duration-300"></div>

            {/* Sidebar Panel */}
            <div
                ref={drawerRef}
                className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300"
            >
                {/* Header */}
                <div className="flex items-center justify-between p-5 border-b border-gray-100 bg-white">
                    <div className="flex items-center gap-3">
                        <h2 className="text-xl font-bold text-gray-900">Your Cart ({items.length})</h2>
                        {items.length > 0 && (
                            <button
                                onClick={clearCart}
                                className="text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded-md transition-colors"
                            >
                                Remove All
                            </button>
                        )}
                    </div>
                    <button
                        onClick={() => setIsOpen(false)}
                        className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto p-5 space-y-6">
                    {items.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                            <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center text-gray-400">
                                <ShoppingBag className="w-10 h-10" />
                            </div>
                            <div>
                                <h3 className="text-lg font-medium text-gray-900">Your cart is empty</h3>
                                <p className="text-sm text-gray-500 mt-1">Looks like you haven't added anything yet.</p>
                            </div>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="px-6 py-2.5 bg-culina-green text-white font-medium rounded-full hover:bg-emerald-600 transition-colors"
                            >
                                Start Shopping
                            </button>
                        </div>
                    ) : (
                        items.map((item) => (
                            <div key={item.id} className="flex gap-4">
                                {/* Image */}
                                <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50 relative">
                                    {item.image ? (
                                        <Image
                                            src={item.image}
                                            alt={item.name}
                                            fill
                                            className="object-cover object-center"
                                            unoptimized // For development/local images
                                        />
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-gray-300">
                                            <ImageIcon className="w-8 h-8" />
                                        </div>
                                    )}
                                </div>

                                {/* Details */}
                                <div className="flex flex-1 flex-col justify-between">
                                    <div>
                                        <div className="flex justify-between">
                                            <h3 className="text-base font-semibold text-gray-900 line-clamp-2">
                                                <Link href="#">{item.name}</Link>
                                            </h3>
                                            <p className="ml-4 text-base font-semibold text-gray-900">
                                                Rp {(item.price * item.quantity).toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        {/* Quantity Control */}
                                        <div className="flex items-center border border-gray-200 rounded-lg">
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                                className="p-1 px-2 text-gray-600 hover:text-culina-green hover:bg-gray-50 rounded-l-lg transition-colors"
                                            >
                                                −
                                            </button>
                                            <span className="px-2 text-sm font-medium text-gray-900 min-w-[20px] text-center">
                                                {item.quantity}
                                            </span>
                                            <button
                                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                                className="p-1 px-2 text-gray-600 hover:text-culina-green hover:bg-gray-50 rounded-r-lg transition-colors"
                                            >
                                                +
                                            </button>
                                        </div>

                                        <button
                                            type="button"
                                            onClick={() => removeItem(item.id)}
                                            className="text-sm font-medium text-red-500 hover:text-red-700 transition-colors"
                                        >
                                            Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                {items.length > 0 && (
                    <div className="border-t border-gray-100 bg-gray-50 p-6 space-y-4">
                        <div className="flex items-center justify-between text-base font-medium text-gray-900">
                            <p>Subtotal</p>
                            <p className="text-xl">Rp {totalPrice.toLocaleString('id-ID')}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-gray-500">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                            <Link
                                href="/checkout"
                                className="flex items-center justify-center rounded-xl border border-transparent bg-culina-green px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-emerald-600 hover:shadow-lg hover:-translate-y-0.5 transition-all"
                                onClick={() => setIsOpen(false)}
                            >
                                Checkout
                            </Link>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
