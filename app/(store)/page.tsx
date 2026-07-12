import { HeroSection } from "@/components/store/HeroSection";
import { OfferBanner } from "@/components/store/OfferBanner";
import { CategorySection } from "@/components/store/CategorySection";
import { FeaturedProductsSection } from "@/components/store/FeaturedProductsSection";
import {
  getSiteSettings,
  getFeaturedProducts,
  getActiveOffers,
  getCategories,
} from "@/lib/products";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: settings.storeName,
    description: settings.tagline,
  };
}

export default async function HomePage() {
  const [settings, featured, offers, categories] = await Promise.all([
    getSiteSettings(),
    getFeaturedProducts(20),
    getActiveOffers(),
    getCategories(),
  ]);

  return (
    <>
      <HeroSection settings={settings} />
      {settings.showOffersSection && offers.length > 0 && (
        <OfferBanner offers={offers} />
      )}
      <CategorySection categories={categories} />
      <FeaturedProductsSection products={featured} />
    </>
  );
}
