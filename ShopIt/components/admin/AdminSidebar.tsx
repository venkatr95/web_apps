"use client";

import { cn } from "@/lib/utils";
import {
  BarChart3,
  Bell,
  Database,
  LayoutDashboard,
  Package,
  Shield,
  ShoppingCart,
  Star,
  TrendingUp,
  UserCheck,
  Users,
} from "lucide-react";
import Link from "next/link";

interface AdminSidebarProps {
  currentPath: string;
}

const adminRoutes = [
  {
    label: "Dashboard",
    icon: LayoutDashboard,
    href: "/admin",
    description: "Overview & Quick Stats",
  },
  {
    label: "Analytics",
    icon: BarChart3,
    href: "/admin/analytics",
    description: "Business Insights",
  },
  {
    label: "Users",
    icon: Users,
    href: "/admin/users",
    description: "Customer Management",
  },
  {
    label: "Account Requests",
    icon: UserCheck,
    href: "/admin/account-requests",
    description: "Premium & Business Approvals",
  },
  {
    label: "Products",
    icon: Package,
    href: "/admin/products",
    description: "Inventory Management",
  },
  {
    label: "Orders",
    icon: ShoppingCart,
    href: "/admin/orders",
    description: "Order Management",
  },
  {
    label: "Reviews",
    icon: Star,
    href: "/admin/reviews",
    description: "Approve & Manage Reviews",
  },
  {
    label: "Notifications",
    icon: Bell,
    href: "/admin/notifications",
    description: "Send & Manage Notifications",
  },
  {
    label: "Data Management",
    icon: Database,
    href: "/admin/data",
    description: "Manage Sanity CMS Data",
  },
];

const AdminSidebar = ({ currentPath }: AdminSidebarProps) => {
  return (
    <div className="bg-white rounded-2xl shadow-xl border border-shop_light_blue/10 p-6">
      {/* Header */}
      <div className="flex items-center gap-3 mb-8 pb-6 border-b border-shop_light_blue/20">
        <div className="p-2 bg-gradient-to-br from-shop_light_blue to-shop_dark_blue rounded-xl">
          <Shield className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-dark-color">Admin Panel</h2>
          <p className="text-sm text-light-color">Management Center</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="space-y-2">
        {adminRoutes.map((route) => {
          const isActive = currentPath === route.href;
          const Icon = route.icon;

          return (
            <Link
              key={route.href}
              href={route.href}
              className={cn(
                "flex items-center gap-3 p-4 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-gradient-to-r from-shop_light_blue to-shop_dark_blue text-white shadow-lg"
                  : "hover:bg-shop_light_bg hover:shadow-md text-dark-color"
              )}
            >
              <Icon
                className={cn(
                  "w-5 h-5 transition-transform group-hover:scale-110",
                  isActive ? "text-white" : "text-shop_light_blue"
                )}
              />
              <div className="flex-1">
                <div
                  className={cn(
                    "font-semibold text-sm",
                    isActive ? "text-white" : "text-dark-color"
                  )}
                >
                  {route.label}
                </div>
                <div
                  className={cn(
                    "text-xs",
                    isActive ? "text-white/80" : "text-light-color"
                  )}
                >
                  {route.description}
                </div>
              </div>
              {isActive && (
                <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-shop_light_blue/20">
        <div className="flex items-center gap-2 text-xs text-light-color">
          <TrendingUp className="w-4 h-4" />
          <span>Admin Dashboard v2.0</span>
        </div>
      </div>
    </div>
  );
};

export default AdminSidebar;
