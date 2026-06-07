import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";

import { Reveal } from "./Reveal";

export function HeroSection() {
  return (
    <section className="relative px-6 pb-20 pt-20 md:pb-28 md:pt-28">
      <div className="mx-auto flex max-w-3xl flex-col items-center text-center">
        <Reveal>
          <span className="inline-flex items-center rounded-full border border-pf-border px-3 py-1 font-pf-mono text-[11px] uppercase tracking-[0.15em] text-pf-text-muted">
            Pipeline · Leads · Métricas — em um só lugar
          </span>
        </Reveal>

        <Reveal delayMs={100}>
          <h1 className="mt-6 font-pf-display text-4xl font-extrabold leading-[1.1] tracking-[-1.5px] text-pf-text md:text-6xl md:tracking-[-2px]">
            Feche mais negócios sem perder o controle do funil
          </h1>
        </Reveal>

        <Reveal delayMs={200}>
          <p className="mt-5 max-w-xl font-pf-body text-base leading-[1.65] text-pf-text-secondary md:text-lg">
            O PipeFlow organiza seus leads, seu pipeline e suas métricas de vendas em
            um CRM simples e direto — sem a complexidade (nem o preço) do HubSpot ou
            Pipedrive.
          </p>
        </Reveal>

        <Reveal delayMs={300}>
          <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row">
            <Link
              href="/signup"
              className="group inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pf-accent px-7 font-pf-body text-sm font-semibold text-pf-bg transition-shadow hover:shadow-[0_0_0_4px_rgba(202,255,51,0.15)]"
            >
              Começar grátis
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
            <a
              href="#features"
              className="inline-flex h-11 items-center justify-center gap-2 rounded-[8px] border border-pf-border px-7 font-pf-body text-sm font-medium text-pf-text transition-colors hover:bg-pf-surface"
            >
              <PlayCircle className="h-4 w-4" />
              Ver demo
            </a>
          </div>
        </Reveal>
      </div>
    </section>
  );
}
