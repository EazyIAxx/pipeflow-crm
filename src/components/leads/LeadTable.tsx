"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronLeft, ChevronRight, MoreHorizontal, Pencil, Trash2, Users2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { LeadStatusBadge } from "@/components/leads/LeadStatusBadge";
import type { MockLead } from "@/lib/mock/leads";

const PAGE_SIZE = 8;

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

interface LeadTableProps {
  leads: MockLead[];
  workspaceSlug: string;
  onEdit: (lead: MockLead) => void;
  onDelete: (lead: MockLead) => void;
}

export function LeadTable({ leads, workspaceSlug, onEdit, onDelete }: LeadTableProps) {
  const router = useRouter();
  const [page, setPage] = useState(1);

  const totalPages = Math.max(1, Math.ceil(leads.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const start = (currentPage - 1) * PAGE_SIZE;
  const pageLeads = leads.slice(start, start + PAGE_SIZE);

  if (leads.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-border bg-card py-16 text-center">
        <Users2 className="h-8 w-8 text-muted-foreground/40" />
        <p className="text-sm font-medium">Nenhum lead encontrado</p>
        <p className="text-xs text-muted-foreground">Tente ajustar os filtros ou cadastre um novo lead.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Empresa</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden xl:table-cell">Responsável</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden sm:table-cell">Data</th>
              <th className="px-4 py-3 text-right font-medium text-muted-foreground w-10" />
            </tr>
          </thead>
          <tbody>
            {pageLeads.map((lead, i) => (
              <tr
                key={lead.id}
                onClick={() => router.push(`/${workspaceSlug}/leads/${lead.id}`)}
                className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
              >
                <td className="px-4 py-3 font-medium">{lead.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.company}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.email}</td>
                <td className="px-4 py-3">
                  <LeadStatusBadge status={lead.status} />
                </td>
                <td className="px-4 py-3 text-muted-foreground hidden xl:table-cell">{lead.owner}</td>
                <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">{formatDate(lead.createdAt)}</td>
                <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Ações</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem className="gap-2 cursor-pointer" onClick={() => onEdit(lead)}>
                        <Pencil className="h-4 w-4" />
                        Editar
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="gap-2 cursor-pointer text-destructive focus:text-destructive"
                        onClick={() => onDelete(lead)}
                      >
                        <Trash2 className="h-4 w-4" />
                        Excluir
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <p>
            Mostrando {start + 1}–{Math.min(start + PAGE_SIZE, leads.length)} de {leads.length} leads
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="px-2 text-xs">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="icon"
              className="h-8 w-8"
              disabled={currentPage === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
