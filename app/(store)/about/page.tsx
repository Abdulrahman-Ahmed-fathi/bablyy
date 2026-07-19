import { getSiteSettings } from "@/lib/products";
import { parseJsonArray } from "@/lib/utils";
import { absoluteUrl } from "@/lib/site-url";
import { AboutContent } from "./AboutContent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const title = `About ${settings.storeName} — Our Story`;
  const description = settings.aboutText
    ? settings.aboutText.slice(0, 160)
    : `Learn about ${settings.storeName}, our passion for fine fragrances, and the craftsmanship behind every scent.`;
  return {
    title,
    description,
    alternates: { canonical: absoluteUrl("/about") },
    openGraph: {
      title,
      description,
      type: "website",
      url: absoluteUrl("/about"),
      images: settings.aboutHeroImageUrl || settings.heroImageUrl
        ? [{ url: settings.aboutHeroImageUrl || settings.heroImageUrl }]
        : undefined,
    },
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <AboutContent
      aboutText={settings.aboutText}
      storeName={settings.storeName}
      heroImageUrl={settings.aboutHeroImageUrl || settings.heroImageUrl || null}
      galleryImages={parseJsonArray(settings.aboutGalleryImages)}
      showGallerySection={settings.showAboutGallerySection}
      instagramUrl={settings.instagram}
      phone={settings.phone}
      email={settings.email}
      address={settings.address}
      facebookUrl={settings.facebook}
      whatsapp={settings.whatsapp}
      showMapSection={settings.showMapSection}
      mapLocations={parseJsonArray(settings.mapLocations) as unknown as { id: string; name: string; address: string; lat: number; lng: number; }[]}
    />
  );
}