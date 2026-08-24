import {
  LayoutDashboard,
  Database,
  BarChart3,
  MessageSquareText,
  TrendingUp,
  FileText,
  ShieldAlert,
  type LucideIcon,
} from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  adminOnly?: boolean;
}

export const navItems: NavItem[] = [
  { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { label: "Datasets", href: "/datasets", icon: Database },
  { label: "Analytics", href: "/analytics", icon: MessageSquareText },
  { label: "Insights", href: "/insights", icon: BarChart3 },
  { label: "Forecasts", href: "/forecasts", icon: TrendingUp },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Audit Log", href: "/admin/audit", icon: ShieldAlert, adminOnly: true },
];
