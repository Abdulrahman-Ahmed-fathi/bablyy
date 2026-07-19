"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Tag,
  Percent,
  MessageSquare,
  Settings,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
  { href: "/admin/orders", label: "Orders", icon: ShoppingBag },
  { href: "/admin/products", label: "Products", icon: Package },
  { href: "/admin/categories", label: "Categories", icon: Tag },
  { href: "/admin/offers", label: "Offers", icon: Percent },
  { href: "/admin/messages", label: "Get in Touch", icon: MessageSquare },
  { href: "/admin/settings", label: "Settings", icon: Settings },
];

const mobileItems = navItems.filter((i) =>
  ["/admin/orders", "/admin/products", "/admin/messages", "/admin/settings"].includes(i.href)
);

interface AdminSidebarProps {
  pendingCount?: number;
  unreadMessages?: number;
}

export function AdminSidebar({
  pendingCount: initialPending = 0,
  unreadMessages: initialUnread = 0,
}: AdminSidebarProps) {
  const pathname = usePathname();
  const [pendingCount, setPendingCount] = useState(initialPending);
  const [unreadMessages, setUnreadMessages] = useState(initialUnread);

  useEffect(() => {
    setPendingCount(initialPending);
    setUnreadMessages(initialUnread);
  }, [initialPending, initialUnread]);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        if (typeof d.pendingOrders === "number") setPendingCount(d.pendingOrders);
        if (typeof d.unreadMessages === "number") setUnreadMessages(d.unreadMessages);
      })
      .catch(() => {});
  }, [pathname]);

  const NavLink = ({ item }: { item: (typeof navItems)[0] }) => {
    const active =
      pathname === item.href ||
      (item.href !== "/admin" && pathname.startsWith(item.href));
    const Icon = item.icon;
    return (
      <Link
        href={item.href}
        className={cn(
          "relative flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200 mx-3 my-0.5",
          active
            ? "bg-white/10 text-white shadow-luxury-sm"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        )}
      >
        {active && (
          <span className="absolute left-0 top-1/4 h-1/2 w-1.5 rounded-r-full bg-gold" />
        )}
        <Icon className={cn("h-5 w-5 shrink-0 transition-transform duration-200", active ? "text-gold" : "text-white/60")} />
        <span className="hidden lg:inline">{item.label}</span>
        {item.href === "/admin/orders" && pendingCount > 0 && (
          <span className="ms-auto rounded-full bg-gold/90 px-2 py-0.5 text-xs font-bold text-brown lg:inline">
            {pendingCount}
          </span>
        )}
        {item.href === "/admin/messages" && unreadMessages > 0 && (
          <span className="ms-auto rounded-full bg-gold/90 px-2 py-0.5 text-xs font-bold text-brown lg:inline">
            {unreadMessages}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <aside className="hidden min-h-screen w-16 flex-col bg-brown text-white md:flex lg:w-64 border-r border-white/5 shadow-luxury">
        <div className="border-b border-white/5 px-6 py-5.5 flex items-center gap-2.5">
          <Link href="/admin" className="font-display text-lg lg:text-xl tracking-wider text-white uppercase font-semibold">
            <span className="hidden lg:inline">Dashboard</span>
            <span className="lg:hidden">M</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 py-6">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mx-3 mb-6 flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white/50 transition-all duration-200 hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5 text-white/50" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/5 bg-brown md:hidden shadow-luxury">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center py-3 text-xs transition-colors duration-200",
                active ? "text-gold font-medium" : "text-white/50"
              )}
            >
              <Icon className="h-5 w-5 mb-1" />
              {item.label}
              {item.href === "/admin/orders" && pendingCount > 0 && (
                <span className="absolute end-1/4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-brown">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
              {item.href === "/admin/messages" && unreadMessages > 0 && (
                <span className="absolute end-1/4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-gold text-[10px] font-bold text-brown">
                  {unreadMessages > 9 ? "9+" : unreadMessages}
                </span>
              )}
            </Link>
          );
        })}
      </nav>
    </>
  );
}
