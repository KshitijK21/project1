import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  variant?: "default" | "positive" | "negative" | "signal" | "info";
}

const variantStyles = {
  default: "bg-surface-raised text-text-secondary border-border-strong",
  positive: "bg-positive/10 text-positive border-positive/30",
  negative: "bg-negative/10 text-negative border-negative/30",
  signal: "bg-signal/10 text-signal border-signal/30",
  info: "bg-info/10 text-info border-info/30",
};

export default function Badge({ className, variant = "default", ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-medium",
        variantStyles[variant],
        className
      )}
      {...props}
    />
  );
}
