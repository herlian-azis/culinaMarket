import Navbar from '@/components/Navbar';
import Link from 'next/link';
import ProductCard from '@/components/ProductCard';
import ConciergeSidebar from '@/components/ConciergeSidebar';

async function getProducts() {
  const res = await fetch('http://localhost:3000/api/products', { cache: 'no-store' });
  if (!res.ok) {
    // Fallback if API fails
    return [];
  }
  return res.json();
}

export default async function Home() {
  const products = await getProducts();

  return (
    <div className="min-h-screen bg-culina-off-white pb-20">
      <Navbar />
      <ConciergeSidebar />

      <main>
        {/* Hero / Concierge Prompt */}
        <section className="relative px-4 pt-16 pb-12 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight text-gray-900 sm:text-5xl">
                What are we cooking today?
              </h1>
              <p className="mt-4 text-xl text-gray-500">
                AI-powered recipes based on what's actually in stock.
              </p>

              <div className="mt-8 flex gap-4">
                <Link href="/concierge" className="rounded-full bg-culina-navy px-8 py-4 text-base font-semibold text-white shadow-sm hover:bg-blue-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-culina-navy transition-all">
                  Ask the Concierge
                </Link>
                <Link href="/shop" className="rounded-full bg-white px-8 py-4 text-base font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 transition-all">
                  Browse Catalog
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* Product Grid */}
        <section className="px-4 py-8 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-7xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Fresh In Stock</h2>
              <Link href="/shop" className="text-sm font-medium text-culina-green hover:text-emerald-700">View all &rarr;</Link>
            </div>

            <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4 xl:gap-x-8">
              {products.length > 0 ? (
                products.map((product: any) => (
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
                <p className="col-span-full text-center text-gray-500">Connecting to inventory...</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
