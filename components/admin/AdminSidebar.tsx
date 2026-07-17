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
          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-colors mx-2",
          active
            ? "bg-white/10 text-white"
            : "text-white/60 hover:bg-white/5 hover:text-white"
        )}
      >
        <Icon className="h-5 w-5 shrink-0" />
        <span className="hidden lg:inline">{item.label}</span>
        {item.href === "/admin/orders" && pendingCount > 0 && (
          <span className="ms-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-stone-900 lg:inline">
            {pendingCount}
          </span>
        )}
        {item.href === "/admin/messages" && unreadMessages > 0 && (
          <span className="ms-auto rounded-full bg-amber-400 px-2 py-0.5 text-xs font-medium text-stone-900 lg:inline">
            {unreadMessages}
          </span>
        )}
      </Link>
    );
  };

  return (
    <>
      <aside className="hidden min-h-screen w-16 flex-col bg-yellow-950 text-white md:flex lg:w-64">
        <div className="border-b border-white/10 p-5">
          <Link href="/admin" className="font-body text-lg lg:text-xl">
            <span className="hidden lg:inline">Admin Dashboard</span>
            <span className="lg:hidden">M</span>
          </Link>
        </div>
        <nav className="flex-1 space-y-1 py-4">
          {navItems.map((item) => (
            <NavLink key={item.href} item={item} />
          ))}
        </nav>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="mx-2 mb-4 flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-white/60 transition-colors hover:bg-white/5 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span className="hidden lg:inline">Logout</span>
        </button>
      </aside>

      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-white/10 bg-yellow-950 md:hidden">
        {mobileItems.map((item) => {
          const Icon = item.icon;
          const active = pathname.startsWith(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative flex flex-1 flex-col items-center py-3 text-xs",
                active ? "text-white" : "text-white/50"
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
              {item.href === "/admin/orders" && pendingCount > 0 && (
                <span className="absolute end-1/4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-stone-900">
                  {pendingCount > 9 ? "9+" : pendingCount}
                </span>
              )}
              {item.href === "/admin/messages" && unreadMessages > 0 && (
                <span className="absolute end-1/4 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-amber-400 text-[10px] font-bold text-stone-900">
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
