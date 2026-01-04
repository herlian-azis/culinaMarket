import Navbar from '@/components/Navbar';
import AddRecipeIngredients from '@/components/AddRecipeIngredients';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, ChefHat, Users, Flame, Zap, Beef, Wheat, Droplets, ArrowLeft, BookOpen } from 'lucide-react';
import { supabase } from '@/lib/supabase';

async function getRecipe(id: string) {
    const { data, error } = await supabase
        .from('recipes')
        .select(`
            id, title, description, difficulty_level, prep_time_minutes, image_url, instructions,
            recipe_ingredients ( quantity_required, unit, products!recipe_ingredients_product_id_fkey ( id, name, price, image_url, nutrition_info ) )
        `)
        .eq('id', id)
        .single();

    if (error) return null;
    return data;
}

export default async function RecipeDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const recipe = await getRecipe(id);

    if (!recipe) {
        notFound();
    }

    // Calculate bundle price
    const totalPrice = recipe.recipe_ingredients.reduce((sum: number, ing: any) => {
        return sum + (ing.products ? Number(ing.products.price) : 0);
    }, 0);

    // Calculate nutrition
    const nutrition = recipe.recipe_ingredients.reduce((acc: any, ing: any) => {
        if (!ing.products?.nutrition_info) return acc;

        const parseValue = (val: any) => {
            if (!val) return 0;
            const strVal = String(val);
            const match = strVal.match(/(\d+(\.\d+)?)/);
            return match ? parseFloat(match[0]) : 0;
        };

        const qty = Number(ing.quantity_required) || 1;
        const info = ing.products.nutrition_info;

        return {
            calories: acc.calories + (parseValue(info.calories) * qty),
            protein: acc.protein + (parseValue(info.protein) * qty),
            carbs: acc.carbs + (parseValue(info.carbs) * qty),
            fat: acc.fat + (parseValue(info.fat) * qty),
        };
    }, { calories: 0, protein: 0, carbs: 0, fat: 0 });

    const difficultyConfig = {
        'Easy': { color: 'from-green-500 to-emerald-500', bg: 'bg-green-500/10', text: 'text-green-600' },
        'Medium': { color: 'from-yellow-500 to-orange-500', bg: 'bg-yellow-500/10', text: 'text-yellow-600' },
        'Hard': { color: 'from-red-500 to-rose-500', bg: 'bg-red-500/10', text: 'text-red-600' },
    };

    const difficulty = difficultyConfig[recipe.difficulty_level as keyof typeof difficultyConfig] || difficultyConfig['Easy'];

    return (
        <div className="min-h-screen bg-linear-to-b from-gray-50 to-white">
            <Navbar />

            <main>
                {/* Hero Section - More immersive */}
                <div className="relative h-[500px] md:h-[550px] w-full overflow-hidden">
                    {/* Background Image with Gradient Overlay */}
                    {recipe.image_url && (
                        <Image
                            src={recipe.image_url}
                            alt={recipe.title}
                            fill
                            className="object-cover"
                            priority
                            unoptimized
                        />
                    )}
                    <div className="absolute inset-0 bg-linear-to-t from-black via-black/60 to-black/20" />

                    {/* Content */}
                    <div className="absolute inset-0 flex flex-col justify-end">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12 w-full">
                            {/* Back Button */}
                            <Link
                                href="/recipes"
                                className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-8 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md hover:bg-white/20 transition-all w-fit"
                            >
                                <ArrowLeft className="w-4 h-4" />
                                Back to Recipes
                            </Link>

                            {/* Title & Description */}
                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4 leading-tight">
                                {recipe.title}
                            </h1>
                            <p className="text-lg md:text-xl text-white/80 max-w-2xl leading-relaxed">
                                {recipe.description}
                            </p>

                            {/* Meta Badges */}
                            <div className="flex flex-wrap gap-3 mt-8">
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white">
                                    <Clock className="w-5 h-5" />
                                    <span className="font-medium">{recipe.prep_time_minutes} mins</span>
                                </div>
                                <div className={`flex items-center gap-2 px-4 py-2.5 backdrop-blur-md rounded-full text-white bg-linear-to-r ${difficulty.color}`}>
                                    <ChefHat className="w-5 h-5" />
                                    <span className="font-medium">{recipe.difficulty_level}</span>
                                </div>
                                <div className="flex items-center gap-2 px-4 py-2.5 bg-white/10 backdrop-blur-md rounded-full text-white">
                                    <Users className="w-5 h-5" />
                                    <span className="font-medium">{recipe.recipe_ingredients.length} Ingredients</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8 -mt-8 relative z-10">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* Left Col: Sticky Sidebar */}
                        <div className="lg:col-span-1 space-y-6">
                            {/* Ingredients Card */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100 sticky top-24">
                                <div className="flex items-center justify-between mb-6">
                                    <h2 className="text-xl font-bold text-gray-900">Shopping List</h2>
                                    <span className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-medium">
                                        {recipe.recipe_ingredients.length} items
                                    </span>
                                </div>

                                <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2">
                                    {recipe.recipe_ingredients.map((ing: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 hover:bg-gray-100 rounded-2xl transition-colors group">
                                            <div className="flex items-center gap-3">
                                                <div className="h-12 w-12 relative bg-white rounded-xl overflow-hidden shrink-0 shadow-sm border border-gray-100">
                                                    {ing.products?.image_url ? (
                                                        <Image src={ing.products.image_url} alt={ing.products.name} fill className="object-cover" unoptimized />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-gray-300">
                                                            <Beef className="w-5 h-5" />
                                                        </div>
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm group-hover:text-emerald-600 transition-colors">
                                                        {ing.products?.name || 'Unknown'}
                                                    </p>
                                                    <p className="text-xs text-gray-500">{ing.quantity_required} {ing.unit}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-bold text-gray-900">
                                                Rp {ing.products?.price ? Number(ing.products.price).toLocaleString('id-ID') : '-'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                {/* Total & CTA */}
                                <div className="mt-6 pt-6 border-t border-gray-100">
                                    <div className="flex justify-between items-end mb-4">
                                        <div>
                                            <p className="text-sm text-gray-500">Total Price</p>
                                            <p className="text-3xl font-bold text-gray-900">
                                                Rp {totalPrice.toLocaleString('id-ID')}
                                            </p>
                                        </div>
                                        <p className="text-xs text-gray-400">All ingredients</p>
                                    </div>
                                    <AddRecipeIngredients ingredients={recipe.recipe_ingredients} />
                                </div>
                            </div>
                        </div>

                        {/* Right Col: Instructions & Nutrition */}
                        <div className="lg:col-span-2 space-y-8">
                            {/* Nutrition Cards */}
                            <div className="bg-white rounded-3xl p-6 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Flame className="w-6 h-6 text-orange-500" />
                                    Nutrition per Serving
                                </h2>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="bg-linear-to-br from-orange-50 to-amber-50 p-5 rounded-2xl text-center border border-orange-100">
                                        <div className="w-10 h-10 mx-auto mb-3 bg-orange-100 rounded-full flex items-center justify-center">
                                            <Zap className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(nutrition.calories)}</p>
                                        <p className="text-sm text-gray-500">Calories</p>
                                    </div>
                                    <div className="bg-linear-to-br from-red-50 to-rose-50 p-5 rounded-2xl text-center border border-red-100">
                                        <div className="w-10 h-10 mx-auto mb-3 bg-red-100 rounded-full flex items-center justify-center">
                                            <Beef className="w-5 h-5 text-red-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(nutrition.protein)}g</p>
                                        <p className="text-sm text-gray-500">Protein</p>
                                    </div>
                                    <div className="bg-linear-to-br from-amber-50 to-yellow-50 p-5 rounded-2xl text-center border border-amber-100">
                                        <div className="w-10 h-10 mx-auto mb-3 bg-amber-100 rounded-full flex items-center justify-center">
                                            <Wheat className="w-5 h-5 text-amber-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(nutrition.carbs)}g</p>
                                        <p className="text-sm text-gray-500">Carbs</p>
                                    </div>
                                    <div className="bg-linear-to-br from-blue-50 to-indigo-50 p-5 rounded-2xl text-center border border-blue-100">
                                        <div className="w-10 h-10 mx-auto mb-3 bg-blue-100 rounded-full flex items-center justify-center">
                                            <Droplets className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <p className="text-2xl font-bold text-gray-900">{Math.round(nutrition.fat)}g</p>
                                        <p className="text-sm text-gray-500">Fat</p>
                                    </div>
                                </div>
                            </div>

                            {/* Instructions */}
                            <div className="bg-white rounded-3xl p-6 md:p-8 shadow-xl shadow-gray-200/50 border border-gray-100">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
                                        <BookOpen className="w-5 h-5 text-emerald-600" />
                                    </div>
                                    How to Make It
                                </h2>

                                <div className="space-y-6">
                                    {recipe.instructions.split('\n').map((step: string, i: number) => (
                                        step.trim() && (
                                            <div key={i} className="flex gap-4 group">
                                                <div className="shrink-0">
                                                    <div className="w-10 h-10 rounded-full bg-linear-to-br from-emerald-500 to-teal-500 text-white font-bold flex items-center justify-center shadow-lg shadow-emerald-200 group-hover:scale-110 transition-transform">
                                                        {i + 1}
                                                    </div>
                                                </div>
                                                <div className="flex-1 pb-6 border-b border-gray-100 last:border-0">
                                                    <p className="text-gray-700 leading-relaxed text-lg">
                                                        {step.replace(/^\d+\.\s*/, '')}
                                                    </p>
                                                </div>
                                            </div>
                                        )
                                    ))}
                                </div>

                                <div className="mt-8 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                                    <p className="text-sm text-emerald-700 text-center">
                                        🎉 <strong>Pro tip:</strong> Prep all ingredients before you start cooking for a smoother experience!
                                    </p>
                                </div>
                            </div>
                        </div>

                    </div>
                </div>
            </main>
        </div>
    );
}
