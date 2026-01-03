'use client';

import { useCart } from '@/context/CartContext';
import { useEffect, useState } from 'react';

export default function CartNotification() {
    const { lastAddedItem, totalPrice } = useCart();
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        if (lastAddedItem) {
            setVisible(true);
            const timer = setTimeout(() => setVisible(false), 3000); // Syncs with context clear
            return () => clearTimeout(timer);
        }
    }, [lastAddedItem]);

    if (!lastAddedItem && !visible) return null;

    return (
        <div
            className={`fixed bottom-6 left-1/2 -translate-x-1/2 z-[70] transform transition-all duration-300 ${visible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
                }`}
        >
            <div className="flex items-center gap-4 rounded-full bg-gray-900/90 py-3 px-6 text-white shadow-2xl backdrop-blur-md">
                <div className="flex flex-col">
                    <span className="text-sm font-medium text-gray-200">Added to cart via Concierge</span>
                    <span className="text-base font-bold text-white">{lastAddedItem?.name || 'Item'}</span>
                </div>
                <div className="h-8 w-px bg-gray-700/50 mx-2"></div>
                <div className="flex flex-col items-end">
                    <span className="text-xs font-medium text-gray-400">Total</span>
                    <span className="text-sm font-bold text-culina-green">Rp {totalPrice.toLocaleString('id-ID')}</span>
                </div>
            </div>
        </div>
    );
}
