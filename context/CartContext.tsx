'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type CartItem = {
    id: string; // Product ID
    name: string;
    price: number;
    quantity: number;
    image?: string; // Added image support
};

interface CartContextType {
    items: CartItem[];
    addItem: (product: { id: string | number; name: string; price: number; image?: string }) => void;
    removeItem: (id: string) => void;
    updateQuantity: (id: string, quantity: number) => void;
    clearCart: () => void;
    totalItems: number;
    totalPrice: number;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
    lastAddedItem: { name: string; price: number } | null;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [isOpen, setIsOpen] = useState(false);

    const [lastAddedItem, setLastAddedItem] = useState<{ name: string; price: number } | null>(null);

    // Load from localStorage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem('culina-cart');
        if (savedCart) {
            try {
                setItems(JSON.parse(savedCart));
            } catch (error) {
                console.error("Failed to parse cart from storage", error);
            }
        }
    }, []);

    // Save to localStorage on change
    useEffect(() => {
        localStorage.setItem('culina-cart', JSON.stringify(items));
    }, [items]);

    // Clear notification after 3 seconds
    useEffect(() => {
        if (lastAddedItem) {
            const timer = setTimeout(() => setLastAddedItem(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [lastAddedItem]);

    const addItem = (product: { id: string | number; name: string; price: number; image?: string }) => {
        setItems((prev) => {
            const existing = prev.find((item) => item.id === String(product.id));
            if (existing) {
                return prev.map((item) =>
                    item.id === String(product.id) ? { ...item, quantity: item.quantity + 1 } : item
                );
            }
            return [...prev, {
                id: String(product.id),
                name: product.name,
                price: product.price,
                quantity: 1,
                image: product.image
            }];
        });
        // NOTIFICATION LOGIC: Set the item to show in toast, DO NOT open drawer
        setLastAddedItem({ name: product.name, price: product.price });
    };

    const removeItem = (id: string) => {
        setItems((prev) => prev.filter((item) => item.id !== id));
    };

    const updateQuantity = (id: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(id);
            return;
        }
        setItems((prev) =>
            prev.map((item) => (item.id === id ? { ...item, quantity } : item))
        );
    };

    const clearCart = () => {
        setItems([]);
    };

    const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);
    const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    return (
        <CartContext.Provider value={{
            items,
            addItem,
            removeItem,
            updateQuantity,
            clearCart,
            totalItems,
            totalPrice,
            isOpen,
            setIsOpen,
            lastAddedItem
        }}>
            {children}
        </CartContext.Provider>
    );
}

export function useCart() {
    const context = useContext(CartContext);
    if (context === undefined) {
        throw new Error('useCart must be used within a CartProvider');
    }
    return context;
}
