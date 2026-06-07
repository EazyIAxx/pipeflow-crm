import { Reveal } from "./Reveal";

const STATS = [
  { value: "+47%", label: "Taxa de conversão" },
  { value: "3.2x", label: "Leads qualificados" },
  { value: "-62%", label: "Ciclo de venda" },
  { value: "1200+", label: "Times usando o PipeFlow" },
];

export function StatsSection() {
  return (
    <section className="border-y border-pf-border-subtle bg-pf-surface/40">
      <div className="mx-auto grid max-w-6xl grid-cols-2 divide-x divide-y divide-pf-border-subtle md:grid-cols-4 md:divide-y-0">
        {STATS.map((stat, i) => (
          <Reveal key={stat.label} delayMs={i * 100} className="h-full">
            <div className="flex h-full flex-col items-center justify-center gap-1.5 px-6 py-10 text-center">
              <p className="font-pf-mono text-3xl font-medium tracking-normal text-pf-accent md:text-4xl">
                {stat.value}
              </p>
              <p className="font-pf-mono text-[11px] uppercase tracking-[0.15em] text-pf-text-muted">
                {stat.label}
              </p>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
