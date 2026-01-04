'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Facebook, Twitter, Instagram, Linkedin, Mail, MapPin, Phone } from 'lucide-react';

export default function Footer() {
    const pathname = usePathname();
    const isAdmin = pathname?.startsWith('/admin');

    if (isAdmin) return null;

    return (
        <footer className="bg-gray-50 border-t border-gray-100 pt-16 pb-8">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
                    {/* Brand Identity */}
                    <div>
                        <Link href="/" className="text-2xl font-bold tracking-tight text-culina-green mb-4 inline-block">
                            Culina<span className="text-culina-navy">Market</span>
                        </Link>
                        <p className="text-gray-500 text-sm leading-6 mb-6">
                            Fresh ingredients, smart recipes, and instant delivery. Revolutionizing your kitchen experience with AI.
                        </p>
                        <div className="flex space-x-4">
                            <a href="#" className="text-gray-400 hover:text-culina-green transition-colors">
                                <Facebook className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-culina-green transition-colors">
                                <Twitter className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-culina-green transition-colors">
                                <Instagram className="w-5 h-5" />
                            </a>
                            <a href="#" className="text-gray-400 hover:text-culina-green transition-colors">
                                <Linkedin className="w-5 h-5" />
                            </a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Shop</h3>
                        <ul className="space-y-3">
                            {['Fresh Produce', 'Meat & Seafood', 'Dairy & Eggs', 'Bakery', 'Pantry Essentials'].map((item) => (
                                <li key={item}>
                                    <Link href="/shop" className="text-sm text-gray-500 hover:text-culina-green transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Support */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Company</h3>
                        <ul className="space-y-3">
                            {['About Us', 'Careers', 'Privacy Policy', 'Terms of Service', 'Contact Support'].map((item) => (
                                <li key={item}>
                                    <Link href="#" className="text-sm text-gray-500 hover:text-culina-green transition-colors">
                                        {item}
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Contact */}
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider mb-4">Contact</h3>
                        <ul className="space-y-4">
                            <li className="flex items-start gap-3 text-sm text-gray-500">
                                <MapPin className="w-5 h-5 text-culina-green shrink-0" />
                                <span>123 Market Street<br />Jakarta, Indonesia 12000</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <Phone className="w-5 h-5 text-culina-green shrink-0" />
                                <span>+62 21 555 0123</span>
                            </li>
                            <li className="flex items-center gap-3 text-sm text-gray-500">
                                <Mail className="w-5 h-5 text-culina-green shrink-0" />
                                <span>hello@culinamarket.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="border-t border-gray-200 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
                    <p className="text-xs text-gray-400">
                        &copy; {new Date().getFullYear()} CulinaMarket AI. All rights reserved.
                    </p>
                    <div className="flex gap-6">
                        <Link href="#" className="text-xs text-gray-400 hover:text-gray-900">Privacy</Link>
                        <Link href="#" className="text-xs text-gray-400 hover:text-gray-900">Terms</Link>
                        <Link href="#" className="text-xs text-gray-400 hover:text-gray-900">Cookies</Link>
                    </div>
                </div>
            </div>
        </footer>
    );
}
