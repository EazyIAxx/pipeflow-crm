"use client";

import { Briefcase, Building2, Mail, Phone, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatDate(value: Date | string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });
}

interface Lead {
  id: string;
  name: string;
  email: string | null;
  phone: string | null;
  company: string | null;
  jobTitle: string | null;
  status: string;
  createdAt: Date | string;
}

interface LeadProfileProps {
  lead: Lead;
  onEdit: () => void;
  onDelete: () => void;
}

export function LeadProfile({ lead, onEdit, onDelete }: LeadProfileProps) {
  return (
    <div className="rounded-lg border border-border bg-card p-6 flex flex-col gap-5">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-4">
          <Avatar className="h-14 w-14">
            <AvatarFallback className="text-base font-semibold bg-primary/15 text-primary">
              {getInitials(lead.name)}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col gap-1">
            <h3 className="text-lg font-bold tracking-tight">{lead.name}</h3>
            <p className="text-sm text-muted-foreground">{lead.jobTitle || "—"}</p>
            <p className="text-sm text-muted-foreground">{lead.company || "—"}</p>
            <LeadStatusBadge status={lead.status} className="w-fit mt-0.5" />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" className="gap-1.5" onClick={onEdit}>
            <Pencil className="h-3.5 w-3.5" />
            Editar
          </Button>
          <Button variant="outline" size="sm" className="gap-1.5 text-destructive hover:text-destructive" onClick={onDelete}>
            <Trash2 className="h-3.5 w-3.5" />
            Excluir
          </Button>
        </div>
      </div>

      <Separator />

      <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Mail className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <dt className="text-xs text-muted-foreground">E-mail</dt>
            <dd className="text-sm font-medium">{lead.email || "—"}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Phone className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <dt className="text-xs text-muted-foreground">Telefone</dt>
            <dd className="text-sm font-medium">{lead.phone || "—"}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Building2 className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <dt className="text-xs text-muted-foreground">Empresa</dt>
            <dd className="text-sm font-medium">{lead.company || "—"}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Briefcase className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
          <div>
            <dt className="text-xs text-muted-foreground">Cargo</dt>
            <dd className="text-sm font-medium">{lead.jobTitle || "—"}</dd>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-4 w-4 shrink-0" />
          <div>
            <dt className="text-xs text-muted-foreground">Lead desde</dt>
            <dd className="text-sm font-medium">{formatDate(lead.createdAt)}</dd>
          </div>
        </div>
      </dl>
    </div>
  );
}
