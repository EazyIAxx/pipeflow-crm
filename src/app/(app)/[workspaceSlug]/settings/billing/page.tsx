"use client";

import { useFormStatus } from "react-dom";
import { trpc } from "@/lib/trpc/client";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startCheckoutAction, openPortalAction } from "@/server/actions/billing";
import {
  Zap,
  CheckCircle2,
  XCircle,
  CreditCard,
  Users,
  BarChart3,
  Loader2,
  ExternalLink,
  AlertTriangle,
  CalendarDays,
  ShieldCheck,
} from "lucide-react";

interface PageProps {
  params: { workspaceSlug: string };
}

function SubmitButton({
  children,
  variant = "default",
}: {
  children: React.ReactNode;
  variant?: "default" | "outline";
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      className={
        variant === "default"
          ? "gap-2 bg-pf-accent text-pf-bg hover:bg-pf-accent/90 font-semibold"
          : "gap-2"
      }
    >
      {pending && <Loader2 className="h-4 w-4 animate-spin" />}
      {children}
    </Button>
  );
}

function UsageBar({ current, max, label }: { current: number; max: number; label: string }) {
  const pct = Math.min((current / max) * 100, 100);
  const atLimit = current >= max;
  const nearLimit = pct >= 80;

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center justify-between text-sm">
        <span className="text-muted-foreground">{label}</span>
        <span
          className={`font-medium tabular-nums ${
            atLimit
              ? "text-red-500"
              : nearLimit
                ? "text-yellow-600 dark:text-yellow-400"
                : "text-foreground"
          }`}
        >
          {current} / {max}
        </span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            atLimit ? "bg-red-500" : nearLimit ? "bg-yellow-500" : "bg-pf-accent"
          }`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

const COMPARISON = [
  { label: "Leads",                    free: "Até 50",   pro: "Ilimitados" },
  { label: "Colaboradores",            free: "Até 2",    pro: "Ilimitados" },
  { label: "Pipeline Kanban",          free: true,       pro: true },
  { label: "Dashboard de métricas",    free: true,       pro: true },
  { label: "Histórico de atividades",  free: true,       pro: true },
  { label: "Suporte prioritário",      free: false,      pro: true },
];

function SectionCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
      {children}
    </div>
  );
}

function SectionHeader({
  icon: Icon,
  title,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
}) {
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-muted-foreground" />
      <span className="text-sm font-semibold">{title}</span>
    </div>
  );
}

export default function BillingPage({ params }: PageProps) {
  const { workspaceSlug } = params;

  const { data: workspace, isLoading: loadingWs } = trpc.workspace.getBySlug.useQuery({
    slug: workspaceSlug,
  });
  const { data: limits, isLoading: loadingLimits } = trpc.workspace.getLimits.useQuery({
    slug: workspaceSlug,
  });

  const isLoading = loadingWs || loadingLimits;
  const plan = workspace?.plan ?? "FREE";
  const isPro = plan === "PRO";
  const isPaymentFailed = plan === "PAYMENT_FAILED";
  const isFree = plan === "FREE";
  const isAdmin = workspace?.role === "ADMIN";

  const renewalDate = workspace?.planExpiresAt
    ? new Date(workspace.planExpiresAt).toLocaleDateString("pt-BR", {
        day: "2-digit",
        month: "long",
        year: "numeric",
      })
    : null;

  const checkoutAction = startCheckoutAction.bind(null, workspaceSlug);
  const portalAction = openPortalAction.bind(null, workspaceSlug);

  return (
    <div className="flex flex-col gap-6 max-w-2xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Faturamento</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie seu plano e assinatura.
        </p>
      </div>

      {/* ── 1. Plano atual ─────────────────────────────────────────── */}
      {isLoading ? (
        <SectionCard>
          <Skeleton className="h-5 w-32" />
          <Skeleton className="h-4 w-64" />
          <Skeleton className="h-9 w-44" />
        </SectionCard>
      ) : (
        <SectionCard>
          <div className="flex items-center gap-2">
            <SectionHeader icon={CreditCard} title="Plano atual" />
            <Badge
              variant="outline"
              className={`ml-auto text-xs ${
                isPro
                  ? "bg-pf-accent/20 text-[#5C7500] dark:text-pf-accent border-pf-accent/30 hover:bg-pf-accent/20"
                  : isPaymentFailed
                    ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10"
                    : "bg-muted text-muted-foreground hover:bg-muted"
              }`}
            >
              {isPro ? (
                <span className="flex items-center gap-1">
                  <Zap className="h-3 w-3 text-pf-accent" />
                  Pro
                </span>
              ) : isPaymentFailed ? (
                <span className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Pagamento falhou
                </span>
              ) : (
                "Free"
              )}
            </Badge>
          </div>

          {isPaymentFailed && (
            <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 p-3">
              <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
              <div className="flex flex-col gap-0.5">
                <span className="text-sm font-medium text-red-600 dark:text-red-400">
                  Falha no pagamento
                </span>
                <span className="text-xs text-muted-foreground">
                  Não conseguimos processar sua última cobrança. Atualize seu método de
                  pagamento para reativar o Pro.
                </span>
              </div>
            </div>
          )}

          {isPro && (
            <div className="flex items-center gap-2 text-sm text-pf-positive">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Plano Pro ativo — colaboradores e leads ilimitados.</span>
            </div>
          )}

          {isFree && (
            <p className="text-sm text-muted-foreground">
              Você está no plano gratuito. Faça upgrade para remover todos os limites.
            </p>
          )}

          {isAdmin && !isPro && (
            <form action={checkoutAction} className="w-fit">
              <SubmitButton>
                <Zap className="h-4 w-4" />
                Assinar Pro — R$49/mês
              </SubmitButton>
            </form>
          )}
        </SectionCard>
      )}

      {/* ── 2. Detalhes da assinatura (Pro / Payment Failed) ─────────── */}
      {!isLoading && (isPro || isPaymentFailed) && (
        <SectionCard>
          <SectionHeader icon={CalendarDays} title="Assinatura" />

          <div className="flex flex-col divide-y divide-border rounded-md border border-border overflow-hidden text-sm">
            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground">Status</span>
              {isPro ? (
                <span className="flex items-center gap-1.5 font-medium text-pf-positive">
                  <span className="h-2 w-2 rounded-full bg-pf-positive animate-pulse" />
                  Ativa
                </span>
              ) : (
                <span className="flex items-center gap-1.5 font-medium text-red-500">
                  <span className="h-2 w-2 rounded-full bg-red-500" />
                  Falha no pagamento
                </span>
              )}
            </div>

            <div className="flex items-center justify-between px-4 py-3">
              <span className="text-muted-foreground">Plano</span>
              <span className="font-medium flex items-center gap-1">
                <Zap className="h-3.5 w-3.5 text-pf-accent" />
                PipeFlow Pro · R$49/mês
              </span>
            </div>

            {renewalDate && (
              <div className="flex items-center justify-between px-4 py-3">
                <span className="text-muted-foreground">
                  {isPro ? "Próxima renovação" : "Expiração"}
                </span>
                <span className="font-medium">{renewalDate}</span>
              </div>
            )}
          </div>

          {isAdmin && workspace?.hasActiveSubscription && (
            <form action={portalAction} className="w-fit">
              <SubmitButton variant="outline">
                <ExternalLink className="h-4 w-4" />
                Gerenciar assinatura
              </SubmitButton>
            </form>
          )}
        </SectionCard>
      )}

      {/* ── 3. Uso do plano (Free / Payment Failed) ──────────────────── */}
      {!isLoading && !isPro && limits && (
        <SectionCard>
          <SectionHeader icon={BarChart3} title="Uso do plano Free" />

          {(limits.leads.atLimit || limits.members.atLimit) && (
            <div className="flex items-start gap-2 rounded-md border border-yellow-400/30 bg-yellow-400/5 p-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 shrink-0 mt-0.5" />
              <span className="text-sm text-muted-foreground">
                Você atingiu o limite do plano Free.{" "}
                {isAdmin && "Faça upgrade para continuar adicionando."}
              </span>
            </div>
          )}

          <div className="flex flex-col gap-4">
            <UsageBar
              current={limits.leads.current}
              max={limits.leads.max}
              label="Leads"
            />
            <UsageBar
              current={limits.members.current}
              max={limits.members.max}
              label="Colaboradores"
            />
          </div>
        </SectionCard>
      )}

      {/* ── 4. Comparação de planos ───────────────────────────────────── */}
      <SectionCard>
        <SectionHeader icon={Users} title="Comparação de planos" />

        {isLoading ? (
          <div className="flex flex-col gap-3">
            {[...Array(6)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full" />
            ))}
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="pb-3 text-left font-medium text-muted-foreground w-1/2">
                      Recurso
                    </th>
                    <th className="pb-3 text-center font-medium text-muted-foreground w-1/4">
                      Free
                    </th>
                    <th className="pb-3 text-center font-semibold w-1/4">
                      <span className="flex items-center justify-center gap-1 text-pf-accent">
                        <Zap className="h-3.5 w-3.5" />
                        Pro
                      </span>
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {COMPARISON.map((row) => (
                    <tr key={row.label}>
                      <td className="py-3 text-muted-foreground">{row.label}</td>
                      <td className="py-3 text-center">
                        {typeof row.free === "string" ? (
                          <span className="text-muted-foreground">{row.free}</span>
                        ) : row.free ? (
                          <CheckCircle2 className="h-4 w-4 text-pf-positive mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                      <td className="py-3 text-center">
                        {typeof row.pro === "string" ? (
                          <span className="font-semibold text-pf-accent">{row.pro}</span>
                        ) : row.pro ? (
                          <CheckCircle2 className="h-4 w-4 text-pf-positive mx-auto" />
                        ) : (
                          <XCircle className="h-4 w-4 text-muted-foreground/40 mx-auto" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {isAdmin && !isPro && (
              <div className="pt-2 border-t border-border">
                <form action={checkoutAction} className="w-fit">
                  <SubmitButton>
                    <Zap className="h-4 w-4" />
                    Fazer upgrade — R$49/mês
                  </SubmitButton>
                </form>
              </div>
            )}
          </>
        )}
      </SectionCard>
    </div>
  );
}
