"use client";

import type React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ClipboardList,
  Users,
  Hospital,
  BedDouble,
  Stethoscope,
  Bell,
  BarChart3,
  ScrollText,
  UserCog,
  LogOut,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { ReferralIcon } from "@/components/referral-logo";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/lib/auth-context";
import { getModuleAccess } from "@/lib/config";
import type { Role } from "@/lib/types";

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
  module: string;
}

const navItems: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    module: "dashboard",
  },
  {
    title: "Referrals",
    href: "/referrals",
    icon: ClipboardList,
    module: "referrals",
  },
  { title: "Patients", href: "/patients", icon: Users, module: "patients" },
  {
    title: "Hospitals",
    href: "/hospitals",
    icon: Hospital,
    module: "hospitals",
  },
  {
    title: "Bed Capacity",
    href: "/bed-capacity",
    icon: BedDouble,
    module: "bed-capacity",
  },
  {
    title: "Specialists",
    href: "/specialists",
    icon: Stethoscope,
    module: "specialists",
  },
  {
    title: "Notifications",
    href: "/notifications",
    icon: Bell,
    module: "notifications",
  },
  { title: "Reports", href: "/reports", icon: BarChart3, module: "reports" },
  {
    title: "Audit Logs",
    href: "/audit-logs",
    icon: ScrollText,
    module: "audit-logs",
  },
  { title: "Users", href: "/users", icon: UserCog, module: "users" },
];

import { useGetUnreadCountQuery } from "@/store/features/notification/notificationSlice";

export function AppSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  
  const role = user?.role as Role | undefined;
  const accessibleModules = role ? getModuleAccess(role) : [];

  const filteredNavItems = navItems.filter(
    (item) =>
      accessibleModules.includes("all") ||
      accessibleModules.includes(item.module),
  );

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      {/* Logo */}
      <div className="flex h-16 items-center gap-2 border-b px-6">
        <ReferralIcon className="h-8 w-8" />
        <div className="flex flex-col">
          <span className="text-sm font-bold leading-none">MediRefer</span>
          <span className="text-xs text-muted-foreground leading-none mt-1">
            Referral System
          </span>
        </div>
      </div>

      {/* Nav */}
      <ScrollArea className="flex-1 px-3 py-4">
        <nav className="flex flex-col gap-1">
          {filteredNavItems.map((item) => {
            const isActive =
              pathname === item.href || pathname?.startsWith(`${item.href}/`);
            return (
              <Link key={item.href} href={item.href}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  className={cn(
                    "w-full justify-start gap-3 h-10",
                    isActive &&
                      "bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="text-sm font-medium">{item.title}</span>
                </Button>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      {/* Sign out */}
      <div className="border-t p-3">
        <Button
          variant="ghost"
          onClick={logout}
          className="w-full justify-start gap-3 h-10 text-destructive hover:text-destructive hover:bg-destructive/10"
        >
          <LogOut className="h-4 w-4" />
          <span className="text-sm font-medium">Sign Out</span>
        </Button>
      </div>
    </div>
  );
}
