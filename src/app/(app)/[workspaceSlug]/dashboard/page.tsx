import { LayoutDashboard, TrendingUp, Users, DollarSign, Target } from "lucide-react";

const MOCK_METRICS = [
  {
    label: "Total de Leads",
    value: "124",
    change: "+12 este mês",
    icon: Users,
    positive: true,
  },
  {
    label: "Negócios Abertos",
    value: "38",
    change: "+4 esta semana",
    icon: Target,
    positive: true,
  },
  {
    label: "Valor do Pipeline",
    value: "R$ 142.500",
    change: "+8% vs. mês anterior",
    icon: DollarSign,
    positive: true,
  },
  {
    label: "Taxa de Conversão",
    value: "24%",
    change: "+2pp este mês",
    icon: TrendingUp,
    positive: true,
  },
];

export default function DashboardPage() {
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
        {MOCK_METRICS.map((metric) => (
          <div
            key={metric.label}
            className="rounded-lg border border-border bg-card p-5 flex flex-col gap-3"
          >
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">{metric.label}</span>
              <metric.icon className="h-4 w-4 text-muted-foreground/60" />
            </div>
            <p className="text-2xl font-bold tracking-tight">{metric.value}</p>
            <p className="text-xs text-emerald-400">{metric.change}</p>
          </div>
        ))}
      </div>

      {/* Funnel placeholder */}
      <div className="rounded-lg border border-border bg-card p-6">
        <p className="text-sm font-medium mb-4">Funil de Vendas</p>
        <div className="flex flex-col items-center gap-2 py-8 text-muted-foreground">
          <LayoutDashboard className="h-10 w-10 opacity-20" />
          <p className="text-sm">Gráfico de funil — implementado em M6</p>
        </div>
      </div>
    </div>
  );
}
