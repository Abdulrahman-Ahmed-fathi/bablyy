"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { OrderTimeline } from "@/components/store/OrderTimeline";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { OrderStatus } from "@/lib/validations";

interface OrderLookupResult {
  orderNumber: string;
  status: OrderStatus;
  total: number;
  createdAt: string;
  items: { name: string; size: string | null; quantity: number; price: number }[];
}

export default function OrderStatusClient() {
  const searchParams = useSearchParams();
  const prefilled = searchParams.get("order") || "";
  const [orderNumber, setOrderNumber] = useState(prefilled);
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderLookupResult | null>(null);

  const lookup = useCallback(async (value: string) => {
    if (!value.trim()) return;
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/lookup?orderNumber=${encodeURIComponent(value.trim())}`
      );
      const data = await res.json();
      if (!res.ok) {
        toast.error("We could not find that order.");
        return;
      }
      setOrder(data);
    } catch {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  // Auto-lookup when arriving with ?order=... in the URL (e.g. from the confirmation email)
  useEffect(() => {
    if (prefilled) {
      lookup(prefilled);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefilled]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    lookup(orderNumber);
  };

  return (
    <div className="mx-auto max-w-container px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-body text-4xl md:text-5xl">Track Your Order</h1>
        <p className="mt-4 text-black/60">Enter your order number to check the latest status.</p>
      </div>

      <form onSubmit={handleSubmit} className="mx-auto mt-10 max-w-md space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="ORD-20260101-0001"
            className="mt-1"
          />
        </div>
        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Loading..." : "Track Order"}
        </Button>
      </form>

      {order && (
        <div className="mx-auto mt-12 max-w-lg rounded-2xl border border-cream-dark bg-white p-8 shadow-luxury-sm">
          <div className="flex items-center justify-between">
            <p className="font-body text-2xl text-brown">{order.orderNumber}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-black/50">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <OrderTimeline status={order.status} />
          <ul className="mt-8 space-y-2 border-t border-cream-dark pt-6 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>
                  {item.name}
                  {item.size && ` (${item.size})`} × {item.quantity}
                </span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between font-body text-xl">
            <span>Total</span>
            <span className="text-brown">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}

      <div className="mx-auto mt-12 max-w-lg text-center">
        <p className="text-sm text-black/50">Not ready to track an order yet?</p>
        <Button className="mt-4" asChild>
          <Link href="/products">Browse Products</Link>
        </Button>
      </div>
    </div>
  );
}