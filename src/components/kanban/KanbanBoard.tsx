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
  type DragOverEvent,
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
  // Local stage override while the user is dragging — avoids calling the mutation on every pixel
  const [dragOverride, setDragOverride] = useState<{ id: string; stage: Stage } | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [formStage, setFormStage] = useState<Stage>("NEW_LEAD");

  const createMutation = trpc.deals.create.useMutation({
    onSuccess: () => {
      utils.deals.listByWorkspace.invalidate({ workspaceSlug });
      setFormOpen(false);
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

  const displayDeals = useMemo<Deal[]>(() => {
    if (!dragOverride) return deals;
    return deals.map((d) => (d.id === dragOverride.id ? { ...d, stage: dragOverride.stage } : d));
  }, [deals, dragOverride]);

  const dealsByStage = useMemo(() => {
    const map = new Map<Stage, Deal[]>(STAGE_ORDER.map((stage) => [stage, []]));
    for (const deal of displayDeals) {
      map.get(deal.stage)?.push(deal);
    }
    return map;
  }, [displayDeals]);

  function findDeal(id: string): Deal | undefined {
    return deals.find((d) => d.id === id);
  }

  function resolveStageFromDroppableId(id: string | number): Stage | undefined {
    const idStr = String(id);
    if ((STAGE_ORDER as string[]).includes(idStr)) return idStr as Stage;
    return findDeal(idStr)?.stage;
  }

  function handleDragStart(event: DragStartEvent) {
    const deal = findDeal(String(event.active.id));
    setActiveDeal(deal ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;
    const targetStage = resolveStageFromDroppableId(over.id);
    if (!targetStage) return;
    setDragOverride({ id: String(active.id), stage: targetStage });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);
    setDragOverride(null);

    if (!over) return;

    const dealId = String(active.id);
    const targetStage = resolveStageFromDroppableId(over.id);
    if (!targetStage) return;

    const original = findDeal(dealId);
    if (!original || original.stage === targetStage) return;

    updateStageMutation.mutate({ workspaceSlug, dealId, stage: targetStage });
  }

  function handleAddDeal(stage: Stage) {
    setFormStage(stage);
    setFormOpen(true);
  }

  function handleCreateDeal(values: DealFormValues) {
    const numericValue = parseFloat(values.value.replace(",", "."));
    createMutation.mutate({
      workspaceSlug,
      title: values.title,
      leadId: values.leadId,
      ownerId: values.ownerId,
      stage: values.stage,
      value: Number.isFinite(numericValue) ? numericValue : undefined,
      dueDate: values.dueDate || undefined,
    });
  }

  return (
    <div className="pf-bg min-h-[calc(100vh-8rem)] rounded-2xl border border-pf-border-subtle bg-pf-bg p-6 font-pf-body text-pf-text">
      <header className="mb-6 flex flex-col gap-1">
        <h2 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
          Pipeline
        </h2>
        <p className="font-pf-body text-sm text-pf-text-secondary">
          Arraste os negócios entre as etapas do funil para atualizar o estágio.
        </p>
      </header>

      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="flex gap-4 overflow-x-auto pb-4">
          {STAGE_ORDER.map((stage) => (
            <KanbanColumn
              key={stage}
              stage={stage}
              deals={dealsByStage.get(stage) ?? []}
              onAddDeal={handleAddDeal}
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
        onOpenChange={setFormOpen}
        defaultStage={formStage}
        onSubmit={handleCreateDeal}
        isPending={createMutation.isPending}
        leads={leads}
        members={members}
      />
    </div>
  );
}
