"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { SlidersHorizontal, X } from "lucide-react";

interface Category {
  id: string;
  name: string;
  slug: string;
}

interface FilterSidebarProps {
  categories: Category[];
  maxPrice: number;
}

export function FilterSidebar({ categories, maxPrice }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice") || 0),
    Number(searchParams.get("maxPrice") || maxPrice),
  ]);

  useEffect(() => {
    setPriceRange([
      Number(searchParams.get("minPrice") || 0),
      Number(searchParams.get("maxPrice") || maxPrice),
    ]);
  }, [searchParams, maxPrice]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const updateParams = useCallback(
    (updates: Record<string, string | null>) => {
      const params = new URLSearchParams(searchParams.toString());
      Object.entries(updates).forEach(([key, value]) => {
        if (value === null || value === "") params.delete(key);
        else params.set(key, value);
      });
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
  );

  const selectedCategories = searchParams.get("category")
    ? searchParams.get("category")!.split(",").filter(Boolean)
    : [];
  const currentGender = searchParams.get("gender") || "All";
  const currentSort = searchParams.get("sort") || "newest";

  const genders = ["All", "Men", "Women", "Unisex"];

  const content = (
    <div className="space-y-8">
      <div>
        <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-black/50">Categories</h3>
        <div className="space-y-3">
          {categories.map((cat) => {
            const isChecked = selectedCategories.includes(cat.slug);
            return (
              <div key={cat.id} className="flex items-center gap-2">
                <Checkbox
                  id={cat.slug}
                  checked={isChecked}
                  onCheckedChange={(checked) => {
                    let nextCats: string[];
                    if (checked) {
                      nextCats = [...selectedCategories, cat.slug];
                    } else {
                      nextCats = selectedCategories.filter((slug) => slug !== cat.slug);
                    }
                    updateParams({
                      category: nextCats.length > 0 ? nextCats.join(",") : null,
                    });
                  }}
                />
                <Label htmlFor={cat.slug} className="cursor-pointer text-sm font-medium text-stone-700 hover:text-brown transition-colors">
                  {cat.name}
                </Label>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-black/50">Price Range</h3>
        <Slider
          min={0}
          max={maxPrice}
          step={50}
          value={priceRange}
          onValueChange={setPriceRange}
          onValueCommit={(v) =>
            updateParams({
              minPrice: v[0] > 0 ? String(v[0]) : null,
              maxPrice: v[1] < maxPrice ? String(v[1]) : null,
            })
          }
          className="mb-2"
        />
        <p className="text-xs text-black/50">
          {priceRange[0]} — {priceRange[1]} EGP
        </p>
      </div>

      <div>
        <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-black/50">Gender</h3>
        <div className="space-y-1">
          {genders.map((g) => (
            <button
              key={g}
              type="button"
              onClick={() => updateParams({ gender: g === "All" ? null : g })}
              className={`block w-full rounded-lg px-2 py-2.5 text-left text-sm transition-colors ${
                currentGender === g ? "bg-cream-dark/60 font-medium text-brown" : "text-black/60 hover:bg-cream-dark/30"
              }`}
            >
              {g}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="mb-4 text-xs uppercase tracking-[0.2em] text-black/50">Sort By</h3>
        <Select value={currentSort} onValueChange={(v) => updateParams({ sort: v })}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="newest">Newest</SelectItem>
            <SelectItem value="price-asc">Price: Low to High</SelectItem>
            <SelectItem value="price-desc">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Button variant="outline" className="w-full" onClick={() => router.push("/products")}>
        Reset Filters
      </Button>
    </div>
  );

  return (
    <>
      <button
        type="button"
        className="mb-4 flex w-full items-center justify-between rounded-xl border border-cream-dark p-4 md:hidden"
        onClick={() => setOpen(true)}
      >
        <span className="flex items-center gap-2 text-sm uppercase tracking-widest">
          <SlidersHorizontal className="h-4 w-4" /> Filters
        </span>
      </button>

      {/* Mobile: fixed overlay sheet — does not push page content */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-50 bg-black/40 md:hidden"
            onClick={() => setOpen(false)}
          />
          <div
            className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] overflow-y-auto rounded-t-3xl bg-cream p-6 shadow-luxury md:hidden"
            role="dialog"
            aria-label="Filter products"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-sm uppercase tracking-widest text-black">Filters</span>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1.5 text-black/60 hover:bg-cream-dark"
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {content}
            <Button className="mt-6 w-full" onClick={() => setOpen(false)}>
              Show Results
            </Button>
          </div>
        </>
      )}

      {/* Desktop: always-visible sidebar */}
      <aside className="hidden md:block md:w-64 md:shrink-0">{content}</aside>
    </>
  );
}