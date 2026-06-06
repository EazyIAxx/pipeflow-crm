import { KanbanSquare } from "lucide-react";
import { Badge } from "@/components/ui/badge";

const STAGES = [
  { id: "NEW_LEAD", label: "Novo Lead", color: "bg-slate-500" },
  { id: "CONTACTED", label: "Contato Realizado", color: "bg-blue-500" },
  { id: "PROPOSAL_SENT", label: "Proposta Enviada", color: "bg-indigo-500" },
  { id: "NEGOTIATION", label: "Negociação", color: "bg-amber-500" },
  { id: "WON", label: "Fechado Ganho", color: "bg-emerald-500" },
  { id: "LOST", label: "Fechado Perdido", color: "bg-rose-500" },
];

const MOCK_DEALS: Record<string, { id: string; title: string; value: string; lead: string }[]> = {
  NEW_LEAD: [
    { id: "1", title: "Proposta Website", value: "R$ 8.000", lead: "Ana Paula Rocha" },
    { id: "2", title: "Consultoria Mensal", value: "R$ 3.500", lead: "Carlos Mendes" },
  ],
  CONTACTED: [
    { id: "3", title: "Sistema ERP", value: "R$ 45.000", lead: "Ricardo Torres" },
  ],
  PROPOSAL_SENT: [
    { id: "4", title: "App Mobile", value: "R$ 28.000", lead: "Fernanda Lima" },
  ],
  NEGOTIATION: [],
  WON: [{ id: "5", title: "Dashboard Analytics", value: "R$ 12.000", lead: "Carlos Mendes" }],
  LOST: [],
};

export default function PipelinePage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Pipeline</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Arraste os negócios entre as etapas do funil.
        </p>
      </div>

      {/* Kanban board */}
      <div className="flex gap-3 overflow-x-auto pb-4">
        {STAGES.map((stage) => {
          const deals = MOCK_DEALS[stage.id] ?? [];
          return (
            <div
              key={stage.id}
              className="flex shrink-0 w-[220px] flex-col gap-2"
            >
              {/* Column header */}
              <div className="flex items-center gap-2 px-1">
                <span className={`h-2 w-2 rounded-full ${stage.color}`} />
                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                  {stage.label}
                </span>
                <Badge variant="secondary" className="ml-auto text-xs h-5 px-1.5">
                  {deals.length}
                </Badge>
              </div>

              {/* Cards */}
              <div className="flex flex-col gap-2 rounded-lg bg-muted/20 border border-border p-2 min-h-[120px]">
                {deals.map((deal) => (
                  <div
                    key={deal.id}
                    className="rounded-md border border-border bg-card p-3 cursor-grab hover:border-primary/40 transition-colors shadow-sm"
                  >
                    <p className="text-sm font-medium leading-tight">{deal.title}</p>
                    <p className="text-xs text-muted-foreground mt-1">{deal.lead}</p>
                    <p className="text-xs font-semibold text-emerald-400 mt-2">{deal.value}</p>
                  </div>
                ))}
                {deals.length === 0 && (
                  <div className="flex flex-1 items-center justify-center py-4">
                    <KanbanSquare className="h-5 w-5 text-muted-foreground/30" />
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <p className="text-xs text-muted-foreground">
        Drag-and-drop com @dnd-kit — implementado em M5
      </p>
    </div>
  );
}
