import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "default" | "secondary" | "destructive" | "outline" | "success" | "warning" | "info";
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium transition-colors",
        {
          default: "bg-brown text-white",
          secondary: "bg-cream-dark text-black",
          destructive: "bg-red-100 text-red-800",
          outline: "border border-brown text-brown",
          success: "bg-green-100 text-green-800",
          warning: "bg-amber-100 text-amber-800",
          info: "bg-blue-100 text-blue-800",
        }[variant],
        className
      )}
      {...props}
    />
  );
}

export { Badge };
