"use client";

import { Check, ChevronsUpDown, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

function formatWorkspaceName(slug: string): string {
  return slug
    .split("-")
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
    .join(" ");
}

interface WorkspaceSwitcherProps {
  workspaceSlug: string;
}

export function WorkspaceSwitcher({ workspaceSlug }: WorkspaceSwitcherProps) {
  const name = formatWorkspaceName(workspaceSlug);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between gap-2 px-2 h-10 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-sidebar-primary text-sidebar-primary-foreground text-xs font-bold">
              {name[0]}
            </div>
            <span className="truncate text-sm font-medium">{name}</span>
          </div>
          <ChevronsUpDown className="h-4 w-4 shrink-0 opacity-40" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" sideOffset={4} className="w-56">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Workspaces
        </DropdownMenuLabel>
        <DropdownMenuItem className="gap-2 cursor-default">
          <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-primary/15 text-primary text-xs font-bold">
            {name[0]}
          </div>
          <span className="flex-1 truncate text-sm">{name}</span>
          <Check className="h-3.5 w-3.5 text-primary" />
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer text-muted-foreground">
          <Plus className="h-4 w-4" />
          <span className="text-sm">Novo workspace</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
