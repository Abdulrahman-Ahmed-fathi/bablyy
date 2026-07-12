import { Suspense } from "react";
import { ProductGrid } from "@/components/store/ProductGrid";
import { FilterSidebar } from "@/components/store/FilterSidebar";
import { getProducts, getCategories } from "@/lib/products";
import type { Metadata } from "next";

export const revalidate = 60;

export const metadata: Metadata = {
  title: "Perfumes | Maison de Parfum",
  description: "Browse our curated collection of luxury fragrances",
};

interface ProductsPageProps {
  searchParams: {
    category?: string;
    sort?: string;
    q?: string;
    gender?: string;
    minPrice?: string;
    maxPrice?: string;
  };
}

function ProductSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <div key={i} className="space-y-4">
          <div className="aspect-[3/4] skeleton" />
          <div className="h-4 w-2/3 skeleton" />
          <div className="h-4 w-1/3 skeleton" />
        </div>
      ))}
    </div>
  );
}

async function ProductsContent({ searchParams }: ProductsPageProps) {
  const products = await getProducts({
    category: searchParams.category,
    gender: searchParams.gender,
    search: searchParams.q,
    sort: searchParams.sort,
    minPrice: searchParams.minPrice ? Number(searchParams.minPrice) : undefined,
    maxPrice: searchParams.maxPrice ? Number(searchParams.maxPrice) : undefined,
  });
  const categories = await getCategories();
  const maxPrice = Math.max(...products.map((p) => p.price), 5000);

  return (
    <div className="flex flex-col gap-8 md:flex-row">
      <FilterSidebar
        categories={categories.map((c) => ({
          id: c.id,
          name: c.name,
          slug: c.slug,
        }))}
        maxPrice={maxPrice}
      />
      <div className="flex-1">
        {searchParams.q && (
          <p className="mb-6 text-sm text-black/60">
            Results for &ldquo;{searchParams.q}&rdquo; ({products.length})
          </p>
        )}
        <ProductGrid products={products} />
      </div>
    </div>
  );
}

export default function ProductsPage({ searchParams }: ProductsPageProps) {
  return (
    <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
      <h1 className="mb-12 font-display text-4xl md:text-5xl">Our Collection</h1>
      <Suspense fallback={<ProductSkeleton />}>
        <ProductsContent searchParams={searchParams} />
      </Suspense>
    </div>
  );
}
