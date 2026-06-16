"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadForm, type LeadFormValues } from "@/components/leads/LeadForm";

export default function LeadsPage() {
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");

  // Debounce search to avoid an API call per keystroke
  useEffect(() => {
    const timer = setTimeout(() => setSearch(searchInput), 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const [formOpen, setFormOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState<string | null>(null);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);

  const utils = trpc.useUtils();

  const { data: leads = [], isLoading } = trpc.leads.list.useQuery({
    workspaceSlug,
    search: search || undefined,
    status: status !== "all" ? status : undefined,
  });

  const createMutation = trpc.leads.create.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate({ workspaceSlug });
      setFormOpen(false);
      toast.success("Lead criado com sucesso.");
    },
    onError: (err) => toast.error(err.message ?? "Erro ao criar lead."),
  });

  const updateMutation = trpc.leads.update.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate({ workspaceSlug });
      setFormOpen(false);
      setEditingLeadId(null);
      toast.success("Lead atualizado com sucesso.");
    },
    onError: (err) => toast.error(err.message ?? "Erro ao atualizar lead."),
  });

  const deleteMutation = trpc.leads.delete.useMutation({
    onSuccess: () => {
      utils.leads.list.invalidate({ workspaceSlug });
      setDeletingLeadId(null);
      toast.success("Lead excluído.");
    },
    onError: (err) => toast.error(err.message ?? "Erro ao excluir lead."),
  });

  const editingLead = editingLeadId ? (leads.find((l) => l.id === editingLeadId) ?? null) : null;
  const deletingLead = deletingLeadId ? (leads.find((l) => l.id === deletingLeadId) ?? null) : null;

  function handleSubmit(values: LeadFormValues) {
    if (editingLeadId) {
      updateMutation.mutate({ workspaceSlug, leadId: editingLeadId, ...values });
    } else {
      createMutation.mutate({ workspaceSlug, ...values });
    }
  }

  function handleOpenForm() {
    setEditingLeadId(null);
    setFormOpen(true);
  }

  function handleEdit(lead: { id: string }) {
    setEditingLeadId(lead.id);
    setFormOpen(true);
  }

  const isPending = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie seus contatos e clientes em potencial.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleOpenForm}>
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <LeadFilters
        search={searchInput}
        onSearchChange={setSearchInput}
        status={status}
        onStatusChange={setStatus}
      />

      {isLoading ? (
        <div className="flex flex-col gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-12 w-full rounded-lg" />
          ))}
        </div>
      ) : (
        <LeadTable
          leads={leads}
          workspaceSlug={workspaceSlug}
          onEdit={handleEdit}
          onDelete={(lead) => setDeletingLeadId(lead.id)}
        />
      )}

      <LeadForm
        open={formOpen}
        onOpenChange={(open) => {
          setFormOpen(open);
          if (!open) setEditingLeadId(null);
        }}
        lead={editingLead}
        onSubmit={handleSubmit}
        isPending={isPending}
      />

      <Dialog open={!!deletingLead} onOpenChange={(open) => !open && setDeletingLeadId(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deletingLead?.name}</strong>? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingLeadId(null)}>
              Cancelar
            </Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => deletingLeadId && deleteMutation.mutate({ workspaceSlug, leadId: deletingLeadId })}
            >
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
