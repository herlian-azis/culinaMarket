'use client';

import { useState, useRef, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import { useCart } from '@/context/CartContext';
import { Sparkles, Send } from 'lucide-react';

type Message = {
    role: 'user' | 'ai';
    text: string;
    action?: {
        type: 'add_to_cart';
        items: { id: string; name: string; price: number; image_url?: string }[];
    };
};
import Image from 'next/image';

export default function ConciergePage() {
    const { addItem } = useCart();
    const [messages, setMessages] = useState<Message[]>([
        { role: 'ai', text: 'Welcome to the Concierge! I can help you find recipes or products. Try asking for "pasta" or "steak".' }
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const isInitialRender = useRef(true);

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    useEffect(() => {
        // Skip scroll on initial render
        if (isInitialRender.current) {
            isInitialRender.current = false;
            return;
        }
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSend = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!input.trim()) return;

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
                    history: messages.map(m => ({ role: m.role, text: m.text })) // Clean history
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

    const handleAddAll = (items: { id: string; name: string; price: number; image_url?: string }[]) => {
        items.forEach(item => {
            addItem({
                id: item.id || Math.random().toString(), // fallback if id missing
                name: item.name,
                price: item.price,
                image: item.image_url // Map to 'image' for CartContext
            });
        });
    };

    return (
        <div className="h-screen bg-culina-off-white flex flex-col overflow-hidden">
            <Navbar />

            <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 lg:p-8 flex flex-col overflow-hidden">
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">

                    {/* Header */}
                    <div className="p-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-3">
                        <div className="h-10 w-10 rounded-full bg-culina-green/10 flex items-center justify-center text-culina-green">
                            <Sparkles className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-gray-900">Culina Concierge</h1>
                            <p className="text-sm text-gray-500">Your AI Shopping Assistant</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-6 sm:p-6">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`flex flex-col gap-2 ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                                <div className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-5 py-4 text-base shadow-sm ${msg.role === 'user'
                                    ? 'bg-culina-navy text-white rounded-br-none'
                                    : 'bg-gray-50 text-gray-800 rounded-bl-none border border-gray-100'
                                    }`}>
                                    {msg.text}
                                </div>

                                {/* Action Card */}
                                {msg.action?.type === 'add_to_cart' && msg.action.items && msg.action.items.length > 0 && (
                                    <div className="mt-2 w-full max-w-[300px] rounded-xl bg-white p-4 shadow-lg border border-gray-100">
                                        <p className="mb-3 text-xs font-bold text-gray-500 uppercase tracking-wider">Recommended Items</p>
                                        <ul className="space-y-3 mb-4">
                                            {msg.action.items.map((item, i) => (
                                                <li key={i} className="flex items-center gap-3 text-sm">
                                                    {item.image_url && (
                                                        <div className="relative w-10 h-10 flex-shrink-0 rounded-md overflow-hidden bg-gray-100">
                                                            <Image
                                                                src={item.image_url}
                                                                alt={item.name}
                                                                fill
                                                                className="object-cover"
                                                                sizes="40px"
                                                            />
                                                        </div>
                                                    )}
                                                    <div className="flex-1 min-w-0">
                                                        <div className="text-gray-900 font-medium truncate">{item.name}</div>
                                                        <div className="text-gray-400 text-xs">Rp {item.price.toLocaleString('id-ID')}</div>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                        <button
                                            onClick={() => handleAddAll(msg.action!.items)}
                                            className="w-full py-2.5 bg-culina-green text-white text-sm font-bold rounded-lg hover:bg-emerald-600 transition-colors shadow-sm flex items-center justify-center gap-2"
                                        >
                                            <span>Add to Cart</span>
                                            <span>→</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex justify-start">
                                <div className="bg-gray-50 border border-gray-100 rounded-2xl rounded-bl-none px-5 py-4 shadow-sm">
                                    <div className="flex space-x-1.5 h-6 items-center">
                                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.3s]"></div>
                                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce [animation-delay:-0.15s]"></div>
                                        <div className="h-2 w-2 rounded-full bg-gray-400 animate-bounce"></div>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="p-4 bg-white border-t border-gray-100 sm:p-6">
                        <form onSubmit={handleSend} className="relative max-w-3xl mx-auto">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Examples: 'I want a pasta recipe', 'Do we have fresh salmon?'"
                                className="w-full rounded-full border border-gray-200 bg-gray-50 pl-6 pr-14 py-4 text-base text-gray-900 focus:border-culina-green focus:ring-2 focus:ring-culina-green/20 focus:outline-none transition-all placeholder:text-gray-400"
                            />
                            <button
                                type="submit"
                                className="absolute right-3 top-1/2 -translate-y-1/2 p-2.5 rounded-full bg-culina-green text-white hover:bg-emerald-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm flex items-center justify-center"
                                disabled={!input.trim() || isTyping}
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </form>
                    </div>

                </div>
            </main>
        </div>
    );
}
