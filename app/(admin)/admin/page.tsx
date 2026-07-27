"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { StatsCard } from "@/components/admin/StatsCard";
import { OrderStatusBadge } from "@/components/admin/OrderStatusBadge";
import { formatPrice } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const COLORS = ["#B58E3D", "#3D1C10", "#5D3A21", "#8C6239", "#A67C52", "#C4A484"];

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<{
    totalOrders: number;
    pendingOrders: number;
    totalProducts: number;
    totalRevenue: number;
    ordersPerDay: { date: string; count: number }[];
    ordersByStatus: { status: string; count: number }[];
    recentOrders: {
      id: string;
      orderNumber: string;
      firstName: string;
      lastName: string;
      total: number;
      status: "PENDING" | "CONFIRMED" | "PROCESSING" | "SHIPPED" | "DELIVERED" | "CANCELLED";
      createdAt: string;
    }[];
  } | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => {
        if (!r.ok) throw new Error("Failed to load stats");
        return r.json();
      })
      .then(setStats)
      .catch(() => {
        setStats({
          totalOrders: 0,
          pendingOrders: 0,
          totalProducts: 0,
          totalRevenue: 0,
          ordersPerDay: [],
          ordersByStatus: [],
          recentOrders: [],
        });
      });
  }, []);

  if (!stats) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-28 animate-pulse rounded-2xl bg-stone-100" />
          ))}
        </div>
      </div>
    );
  }

  const isEmpty = stats.totalOrders === 0 && stats.totalProducts === 0;

  return (
    <div className="space-y-8">
      {isEmpty && (
        <div className="rounded-2xl border border-dashed border-stone-300 bg-white p-8 text-center">
          <h2 className="text-lg font-medium text-stone-900">Welcome to your dashboard</h2>
          <p className="mt-2 text-stone-500">
            Add products and start receiving orders to see your stats here.
          </p>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatsCard title="Total Orders" value={stats.totalOrders} />
        <StatsCard title="Pending Orders" value={stats.pendingOrders} accent="amber" />
        <StatsCard title="Active Products" value={stats.totalProducts} />
        <StatsCard title="Revenue (Delivered)" value={stats.totalRevenue} prefix="EGP " />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-cream-dark/60 bg-white p-4 sm:p-6 shadow-luxury-sm">
          <h2 className="mb-4 font-body text-base sm:text-lg tracking-wide text-brown uppercase">Orders (Last 30 Days)</h2>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={stats.ordersPerDay}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e7e5e4" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={(v) => v.slice(5)} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Line type="monotone" dataKey="count" stroke="#3D1C10" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-2xl border border-cream-dark/60 bg-white p-4 sm:p-6 shadow-luxury-sm">
          <h2 className="mb-4 font-body text-base sm:text-lg tracking-wide text-brown uppercase">Orders by Status</h2>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie
                data={stats.ordersByStatus}
                dataKey="count"
                nameKey="status"
                cx="50%"
                cy="50%"
                outerRadius={65}
                label={(entry) => `${entry.name}: ${entry.value}`}
              >
                {stats.ordersByStatus.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-cream-dark/60 bg-white shadow-luxury-sm">
        <div className="border-b border-stone-100 px-6 py-4 bg-white">
          <h2 className="font-body text-lg tracking-wide text-brown uppercase">Recent Orders</h2>
        </div>
        <div className="overflow-x-auto">
          <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Order #</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>Total</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Date</TableHead>
              <TableHead></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {stats.recentOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-stone-500">
                  No orders yet
                </TableCell>
              </TableRow>
            ) : (
              stats.recentOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.orderNumber}</TableCell>
                  <TableCell>
                    {order.firstName} {order.lastName}
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="text-brown hover:underline"
                    >
                      View
                    </Link>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
      </div>
    </div>
  );
}
