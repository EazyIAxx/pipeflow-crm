"use client";

import { useFormStatus } from "react-dom";
import { CreditCard, Zap, CheckCircle2, Loader2, ExternalLink, AlertTriangle, ShieldCheck } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startCheckoutAction, openPortalAction } from "@/server/actions/billing";

function SubmitButton({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "outline" }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      size="sm"
      variant={variant}
      disabled={pending}
      className={
        variant === "default"
          ? "w-fit gap-2 bg-pf-accent text-pf-bg hover:bg-pf-accent/90 font-semibold"
          : "w-fit gap-2"
      }
    >
      {pending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
      {children}
    </Button>
  );
}

const PRO_FEATURES = [
  "Colaboradores ilimitados",
  "Leads ilimitados",
  "Negócios ilimitados",
  "Suporte prioritário",
];

const FREE_LIMITS_LIST = [
  "Até 2 colaboradores",
  "Até 50 leads",
];

interface BillingCardProps {
  workspaceSlug: string;
  plan: "FREE" | "PRO" | "PAYMENT_FAILED";
  planExpiresAt: string | null;
  hasActiveSubscription: boolean;
  isAdmin: boolean;
}

export function BillingCard({
  workspaceSlug,
  plan,
  planExpiresAt,
  hasActiveSubscription,
  isAdmin,
}: BillingCardProps) {
  const isPro = plan === "PRO";
  const isPaymentFailed = plan === "PAYMENT_FAILED";
  const renewalDate = planExpiresAt
    ? new Date(planExpiresAt).toLocaleDateString("pt-BR", { day: "2-digit", month: "long", year: "numeric" })
    : null;

  const checkoutAction = startCheckoutAction.bind(null, workspaceSlug);
  const portalAction = openPortalAction.bind(null, workspaceSlug);

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center gap-2">
        <CreditCard className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Plano</span>
        <Badge
          className={`ml-auto text-xs ${
            isPro
              ? "bg-pf-accent/20 text-[#5C7500] dark:text-pf-accent border-pf-accent/30 hover:bg-pf-accent/20"
              : isPaymentFailed
                ? "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30 hover:bg-red-500/10"
                : "bg-muted text-muted-foreground hover:bg-muted"
          }`}
          variant="outline"
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
        <div className="flex items-start gap-2 rounded-md border border-red-500/30 bg-red-500/5 p-3 text-sm">
          <AlertTriangle className="h-4 w-4 text-red-500 shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5">
            <span className="font-medium text-red-600 dark:text-red-400">Falha no pagamento</span>
            <span className="text-muted-foreground text-xs">
              Não conseguimos processar sua assinatura. Atualize seu método de pagamento para reativar o Pro.
            </span>
          </div>
        </div>
      )}

      {isPro ? (
        <>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-pf-positive">
              <ShieldCheck className="h-4 w-4 shrink-0" />
              <span>Plano Pro ativo — colaboradores e leads ilimitados.</span>
            </div>
            {renewalDate && (
              <p className="text-xs text-muted-foreground pl-6">
                Renova em {renewalDate}.
              </p>
            )}
          </div>

          <ul className="flex flex-col gap-1.5">
            {PRO_FEATURES.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-pf-positive shrink-0" />
                {f}
              </li>
            ))}
          </ul>

          {isAdmin && hasActiveSubscription && (
            <form action={portalAction}>
              <SubmitButton variant="outline">
                <ExternalLink className="h-3.5 w-3.5" />
                Gerenciar assinatura
              </SubmitButton>
            </form>
          )}
        </>
      ) : (
        <>
          <p className="text-sm text-muted-foreground">
            Você está no plano gratuito.
          </p>

          <ul className="flex flex-col gap-1.5">
            {FREE_LIMITS_LIST.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-3.5 w-3.5 flex items-center justify-center shrink-0 text-muted-foreground/50 text-xs">—</span>
                {f}
              </li>
            ))}
          </ul>

          {/* Upgrade card */}
          <div className="rounded-md border border-pf-accent/30 bg-pf-accent/5 p-4 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-pf-accent" />
                PipeFlow Pro
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$49/mês · Cancele quando quiser
              </p>
            </div>
            <ul className="flex flex-col gap-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-pf-accent shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            {isAdmin ? (
              <form action={checkoutAction}>
                <SubmitButton>
                  <Zap className="h-3.5 w-3.5" />
                  Assinar Pro — R$49/mês
                </SubmitButton>
              </form>
            ) : (
              <p className="text-xs text-muted-foreground">
                Somente administradores podem fazer upgrade.
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
}
