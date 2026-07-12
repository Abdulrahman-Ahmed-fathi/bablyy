import OrderStatusClient from "./OrderStatusClient";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Order Status | Maison de Parfum",
};

export default function OrderStatusPage() {
  return <OrderStatusClient />;
}
