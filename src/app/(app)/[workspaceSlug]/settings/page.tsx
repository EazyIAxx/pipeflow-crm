"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { trpc } from "@/lib/trpc/client";
import { WorkspaceSettings } from "@/components/settings/WorkspaceSettings";
import { MembersList } from "@/components/settings/MembersList";
import { startCheckoutAction, openPortalAction } from "@/server/actions/billing";
import {
  Zap,
  CheckCircle2,
  Minus,
  Users2,
  Contact,
  KanbanSquare,
  BarChart2,
  Mail,
  Headphones,
  Loader2,
  ExternalLink,
  ShieldCheck,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface PageProps {
  params: { workspaceSlug: string };
}

// ── Tabs ────────────────────────────────────────────────────────────────────
const TABS = [
  { key: "workspace", label: "Workspace" },
  { key: "membros",   label: "Membros" },
  { key: "assinatura", label: "Assinatura" },
] as const;
type TabKey = typeof TABS[number]["key"];

// ── Submit button ────────────────────────────────────────────────────────────
function SubmitBtn({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "outline" }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant={variant}
      disabled={pending}
      size="sm"
      className={cn(
        "gap-1.5 font-semibold",
        variant === "default" && "bg-pf-accent text-pf-bg hover:bg-pf-accent/90",
      )}
    >
      {pending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
      {children}
    </Button>
  );
}

// ── Plan feature rows ────────────────────────────────────────────────────────
const FEATURES = [
  { icon: Users2,       label: "Membros da equipe", free: "Até 2",  pro: "Ilimitados" },
  { icon: Contact,      label: "Leads",             free: "Até 50", pro: "Ilimitados" },
  { icon: KanbanSquare, label: "Pipeline Kanban",   free: true,     pro: true },
  { icon: BarChart2,    label: "Dashboard de métricas", free: true, pro: true },
  { icon: Mail,         label: "Convites por e-mail",   free: true, pro: true },
  { icon: Headphones,   label: "Suporte prioritário",   free: false, pro: true },
] as const;

function FeatureRow({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | boolean;
  accent?: boolean;
}) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-border/50 last:border-0">
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Icon className={cn("h-4 w-4 shrink-0", accent ? "text-pf-accent" : "text-muted-foreground/60")} />
        {label}:
      </div>
      <div className="text-sm">
        {typeof value === "string" ? (
          <span className={cn("font-medium", accent && "text-pf-accent")}>{value}</span>
        ) : value ? (
          <CheckCircle2 className={cn("h-4 w-4", accent ? "text-pf-accent" : "text-muted-foreground/60")} />
        ) : (
          <Minus className="h-4 w-4 text-muted-foreground/40" />
        )}
      </div>
    </div>
  );
}

