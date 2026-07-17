import { ProductCard } from "./ProductCard";
import type { ProductWithCategory } from "@/lib/products";

interface ProductGridProps {
  products: ProductWithCategory[];
}

export function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="py-20 text-center">
        <h3 className="font-body text-2xl">No perfumes found</h3>
        <p className="mt-2 text-black/60">
          Try adjusting your filters or{" "}
          <a href="/products" className="text-brown underline">
            reset filters
          </a>
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 md:gap-6 xl:grid-cols-4">
      {products.map((product, i) => (
        <ProductCard key={product.id} product={product} index={i} />
      ))}
    </div>
  );
}
