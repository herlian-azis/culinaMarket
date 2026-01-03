'use client';

import Link from 'next/link';
import Navbar from '@/components/Navbar';
import { CheckCircle } from 'lucide-react';

export default function SuccessPage() {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />
            <main className="flex flex-col items-center justify-center p-4 min-h-[80vh]">
                <div className="bg-white p-8 sm:p-12 rounded-3xl shadow-sm border border-gray-100 max-w-lg w-full text-center">
                    <div className="h-24 w-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle className="w-12 h-12 text-culina-green animate-in zoom-in duration-300" />
                    </div>

                    <h1 className="text-3xl font-bold text-gray-900 mb-2">Order Confirmed!</h1>
                    <p className="text-gray-500 mb-8">
                        Thank you for your purchase. Your order <span className="font-mono font-medium text-gray-900">#ORD-{Math.floor(1000 + Math.random() * 9000)}</span> has been received.
                    </p>

                    <div className="space-y-3">
                        <Link
                            href="/shop"
                            className="block w-full rounded-xl bg-culina-green px-6 py-4 text-base font-bold text-white shadow-sm hover:bg-emerald-600 transition-all"
                        >
                            Continue Shopping
                        </Link>
                        <Link
                            href="/"
                            className="block w-full rounded-xl px-6 py-4 text-base font-bold text-gray-600 hover:bg-gray-50 transition-all"
                        >
                            Back to Home
                        </Link>
                    </div>
                </div>
            </main>
        </div>
    );
}
