"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "./ProductCard";
import { ProductCarousel } from "./ProductCarousel";
import type { ProductWithCategory } from "@/lib/products";

interface RecentProduct {
  id: string;
  slug: string;
  name: string;
  price: number;
  imageUrl: string;
}

const STORAGE_KEY = "store-recently-viewed";

export function addRecentlyViewed(product: RecentProduct) {
  if (typeof window === "undefined") return;
  const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[];
  const filtered = stored.filter((p) => p.id !== product.id);
  const updated = [product, ...filtered].slice(0, 10);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

function RecentlyViewedSkeleton() {
  return (
    <section className="py-16 border-t border-cream-dark/30 mt-16">
      <h2 className="mb-8 font-body text-2xl text-brown">Recently Viewed</h2>
      <div className="flex gap-5 overflow-hidden">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="w-[260px] shrink-0 sm:w-[280px] space-y-4">
            <div className="aspect-[3/4] w-full rounded-xl bg-cream-dark/40 animate-pulse" />
            <div className="h-4 w-2/3 rounded bg-cream-dark/40 animate-pulse" />
            <div className="h-4 w-1/3 rounded bg-cream-dark/40 animate-pulse" />
          </div>
        ))}
      </div>
    </section>
  );
}

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[];
    const ids = stored.map((p) => p.id).filter((id) => id !== currentId);

    if (ids.length === 0) {
      setLoading(false);
      return;
    }

    setLoading(true);
    fetch(`/api/products?ids=${ids.join(",")}`)
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data: ProductWithCategory[]) => {
        // Sort the fetched products to match the order of IDs in localStorage
        const sortedData = [...data].sort((a, b) => ids.indexOf(a.id) - ids.indexOf(b.id));
        setProducts(sortedData);
      })
      .catch((err) => {
        console.error("Error loading recently viewed products:", err);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [currentId]);

  if (loading) {
    return <RecentlyViewedSkeleton />;
  }

  if (products.length === 0) return null;

  return (
    <section className="py-16 border-t border-cream-dark/30 mt-16">
      <h2 className="mb-8 font-body text-2xl text-brown">Recently Viewed</h2>
      <ProductCarousel>
        {products.map((p, i) => (
          <div key={p.id} className="w-[260px] shrink-0 snap-start sm:w-[280px]">
            <ProductCard product={p} index={i} />
          </div>
        ))}
      </ProductCarousel>
    </section>
  );
}
