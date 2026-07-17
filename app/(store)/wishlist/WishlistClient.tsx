"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useWishlistStore } from "@/lib/wishlist";
import { ProductGrid } from "@/components/store/ProductGrid";
import { Button } from "@/components/ui/button";
import type { ProductWithCategory } from "@/lib/products";

export default function WishlistClient() {
  const { productIds, setAll } = useWishlistStore();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    async function load() {
      if (productIds.length === 0) {
        setProducts([]);
        setLoaded(true);
        return;
      }

      const res = await fetch("/api/products");
      if (!res.ok) {
        setLoaded(true);
        return;
      }
      const all: ProductWithCategory[] = await res.json();
      const activeIds = new Set(all.map((p) => p.id));

      // Silently drop any wishlist items that are no longer active/existing
      const validIds = productIds.filter((id) => activeIds.has(id));
      if (validIds.length !== productIds.length) {
        setAll(validIds);
      }

      setProducts(all.filter((p) => validIds.includes(p.id)));
      setLoaded(true);
    }
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productIds.length]);

  if (!loaded) {
    return (
      <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
        <div className="mb-8 h-8 w-48 skeleton" />
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="aspect-[3/4] skeleton" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-container px-4 py-12 lg:px-8">
      <h1 className="mb-12 font-body text-4xl md:text-5xl">Your Wishlist</h1>

      {products.length === 0 ? (
        <div className="py-20 text-center">
          <p className="text-black/60">Your wishlist is empty.</p>
          <Button className="mt-6" asChild>
            <Link href="/products">Browse Perfumes</Link>
          </Button>
        </div>
      ) : (
        <ProductGrid products={products} />
      )}
    </div>
  );
}