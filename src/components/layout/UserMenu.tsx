"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/client";

interface UserMenuProps {
  workspaceSlug: string;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function UserMenu({ workspaceSlug }: UserMenuProps) {
  const router = useRouter();
  const [userData, setUserData] = useState<{
    name: string;
    email: string;
    initials: string;
  } | null>(null);

  useEffect(() => {
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) return;
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) return;
      const email = user.email ?? "";
      const rawName =
        user.user_metadata?.full_name ??
        user.user_metadata?.name ??
        email.split("@")[0];
      setUserData({
        name: rawName,
        email,
        initials: getInitials(rawName),
      });
    });
  }, []);

  async function handleSignOut() {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient();
      await supabase.auth.signOut();
    }
    router.push("/login");
  }

  const name = userData?.name ?? "";
  const email = userData?.email ?? "";
  const initials = userData?.initials ?? "?";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-start gap-3 px-2 h-11 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Avatar className="h-7 w-7 shrink-0">
            <AvatarFallback className="bg-sidebar-primary/20 text-sidebar-primary text-xs font-semibold">
              {initials}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col items-start min-w-0">
            <span className="text-sm font-medium text-sidebar-foreground truncate leading-tight">
              {name || "Carregando..."}
            </span>
            <span className="text-xs text-muted-foreground truncate leading-tight">
              {email}
            </span>
          </div>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="top" sideOffset={8} className="w-56">
        <DropdownMenuLabel className="font-normal py-2">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium leading-tight">{name}</p>
            <p className="text-xs text-muted-foreground leading-tight">{email}</p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="gap-2 cursor-pointer">
          <User className="h-4 w-4" />
          Perfil
        </DropdownMenuItem>
        <DropdownMenuItem
          className="gap-2 cursor-pointer"
          onSelect={() => router.push(`/${workspaceSlug}/settings`)}
        >
          <Settings className="h-4 w-4" />
          Configurações
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="gap-2 cursor-pointer text-destructive focus:text-destructive focus:bg-destructive/10"
          onSelect={handleSignOut}
        >
          <LogOut className="h-4 w-4" />
          Sair
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
