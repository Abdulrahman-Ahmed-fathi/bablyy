import { Suspense } from "react";
import OrderStatusClient from "./OrderStatusClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status | Maison de Parfum",
};

export default function OrderStatusPage() {
  return (
    <Suspense fallback={<div className="py-24 text-center">Loading...</div>}>
      <OrderStatusClient />
    </Suspense>
  );
}