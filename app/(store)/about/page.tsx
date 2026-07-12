import { getSiteSettings } from "@/lib/products";
import { AboutContent } from "./AboutContent";
import type { Metadata } from "next";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  return {
    title: `About | ${settings.storeName}`,
    description: settings.aboutText.slice(0, 160),
  };
}

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return <AboutContent aboutText={settings.aboutText} storeName={settings.storeName} />;
}
