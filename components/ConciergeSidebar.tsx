'use client';

import { useState, useRef, useEffect } from 'react';
import { useCart } from '@/context/CartContext';
import { Sparkles, X, Send } from 'lucide-react';

import Image from 'next/image';

type Message = {
    role: 'user' | 'ai';
    text: string;
    action?: {
        type: 'add_to_cart';
        items: { name: string; price: number; image_url?: string }[];
    };
};

export default function ConciergeSidebar() {
    const { addItem } = useCart();
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: 'Hello! I can help you plan meals based on what is in stock locally. What are you craving today?' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const toggleSidebar = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping, isOpen]);

    const handleAddAll = (items: { name: string; price: number; image_url?: string }[]) => {
        items.forEach(item => {
            addItem({ id: Math.random(), name: item.name, price: item.price, image: item.image_url });
        });
        // Optional: Add visual feedback toast or animation here
    };

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

        // Add user message
        const userMsg: Message = { role: 'user', text: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMsg.text,
                    history: messages.map(m => ({ role: m.role, text: m.text }))
                })
            });
            const data = await res.json();

            if (res.ok) {
                setMessages(prev => [...prev, data]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I encountered an error. Please try again.' }]);
            }

        } catch (error) {
            console.error('Chat error:', error);
            setMessages(prev => [...prev, { role: 'ai', text: 'Sorry, I seems to be having trouble connecting. Please try again.' }]);
        } finally {
            setIsTyping(false);
        }
    };

    return (
        <>
            {/* Toggle Button (Visible when closed) */}
            {!isOpen && (
                <button
                    onClick={toggleSidebar}
                    className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-culina-navy text-white shadow-xl hover:bg-blue-900 hover:scale-105 transition-all"
                >
                    <Sparkles className="w-8 h-8" />
                </button>
            )}

            {/* Sidebar Overlay */}
            {isOpen && (
                <div className="fixed inset-0 z-50 flex justify-end transition-all">
                    {/* Backdrop */}
                    <div className="absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity" onClick={toggleSidebar}></div>

                    {/* Sidebar Panel */}
                    <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
                        {/* Header */}
                        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-culina-off-white">
                            <div className="flex items-center gap-2">
                                <div className="h-8 w-8 rounded-full bg-culina-green/10 flex items-center justify-center text-culina-green">
                                    <Sparkles className="w-5 h-5" />
                                </div>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">Culina Concierge</h3>
                                    <p className="text-xs text-gray-500">Inventory-Aware AI</p>
                                </div>
                            </div>
                            <button onClick={toggleSidebar} className="p-2 text-gray-400 hover:text-gray-600">
                                <span className="sr-only">Close</span>
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
                            {messages.map((msg, idx) => (
                                <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                    <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm shadow-sm ${msg.role === 'user'
                                        ? 'bg-culina-navy text-white rounded-br-none'
                                        : 'bg-white text-gray-800 rounded-bl-none border border-gray-100'
                                        }`}>
                                        {msg.text}
                                    </div>

                                    {/* Action Card (e.g. Add to Cart) */}
                                    {msg.action?.type === 'add_to_cart' && msg.action.items && msg.action.items.length > 0 && (
                                        <div className="mt-1 w-[85%] rounded-xl bg-white p-3 shadow-md border border-gray-100">
                                            <p className="mb-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Recommended Cart</p>
                                            <ul className="space-y-2 mb-3">
                                                {msg.action.items.map((item, i) => (
                                                    <li key={i} className="flex items-center gap-3 text-sm">
                                                        {item.image_url && (
                                                            <div className="relative w-8 h-8 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                                <Image
                                                                    src={item.image_url}
                                                                    alt={item.name}
                                                                    fill
                                                                    className="object-cover"
                                                                    sizes="32px"
                                                                    unoptimized
                                                                />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="text-gray-700 font-medium truncate">{item.name}</div>
                                                            <div className="text-gray-400 text-xs">Rp {item.price.toLocaleString('id-ID')}</div>
                                                        </div>
                                                    </li>
                                                ))}
                                            </ul>
                                            <div className="pt-2 border-t border-gray-50 flex justify-between items-center">
                                                <span className="font-bold text-gray-900">
                                                    Rp {msg.action.items.reduce((sum, i) => sum + i.price, 0).toLocaleString('id-ID')}
                                                </span>
                                                <button
                                                    onClick={() => handleAddAll(msg.action!.items)}
                                                    className="px-3 py-1.5 bg-culina-green text-white text-xs font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm"
                                                >
                                                    Add to Cart
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}

                            {/* Typing Indicator */}
                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="bg-white border border-gray-100 rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                                        <div className="flex space-x-1">
                                            <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.3s]"></div>
                                            <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce [animation-delay:-0.15s]"></div>
                                            <div className="h-2 w-2 rounded-full bg-gray-300 animate-bounce"></div>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-white border-t border-gray-100">
                            <form onSubmit={handleSend} className="relative">
                                <input
                                    type="text"
                                    value={input}
                                    onChange={(e) => setInput(e.target.value)}
                                    placeholder="Examples: 'Pasta', 'Vegan salad', 'Steak'"
                                    className="w-full rounded-full border border-gray-200 bg-gray-50 pl-4 pr-12 py-3 text-sm text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 focus:outline-none transition-all placeholder:text-gray-400"
                                />
                                <button
                                    type="submit"
                                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-culina-green text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={!input.trim() || isTyping}
                                >
                                    <Send className="w-4 h-4" />
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
