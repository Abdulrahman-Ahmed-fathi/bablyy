import { HeroSection } from "@/components/store/HeroSection";
import { OfferBanner } from "@/components/store/OfferBanner";
import { BestSellersSection } from "@/components/store/BestSellersSection";
import { CategorySection } from "@/components/store/CategorySection";
import { FeaturedProductsSection } from "@/components/store/FeaturedProductsSection";
import {
  getSiteSettings,
  getFeaturedProducts,
  getBestSellerProducts,
  getActiveOffers,
  getCategories,
} from "@/lib/products";
import { absoluteUrl } from "@/lib/site-url";
import type { Metadata } from "next";
export const revalidate = 120;
export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = `${settings.storeName} — Luxury Fragrances Online`;
  const description =
    settings.tagline ||
    "Discover curated luxury perfumes and signature scents. Shop bestsellers, new arrivals, and exclusive offers.";
  return {
    title,
    description: description.slice(0, 160),
    alternates: { canonical: absoluteUrl("/") },
    openGraph: {
      title,
      description: description.slice(0, 160),
      type: "website",
      url: absoluteUrl("/"),
      images: settings.heroImageUrl
        ? [{ url: settings.heroImageUrl }]
        : settings.logoUrl
          ? [{ url: settings.logoUrl }]
          : undefined,
    },
  };
}

export default async function HomePage() {
  const [settings, featured, bestSellers, offers, categories] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(20),
    getBestSellerProducts(8),
    getActiveOffers(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      {settings.showOffersSection && offers.length > 0 && (
        <OfferBanner offers={offers} />
      )}
      <BestSellersSection products={bestSellers} />
      <CategorySection categories={categories} />
      <FeaturedProductsSection products={featured} />
    </>
  );
}