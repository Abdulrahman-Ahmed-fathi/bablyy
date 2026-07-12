"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion } from "framer-motion";
import { Menu, X } from "lucide-react";
import { CartIcon } from "./CartIcon";
import { CartDrawer } from "./CartDrawer";
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
          <Link href="/" className="font-display text-2xl tracking-wide text-black">
            {settings.logoUrl ? (
              <Image
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

          <div className="flex items-center gap-3">
            <CartIcon onClick={() => setCartOpen(true)} />
            <button
              type="button"
              className="md:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <Menu className="h-6 w-6" />
            </button>
          </div>
        </nav>
      </motion.header>

      {mobileOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-yellow-950"
        >
          <button
            type="button"
            className="absolute right-6 top-6 text-cream"
            onClick={() => setMobileOpen(false)}
            aria-label="Close menu"
          >
            <X className="h-8 w-8" />
          </button>
          {links.map((link, i) => (
            <motion.div
              key={link.href}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
            >
              <Link
                href={link.href}
                onClick={() => setMobileOpen(false)}
                className="font-display text-3xl text-cream"
              >
                {link.label}
              </Link>
            </motion.div>
          ))}
        </motion.div>
      )}

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}
