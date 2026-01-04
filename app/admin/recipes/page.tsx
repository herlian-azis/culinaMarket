'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import Image from 'next/image';
import { Search, Plus, Edit2, Trash2, Clock, ChefHat, X, Check, AlertTriangle, ImageIcon, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Pagination } from '@/components/ui/Pagination';

type Recipe = {
    id: string;
    title: string;
    description: string;
    instructions: string;
    difficulty_level: string;
    prep_time_minutes: number;
    image_url: string;
    created_at: string;
    ingredient_count?: number;
};

type Ingredient = {
    id: string;
    product_id: string;
    product_name: string;
    quantity_required: number;
    unit: string;
};

type Product = {
    id: string;
    name: string;
};

const difficultyOptions = ['Easy', 'Medium', 'Hard'];

const emptyForm = {
    title: '',
    description: '',
    instructions: '',
    difficulty_level: 'Easy',
    prep_time_minutes: 30,
    image_url: ''
};

export default function AdminRecipesPage() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingRecipe, setEditingRecipe] = useState<Recipe | null>(null);
    const [form, setForm] = useState(emptyForm);
    const [saving, setSaving] = useState(false);
    const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
    const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; recipeId: string | null; recipeName: string }>({ isOpen: false, recipeId: null, recipeName: '' });
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const itemsPerPage = 6;

    // Image upload states
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadingImage, setUploadingImage] = useState(false);
    const [urlError, setUrlError] = useState<string | null>(null);
    const [validatingUrl, setValidatingUrl] = useState(false);

    const validateImageUrl = async (url: string): Promise<boolean> => {
        if (!url) return true;
        try {
            new URL(url);
        } catch {
            setUrlError('URL tidak valid');
            return false;
        }
        setValidatingUrl(true);
        return new Promise((resolve) => {
            const img = new window.Image();
            img.onload = () => {
                setUrlError(null);
                setValidatingUrl(false);
                resolve(true);
            };
            img.onerror = () => {
                setUrlError('URL bukan gambar valid');
                setValidatingUrl(false);
                resolve(false);
            };
            img.src = url;
            setTimeout(() => {
                setValidatingUrl(false);
                resolve(false);
            }, 5000);
        });
    };

    // Ingredient management
    const [isIngredientModalOpen, setIsIngredientModalOpen] = useState(false);
    const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
    const [ingredients, setIngredients] = useState<Ingredient[]>([]);
    const [allProducts, setAllProducts] = useState<Product[]>([]);
    const [newIngredient, setNewIngredient] = useState({ product_id: '', quantity_required: 1, unit: 'pcs' });
    const [loadingIngredients, setLoadingIngredients] = useState(false);

    useEffect(() => {
        fetchRecipes();
    }, [currentPage]);

    useEffect(() => {
        fetchProducts();
    }, []);

    const fetchRecipes = async () => {
        setLoading(true);
        const from = (currentPage - 1) * itemsPerPage;
        const to = from + itemsPerPage - 1;

        const { data, count, error } = await supabase
            .from('recipes')
            .select('*', { count: 'exact' })
            .order('created_at', { ascending: false })
            .range(from, to);

        if (!error && data) {
            // Get ingredient counts
            const recipeIds = data.map(r => r.id);
            const { data: ingredientCounts } = await supabase
                .from('recipe_ingredients')
                .select('recipe_id')
                .in('recipe_id', recipeIds);

            const countMap: Record<string, number> = {};
            ingredientCounts?.forEach(i => {
                countMap[i.recipe_id] = (countMap[i.recipe_id] || 0) + 1;
            });

            setRecipes(data.map(r => ({ ...r, ingredient_count: countMap[r.id] || 0 })));
            setTotalPages(Math.ceil((count || 0) / itemsPerPage));
        }
        setLoading(false);
    };

    const fetchProducts = async () => {
        const { data } = await supabase
            .from('products')
            .select('id, name')
            .order('name');
        setAllProducts(data || []);
    };

    const fetchIngredients = async (recipeId: string) => {
        setLoadingIngredients(true);
        const { data } = await supabase
            .from('recipe_ingredients')
            .select(`
                id,
                product_id,
                quantity_required,
                unit,
                products:product_id (name)
            `)
            .eq('recipe_id', recipeId);

        if (data) {
            setIngredients(data.map((i: any) => ({
                id: i.id,
                product_id: i.product_id,
                product_name: i.products?.name || 'Unknown',
                quantity_required: i.quantity_required,
                unit: i.unit
            })));
        }
        setLoadingIngredients(false);
    };

    const handleImageUpload = async (file: File): Promise<string | null> => {
        setUploadingImage(true);
        try {
            const fileExt = file.name.split('.').pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
            const filePath = `recipes/${fileName}`;

            const { error: uploadError } = await supabase.storage
                .from('product-images')
                .upload(filePath, file);

            if (uploadError) {
                setNotification({ message: 'Gagal upload gambar: ' + uploadError.message, type: 'error' });
                setTimeout(() => setNotification(null), 3000);
                return null;
            }

            const { data: { publicUrl } } = supabase.storage
                .from('product-images')
                .getPublicUrl(filePath);

            return publicUrl;
        } catch (error) {
            console.error('Upload error:', error);
            return null;
        } finally {
            setUploadingImage(false);
        }
    };

    const openAddModal = () => {
        setEditingRecipe(null);
        setForm(emptyForm);
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openEditModal = (recipe: Recipe) => {
        setEditingRecipe(recipe);
        setForm({
            title: recipe.title,
            description: recipe.description || '',
            instructions: recipe.instructions || '',
            difficulty_level: recipe.difficulty_level || 'Easy',
            prep_time_minutes: recipe.prep_time_minutes || 30,
            image_url: recipe.image_url || ''
        });
        setImageFile(null);
        setIsModalOpen(true);
    };

    const openIngredientModal = (recipe: Recipe) => {
        setSelectedRecipe(recipe);
        fetchIngredients(recipe.id);
        setIsIngredientModalOpen(true);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);

        let finalImageUrl = form.image_url;
        if (imageFile) {
            const uploadedUrl = await handleImageUpload(imageFile);
            if (uploadedUrl) {
                finalImageUrl = uploadedUrl;
            }
        }

        const recipeData = {
            title: form.title,
            description: form.description,
            instructions: form.instructions,
            difficulty_level: form.difficulty_level,
            prep_time_minutes: form.prep_time_minutes,
            image_url: finalImageUrl
        };

        if (editingRecipe) {
            const { error } = await supabase
                .from('recipes')
                .update(recipeData)
                .eq('id', editingRecipe.id);

            if (!error) {
                setNotification({ message: 'Resep berhasil diupdate!', type: 'success' });
                fetchRecipes();
            } else {
                setNotification({ message: 'Gagal update resep: ' + error.message, type: 'error' });
            }
        } else {
            const { error } = await supabase
                .from('recipes')
                .insert([recipeData]);

            if (!error) {
                setNotification({ message: 'Resep berhasil ditambahkan!', type: 'success' });
                fetchRecipes();
            } else {
                setNotification({ message: 'Gagal menambah resep: ' + error.message, type: 'error' });
            }
        }

        setTimeout(() => setNotification(null), 3000);
        setSaving(false);
        setIsModalOpen(false);
        setImageFile(null);
    };

    const handleDelete = async () => {
        if (!deleteConfirm.recipeId) return;

        // Delete ingredients first
        await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('recipe_id', deleteConfirm.recipeId);

        const { error } = await supabase
            .from('recipes')
            .delete()
            .eq('id', deleteConfirm.recipeId);

        if (!error) {
            setNotification({ message: 'Resep berhasil dihapus!', type: 'success' });
            fetchRecipes();
        } else {
            setNotification({ message: 'Gagal menghapus resep: ' + error.message, type: 'error' });
        }

        setTimeout(() => setNotification(null), 3000);
        setDeleteConfirm({ isOpen: false, recipeId: null, recipeName: '' });
    };

    const handleAddIngredient = async () => {
        if (!selectedRecipe || !newIngredient.product_id) return;

        const { error } = await supabase
            .from('recipe_ingredients')
            .insert([{
                recipe_id: selectedRecipe.id,
                product_id: newIngredient.product_id,
                quantity_required: newIngredient.quantity_required,
                unit: newIngredient.unit
            }]);

        if (!error) {
            fetchIngredients(selectedRecipe.id);
            setNewIngredient({ product_id: '', quantity_required: 1, unit: 'pcs' });
            fetchRecipes(); // Update ingredient count
        }
    };

    const handleRemoveIngredient = async (ingredientId: string) => {
        if (!selectedRecipe) return;

        await supabase
            .from('recipe_ingredients')
            .delete()
            .eq('id', ingredientId);

        fetchIngredients(selectedRecipe.id);
        fetchRecipes();
    };

    const getDifficultyColor = (level: string) => {
        switch (level) {
            case 'Easy': return 'success';
            case 'Medium': return 'warning';
            case 'Hard': return 'error';
            default: return 'default';
        }
    };

    const filteredRecipes = recipes.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.description?.toLowerCase().includes(search.toLowerCase())
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
            {/* Notification */}
            {notification && (
                <div className="fixed top-20 right-6 z-[100] animate-[slideIn_0.3s_ease-out]">
                    <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl shadow-2xl backdrop-blur-sm border ${notification.type === 'success'
                        ? 'bg-emerald-500/90 border-emerald-400/30 text-white'
                        : 'bg-red-500/90 border-red-400/30 text-white'
                        }`}>
                        <div className="p-2 rounded-full bg-white/20">
                            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
                        </div>
                        <span className="font-medium">{notification.message}</span>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Recipes Management</h1>
                    <p className="text-gray-500">Add, edit, and manage recipes</p>
                </div>
                <Button onClick={openAddModal} leftIcon={<Plus className="w-5 h-5" />}>
                    Add Recipe
                </Button>
            </div>

            {/* Search */}
            <div className="flex-1">
                <Input
                    placeholder="Search recipes..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    leftIcon={<Search className="w-5 h-5" />}
                />
            </div>

            {/* Recipes Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredRecipes.map((recipe) => (
                    <Card key={recipe.id} noPadding>
                        <div className="aspect-video relative bg-gray-100">
                            {recipe.image_url ? (
                                <Image
                                    src={recipe.image_url}
                                    alt={recipe.title}
                                    fill
                                    className="object-cover"
                                    unoptimized
                                />
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center">
                                    <ChefHat className="w-12 h-12 text-gray-300" />
                                </div>
                            )}
                            <div className="absolute top-3 left-3">
                                <Badge variant={getDifficultyColor(recipe.difficulty_level) as any}>
                                    {recipe.difficulty_level}
                                </Badge>
                            </div>
                        </div>
                        <div className="p-4 space-y-3">
                            <h3 className="font-semibold text-gray-900 truncate">{recipe.title}</h3>
                            <p className="text-sm text-gray-500 line-clamp-2">{recipe.description}</p>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                <div className="flex items-center gap-1">
                                    <Clock className="w-4 h-4" />
                                    <span>{recipe.prep_time_minutes} min</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    <span>{recipe.ingredient_count || 0} ingredients</span>
                                </div>
                            </div>
                            <div className="flex gap-2 pt-2 border-t border-gray-100">
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openIngredientModal(recipe)}
                                    className="flex-1"
                                >
                                    Ingredients
                                </Button>
                                <Button
                                    variant="secondary"
                                    size="sm"
                                    onClick={() => openEditModal(recipe)}
                                    leftIcon={<Edit2 className="w-4 h-4" />}
                                >
                                    Edit
                                </Button>
                                <Button
                                    variant="danger"
                                    size="sm"
                                    onClick={() => setDeleteConfirm({ isOpen: true, recipeId: recipe.id, recipeName: recipe.title })}
                                    leftIcon={<Trash2 className="w-4 h-4" />}
                                >
                                </Button>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            {filteredRecipes.length === 0 && (
                <div className="text-center py-12 text-gray-500">
                    <ChefHat className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                    <p>No recipes found</p>
                </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
                <div className="flex justify-center">
                    <Pagination
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                    />
                </div>
            )}

            {/* Recipe Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <h2 className="text-lg font-bold text-gray-900">
                                {editingRecipe ? 'Edit Recipe' : 'Add Recipe'}
                            </h2>
                            <button onClick={() => setIsModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <form onSubmit={handleSubmit} className="p-8">
                            <div className="space-y-6">
                                {/* Title */}
                                <div>
                                    <Input
                                        label="Recipe Title"
                                        value={form.title}
                                        onChange={(e) => setForm({ ...form, title: e.target.value })}
                                        required
                                    />
                                </div>

                                {/* Difficulty & Prep Time */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                                        <select
                                            value={form.difficulty_level}
                                            onChange={(e) => setForm({ ...form, difficulty_level: e.target.value })}
                                            className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none appearance-none"
                                        >
                                            {difficultyOptions.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div>
                                        <Input
                                            label="Prep Time (minutes)"
                                            type="number"
                                            value={form.prep_time_minutes}
                                            onChange={(e) => setForm({ ...form, prep_time_minutes: parseInt(e.target.value) || 0 })}
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                                    <textarea
                                        value={form.description}
                                        onChange={(e) => setForm({ ...form, description: e.target.value })}
                                        rows={2}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-none"
                                        placeholder="Brief description of the recipe..."
                                    />
                                </div>

                                {/* Instructions */}
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Instructions</label>
                                    <textarea
                                        value={form.instructions}
                                        onChange={(e) => setForm({ ...form, instructions: e.target.value })}
                                        rows={5}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none resize-none min-h-[120px]"
                                        placeholder="Step 1: Prepare ingredients...&#10;Step 2: Cook...&#10;Step 3: Serve..."
                                    />
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-4">
                                    <label className="block text-sm font-medium text-gray-700">Image</label>
                                    <div
                                        className={`relative aspect-video rounded-xl overflow-hidden border-2 border-dashed transition-all cursor-pointer group
                                            ${uploadingImage ? 'pointer-events-none opacity-70' : ''}`}
                                        style={{
                                            borderColor: form.image_url ? '#10b981' : '#d1d5db',
                                            backgroundColor: form.image_url ? 'transparent' : '#f9fafb'
                                        }}
                                        onClick={() => !uploadingImage && !validatingUrl && document.getElementById('recipe-image-upload')?.click()}
                                    >
                                        <input
                                            id="recipe-image-upload"
                                            type="file"
                                            accept="image/*"
                                            className="hidden"
                                            disabled={uploadingImage || validatingUrl}
                                            onChange={(e) => {
                                                const file = e.target.files?.[0];
                                                if (file) {
                                                    const maxSize = 5 * 1024 * 1024;
                                                    if (file.size > maxSize) {
                                                        setNotification({ message: 'Ukuran gambar maksimal 5MB', type: 'error' });
                                                        setTimeout(() => setNotification(null), 3000);
                                                        e.target.value = '';
                                                        return;
                                                    }
                                                    setImageFile(file);
                                                    setUrlError(null);
                                                    setForm({ ...form, image_url: URL.createObjectURL(file) });
                                                }
                                            }}
                                        />
                                        {form.image_url ? (
                                            <>
                                                <Image src={form.image_url} alt="Preview" fill className="object-cover" unoptimized />
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                                    <p className="text-white text-sm font-medium">Klik untuk ganti</p>
                                                </div>
                                                <button
                                                    type="button"
                                                    onClick={(e) => { e.stopPropagation(); setImageFile(null); setUrlError(null); setForm({ ...form, image_url: '' }); }}
                                                    className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 z-10"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                {imageFile && (
                                                    <div className="absolute bottom-2 left-2 right-2 bg-black/60 backdrop-blur-sm text-white text-xs px-3 py-2 rounded-lg truncate">
                                                        📎 {imageFile.name}
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <ImageIcon className="w-10 h-10 text-gray-400 mb-2" />
                                                <p className="text-sm text-gray-500">Click to upload image</p>
                                                <p className="text-xs text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                                            </div>
                                        )}
                                        {uploadingImage && (
                                            <div className="absolute inset-0 bg-white/80 flex items-center justify-center">
                                                <div className="h-8 w-8 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
                                            </div>
                                        )}
                                    </div>

                                    {/* OR Divider */}
                                    <div className="flex items-center gap-4">
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                        <span className="text-xs text-gray-400 uppercase">atau gunakan URL</span>
                                        <div className="flex-1 h-px bg-gray-200"></div>
                                    </div>

                                    {/* URL Input */}
                                    <div>
                                        <div className="relative">
                                            <input
                                                type="url"
                                                value={imageFile ? '' : form.image_url}
                                                onChange={(e) => {
                                                    setImageFile(null);
                                                    setUrlError(null);
                                                    setForm({ ...form, image_url: e.target.value });
                                                }}
                                                onBlur={async (e) => {
                                                    const url = e.target.value;
                                                    if (url && !imageFile) {
                                                        await validateImageUrl(url);
                                                    }
                                                }}
                                                className={`w-full px-4 py-2.5 rounded-lg border bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:outline-none text-sm pr-10
                                                    ${urlError
                                                        ? 'border-red-400 focus:border-red-500 focus:ring-red-200'
                                                        : 'border-gray-300 focus:border-emerald-500 focus:ring-emerald-200'}
                                                    ${(!!imageFile || uploadingImage || validatingUrl) ? 'opacity-50 cursor-not-allowed' : ''}`}
                                                placeholder="Paste image URL here..."
                                                disabled={!!imageFile || uploadingImage || validatingUrl}
                                            />
                                            {validatingUrl && (
                                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                                                </div>
                                            )}
                                        </div>
                                        {urlError && (
                                            <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                                                <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                                                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                                                </svg>
                                                {urlError}
                                            </p>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-3 mt-8 pt-6 border-t border-gray-100">
                                <Button type="button" variant="secondary" onClick={() => setIsModalOpen(false)} className="flex-1">
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={saving} isLoading={saving} className="flex-1">
                                    {editingRecipe ? 'Update' : 'Create'} Recipe
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deleteConfirm.isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl w-full max-w-md p-6">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="p-3 bg-red-100 rounded-full">
                                <AlertTriangle className="w-6 h-6 text-red-600" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Delete Recipe</h3>
                                <p className="text-sm text-gray-500">Are you sure you want to delete "{deleteConfirm.recipeName}"?</p>
                            </div>
                        </div>
                        <div className="flex gap-3">
                            <Button variant="secondary" onClick={() => setDeleteConfirm({ isOpen: false, recipeId: null, recipeName: '' })} className="flex-1">
                                Cancel
                            </Button>
                            <Button variant="danger" onClick={handleDelete} className="flex-1">
                                Delete
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Ingredient Management Modal */}
            {isIngredientModalOpen && selectedRecipe && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-[fadeIn_0.2s_ease-out]">
                    <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl animate-[scaleIn_0.2s_ease-out]">
                        <div className="flex items-center justify-between p-6 border-b border-gray-100">
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Manage Ingredients</h2>
                                <p className="text-sm text-gray-500">{selectedRecipe.title}</p>
                            </div>
                            <button onClick={() => setIsIngredientModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-6">
                            {/* Add Ingredient Form */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">Add Ingredient</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">Product</label>
                                    <select
                                        value={newIngredient.product_id}
                                        onChange={(e) => setNewIngredient({ ...newIngredient, product_id: e.target.value })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-gray-300 bg-white text-gray-900 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 focus:outline-none appearance-none"
                                    >
                                        <option value="">Select product...</option>
                                        {allProducts.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <Input
                                            label="Quantity"
                                            type="number"
                                            value={newIngredient.quantity_required}
                                            onChange={(e) => setNewIngredient({ ...newIngredient, quantity_required: parseFloat(e.target.value) || 1 })}
                                        />
                                    </div>
                                    <div>
                                        <Input
                                            label="Unit"
                                            value={newIngredient.unit}
                                            onChange={(e) => setNewIngredient({ ...newIngredient, unit: e.target.value })}
                                            placeholder="pcs, kg, ml..."
                                        />
                                    </div>
                                </div>
                                <Button onClick={handleAddIngredient} disabled={!newIngredient.product_id} className="w-full">
                                    <Plus className="w-4 h-4 mr-2" />
                                    Add Ingredient
                                </Button>
                            </div>

                            {/* Ingredients List */}
                            <div className="space-y-4">
                                <h3 className="text-sm font-semibold text-gray-900 border-b pb-2">
                                    Ingredients ({ingredients.length})
                                </h3>
                                {loadingIngredients ? (
                                    <div className="flex justify-center py-8">
                                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent"></div>
                                    </div>
                                ) : ingredients.length === 0 ? (
                                    <div className="text-center py-8 text-gray-500">
                                        <p>No ingredients added yet</p>
                                    </div>
                                ) : (
                                    <ul className="divide-y divide-gray-100">
                                        {ingredients.map((ing) => (
                                            <li key={ing.id} className="flex items-center justify-between py-3">
                                                <div>
                                                    <p className="font-medium text-gray-900">{ing.product_name}</p>
                                                    <p className="text-sm text-gray-500">{ing.quantity_required} {ing.unit}</p>
                                                </div>
                                                <button
                                                    onClick={() => handleRemoveIngredient(ing.id)}
                                                    className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
