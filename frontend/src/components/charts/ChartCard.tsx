"use client";

import { ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/Card";
import Skeleton from "@/components/ui/Skeleton";

export function ChartCard({
  title,
  subtitle,
  action,
  loading,
  children,
  className,
  empty,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  loading?: boolean;
  children: ReactNode;
  className?: string;
  empty?: boolean;
}) {
  return (
    <Card className={className}>
      <CardHeader>
        <div>
          <CardTitle>{title}</CardTitle>
          {subtitle && <p className="text-xs text-text-muted mt-0.5">{subtitle}</p>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="p-4">
        {loading ? (
          <Skeleton className="h-64 w-full" />
        ) : empty ? (
          <div className="flex h-64 items-center justify-center text-sm text-text-muted">
            No data to display
          </div>
        ) : (
          children
        )}
      </CardContent>
    </Card>
  );
}
