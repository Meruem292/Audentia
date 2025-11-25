
import { LayoutDashboard, Gift, User, Users, Archive, type LucideIcon } from "lucide-react";

export interface NavItem {
    href: string;
    label: string;
    icon: LucideIcon;
}

export const userNavItems: NavItem[] = [
  {
    href: "/dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    href: "/dashboard/profile",
    label: "Profile",
    icon: User,
  },
];

export const adminNavItems: NavItem[] = [
  {
    href: "/admin",
    label: "Overview",
    icon: LayoutDashboard,
  },
  {
    href: "/admin/users",
    label: "Users",
    icon: Users,
  },
  {
    href: "/admin/rewards",
    label: "Rewards",
    icon: Archive,
  },
];
