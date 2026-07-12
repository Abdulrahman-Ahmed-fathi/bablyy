"use client";

import { useState } from "react";
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
  items: { name: string; quantity: number; price: number }[];
}

export default function OrderStatusClient() {
  const [orderNumber, setOrderNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<OrderLookupResult | null>(null);

  const lookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderNumber.trim()) return;
    setLoading(true);
    setOrder(null);
    try {
      const res = await fetch(
        `/api/orders/lookup?orderNumber=${encodeURIComponent(orderNumber.trim())}`
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
  };

  return (
    <div className="mx-auto max-w-container px-4 py-16 lg:px-8 lg:py-24">
      <div className="mx-auto max-w-lg text-center">
        <h1 className="font-display text-4xl md:text-5xl">Track Your Order</h1>
        <p className="mt-4 text-black/60">Enter your order number to check the latest status.</p>
      </div>

      <form onSubmit={lookup} className="mx-auto mt-10 max-w-md space-y-4">
        <div>
          <Label htmlFor="orderNumber">Order Number</Label>
          <Input
            id="orderNumber"
            value={orderNumber}
            onChange={(e) => setOrderNumber(e.target.value)}
            placeholder="MP-0001"
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
            <p className="font-display text-2xl text-brown">{order.orderNumber}</p>
            <OrderStatusBadge status={order.status} />
          </div>
          <p className="mt-2 text-sm text-black/50">
            {new Date(order.createdAt).toLocaleDateString()}
          </p>
          <OrderTimeline status={order.status} />
          <ul className="mt-8 space-y-2 border-t border-cream-dark pt-6 text-sm">
            {order.items.map((item, i) => (
              <li key={i} className="flex justify-between">
                <span>{item.name} × {item.quantity}</span>
                <span>{formatPrice(item.price * item.quantity)}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 flex justify-between font-display text-xl">
            <span>Total</span>
            <span className="text-brown">{formatPrice(order.total)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
