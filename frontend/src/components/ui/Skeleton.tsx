import { HTMLAttributes } from "react";
import { cn } from "@/utils/cn";

export default function Skeleton({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-surface-raised", className)}
      {...props}
    />
  );
}
