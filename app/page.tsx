import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ConciergeSidebar from '@/components/ConciergeSidebar';
import Image from 'next/image';
import { Bot, Leaf, Utensils, Truck, Carrot, Apple, Beef, Milk, Croissant, Package } from 'lucide-react';

import RecipeCard from '@/components/RecipeCard';
import { supabase } from '@/lib/supabase';

async function getProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('id, name, price, stock_quantity, image_url, category')
    .eq('is_deleted', false)
    .limit(10);
  if (error) return [];
  return data || [];
}

async function getRecipes() {
  const { data, error } = await supabase
    .from('recipes')
    .select(`
      id, title, description, difficulty_level, prep_time_minutes, image_url,
      recipe_ingredients ( unit, quantity_required, products!recipe_ingredients_product_id_fkey ( id, name, price, image_url ) )
    `)
    .limit(5);
  if (error) return [];
  return data || [];
}


const features = [
  {
    name: 'AI Concierge',
    description: 'Get personalized recipe ideas based on your fridge inventory.',
    icon: Bot,
  },
  {
    name: 'Farm Fresh',
    description: 'Sourced directly from local farmers for maximum freshness.',
    icon: Leaf,
  },
  {
    name: 'Smart Recipes',
    description: 'Dynamic recipes that adapt to what ingredients you have.',
    icon: Utensils,
  },
  {
    name: 'Fast Delivery',
    description: 'From our market to your doorstep in under 60 minutes.',
    icon: Truck,
  },
];

export default async function Home() {
  const products = await getProducts();
  const recipes = await getRecipes();

  return (
    <div className="min-h-screen bg-white pb-20">
      <Navbar />
      <ConciergeSidebar />

      <main>
        {/* Hero Section */}
        <div className="relative isolate overflow-hidden">
          <svg
            className="absolute inset-0 -z-10 h-full w-full stroke-gray-200 mask-[radial-gradient(100%_100%_at_top_right,white,transparent)]"
            aria-hidden="true"
          >
            <defs>
              <pattern
                id="0787a7c5-978c-4f66-83c7-11c213f99cb7"
                width={200}
                height={200}
                x="50%"
                y={-1}
                patternUnits="userSpaceOnUse"
              >
                <path d="M.5 200V.5H200" fill="none" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" strokeWidth={0} fill="url(#0787a7c5-978c-4f66-83c7-11c213f99cb7)" />
          </svg>
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-10 sm:pb-32 lg:flex lg:px-8 lg:py-20">
            <div className="mx-auto max-w-2xl lg:mx-0 lg:max-w-xl lg:shrink-0 lg:pt-8">
              <div className="mt-24 sm:mt-16 lg:mt-0">
                <div className="inline-flex space-x-6">
                  <span className="rounded-full bg-culina-green/10 px-3 py-1 text-sm font-semibold leading-6 text-culina-green ring-1 ring-inset ring-culina-green/10">
                    Latest updates
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-gray-600">
                    <span>MiMo-V2-Flash (free)</span>
                    {/* <span aria-hidden="true">&rarr;</span> */}
                  </span>
                </div>
              </div>
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl">
                Fresh ingredients,<br />
                <span className="text-culina-green">Zero Guesswork.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                Stop wondering what to cook. Our AI Concierge instantly suggests delicious recipes based on your taste and available fresh ingredients.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/concierge"
                  className="rounded-full bg-culina-green px-6 py-3.5 text-sm font-semibold text-white shadow-sm hover:bg-emerald-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-600"
                >
                  Ask AI Chef
                </Link>
                <Link href="/shop" className="text-sm font-semibold leading-6 text-gray-900">
                  Browse Shop <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mt-0 lg:mr-0 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none relative animate-[float_6s_ease-in-out_infinite]">
                <div className="absolute -inset-y-px -left-4 -z-10 bg-culina-green/20 opacity-20 ring-1 ring-white" style={{ clipPath: 'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)' }}></div>
                <Image
                  src="/images/hero-fresh.png"
                  alt="App screenshot"
                  width={600}
                  height={600}
                  className="w-xl rounded-md bg-white/5 shadow-2xl ring-1 ring-white/10"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <section className="bg-white py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-culina-green">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                The future of grocery shopping called.
              </p>
              <p className="mt-6 text-lg leading-8 text-gray-600">
                We combine the freshest local produce with cutting-edge AI to make your cooking experience seamless and delightful.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-4xl">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-10 lg:max-w-none lg:grid-cols-2 lg:gap-y-16">
                {features.map((feature) => (
                  <div key={feature.name} className="relative pl-16">
                    <dt className="text-base font-semibold leading-7 text-gray-900">
                      <div className="absolute left-0 top-0 flex h-10 w-10 items-center justify-center rounded-lg bg-culina-green">
                        <feature.icon className="h-6 w-6 text-white" aria-hidden="true" />
                      </div>
                      {feature.name}
                    </dt>
                    <dd className="mt-2 text-base leading-7 text-gray-600">{feature.description}</dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-4 py-8 sm:px-6 lg:px-8 bg-gray-50/50">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Fresh In Stock</h2>
                <p className="text-gray-500 mt-1">Hand-picked quality items for you</p>
              </div>
              <Link href="/shop" className="group flex items-center gap-2 text-sm font-bold text-culina-green hover:text-emerald-700 transition-colors">
                View all items
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
              {products.length > 0 ? (
                products.slice(0, 4).map((product: any) => (
                  <ProductCard
                    key={product.id}
                    id={product.id}
                    name={product.name}
                    price={Number(product.price)}
                    category={product.category}
                    image={product.image_url}
                  />
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">Connecting to inventory...</p>
              )}
            </div>
          </div>
        </section>

        {/* Trending Recipes Section */}
        <section className="bg-white px-4 py-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Trending Recipes</h2>
                <p className="text-gray-500 mt-1">Chef-curated meals you can cook tonight</p>
              </div>
              <Link href="/recipes" className="group flex items-center gap-2 text-sm font-bold text-culina-green hover:text-emerald-700 transition-colors">
                View all recipes
                <span className="group-hover:translate-x-1 transition-transform">&rarr;</span>
              </Link>
            </div>

            <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
              {recipes.length > 0 ? (
                recipes.slice(0, 3).map((recipe: any) => (
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
                ))
              ) : (
                <p className="col-span-full text-center text-gray-500 py-12">Loading culinary inspiration...</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

