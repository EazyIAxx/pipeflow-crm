"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { SidebarContent } from "./Sidebar";

const ROUTE_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  leads: "Leads",
  pipeline: "Pipeline",
  settings: "Configurações",
};

interface HeaderProps {
  workspaceSlug: string;
}

export function Header({ workspaceSlug }: HeaderProps) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  // Fecha o Sheet ao navegar para outra página
  useEffect(() => {
    setOpen(false);
  }, [pathname]);

  const segments = pathname.split("/").filter(Boolean);
  const lastSegment = segments[segments.length - 1] ?? "";
  const pageLabel = ROUTE_LABELS[lastSegment] ?? lastSegment;

  return (
    <header className="flex h-14 shrink-0 items-center gap-3 border-b border-border bg-background px-4">
      {/* Hamburger + Sheet — mobile only */}
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden text-muted-foreground hover:text-foreground"
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent
          side="left"
          className="w-[232px] p-0 border-r border-sidebar-border bg-sidebar"
        >
          <SheetTitle className="sr-only">Menu de navegação</SheetTitle>
          <SidebarContent workspaceSlug={workspaceSlug} />
        </SheetContent>
      </Sheet>

      {/* Título da página */}
      <div className="flex-1">
        <h1 className="text-sm font-semibold text-foreground">{pageLabel}</h1>
      </div>

      {/* Avatar compacto — mobile only */}
      <div className="md:hidden">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">
            GS
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
}
