import { Settings, Users, CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie seu workspace, membros e plano.
        </p>
      </div>

      {/* Workspace */}
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Workspace</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Nome</span>
          <span className="text-sm font-medium">Acme Corp</span>
        </div>
        <div className="flex flex-col gap-1">
          <span className="text-xs text-muted-foreground">Slug</span>
          <span className="text-sm font-mono text-muted-foreground">acme-corp</span>
        </div>
        <Button variant="outline" size="sm" className="w-fit" disabled>
          Editar workspace — M7
        </Button>
      </div>

      {/* Members */}
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <Users className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Membros</span>
          <Badge variant="secondary" className="ml-auto text-xs">
            1 / 2 (Free)
          </Badge>
        </div>
        <div className="flex items-center gap-3 py-1">
          <div className="h-8 w-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-semibold text-primary">
            GS
          </div>
          <div>
            <p className="text-sm font-medium">Gabriel Silva</p>
            <p className="text-xs text-muted-foreground">gabriel@acme.com</p>
          </div>
          <Badge variant="outline" className="ml-auto text-xs">Admin</Badge>
        </div>
        <Button variant="outline" size="sm" className="w-fit" disabled>
          Convidar membro — M7
        </Button>
      </div>

      {/* Billing */}
      <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-semibold">Plano</span>
          <Badge className="ml-auto text-xs">Free</Badge>
        </div>
        <p className="text-sm text-muted-foreground">
          Até 2 colaboradores e 50 leads incluídos.
        </p>
        <Button size="sm" className="w-fit" disabled>
          Fazer upgrade — M8
        </Button>
      </div>
    </div>
  );
}
