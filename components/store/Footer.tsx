import Link from "next/link";
import type { SiteSettings } from "@prisma/client";

interface FooterProps {
  settings: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const whatsapp = settings.whatsapp || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER;

  return (
    <footer className="bg-[#2f2118] text-cream">
      <div className="mx-auto grid max-w-container gap-12 px-4 py-20 md:grid-cols-3 lg:px-8">
        <div>
          <h3 className="font-display text-2xl text-gold md:text-3xl">{settings.storeName}</h3>
          <p className="mt-3 text-sm leading-relaxed text-cream/75">{settings.tagline}</p>
        </div>

        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold/70">Quick Links</h4>
          <ul className="space-y-3 text-sm text-cream/75">
            <li><Link href="/" className="transition-colors hover:text-gold">Home</Link></li>
            <li><Link href="/products" className="transition-colors hover:text-gold">Perfumes</Link></li>
            <li><Link href="/about" className="transition-colors hover:text-gold">About</Link></li>
            <li><Link href="/cart" className="transition-colors hover:text-gold">Cart</Link></li>
            <li><Link href="/order-status" className="transition-colors hover:text-gold">Track Your Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="mb-4 text-xs uppercase tracking-[0.25em] text-gold/70">Contact</h4>
          <ul className="space-y-2 text-sm text-cream/75">
            {settings.phone && <li>{settings.phone}</li>}
            {settings.email && <li>{settings.email}</li>}
            {settings.address && <li>{settings.address}</li>}
          </ul>
          <div className="mt-5 flex flex-wrap gap-4 text-sm">
            {settings.instagram && (
              <a href={settings.instagram} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">
                Instagram
              </a>
            )}
            {settings.facebook && (
              <a href={settings.facebook} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">
                Facebook
              </a>
            )}
            {whatsapp && (
              <a href={`https://wa.me/${whatsapp}`} target="_blank" rel="noopener noreferrer" className="transition-colors hover:text-gold">
                WhatsApp
              </a>
            )}
          </div>
        </div>
      </div>
      <div className="border-t border-gold/20 bg-[#271a13] py-6 text-center text-xs text-cream/55">
        © {new Date().getFullYear()} {settings.storeName}. All rights reserved.
      </div>
    </footer>
  );
}
