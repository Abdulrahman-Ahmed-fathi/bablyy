"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { SafeImage } from "./SafeImage";
import { formatPrice } from "@/lib/utils";

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
  const updated = [product, ...filtered].slice(0, 4);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
}

export function RecentlyViewed({ currentId }: { currentId: string }) {
  const [items, setItems] = useState<RecentProduct[]>([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]") as RecentProduct[];
    setItems(stored.filter((p) => p.id !== currentId));
  }, [currentId]);

  if (items.length === 0) return null;

  return (
    <section className="py-16">
      <h2 className="mb-8 font-body text-2xl">Recently Viewed</h2>
      <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
        {items.map((item) => (
          <Link key={item.id} href={`/products/${item.slug}`} className="group">
            <div className="relative aspect-[3/4] overflow-hidden rounded-xl bg-cream-dark">
              <SafeImage
                src={item.imageUrl}
                alt={item.name}
                fill
                className="object-cover transition-transform group-hover:scale-105"
                sizes="200px"
              />
            </div>
            <h3 className="mt-2 font-body">{item.name}</h3>
            <p className="text-sm text-brown">{formatPrice(item.price)}</p>
          </Link>
        ))}
      </div>
    </section>
  );
}
