"use client";

import { useMemo, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import type { Stage } from "@prisma/client";

import { trpc } from "@/lib/trpc/client";
import { DealCard, type Deal } from "./DealCard";
import { KanbanColumn } from "./KanbanColumn";
import { DealForm, type DealFormValues } from "./DealForm";
import { STAGE_ORDER } from "./mock-data";

interface KanbanBoardProps {
  workspaceSlug: string;
}

export function KanbanBoard({ workspaceSlug }: KanbanBoardProps) {
  const utils = trpc.useUtils();

  const { data: deals = [] } = trpc.deals.listByWorkspace.useQuery({ workspaceSlug });
  const { data: leads = [] } = trpc.leads.list.useQuery({ workspaceSlug });
  const { data: members = [] } = trpc.workspace.getMembers.useQuery({ slug: workspaceSlug });

  const [activeDeal, setActiveDeal] = useState<Deal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStage, setFormStage] = useState<Stage>("NEW_LEAD");
  const [editingDeal, setEditingDeal] = useState<Deal | null>(null);

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => {
      utils.deals.listByWorkspace.invalidate({ workspaceSlug });
      setFormOpen(false);
    },
  });

  const updateMutation = trpc.deals.update.useMutation({
    onSuccess: () => {
      utils.deals.listByWorkspace.invalidate({ workspaceSlug });
      setFormOpen(false);
      setEditingDeal(null);
    },
  });

  const updateStageMutation = trpc.deals.updateStage.useMutation({
    onMutate: async ({ dealId, stage }) => {
      await utils.deals.listByWorkspace.cancel({ workspaceSlug });
      const previous = utils.deals.listByWorkspace.getData({ workspaceSlug });
      utils.deals.listByWorkspace.setData({ workspaceSlug }, (old) =>
        old?.map((d) => (d.id === dealId ? { ...d, stage } : d)),
      );
      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        utils.deals.listByWorkspace.setData({ workspaceSlug }, context.previous);
      }
    },
    onSettled: () => {
      utils.deals.listByWorkspace.invalidate({ workspaceSlug });
    },
  });

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
  );

  // Stable map — never changes during drag, only after server confirms
  const dealsByStage = useMemo(() => {
    const map = new Map<Stage, Deal[]>(STAGE_ORDER.map((stage) => [stage, []]));
    for (const deal of deals) {
      map.get(deal.stage)?.push(deal);
    }
    return map;
  }, [deals]);

  function findDeal(id: string): Deal | undefined {
    return deals.find((d) => d.id === id);
  }

  function resolveStage(id: string | number): Stage | undefined {
    const idStr = String(id);
    if ((STAGE_ORDER as string[]).includes(idStr)) return idStr as Stage;
    return findDeal(idStr)?.stage;
  }

  function handleDragStart(event: DragStartEvent) {
    setActiveDeal(findDeal(String(event.active.id)) ?? null);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);

    if (!over) return;

    const dealId = String(active.id);
    const targetStage = resolveStage(over.id);
    if (!targetStage) return;

    const original = findDeal(dealId);
    if (!original || original.stage === targetStage) return;

    updateStageMutation.mutate({ workspaceSlug, dealId, stage: targetStage });
  }

  function handleAddDeal(stage: Stage) {
    setEditingDeal(null);
    setFormStage(stage);
    setFormOpen(true);
  }

  function handleEditDeal(deal: Deal) {
    setEditingDeal(deal);
    setFormStage(deal.stage);
    setFormOpen(true);
  }

  function handleFormClose(open: boolean) {
    if (!open) {
      setFormOpen(false);
      setEditingDeal(null);
    }
  }

  function handleFormSubmit(values: DealFormValues) {
    const numericValue = parseFloat(values.value.replace(",", "."));
    const payload = {
      workspaceSlug,
      title: values.title,
      leadId: values.leadId,
      ownerId: values.ownerId,
      stage: values.stage,
      value: Number.isFinite(numericValue) ? numericValue : undefined,
      dueDate: values.dueDate || undefined,
    };
    if (editingDeal) {
      updateMutation.mutate({ ...payload, dealId: editingDeal.id });
    } else {
      createMutation.mutate(payload);
    }
  }

  return (
    <div className="pf-bg min-h-[calc(100vh-8rem)] rounded-2xl border border-pf-border-subtle bg-pf-bg p-6 font-pf-body text-pf-text">
      <header className="mb-6 flex items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h2 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
            Pipeline
          </h2>
          <p className="font-pf-body text-sm text-pf-text-secondary">
            Arraste os negócios entre as etapas do funil para atualizar o estágio.
          </p>
        </div>
        <button
          onClick={() => handleAddDeal("NEW_LEAD")}
          className="shrink-0 rounded-lg bg-pf-accent px-4 py-2 text-sm font-semibold text-pf-bg transition-opacity hover:opacity-90 active:opacity-75"
        >
          + Novo Negócio
        </button>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={dealsByStage.get(stage) ?? []}
              onAddDeal={handleAddDeal}
              onEditDeal={handleEditDeal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="w-[284px]">
              <DealCard deal={activeDeal} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealForm
        open={formOpen}
        onOpenChange={handleFormClose}
        defaultStage={formStage}
        onSubmit={handleFormSubmit}
        isPending={createMutation.isPending || updateMutation.isPending}
        leads={leads}
        members={members}
        editingDeal={editingDeal}
      />
    </div>
  );
}
