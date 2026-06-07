"use client";

import { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { LeadProfile } from "@/components/leads/LeadProfile";
import { LeadForm, type LeadFormValues } from "@/components/leads/LeadForm";
import { ActivityTimeline } from "@/components/leads/ActivityTimeline";
import { ActivityForm, type ActivityFormValues } from "@/components/leads/ActivityForm";
import {
  getActivitiesByLeadId,
  getLeadById,
  type MockActivity,
  type MockLead,
} from "@/lib/mock/leads";

function createId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`;
}

export default function LeadDetailPage() {
  const params = useParams<{ workspaceSlug: string; leadId: string }>();
  const router = useRouter();

  const initialLead = useMemo(() => getLeadById(params.leadId), [params.leadId]);
  const [lead, setLead] = useState<MockLead | undefined>(initialLead);
  const [activities, setActivities] = useState<MockActivity[]>(() => getActivitiesByLeadId(params.leadId));

  const [editOpen, setEditOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [activityFormOpen, setActivityFormOpen] = useState(false);

  function handleEditSubmit(values: LeadFormValues) {
    setLead((prev) =>
      prev
        ? { ...prev, ...values, email: values.email ?? "", phone: values.phone ?? "", jobTitle: values.jobTitle ?? "" }
        : prev
    );
  }

  function handleConfirmDelete() {
    setDeleteOpen(false);
    router.push(`/${params.workspaceSlug}/leads`);
  }

  function handleNewActivity(values: ActivityFormValues) {
    setActivities((prev) => [
      {
        id: createId("activity"),
        leadId: params.leadId,
        type: values.type,
        description: values.description,
        author: lead?.owner ?? "Você",
        date: new Date(values.date).toISOString(),
      },
      ...prev,
    ]);
  }

  if (!lead) {
    return (
      <div className="flex flex-col items-center justify-center gap-3 py-20 text-center">
        <p className="text-sm font-medium">Lead não encontrado</p>
        <p className="text-xs text-muted-foreground">Esse lead pode ter sido removido ou o link está incorreto.</p>
        <Button variant="outline" size="sm" className="gap-1.5" onClick={() => router.push(`/${params.workspaceSlug}/leads`)}>
          <ArrowLeft className="h-4 w-4" />
          Voltar para Leads
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={() => router.push(`/${params.workspaceSlug}/leads`)}
        >
          <ArrowLeft className="h-4 w-4" />
          <span className="sr-only">Voltar</span>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight">{lead.name}</h2>
          <p className="text-sm text-muted-foreground mt-0.5">{lead.company}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
        <div className="lg:col-span-2">
          <LeadProfile lead={lead} onEdit={() => setEditOpen(true)} onDelete={() => setDeleteOpen(true)} />
        </div>

        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold">Histórico de atividades</h3>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={() => setActivityFormOpen(true)}>
              <Plus className="h-3.5 w-3.5" />
              Nova atividade
            </Button>
          </div>
          <div className="rounded-lg border border-border bg-card p-6">
            <ActivityTimeline activities={activities} />
          </div>
        </div>
      </div>

      <LeadForm open={editOpen} onOpenChange={setEditOpen} lead={lead} onSubmit={handleEditSubmit} />
      <ActivityForm open={activityFormOpen} onOpenChange={setActivityFormOpen} onSubmit={handleNewActivity} />

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Excluir lead</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir <strong>{lead.name}</strong>? Essa ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={() => setDeleteOpen(false)}>
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
