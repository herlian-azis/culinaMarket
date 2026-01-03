'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Search, Plus, Pencil, Trash2, X, CheckCircle, AlertTriangle, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
// Badge wasn't utilized in the 'current' version for Products, but we can re-introduce it if it matches the style, or just keep text. 
// User asked to make 'current design' the system. The current design uses simple text for category: <p className="text-xs text-gray-500 uppercase">{product.category}</p>
// I will respecting that and NOT force Badge here unless requested, to ensure 1:1 match.

type Product = {
    id: string;
    name: string;
    category: string;
    price: number;
    stock_quantity: number;
    image_url: string;
};

type ProductForm = {
    name: string;
    category: string;
    sku: string;
    price: number;
    stock_quantity: number;
    image_url: string;
    description: string;
    nutrition_info: {
        calories: string;
        protein: string;
        carbs: string;
        fat: string;
    };
};

const emptyForm: ProductForm = {
    name: '',
    category: '',
    sku: '',
    price: 0,
    stock_quantity: 0,
    image_url: '',
    description: '',
    nutrition_info: {
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
    }
};

const CATEGORIES = [
    'Vegetables',
    'Fruits',
    'Meat & Seafood',
    'Dairy & Eggs',
    'Bakery',
    'Pantry',
    'Beverages',
    'Snacks',
    'Household'
];

