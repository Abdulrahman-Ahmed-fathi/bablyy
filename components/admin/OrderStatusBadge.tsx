import { Badge } from "@/components/ui/badge";
import type { OrderStatus } from "@/lib/validations";

const variants: Record<OrderStatus, "warning" | "info" | "default" | "success" | "destructive"> = {
  PENDING: "warning",
  CONFIRMED: "info",
  PROCESSING: "default",
  SHIPPED: "default",
  DELIVERED: "success",
  CANCELLED: "destructive",
};

export function OrderStatusBadge({ status }: { status: OrderStatus | string }) {
  const variant = variants[status as OrderStatus] || "secondary";
  return (
    <Badge variant={variant}>
      {status.charAt(0) + status.slice(1).toLowerCase()}
    </Badge>
  );
}
