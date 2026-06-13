"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import { Plus } from "lucide-react";
import type { Stage } from "@prisma/client";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { DealCard, type Deal } from "./DealCard";
import { formatCurrency, STAGE_DOT_CLASS, STAGE_LABEL } from "./mock-data";

interface KanbanColumnProps {
  stage: Stage;
  deals: Deal[];
  onAddDeal: (stage: Stage) => void;
}

export function KanbanColumn({ stage, deals, onAddDeal }: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: stage, data: { stage } });

  const total = deals.reduce((sum, deal) => sum + deal.value, 0);

  return (
    <div className="flex w-[300px] shrink-0 flex-col gap-3">
      <div className="flex items-center gap-2 px-1">
        <span className={cn("h-2 w-2 rounded-full", STAGE_DOT_CLASS[stage])} aria-hidden />
        <span className="font-pf-mono text-[11px] font-medium uppercase tracking-[0.15em] text-pf-text-secondary">
          {STAGE_LABEL[stage]}
        </span>
        <span className="rounded-full border border-pf-border px-1.5 py-0.5 font-pf-mono text-[10px] text-pf-text-muted">
          {deals.length}
        </span>
        <span className="ml-auto font-pf-display text-sm font-bold tracking-tight text-pf-text">
          {formatCurrency(total)}
        </span>
      </div>

      <div
        ref={setNodeRef}
        className={cn(
          "flex min-h-[160px] flex-1 flex-col gap-2 rounded-xl border p-2 transition-colors duration-150",
          isOver
            ? "border-pf-accent/60 bg-pf-accent/[0.04]"
            : "border-pf-border-subtle bg-pf-surface-2/40"
        )}
      >
        <SortableContext items={deals.map((deal) => deal.id)} strategy={verticalListSortingStrategy}>
          {deals.map((deal) => (
            <DealCard key={deal.id} deal={deal} />
          ))}
        </SortableContext>

        {deals.length === 0 && (
          <div className="flex flex-1 items-center justify-center py-6">
            <p className="font-pf-mono text-[10px] uppercase tracking-[0.15em] text-pf-text-muted">
              Sem negócios
            </p>
          </div>
        )}
      </div>

      <Button
        type="button"
        variant="ghost"
        onClick={() => onAddDeal(stage)}
        className="h-9 justify-start gap-1.5 rounded-[8px] border border-dashed border-pf-border px-3 font-pf-body text-xs text-pf-text-secondary hover:border-pf-accent/50 hover:bg-pf-accent/[0.06] hover:text-pf-accent"
      >
        <Plus className="h-3.5 w-3.5" aria-hidden />
        Negócio
      </Button>
    </div>
  );
}
