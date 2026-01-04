'use client';

import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useState, useEffect, Suspense, useCallback } from 'react';
import Link from 'next/link';
import { Search, ShoppingBag, User, LogOut, Package, X } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import CartDrawer from './CartDrawer';

function NavbarContent() {
  const { totalItems, items, setIsOpen } = useCart();
  const { user, signOut, loading } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();

  // Initialize search query from URL if we are on /shop
  const initialQuery = pathname === '/shop' ? searchParams.get('q') || '' : '';
  const [searchQuery, setSearchQuery] = useState(initialQuery);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  // Sync state with URL if URL changes (e.g. back button)
  useEffect(() => {
    if (pathname === '/shop') {
      const q = searchParams.get('q');
      if (q !== null) {
        setSearchQuery(q);
      } else {
        setSearchQuery('');
      }
    } else {
      setSearchQuery('');
    }
  }, [pathname, searchParams]);


  const updateSearchInfo = useCallback((term: string) => {
    // Logic: 
    // - If on /shop, update 'q' param (or delete if empty), keep other params.
    // - If NOT on /shop, if term is not empty, go to /shop?q=term.
    // - If NOT on /shop, and term is empty, do nothing or go to /shop?

    if (pathname === '/shop') {
      const params = new URLSearchParams(searchParams.toString());
      if (term.trim()) {
        params.set('q', term);
      } else {
        params.delete('q');
      }
      router.push(`/shop?${params.toString()}`);
    } else {
      if (term.trim()) {
        router.push(`/shop?q=${encodeURIComponent(term)}`);
      } else {
        // Check if we should redirect to shop without query? 
        // Usually user expects to just clear input.
        // If they hit enter on empty input on Home, maybe go to Shop?
        router.push('/shop');
      }
    }
  }, [pathname, searchParams, router]);

  // Instant Search Effect (Debounced)
  useEffect(() => {
    // Only auto-search if we are ON the shop page
    if (pathname === '/shop') {
      const timeoutId = setTimeout(() => {
        const currentQ = searchParams.get('q') || '';
        // Only push if value is different to avoid history clutter/loops
        if (searchQuery !== currentQ) {
          updateSearchInfo(searchQuery);
        }
      }, 500); // 500ms debounce

      return () => clearTimeout(timeoutId);
    }
  }, [searchQuery, pathname, searchParams, updateSearchInfo]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    updateSearchInfo(searchQuery);
  };

  const clearSearch = () => {
    setSearchQuery('');
    updateSearchInfo('');
  };

  const handleSignOut = async () => {
    await signOut();
    setUserMenuOpen(false);
    router.push('/');
  };

  return (
    <>
      <nav className="sticky top-0 z-50 w-full border-b border-gray-100 bg-white/80 backdrop-blur-md px-4 sm:px-6 lg:px-8">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between">
          {/* Logo */}
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold tracking-tight text-culina-green">
              Culina<span className="text-culina-navy">Market</span>
            </Link>
          </div>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-8">
            <Link href="/shop" className="text-sm font-medium text-gray-700 hover:text-culina-green transition-colors">
              Shop
            </Link>
            <Link href="/recipes" className="text-sm font-medium text-gray-700 hover:text-culina-green transition-colors">
              Recipes
            </Link>
            <Link href="/concierge" className="text-sm font-medium text-gray-700 hover:text-culina-green transition-colors">
              Concierge
            </Link>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <div className="relative flex items-center w-64 transition-all duration-300 ease-in-out">
              <form
                onSubmit={handleSearch}
                className="flex items-center w-full rounded-full border border-gray-200 bg-gray-50 pl-4 pr-10 hover:shadow-sm focus-within:shadow-sm focus-within:border-culina-green/50 transition-all duration-300"
              >
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search..."
                  className="w-full bg-transparent text-sm text-gray-900 placeholder:text-gray-400 focus:outline-none py-2"
                />
                {searchQuery ? (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-culina-green transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="submit"
                    className="absolute right-1 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-culina-green transition-colors"
                  >
                    <Search className="w-4 h-4" />
                  </button>
                )}
              </form>
            </div>

            <button
              onClick={() => setIsOpen(true)}
              className="relative p-2 text-gray-500 hover:text-culina-navy transition-colors group"
            >
              <span className="sr-only">Cart</span>
              <ShoppingBag className="w-5 h-5 group-hover:scale-110 transition-transform" />
              {items.length > 0 && (
                <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-culina-green text-[10px] font-bold text-white shadow-sm ring-2 ring-white">
                  {items.length}
                </span>
              )}
            </button>

            {/* User Menu */}
            {!loading && (
              user ? (
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center gap-2 p-2 text-gray-500 hover:text-culina-navy transition-colors"
                  >
                    <div className="h-8 w-8 rounded-full bg-culina-green/10 flex items-center justify-center">
                      <User className="w-4 h-4 text-culina-green" />
                    </div>
                  </button>

                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg border border-gray-100 py-2 z-50">
                      <div className="px-4 py-2 border-b border-gray-100">
                        <p className="text-sm font-medium text-gray-900 truncate">{user.email}</p>
                      </div>
                      <Link
                        href="/orders"
                        onClick={() => setUserMenuOpen(false)}
                        className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                      >
                        <Package className="w-4 h-4" />
                        My Orders
                      </Link>
                      <button
                        onClick={handleSignOut}
                        className="flex items-center gap-2 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                      >
                        <LogOut className="w-4 h-4" />
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-medium text-white bg-culina-navy rounded-lg hover:bg-blue-900 transition-colors"
                >
                  Login
                </Link>
              )
            )}
          </div>
        </div>
      </nav>
      <CartDrawer />
    </>
  );
}

export default function Navbar() {
  return (
    <Suspense fallback={<div className="h-16 bg-white/80 border-b border-gray-100" />}>
      <NavbarContent />
    </Suspense>
  );
}
