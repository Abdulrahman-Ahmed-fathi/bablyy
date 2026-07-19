"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";
import { cn } from "@/lib/utils";

interface AdminTopbarProps {
  title: string;
  email?: string | null;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  firstName: string;
  lastName: string;
  total: number;
  status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
}

export function AdminTopbar({ title, email }: AdminTopbarProps) {
  const [showNotifications, setShowNotifications] = useState(false);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((d) => {
        setRecentOrders(d.recentOrders || []);
        setPendingCount(d.pendingOrders || 0);
      })
      .catch(() => {});
  }, []);

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-cream-dark/40 bg-white/90 backdrop-blur-md px-6 py-4 shadow-sm">
      <div>
        <h1 className="font-body text-2xl font-semibold tracking-wide text-brown">{title}</h1>
        {pendingCount > 0 && (
          <p className="text-xs font-medium text-amber-700 mt-0.5">
            {pendingCount} pending order{pendingCount !== 1 ? "s" : ""} requiring action
          </p>
        )}
      </div>
      <div className="flex items-center gap-4">
        {/* Notifications */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className={cn(
              "relative rounded-xl p-2.5 transition-colors border border-stone-100 hover:bg-stone-50",
              showNotifications && "bg-stone-50 border-stone-200"
            )}
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-stone-600" />
            {pendingCount > 0 && (
              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-gold animate-pulse" />
            )}
          </button>
          {showNotifications && (
            <>
              {/* Overlay back-click handler */}
              <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
              <div className="absolute right-0 top-full z-50 mt-2.5 w-80 rounded-2xl border border-cream-dark/60 bg-white p-2 shadow-luxury">
                <div className="border-b border-stone-100 px-4 py-3 text-xs font-semibold uppercase tracking-wider text-stone-400">
                  Recent Orders
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {recentOrders.length === 0 ? (
                    <p className="p-4 text-center text-sm text-stone-500">No recent orders</p>
                  ) : (
                    recentOrders.map((order) => (
                      <Link
                        key={order.id}
                        href={`/admin/orders/${order.id}`}
                        className="flex items-center justify-between rounded-xl px-4 py-3 text-sm transition-all duration-200 hover:bg-stone-50"
                        onClick={() => setShowNotifications(false)}
                      >
                        <div>
                          <p className="font-semibold text-brown">{order.orderNumber}</p>
                          <p className="text-xs text-stone-500 mt-0.5">
                            {order.firstName} {order.lastName}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-stone-900">{formatPrice(order.total)}</p>
                          <div className="mt-1">
                            <OrderStatusBadge status={order.status} />
                          </div>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        {/* User Info & Logout */}
        {email && (
          <span className="hidden text-sm font-medium text-stone-500 sm:inline bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100">
            {email}
          </span>
        )}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-xl p-2.5 transition-colors border border-stone-100 hover:bg-stone-50"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5 text-stone-600" />
        </button>
      </div>
    </header>
  );
}
