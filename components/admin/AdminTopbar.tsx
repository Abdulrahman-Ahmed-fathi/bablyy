"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { Bell, LogOut } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { OrderStatusBadge } from "./OrderStatusBadge";

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
    <header className="flex items-center justify-between border-b border-stone-200 bg-white px-6 py-4">
      <div>
        <h1 className="text-xl font-semibold text-stone-900">{title}</h1>
        {pendingCount > 0 && (
          <p className="text-xs text-amber-700">
            {pendingCount} pending order{pendingCount !== 1 ? "s" : ""}
          </p>
        )}
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-lg p-2 transition-colors hover:bg-stone-100"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5 text-stone-600" />
            {pendingCount > 0 && (
              <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-amber-500" />
            )}
          </button>
          {showNotifications && (
            <div className="absolute right-0 top-full z-50 mt-2 w-80 rounded-xl border border-stone-200 bg-white shadow-lg">
              <div className="border-b border-stone-100 p-3 text-sm font-medium">Recent Orders</div>
              {recentOrders.length === 0 ? (
                <p className="p-4 text-sm text-stone-500">No recent orders</p>
              ) : (
                recentOrders.map((order) => (
                  <Link
                    key={order.id}
                    href={`/admin/orders/${order.id}`}
                    className="flex items-center justify-between border-b border-stone-50 p-3 text-sm transition-colors hover:bg-stone-50"
                    onClick={() => setShowNotifications(false)}
                  >
                    <div>
                      <p className="font-medium">{order.orderNumber}</p>
                      <p className="text-stone-500">
                        {order.firstName} {order.lastName}
                      </p>
                    </div>
                    <div className="text-right">
                      <p>{formatPrice(order.total)}</p>
                      <OrderStatusBadge status={order.status} />
                    </div>
                  </Link>
                ))
              )}
            </div>
          )}
        </div>
        {email && <span className="hidden text-sm text-stone-500 sm:inline">{email}</span>}
        <button
          type="button"
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="rounded-lg p-2 transition-colors hover:bg-stone-100"
          aria-label="Logout"
        >
          <LogOut className="h-5 w-5 text-stone-600" />
        </button>
      </div>
    </header>
  );
}
