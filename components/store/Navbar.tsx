"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { SafeImage } from "@/components/store/SafeImage";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X,Heart, ShoppingBag as ShoppingBagIcon } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
import { WishlistIcon } from "./WishlistIcon";
import type { SiteSettings } from "@prisma/client";


interface NavbarProps {
  settings: SiteSettings;
}

export function Navbar({ settings }: NavbarProps) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [cartOpen, setCartOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  const links = [
    { href: "/", label: "Home" },
    { href: "/products", label: "Perfumes" },
    { href: "/about", label: "About" },
    { href: "/order-status", label: "Order Status" }
  ];

  return (
    <>
      <motion.header
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-300 ${
          scrolled
            ? "bg-cream backdrop-blur-md shadow-luxury-sm"
            : "bg-transparent"
        }`}
      >
        <nav className="mx-auto flex max-w-container items-center justify-between px-4 py-4 lg:px-8">
          <Link
            href="/"
            className="font-body text-2xl tracking-wide text-black"
          >
            {settings.logoUrl ? (
              <SafeImage
                src={settings.logoUrl}
                alt={settings.storeName}
                width={120}
                height={40}
                className="h-10 w-auto object-contain"
              />
            ) : (
              settings.storeName
            )}
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            {links.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="text-sm uppercase tracking-widest text-black/80 transition-colors hover:text-brown"
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-1">
            <WishlistIcon />
            <CartIcon onClick={() => setCartOpen(true)} />
            <button
              type="button"
              className="p-2 md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-black/40 md:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", stiffness: 300, damping: 32 }}
              className="fixed inset-y-0 right-0 z-50 flex w-full max-w-xs flex-col bg-cream shadow-luxury md:hidden"
              role="dialog"
              aria-label="Site menu"
            >
              <div className="flex items-center justify-between border-b border-cream-dark px-6 py-5">
                <span className="font-body text-xl text-brown">
                  {settings.storeName}
                </span>
                <button
                  type="button"
                  className="rounded-full p-1.5 text-black/70 transition-colors hover:bg-cream-dark hover:text-brown"
                  onClick={() => setMobileOpen(false)}
                  aria-label="Close menu"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <nav className="flex flex-1 flex-col overflow-y-auto py-4">
                {links.map((link, i) => (
                  <motion.div
                    key={link.href}
                    initial={{ opacity: 0, x: 16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="border-b border-cream-dark/70"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setMobileOpen(false)}
                      className="block px-6 py-4 font-body text-2xl text-black transition-colors hover:text-brown"
                    >
                      {link.label}
                    </Link>
                  </motion.div>
                ))}
              </nav>

              <div className="space-y-1 border-t border-cream-dark px-2 py-4">
                <Link
                  href="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm uppercase tracking-widest text-black/80 transition-colors hover:bg-cream-dark hover:text-brown"
                >
                  <Heart className="h-5 w-5" /> Wishlist
                </Link>
                <Link
                  href="/cart"
                  onClick={() => setMobileOpen(false)}
                  className="flex items-center gap-3 rounded-lg px-4 py-3 text-sm uppercase tracking-widest text-black/80 transition-colors hover:bg-cream-dark hover:text-brown"
                >
                  <ShoppingBagIcon className="h-5 w-5" /> Cart
                </Link>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
