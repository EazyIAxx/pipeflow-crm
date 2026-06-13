import { CalendarClock, DollarSign, Target, TrendingUp, Users } from "lucide-react";
import { createServerCaller } from "@/lib/trpc/server";

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

function formatCurrency(value: number) {
  return currencyFormatter.format(value);
}

function formatDueDate(dueDate: string) {
  const due = new Date(`${dueDate}T00:00:00`);
  return due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

interface DashboardPageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { workspaceSlug } = await params;

  const caller = await createServerCaller();

  let metrics;
  try {
    metrics = await caller.dashboard.getMetrics({ workspaceSlug });
  } catch {
    metrics = null;
  }

  const KPI_CARDS = metrics
    ? [
        {
          label: "Total de Leads",
          value: String(metrics.totalLeads),
          icon: Users,
        },
        {
          label: "Negócios Abertos",
          value: String(metrics.openDeals),
          icon: Target,
        },
        {
          label: "Valor do Pipeline",
          value: formatCurrency(metrics.pipelineValue),
          icon: DollarSign,
        },
        {
          label: "Taxa de Conversão",
          value: `${metrics.conversionRate}%`,
          icon: TrendingUp,
        },
      ]
    : [];

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Visão geral do seu pipeline de vendas.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 xl:grid-cols-4">
        {KPI_CARDS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <metric.icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
          </div>
        ))}
      </div>

      {/* Deals by stage */}
      {metrics && metrics.dealsByStage.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium mb-4">Negócios por Etapa</p>
          <div className="flex flex-col gap-2">
            {metrics.dealsByStage
              .sort((a, b) => b.count - a.count)
              .map((row) => {
                const STAGE_LABEL: Record<string, string> = {
                  NEW_LEAD: "Novo Lead",
                  CONTACTED: "Contato Realizado",
                  PROPOSAL_SENT: "Proposta Enviada",
                  NEGOTIATION: "Negociação",
                  WON: "Fechado Ganho",
                  LOST: "Fechado Perdido",
                };
                return (
                  <div key={row.stage} className="flex items-center gap-3">
                    <span className="w-36 text-xs text-muted-foreground truncate">
                      {STAGE_LABEL[row.stage] ?? row.stage}
                    </span>
                    <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary/70"
                        style={{
                          width: `${Math.min(100, (row.count / (metrics.openDeals + metrics.dealsByStage.filter(d => d.stage === "WON" || d.stage === "LOST").reduce((s, d) => s + d.count, 0))) * 100)}%`,
                        }}
                      />
                    </div>
                    <span className="w-6 text-right text-xs font-medium">{row.count}</span>
                    <span className="w-24 text-right text-xs text-muted-foreground">{formatCurrency(row.value)}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Upcoming deals */}
      {metrics && metrics.upcomingDeals.length > 0 && (
        <div className="rounded-lg border border-border bg-card p-6">
          <p className="text-sm font-medium mb-4">Negócios com Prazo Próximo</p>
          <div className="flex flex-col divide-y divide-border">
            {metrics.upcomingDeals.map((deal) => (
              <div key={deal.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
                <div className="flex flex-col gap-0.5">
                  <span className="text-sm font-medium">{deal.title}</span>
                  <span className="text-xs text-muted-foreground">{deal.leadName}{deal.company ? ` — ${deal.company}` : ""}</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium">{formatCurrency(deal.value)}</span>
                  <span className="inline-flex items-center gap-1 text-xs text-amber-400">
                    <CalendarClock className="h-3 w-3" />
                    {formatDueDate(deal.dueDate)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {metrics && metrics.totalLeads === 0 && metrics.openDeals === 0 && (
        <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">Adicione leads e negócios para ver suas métricas aqui.</p>
        </div>
      )}
    </div>
  );
}
