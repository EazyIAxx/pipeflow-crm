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

import { DealCard } from "./DealCard";
import { KanbanColumn } from "./KanbanColumn";
import { DealForm, type DealFormValues } from "./DealForm";
import {
  MOCK_DEALS,
  MOCK_OWNERS,
  MOCK_PIPELINE_LEADS,
  STAGE_ORDER,
  type MockDeal,
} from "./mock-data";

export function KanbanBoard() {
  const [deals, setDeals] = useState<MockDeal[]>(MOCK_DEALS);
  const [activeDeal, setActiveDeal] = useState<MockDeal | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [formStage, setFormStage] = useState<Stage>("NEW_LEAD");

  const ownersById = useMemo(() => new Map(MOCK_OWNERS.map((owner) => [owner.id, owner])), []);
  const leadsById = useMemo(() => new Map(MOCK_PIPELINE_LEADS.map((lead) => [lead.id, lead])), []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 6 },
    })
  );

  const dealsByStage = useMemo(() => {
    const map = new Map<Stage, MockDeal[]>(STAGE_ORDER.map((stage) => [stage, []]));
    for (const deal of deals) {
      map.get(deal.stage)?.push(deal);
    }
    return map;
  }, [deals]);

  function findDeal(id: string): MockDeal | undefined {
    return deals.find((deal) => deal.id === id);
  }

  function resolveStageFromDroppableId(id: string | number): Stage | undefined {
    const idStr = String(id);
    if ((STAGE_ORDER as string[]).includes(idStr)) {
      return idStr as Stage;
    }
    return findDeal(idStr)?.stage;
  }

  function handleDragStart(event: DragStartEvent) {
    const deal = findDeal(String(event.active.id));
    setActiveDeal(deal ?? null);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeDealId = String(active.id);
    const targetStage = resolveStageFromDroppableId(over.id);
    if (!targetStage) return;

    setDeals((current) => {
      const dragged = current.find((deal) => deal.id === activeDealId);
      if (!dragged || dragged.stage === targetStage) return current;

      return current.map((deal) =>
        deal.id === activeDealId ? { ...deal, stage: targetStage } : deal
      );
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveDeal(null);
    if (!over) return;

    const activeDealId = String(active.id);
    const targetStage = resolveStageFromDroppableId(over.id);
    if (!targetStage) return;

    // Final, authoritative move — simulates the optimistic local mutation that
    // will later be replaced by the `deals.updateStage` tRPC mutation.
    setDeals((current) =>
      current.map((deal) =>
        deal.id === activeDealId ? { ...deal, stage: targetStage } : deal
      )
    );
  }

  function handleAddDeal(stage: Stage) {
    setFormStage(stage);
    setFormOpen(true);
  }

  function handleCreateDeal(values: DealFormValues) {
    const lead = leadsById.get(values.leadId);
    const numericValue = Number(values.value.replace(",", "."));

    const newDeal: MockDeal = {
      id: `deal-${Date.now()}`,
      title: values.title,
      leadId: values.leadId,
      leadName: lead?.name ?? "Lead não encontrado",
      company: lead?.company ?? "",
      value: Number.isFinite(numericValue) ? numericValue : 0,
      stage: values.stage,
      ownerId: values.ownerId,
      dueDate: values.dueDate ? values.dueDate : null,
    };

    setDeals((current) => [...current, newDeal]);
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
              ownersById={ownersById}
              onAddDeal={handleAddDeal}
            />
          ))}
        </div>

        <DragOverlay>
          {activeDeal ? (
            <div className="w-[284px]">
              <DealCard deal={activeDeal} owner={ownersById.get(activeDeal.ownerId)} overlay />
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>

      <DealForm
        open={formOpen}
        onOpenChange={setFormOpen}
        defaultStage={formStage}
        onSubmit={handleCreateDeal}
      />
    </div>
  );
}
