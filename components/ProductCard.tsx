'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Plus } from 'lucide-react';
import { useCart } from '@/context/CartContext';

import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface ProductProps {
    id?: string | number;
    name: string;
    price: number;
    category: string;
    image?: string;
}

export default function ProductCard({ id, name, price, category, image }: ProductProps) {
    const { addItem } = useCart();

    return (
        <Card noPadding className="group relative transition-all hover:shadow-lg hover:-translate-y-1 hover:border-gray-100 p-4">
            {/* Image Container */}
            <div className="aspect-4/5 w-full overflow-hidden rounded-xl bg-gray-100 relative mb-4">
                {image ? (
                    // In real app, remove unoptimized
                    <Image src={image} alt={name} fill className="object-cover object-center group-hover:scale-105 transition-transform duration-300" unoptimized />
                ) : (
                    <div className="flex h-full w-full items-center justify-center text-gray-300">
                        <span className="text-4xl">🥕</span>
                    </div>
                )}

                {/* Quick Add Button (appears on hover) */}
                <div className="absolute bottom-3 right-3 z-10 translate-y-12 transition-all group-hover:translate-y-0">
                    <Button
                        size="icon"
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            addItem({ id: id || Math.random(), name, price, image });
                        }}
                        className="rounded-full shadow-md"
                    >
                        <Plus className="w-5 h-5" />
                    </Button>
                </div>
            </div>

            {/* Details */}
            <div>
                <h3 className="text-sm font-medium text-gray-900">
                    <Link href="#">
                        <span aria-hidden="true" className="absolute inset-0 z-0" />
                        {name}
                    </Link>
                </h3>
                <p className="mt-1 text-sm text-gray-500">{category}</p>
                <div className="mt-2 flex items-center justify-between">
                    <p className="text-lg font-semibold text-gray-900">Rp {price.toLocaleString('id-ID')}</p>
                </div>
            </div>
        </Card>
    );
}