export default function AdminProductsPage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [form, setForm] = useState<ProductForm>(emptyForm);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; productId: string | null; productName: string }>({
        isOpen: false, productId: null, productName: ''
    });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 8; // Showing 8 products per page for grid layout (4x2)

    useEffect(() => {
        fetchProducts();
    }, [currentPage]);

    const fetchProducts = async () => {
        setLoading(true);
        let query = supabase
            .from('products')
            .select('*', { count: 'exact' })
            .or('is_deleted.is.null,is_deleted.eq.false')
            .order('name');

        // Note: Similar to orders, we're doing server-side pagination.
        // Client-side search is preserved on the fetched page for simplicity/speed 
        // without full server-side search implementation which requires text index setup.

        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, count } = await query.range(from, to);

        setProducts(data || []);
        if (count) {
            setTotalPages(Math.ceil(count / itemsPerPage));
        } else {
            setTotalPages(1);
        }
        setLoading(false);
    };

    const openAddModal = () => {
        setForm(emptyForm);
        setEditingId(null);
        setIsModalOpen(true);
    };

    const openEditModal = (product: Product) => {
        const defaultNutrition = { calories: '', protein: '', carbs: '', fat: '' };
        let nutrition = defaultNutrition;

        const rawNutrition = (product as any).nutrition_info;
        if (typeof rawNutrition === 'object' && rawNutrition !== null) {
            nutrition = { ...defaultNutrition, ...rawNutrition };
        }

        setForm({
            name: product.name,
            category: product.category,
            sku: (product as any).sku || '',
            price: product.price,
            stock_quantity: product.stock_quantity,
            image_url: product.image_url || '',
            description: (product as any).description || '',
            nutrition_info: nutrition
        });
        setEditingId(product.id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        if (editingId) {
            // Update
            const { error } = await supabase
                .from('products')
                .update({
                    name: form.name,
                    category: form.category,
                    sku: form.sku,
                    price: form.price,
                    stock_quantity: form.stock_quantity,
                    image_url: form.image_url,
                    description: form.description,
                    nutrition_info: form.nutrition_info
                })
                .eq('id', editingId);

            if (!error) {
                fetchProducts();
                setIsModalOpen(false);
                setNotification({ message: 'Produk berhasil diperbarui!', type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            }
        } else {
            // Insert
            const { error } = await supabase
                .from('products')
                .insert({
                    name: form.name,
                    category: form.category,
                    sku: form.sku,
                    price: form.price,
                    stock_quantity: form.stock_quantity,
                    image_url: form.image_url,
                    description: form.description,
                    nutrition_info: form.nutrition_info
                });

            if (!error) {
                fetchProducts();
                setIsModalOpen(false);
                setNotification({ message: 'Produk berhasil ditambahkan!', type: 'success' });
                setTimeout(() => setNotification(null), 3000);
            }
        }

        setSaving(false);
    };

    const handleDeleteClick = (product: Product) => {
        setDeleteConfirm({ isOpen: true, productId: product.id, productName: product.name });
    };

    const handleDeleteConfirm = async () => {
        if (!deleteConfirm.productId) return;

        // Soft delete - set is_deleted to true instead of actual delete
        const { error } = await supabase
            .from('products')
            .update({ is_deleted: true })
            .eq('id', deleteConfirm.productId);

        if (!error) {
            setProducts(products.filter(p => p.id !== deleteConfirm.productId));
            setNotification({ message: 'Produk berhasil dihapus!', type: 'success' });
            setTimeout(() => setNotification(null), 3000);
        } else {
            setNotification({ message: 'Gagal menghapus produk: ' + error.message, type: 'error' });
            setTimeout(() => setNotification(null), 3000);
        }

        setDeleteConfirm({ isOpen: false, productId: null, productName: '' });
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Modern Toast Notification */}
            {notification && (
                <div className="fixed top-20 right-6 z-50 animate-[slideIn_0.3s_ease-out]">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border ${notification.type === 'success'
                        ? 'bg-gradient-to-r from-emerald-500/90 to-green-500/90 border-emerald-400/30 text-white'
                        : 'bg-gradient-to-r from-red-500/90 to-rose-500/90 border-red-400/30 text-white'
                        }`}>
                        <div className={`p-2 rounded-full ${notification.type === 'success' ? 'bg-white/20' : 'bg-white/20'}`}>
                            <CheckCircle className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="font-semibold">{notification.type === 'success' ? 'Berhasil!' : 'Error!'}</p>
                            <p className="text-sm text-white/90">{notification.message}</p>
                        </div>
                        <button
                            onClick={() => setNotification(null)}
                            className="ml-4 p-1 hover:bg-white/20 rounded-full transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            )}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Products Management</h1>
                    <p className="text-gray-500">Add, edit, and manage products</p>
                </div>
                <Button
                    onClick={openAddModal}
                    leftIcon={<Plus className="w-5 h-5" />}
                >
                    Add Product
                </Button>
            </div>

            {/* Search */}
            <div className="max-w-md">
                <Input
                    placeholder="Search products..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                />
            </div>

            {/* Products Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product) => (
                    <Card key={product.id} noPadding>
                        <div className="aspect-square relative bg-gray-100">
                            {product.image_url ? (
                                <Image
                                    src={product.image_url}
                                    alt={product.name}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-4xl">🥕</div>
                            )}
                        </div>
                        <div className="p-4">
                            <p className="text-xs text-gray-500 uppercase">{product.category}</p>
                            <h3 className="font-medium text-gray-900 mt-1">{product.name}</h3>
                            <div className="flex items-center justify-between mt-2">
                                <p className="font-bold text-emerald-600">Rp {product.price.toLocaleString('id-ID')}</p>
                                <p className="text-sm text-gray-500">Stock: {product.stock_quantity}</p>
                            </div>
                            <div className="flex gap-2 mt-4">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    className="flex-1"
                                    onClick={() => openEditModal(product)}
                                    leftIcon={<Pencil className="w-4 h-4" />}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => handleDeleteClick(product)}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {/* Pagination Controls */}
            <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 rounded-lg shadow-sm">
                <div className="flex flex-1 justify-between sm:hidden">
                    <button
                        onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Previous
                    </button>
                    <button
                        onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                        disabled={currentPage === totalPages}
                        className="relative ml-3 inline-flex items-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Next
                    </button>
                </div>
                <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
                    <div>
                        <p className="text-sm text-gray-700">
                            Showing page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
                        </p>
                    </div>
                    <div>
                        <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(curr => Math.max(1, curr - 1))}
                                disabled={currentPage === 1}
                                className="mr-2"
                            >
                                <span className="sr-only">Previous</span>
                                <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                            </Button>
                            {/* Page Numbers */}
                            {[...Array(totalPages)].map((_, i) => (
                                <button
                                    key={i + 1}
                                    onClick={() => setCurrentPage(i + 1)}
                                    className={`relative inline-flex items-center px-4 py-2 text-sm font-semibold ring-1 ring-inset ring-gray-300 focus:z-20 focus:outline-offset-0 ${currentPage === i + 1
                                        ? 'z-10 bg-emerald-600 text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600'
                                        : 'text-gray-900 hover:bg-gray-50 focus:z-20 focus:outline-offset-0'
                                        }`}
                                >
                                    {i + 1}
                                </button>
                            ))}
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(curr => Math.min(totalPages, curr + 1))}
                                disabled={currentPage === totalPages}
                            >
                                <span className="sr-only">Next</span>
                                <ChevronRight className="h-5 w-5" aria-hidden="true" />
                            </Button>
                        </nav>
                    </div>
                </div>
            </div>

            {filteredProducts.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    No products found
                </div>
            )}

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[90vh] overflow-y-auto shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingId ? 'Edit Product' : 'Add Product'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {/* Left Column: Basic Info */}
                                <div className="space-y-6">
                                    <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Informasi Produk</h3>
                                    <div>
                                        <Input
                                            label="Nama Produk"
                                            value={form.name}
                                            onChange={(e) => setForm({ ...form, name: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Kategori</label>
                                            <select
                                                value={form.category}
                                                onChange={(e) => setForm({ ...form, category: e.target.value })}
                                                required
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none appearance-none"
                                            >
                                                <option value="">Pilih Kategori</option>
                                                {CATEGORIES.map(cat => (
                                                    <option key={cat} value={cat}>{cat}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div>
                                            <Input
                                                label="SKU"
                                                value={form.sku}
                                                onChange={(e) => setForm({ ...form, sku: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <Input
                                                label="Harga (Rp)"
                                                type="number"
                                                value={form.price}
                                                onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                        <div>
                                            <Input
                                                label="Stok"
                                                type="number"
                                                value={form.stock_quantity}
                                                onChange={(e) => setForm({ ...form, stock_quantity: Number(e.target.value) })}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Deskripsi</label>
                                        <textarea
                                            value={form.description}
                                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                                            rows={5}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-none min-h-[120px]"
                                        />
                                    </div>
                                </div>

                                {/* Right Column: Details & Images */}
                                <div className="space-y-8">
                                    {/* Nutrition Info */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Informasi Nutrisi</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Calories</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 100 kcal"
                                                    value={form.nutrition_info.calories}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        nutrition_info: { ...form.nutrition_info, calories: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Protein</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 5g"
                                                    value={form.nutrition_info.protein}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        nutrition_info: { ...form.nutrition_info, protein: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Carbs</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 15g"
                                                    value={form.nutrition_info.carbs}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        nutrition_info: { ...form.nutrition_info, carbs: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-xs text-gray-500 mb-1">Fat</label>
                                                <input
                                                    type="text"
                                                    placeholder="e.g. 2g"
                                                    value={form.nutrition_info.fat}
                                                    onChange={(e) => setForm({
                                                        ...form,
                                                        nutrition_info: { ...form.nutrition_info, fat: e.target.value }
                                                    })}
                                                    className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Image URL */}
                                    <div className="space-y-4">
                                        <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Media</h3>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
                                            <input
                                                type="url"
                                                value={form.image_url}
                                                onChange={(e) => setForm({ ...form, image_url: e.target.value })}
                                                className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none"
                                                placeholder="https://..."
                                            />
                                        </div>
                                        {/* Image Preview */}
                                        <div className="aspect-video relative bg-gray-50 rounded-lg overflow-hidden border border-dashed border-gray-300 flex items-center justify-center">
                                            {form.image_url ? (
                                                <Image
                                                    src={form.image_url}
                                                    alt="Preview"
                                                    fill
                                                    className="object-cover"
                                                    unoptimized
                                                    onError={(e) => {
                                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400?text=Invalid+Image+URL';
                                                    }}
                                                />
                                            ) : (
                                                <div className="text-gray-400 text-sm flex flex-col items-center">
                                                    <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                                                    <span>Preview Image</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-6 border-t border-gray-100 mt-6">
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={() => setIsModalOpen(false)}
                                    className="flex-1"
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={saving}
                                    isLoading={saving}
                                    className="flex-1"
                                >
                                    {editingId ? 'Simpan Perubahan' : 'Tambah Produk'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-3xl w-full max-w-md p-8 shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex flex-col items-center text-center">
                            {/* Icon */}
                            <div className="h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-5">
                                <AlertTriangle className="w-8 h-8 text-red-600" />
                            </div>

                            {/* Title */}
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Hapus Produk?
                            </h3>

                            {/* Message */}
                            <p className="text-gray-500 mb-6">
                                Apakah Anda yakin ingin menghapus <span className="font-semibold text-gray-700">&quot;{deleteConfirm.productName}&quot;</span>?
                                Tindakan ini tidak dapat dibatalkan.
                            </p>

                            {/* Buttons */}
                            <div className="flex gap-3 w-full">
                                <button
                                    onClick={() => setDeleteConfirm({ isOpen: false, productId: null, productName: '' })}
                                    className="flex-1 px-5 py-3 text-gray-700 bg-gray-100 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                                >
                                    Batal
                                </button>
                                <button
                                    onClick={handleDeleteConfirm}
                                    className="flex-1 px-5 py-3 bg-red-600 text-white rounded-xl font-medium hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
                                >
                                    <Trash2 className="w-4 h-4" />
                                    Hapus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