// ── Billing section ──────────────────────────────────────────────────────────
function BillingSection({
  workspaceSlug,
  plan,
  planExpiresAt,
  hasActiveSubscription,
  isAdmin,
  isLoading,
}: {
  workspaceSlug: string;
  plan: "FREE" | "PRO" | "PAYMENT_FAILED";
  planExpiresAt: string | null;
  hasActiveSubscription: boolean;
  isAdmin: boolean;
  isLoading: boolean;
}) {
  const isPro = plan === "PRO";
  const checkoutAction = startCheckoutAction.bind(null, workspaceSlug);
  const portalAction   = openPortalAction.bind(null, workspaceSlug);

  const renewalDate = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-6 w-40" />
        <div className="grid grid-cols-2 gap-4">
          <Skeleton className="h-72 w-full rounded-xl" />
          <Skeleton className="h-72 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Plan status card */}
      <div className="flex items-center justify-between gap-4 rounded-xl border border-border bg-card px-5 py-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm">Plano atual</span>
            <Badge
              variant="outline"
              className={cn(
                "text-xs",
                isPro
                  ? "bg-pf-accent/20 text-[#5C7500] dark:text-pf-accent border-pf-accent/30 hover:bg-pf-accent/20"
                  : "bg-muted text-muted-foreground hover:bg-muted",
              )}
            >
              {isPro ? (
                <span className="flex items-center gap-1"><Zap className="h-3 w-3 text-pf-accent" />Pro</span>
              ) : "Free"}
            </Badge>
          </div>
          {isPro ? (
            <div className="flex items-center gap-1.5 text-sm text-pf-positive">
              <ShieldCheck className="h-3.5 w-3.5" />
              Colaboradores e leads ilimitados.{renewalDate && ` Renova em ${renewalDate}.`}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Até 2 membros e 50 leads. Ideal para começar.
            </p>
          )}
        </div>

        {isAdmin && (
          isPro ? (
            hasActiveSubscription && (
              <form action={portalAction}>
                <SubmitBtn variant="outline">
                  <ExternalLink className="h-3.5 w-3.5" />
                  Gerenciar
                </SubmitBtn>
              </form>
            )
          ) : (
            <form action={checkoutAction}>
              <SubmitBtn>Assinar Pro — R$49/mês</SubmitBtn>
            </form>
          )
        )}
      </div>

      {/* Compare */}
      <h3 className="font-semibold text-base">Compare os planos</h3>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Free card */}
        <div className="rounded-xl border border-border bg-card p-6 flex flex-col gap-4">
          <div>
            <h4 className="font-semibold text-base">Free</h4>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold">R$0</span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Para freelancers começando</p>
          </div>
          <div className="flex flex-col">
            {FEATURES.map((f) => (
              <FeatureRow key={f.label} icon={f.icon} label={f.label} value={f.free} accent={false} />
            ))}
          </div>
        </div>

        {/* Pro card */}
        <div className="relative rounded-xl border-2 border-pf-accent/40 bg-card p-6 flex flex-col gap-4">
          <span className="absolute -top-3 right-4 flex items-center gap-1 rounded-full bg-pf-accent px-3 py-0.5 text-[11px] font-semibold text-pf-bg">
            ⭐ Recomendado
          </span>

          <div>
            <h4 className="font-bold text-base text-pf-accent">Pro</h4>
            <p className="mt-1 flex items-baseline gap-1">
              <span className="text-3xl font-bold">R$49</span>
              <span className="text-sm text-muted-foreground">/mês</span>
            </p>
            <p className="mt-1 text-xs text-muted-foreground">Para equipes em crescimento</p>
          </div>

          <div className="flex flex-col">
            {FEATURES.map((f) => (
              <FeatureRow key={f.label} icon={f.icon} label={f.label} value={f.pro} accent={true} />
            ))}
          </div>

          {isAdmin && !isPro && (
            <form action={checkoutAction} className="mt-auto pt-2">
              <Button className="w-full gap-2 bg-pf-accent text-pf-bg hover:bg-pf-accent/90 font-semibold">
                <Zap className="h-4 w-4" />
                Assinar Pro — R$49/mês
              </Button>
            </form>
          )}

          {isPro && (
            <div className="mt-auto pt-2 flex items-center gap-2 text-sm text-pf-positive">
              <ShieldCheck className="h-4 w-4" />
              Plano ativo
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Page ─────────────────────────────────────────────────────────────────────
export default function SettingsPage({ params }: PageProps) {
  const { workspaceSlug } = params;
  const [tab, setTab] = useState<TabKey>("workspace");

  const { data: workspace, isLoading } = trpc.workspace.getBySlug.useQuery({
    slug: workspaceSlug,
  });

  const isAdmin = workspace?.role === "ADMIN";

  return (
    <div className="flex flex-col gap-6 max-w-3xl">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold tracking-tight">Configurações</h2>
        <p className="text-sm text-muted-foreground mt-0.5">
          Gerencie o workspace e os membros da equipe.
        </p>
      </div>

      {/* Tab bar */}
      <div className="flex gap-1 border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={cn(
              "px-4 py-2 text-sm font-medium transition-colors border-b-2 -mb-px",
              tab === t.key
                ? "border-pf-accent text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "workspace" && (
        isLoading ? (
          <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-8 w-20" />
          </div>
        ) : (
          <WorkspaceSettings
            workspaceSlug={workspaceSlug}
            initialName={workspace?.name ?? ""}
            isAdmin={isAdmin}
          />
        )
      )}

      {tab === "membros" && (
        isLoading ? (
          <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
            <Skeleton className="h-4 w-20" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <MembersList
            workspaceSlug={workspaceSlug}
            currentUserId={workspace?.currentUserId ?? ""}
            isAdmin={isAdmin}
            plan={workspace?.plan ?? "FREE"}
          />
        )
      )}

      {tab === "assinatura" && (
        <BillingSection
          workspaceSlug={workspaceSlug}
          plan={workspace?.plan ?? "FREE"}
          planExpiresAt={workspace?.planExpiresAt ?? null}
          hasActiveSubscription={workspace?.hasActiveSubscription ?? false}
          isAdmin={isAdmin}
          isLoading={isLoading}
        />
      )}
    </div>
  );
}
