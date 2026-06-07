"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { CalendarClock } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  formatCurrency,
  formatDueDate,
  isDueSoon,
  STAGE_TEXT_CLASS,
  type MockDeal,
  type MockOwner,
} from "./mock-data";

interface DealCardProps {
  deal: MockDeal;
  owner: MockOwner | undefined;
  /** When true, render the static "preview" look used inside the DragOverlay. */
  overlay?: boolean;
}

export function DealCard({ deal, owner, overlay = false }: DealCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: deal.id, data: { stage: deal.stage } });

  const style = overlay
    ? undefined
    : {
        transform: CSS.Transform.toString(transform),
        transition,
      };

  const dueSoon = isDueSoon(deal.dueDate);

  return (
    <div
      ref={overlay ? undefined : setNodeRef}
      style={style}
      {...(overlay ? {} : attributes)}
      {...(overlay ? {} : listeners)}
      className={cn(
        "group relative cursor-grab select-none overflow-hidden rounded-[10px] border border-pf-border-subtle bg-pf-surface p-3.5 transition-colors duration-200 active:cursor-grabbing",
        "hover:border-pf-accent/40",
        isDragging && !overlay && "opacity-70",
        overlay && "border-pf-accent/50 shadow-2xl shadow-black/60"
      )}
    >
      {/* Accent bar — appears on hover, width animates 0 -> 100% */}
      <span
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-x-0 top-0 h-[2px] w-0 bg-pf-accent transition-[width] ease-out [transition-duration:400ms]",
          "group-hover:w-full",
          overlay && "w-full"
        )}
      />

      <p className="font-pf-body text-[13px] font-medium leading-snug text-pf-text">
        {deal.title}
      </p>
      <p className="mt-1 truncate font-pf-body text-xs text-pf-text-secondary">
        {deal.leadName} <span className="text-pf-text-muted">— {deal.company}</span>
      </p>

      <div className="mt-3 flex items-center justify-between gap-2">
        <span
          className={cn(
            "font-pf-mono text-[13px] font-medium tracking-tight",
            STAGE_TEXT_CLASS[deal.stage]
          )}
        >
          {formatCurrency(deal.value)}
        </span>

        <div className="flex items-center gap-1.5">
          {deal.dueDate && (
            <span
              className={cn(
                "inline-flex items-center gap-1 rounded-[6px] border px-1.5 py-0.5 font-pf-mono text-[10px] uppercase tracking-[0.1em]",
                dueSoon
                  ? "border-pf-negative/40 bg-pf-negative/10 text-pf-negative"
                  : "border-pf-border text-pf-text-secondary"
              )}
            >
              <CalendarClock className="h-3 w-3" aria-hidden />
              {formatDueDate(deal.dueDate)}
            </span>
          )}

          {owner && (
            <span
              title={owner.name}
              className="flex h-6 w-6 items-center justify-center rounded-full border border-pf-border bg-pf-surface-2 font-pf-mono text-[10px] font-medium text-pf-text-secondary"
            >
              {owner.initials}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
