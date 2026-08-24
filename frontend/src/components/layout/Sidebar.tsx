"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Activity } from "lucide-react";
import { navItems } from "@/lib/nav-config";
import { cn } from "@/utils/cn";
import { useAuth } from "@/hooks/useAuth";

export default function Sidebar({
  mobileOpen,
  onCloseMobile,
}: {
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}) {
  const pathname = usePathname();
  const { role } = useAuth();

  const visibleItems = navItems.filter((item) => !item.adminOnly || role === "admin");

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 lg:hidden"
          onClick={onCloseMobile}
        />
      )}
      <aside
        className={cn(
          "fixed lg:static inset-y-0 left-0 z-50 w-60 shrink-0 border-r border-border bg-surface",
          "flex flex-col transition-transform duration-200 lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center gap-2 px-5 h-16 border-b border-border">
          <div className="flex h-7 w-7 items-center justify-center rounded-md bg-signal/10 border border-signal/30">
            <Activity className="h-4 w-4 text-signal" />
          </div>
          <span className="font-display font-semibold text-sm tracking-wide text-text-primary">
            AUTONOMOUS BI
          </span>
        </div>

        <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          {visibleItems.map((item) => {
            const active = pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onCloseMobile}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                  active
                    ? "bg-signal-soft text-signal font-medium"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-raised"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="px-5 py-4 border-t border-border">
          <p className="text-xs text-text-muted font-data">v1.0.0</p>
        </div>
      </aside>
    </>
  );
}
