import { Navbar } from "@/components/store/Navbar";
import { Footer } from "@/components/store/Footer";
import { WhatsAppButton } from "@/components/store/WhatsAppButton";
import { getSiteSettings } from "@/lib/products";

export default async function StoreLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <>
      <Navbar settings={settings} />
      <main className="min-h-screen pt-16">{children}</main>
      <Footer settings={settings} />
      <WhatsAppButton number={settings.whatsapp} />
    </>
  );
}
