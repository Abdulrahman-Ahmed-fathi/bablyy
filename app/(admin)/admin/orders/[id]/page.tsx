"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { OrderStatus } from "@/lib/validations";

interface OrderDetail {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  governorate: string;
  notes: string | null;
  subtotal: number;
  discount: number;
  total: number;
  createdAt: string;
  items: Array<{
    name: string;
    size: string | null;
    quantity: number;
    price: number;
  }>;
}

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<OrderDetail | null>(null);

  useEffect(() => {
    fetch(`/api/admin/orders/${params.id}`)
      .then((r) => r.json())
      .then(setOrder)
      .catch(() => {});
  }, [params.id]);

  const updateStatus = async (status: OrderStatus) => {
    const res = await fetch(`/api/admin/orders/${params.id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      const updated = await res.json();
      setOrder((prev) => (prev ? { ...prev, status: updated.status } : prev));
      toast.success("Status updated");
      router.refresh();
    } else {
      toast.error("Failed to update status");
    }
  };

  if (!order) {
    return <div className="animate-pulse h-96 bg-gray-200 rounded-lg" />;
  }

  const whatsappMsg = encodeURIComponent(
    `Hello ${order.firstName}, regarding your order ${order.orderNumber}...`
  );

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-wrap gap-3">
        
        <Button variant="outline" asChild>
          <a href={`https://wa.me/${order.phone.replace(/\D/g, "")}?text=${whatsappMsg}`} target="_blank" rel="noopener noreferrer">
            WhatsApp Customer
          </a>
        </Button>
        <Button variant="outline" onClick={() => window.print()}>
          Print Order
        </Button>
      </div>

      <div className="print-only mb-8">
        <h1 className="text-2xl font-bold">Order Invoice</h1>
        <p>{order.orderNumber}</p>
        <p>{new Date(order.createdAt).toLocaleString()}</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Order Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <p><strong>Order #:</strong> {order.orderNumber}</p>
            <p><strong>Date:</strong> {new Date(order.createdAt).toLocaleString()}</p>
            <div className="flex items-center gap-2">
              <strong>Status:</strong>
              <OrderStatusBadge status={order.status} />
            </div>
            <div className="no-print pt-2">
              <Select value={order.status} onValueChange={(v) => updateStatus(v as OrderStatus)}>
                <SelectTrigger className="w-48">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED", "CANCELLED"].map(
                    (s) => (
                      <SelectItem key={s} value={s}>{s}</SelectItem>
                    )
                  )}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Customer</CardTitle>
          </CardHeader>
          <CardContent className="space-y-1 text-sm">
            <p>{order.firstName} {order.lastName}</p>
            <p>{order.email}</p>
            <p>{order.phone}</p>
            <p>{order.address}</p>
            <p>{order.city}, {order.governorate}</p>
            {order.notes && <p className="pt-2"><strong>Notes:</strong> {order.notes}</p>}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Items</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>Qty</TableHead>
                <TableHead>Unit Price</TableHead>
                <TableHead>Total</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {order.items.map((item, i) => (
                <TableRow key={i}>
                  <TableCell>
                    {item.name}
                    {item.size && <span className="text-stone-400"> ({item.size})</span>}
                  </TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell>{formatPrice(item.price)}</TableCell>
                  <TableCell>{formatPrice(item.price * item.quantity)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="mt-4 space-y-1 text-right text-sm">
            <p>Subtotal: {formatPrice(order.subtotal)}</p>
            {order.discount > 0 && <p>Discount: -{formatPrice(order.discount)}</p>}
            <p className="text-lg font-semibold">Total: {formatPrice(order.total)}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
