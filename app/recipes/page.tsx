import Navbar from '@/components/Navbar';
import RecipeCard from '@/components/RecipeCard';
import { getBaseUrl } from '@/lib/utils';

async function getRecipes() {
    const res = await fetch(`${getBaseUrl()}/api/recipes`, { cache: 'no-store' });
    if (!res.ok) {
        console.error('Failed to fetch recipes:', res.statusText);
        return [];
    }
    return res.json();
}

export default async function RecipesPage() {
    const recipes = await getRecipes();

    return (
        <div className="min-h-screen bg-culina-off-white pb-20">
            <Navbar />

            <main className="px-4 py-8 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-7xl">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                            Chef's Selection
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Curated recipes ready to cook. Add all ingredients to your cart in one click.
                        </p>
                    </div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
                        {recipes.map((recipe: any) => (
                            <RecipeCard
                                key={recipe.id}
                                id={recipe.id}
                                title={recipe.title}
                                description={recipe.description}
                                difficulty={recipe.difficulty_level}
                                prep_time={recipe.prep_time_minutes}
                                image={recipe.image_url}
                                ingredients={recipe.recipe_ingredients}
                            />
                        ))}
                    </div>
                </div>
            </main>
        </div>
    );
}
