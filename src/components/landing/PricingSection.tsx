import Link from "next/link";
import { Check } from "lucide-react";

import { cn } from "@/lib/utils";
import { Reveal } from "./Reveal";

interface PricingPlan {
  name: string;
  price: string;
  period?: string;
  description: string;
  features: string[];
  cta: string;
  href: string;
  featured?: boolean;
}

const PLANS: PricingPlan[] = [
  {
    name: "Grátis",
    price: "R$ 0",
    description: "Para começar a organizar seu funil sem custo.",
    features: ["Até 2 colaboradores", "Até 50 leads", "Pipeline Kanban", "Dashboard de métricas"],
    cta: "Começar grátis",
    href: "/signup",
  },
  {
    name: "Pro",
    price: "R$ 49",
    period: "/mês",
    description: "Para times que vivem de fechar negócios.",
    features: [
      "Colaboradores ilimitados",
      "Leads ilimitados",
      "Pipeline Kanban",
      "Dashboard de métricas",
      "Histórico de atividades completo",
      "Suporte prioritário",
    ],
    cta: "Assinar Pro",
    href: "/signup",
    featured: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-5xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-pf-mono text-[11px] uppercase tracking-[0.15em] text-pf-accent">
            Preços
          </span>
          <h2 className="mt-3 font-pf-display text-3xl font-bold tracking-[-1.5px] text-pf-text md:text-[42px]">
            Comece grátis, cresça quando precisar
          </h2>
          <p className="mt-4 font-pf-body text-base leading-[1.65] text-pf-text-secondary">
            Sem fidelidade, sem letras miúdas. Cancele quando quiser.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-6 sm:grid-cols-2">
          {PLANS.map((plan, i) => (
            <Reveal key={plan.name} delayMs={i * 100}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-[12px] border p-8",
                  plan.featured
                    ? "border-pf-accent/40 bg-pf-surface-2"
                    : "border-pf-border-subtle bg-pf-surface"
                )}
              >
                {plan.featured && (
                  <span className="absolute -top-3 right-8 rounded-full bg-pf-accent px-3 py-1 font-pf-mono text-[10px] font-medium uppercase tracking-[0.1em] text-pf-bg">
                    Mais popular
                  </span>
                )}

                <h3 className="font-pf-display text-xl font-semibold text-pf-text">{plan.name}</h3>
                <p className="mt-1 font-pf-body text-sm text-pf-text-secondary">{plan.description}</p>

                <p className="mt-6 flex items-baseline gap-1">
                  <span className="font-pf-mono text-4xl font-medium tracking-normal text-pf-text">
                    {plan.price}
                  </span>
                  {plan.period && (
                    <span className="font-pf-mono text-sm text-pf-text-muted">{plan.period}</span>
                  )}
                </p>

                <ul className="mt-8 flex flex-col gap-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-pf-accent" />
                      <span className="font-pf-body text-sm text-pf-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href={plan.href}
                  className={cn(
                    "mt-8 inline-flex h-11 items-center justify-center rounded-[8px] font-pf-body text-sm font-semibold transition-shadow",
                    plan.featured
                      ? "bg-pf-accent text-pf-bg hover:shadow-[0_0_0_4px_rgba(202,255,51,0.15)]"
                      : "border border-pf-border text-pf-text hover:bg-pf-surface-2"
                  )}
                >
                  {plan.cta}
                </Link>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
