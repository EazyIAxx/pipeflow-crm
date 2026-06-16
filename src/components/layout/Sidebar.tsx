"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  KanbanSquare,
  Settings,
  Zap,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { WorkspaceSwitcher } from "./WorkspaceSwitcher";
import { UserMenu } from "./UserMenu";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { segment: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { segment: "leads", label: "Leads", icon: Users },
  { segment: "pipeline", label: "Pipeline", icon: KanbanSquare },
  { segment: "settings", label: "Configurações", icon: Settings },
];

interface NavItemProps {
  href: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  isActive: boolean;
}

function NavItem({ href, label, icon: Icon, isActive }: NavItemProps) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-sidebar-accent text-sidebar-accent-foreground"
          : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
      )}
    >
      <Icon
        className={cn(
          "h-4 w-4 shrink-0 transition-colors",
          isActive ? "text-pf-accent" : "opacity-60 group-hover:opacity-100 group-hover:text-pf-accent"
        )}
      />
      <span className="flex-1">{label}</span>
      {isActive && (
        <span className="h-1.5 w-1.5 rounded-full bg-pf-accent" />
      )}
    </Link>
  );
}

interface SidebarContentProps {
  workspaceSlug: string;
}

export function SidebarContent({ workspaceSlug }: SidebarContentProps) {
  const pathname = usePathname();
  const base = `/${workspaceSlug}`;

  return (
    <div className="flex h-full flex-col">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-4 py-5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pf-accent shadow-sm">
          <Zap className="h-4 w-4 text-black" />
        </div>
        <span className="font-bold text-[15px] tracking-tight text-pf-accent">
          PipeFlow
        </span>
      </div>

      {/* Workspace Switcher */}
      <div className="px-3 pb-3">
        <WorkspaceSwitcher workspaceSlug={workspaceSlug} />
      </div>

      <Separator className="bg-sidebar-border" />

      {/* Navigation */}
      <nav className="flex-1 space-y-0.5 px-3 py-3">
        {NAV_ITEMS.map((item) => {
          const href = `${base}/${item.segment}`;
          const isActive = pathname.startsWith(href);
          return (
            <NavItem
              key={item.segment}
              href={href}
              label={item.label}
              icon={item.icon}
              isActive={isActive}
            />
          );
        })}
      </nav>

      <Separator className="bg-sidebar-border" />

      {/* User */}
      <div className="px-3 py-3">
        <UserMenu workspaceSlug={workspaceSlug} />
      </div>
    </div>
  );
}

interface SidebarProps {
  workspaceSlug: string;
  className?: string;
}

export function Sidebar({ workspaceSlug, className }: SidebarProps) {
  return (
    <aside
      className={cn(
        "flex h-full w-[232px] shrink-0 flex-col border-r border-sidebar-border bg-sidebar",
        className
      )}
    >
      <SidebarContent workspaceSlug={workspaceSlug} />
    </aside>
  );
}
