"use client";

import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
import { Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadTable } from "@/components/leads/LeadTable";
import { LeadForm, type LeadFormValues } from "@/components/leads/LeadForm";
import { MOCK_LEADS, type MockLead } from "@/lib/mock/leads";

function createId() {
  return `lead-${Math.random().toString(36).slice(2, 9)}`;
}

export default function LeadsPage() {
  const params = useParams<{ workspaceSlug: string }>();
  const workspaceSlug = params.workspaceSlug;

  const [leads, setLeads] = useState<MockLead[]>(MOCK_LEADS);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [owner, setOwner] = useState("all");

  const [formOpen, setFormOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<MockLead | null>(null);
  const [deletingLead, setDeletingLead] = useState<MockLead | null>(null);

  const filteredLeads = useMemo(() => {
    const query = search.trim().toLowerCase();
    return leads.filter((lead) => {
      const matchesQuery =
        !query ||
        lead.name.toLowerCase().includes(query) ||
        lead.company.toLowerCase().includes(query);
      const matchesStatus = status === "all" || lead.status === status;
      const matchesOwner = owner === "all" || lead.owner === owner;
      return matchesQuery && matchesStatus && matchesOwner;
    });
  }, [leads, search, status, owner]);

  function handleCreate() {
    setEditingLead(null);
    setFormOpen(true);
  }

  function handleEdit(lead: MockLead) {
    setEditingLead(lead);
    setFormOpen(true);
  }

  function handleSubmit(values: LeadFormValues) {
    if (editingLead) {
      setLeads((prev) =>
        prev.map((lead) =>
          lead.id === editingLead.id
            ? { ...lead, ...values, email: values.email ?? "", phone: values.phone ?? "", jobTitle: values.jobTitle ?? "" }
            : lead
        )
      );
    } else {
      setLeads((prev) => [
        {
          id: createId(),
          name: values.name,
          email: values.email ?? "",
          phone: values.phone ?? "",
          company: values.company,
          jobTitle: values.jobTitle ?? "",
          status: values.status,
          owner: values.owner,
          createdAt: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
    }
  }

  function handleConfirmDelete() {
    if (!deletingLead) return;
    setLeads((prev) => prev.filter((lead) => lead.id !== deletingLead.id));
    setDeletingLead(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie seus contatos e clientes em potencial.
          </p>
        </div>
        <Button size="sm" className="gap-1.5" onClick={handleCreate}>
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      <LeadFilters
        search={search}
        onSearchChange={setSearch}
        status={status}
        onStatusChange={setStatus}
        owner={owner}
        onOwnerChange={setOwner}
      />

      <LeadTable
        leads={filteredLeads}
        workspaceSlug={workspaceSlug}
        onEdit={handleEdit}
        onDelete={setDeletingLead}
      />

      <LeadForm open={formOpen} onOpenChange={setFormOpen} lead={editingLead} onSubmit={handleSubmit} />

      <Dialog open={!!deletingLead} onOpenChange={(open) => !open && setDeletingLead(null)}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{deletingLead?.name}</strong>? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeletingLead(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleConfirmDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
