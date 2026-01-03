
import Navbar from '@/components/Navbar';
import AddRecipeIngredients from '@/components/AddRecipeIngredients';
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Clock, BarChart2, ShoppingCart, Activity } from 'lucide-react';

async function getRecipe(id: string) {
    const res = await fetch(`http://localhost:3000/api/recipes/${id}`, { cache: 'no-store' });
    if (!res.ok) return null;
    return res.json();
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

    return (
        <div className="min-h-screen bg-white pb-20">
            <Navbar />

            <main>
                {/* Hero Section */}
                <div className="relative h-[400px] w-full bg-gray-900">
                    {recipe.image_url && (
                        <Image
                            src={recipe.image_url}
                            alt={recipe.title}
                            fill
                            className="object-cover opacity-60"
                            unoptimized
                        />
                    )}
                    <div className="absolute inset-0 flex flex-col justify-end p-8 sm:p-12 lg:p-16 max-w-7xl mx-auto">
                        <Link href="/recipes" className="text-white/80 hover:text-white mb-6 flex items-center gap-2 w-fit transition-colors">
                            ← Back to Recipes
                        </Link>
                        <h1 className="text-4xl font-bold text-white sm:text-5xl mb-4">{recipe.title}</h1>
                        <p className="text-lg text-white/90 max-w-2xl">{recipe.description}</p>

                        <div className="flex gap-4 mt-6">
                            <span className="px-4 py-2 bg-white/20 backdrop-blur-md rounded-full text-white font-medium flex items-center gap-2">
                                <Clock className="w-5 h-5" /> {recipe.prep_time_minutes} mins
                            </span>
                            <span className={`px-4 py-2 backdrop-blur-md rounded-full text-white font-medium flex items-center gap-2 ${recipe.difficulty_level === 'Easy' ? 'bg-green-500/50' :
                                recipe.difficulty_level === 'Medium' ? 'bg-yellow-500/50' : 'bg-red-500/50'
                                }`}>
                                <BarChart2 className="w-5 h-5" /> {recipe.difficulty_level}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">

                        {/* Left Col: Ingredients */}
                        <div className="lg:col-span-1 space-y-8">
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <ShoppingCart className="w-6 h-6 text-emerald-600" /> Ingredients
                                </h2>

                                <div className="space-y-4">
                                    {recipe.recipe_ingredients.map((ing: any, i: number) => (
                                        <div key={i} className="flex items-center justify-between p-3 bg-white rounded-xl border border-gray-100">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 relative bg-gray-100 rounded-lg overflow-hidden shrink-0">
                                                    {ing.products?.image_url && (
                                                        <Image src={ing.products.image_url} alt={ing.products.name} fill className="object-cover" unoptimized />
                                                    )}
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900 text-sm">{ing.products?.name}</p>
                                                    <p className="text-xs text-gray-500">{ing.quantity_required} {ing.unit}</p>
                                                </div>
                                            </div>
                                            <p className="text-sm font-semibold text-gray-900">
                                                Rp {ing.products?.price ? Number(ing.products.price).toLocaleString('id-ID') : '-'}
                                            </p>
                                        </div>
                                    ))}
                                </div>

                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex justify-between items-end mb-4">
                                        <p className="text-sm text-gray-500">Estimated Total</p>
                                        <p className="text-2xl font-bold text-gray-900">Rp {totalPrice.toLocaleString('id-ID')}</p>
                                    </div>
                                    <AddRecipeIngredients ingredients={recipe.recipe_ingredients} />
                                </div>
                            </div>

                            {/* Nutrition Card */}
                            {/* Nutrition Card */}
                            <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                <h2 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                                    <Activity className="w-6 h-6 text-emerald-600" /> Nutrition Info
                                </h2>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-white p-4 rounded-xl text-center border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Calories</p>
                                        <p className="text-xl font-bold text-gray-900">{Math.round(nutrition.calories)}</p>
                                        <p className="text-xs text-gray-400">kcal</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl text-center border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Protein</p>
                                        <p className="text-xl font-bold text-gray-900">{Math.round(nutrition.protein)}g</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl text-center border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Carbs</p>
                                        <p className="text-xl font-bold text-gray-900">{Math.round(nutrition.carbs)}g</p>
                                    </div>
                                    <div className="bg-white p-4 rounded-xl text-center border border-gray-100">
                                        <p className="text-sm text-gray-500 mb-1">Fat</p>
                                        <p className="text-xl font-bold text-gray-900">{Math.round(nutrition.fat)}g</p>
                                    </div>
                                </div>
                                <p className="text-xs text-gray-400 mt-4 text-center">
                                    *Estimated values based on ingredients
                                </p>
                            </div>
                        </div>

                        {/* Right Col: Instructions */}
                        <div className="lg:col-span-2">
                            <h2 className="text-2xl font-bold text-gray-900 mb-6">Instructions</h2>
                            <div className="prose prose-lg text-gray-600">
                                {recipe.instructions.split('\n').map((step: string, i: number) => (
                                    step.trim() && (
                                        <div key={i} className="flex gap-4 mb-6 group">
                                            <div className="flex-shrink-0 h-8 w-8 rounded-full bg-culina-green/10 text-culina-green font-bold flex items-center justify-center group-hover:bg-culina-green group-hover:text-white transition-colors">
                                                {i + 1}
                                            </div>
                                            <p className="mt-1 leading-relaxed">{step.replace(/^\d+\.\s*/, '')}</p>
                                        </div>
                                    )
                                ))}
                            </div>
                        </div>

                    </div>
                </div>
            </main >
        </div >
    );
}
