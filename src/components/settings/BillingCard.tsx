"use client";

import { useFormStatus } from "react-dom";
import { CreditCard, Zap, CheckCircle2, Loader2, ExternalLink } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { startCheckoutAction, openPortalAction } from "@/server/actions/billing";

function SubmitButton({ children, variant = "default" }: { children: React.ReactNode; variant?: "default" | "outline" }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="sm" variant={variant} disabled={pending} className="w-fit gap-2">
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

const FREE_LIMITS = [
  "Até 2 colaboradores",
  "Até 50 leads",
];

interface BillingCardProps {
  workspaceSlug: string;
  plan: "FREE" | "PRO";
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
              ? "bg-yellow-400/20 text-yellow-700 dark:text-yellow-300 border-yellow-400/30 hover:bg-yellow-400/20"
              : "bg-muted text-muted-foreground hover:bg-muted"
          }`}
          variant="outline"
        >
          {isPro ? (
            <span className="flex items-center gap-1">
              <Zap className="h-3 w-3" />
              Pro
            </span>
          ) : (
            "Free"
          )}
        </Badge>
      </div>

      {isPro ? (
        <>
          {/* Pro state */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
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
                <CheckCircle2 className="h-3.5 w-3.5 text-green-500 shrink-0" />
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
          {/* Free state */}
          <p className="text-sm text-muted-foreground">
            Você está no plano gratuito.
          </p>

          <ul className="flex flex-col gap-1.5">
            {FREE_LIMITS.map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-muted-foreground">
                <span className="h-3.5 w-3.5 flex items-center justify-center shrink-0 text-muted-foreground/50 text-xs">—</span>
                {f}
              </li>
            ))}
          </ul>

          {/* Upgrade card */}
          <div className="rounded-md border border-yellow-400/30 bg-yellow-400/5 p-4 flex flex-col gap-3">
            <div>
              <p className="text-sm font-semibold flex items-center gap-1.5">
                <Zap className="h-3.5 w-3.5 text-yellow-500" />
                PipeFlow Pro
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">
                R$49/mês · Cancele quando quiser
              </p>
            </div>
            <ul className="flex flex-col gap-1">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CheckCircle2 className="h-3 w-3 text-yellow-500 shrink-0" />
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
