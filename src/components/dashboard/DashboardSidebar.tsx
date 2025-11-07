"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Settings, History, Award } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard/home", label: "Dashboard", icon: Home },
  { href: "/dashboard/history", label: "History", icon: History },
  { href: "/dashboard/rewards", label: "Rewards", icon: Award },
  { href: "/dashboard/settings", label: "Settings", icon: Settings },
];

export default function DashboardSidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 border-r bg-background pt-4">
      <nav className="flex-1 p-4">
        <ul className="space-y-1">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-muted-foreground transition-all hover:text-primary hover:bg-muted",
                  pathname === item.href && "bg-muted text-primary"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
