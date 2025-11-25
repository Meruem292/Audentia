
import { LayoutDashboard, Gift, User, Bot, Users, Archive, type LucideIcon } from "lucide-react";

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
    href: "/dashboard/rewards",
    label: "Rewards",
    icon: Gift,
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
    href: "/admin/machines",
    label: "Machines",
    icon: Bot,
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
