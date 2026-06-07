import {
  Building2,
  Columns3,
  History,
  LayoutDashboard,
  UserPlus,
  Users,
  type LucideIcon,
} from "lucide-react";

import { Reveal } from "./Reveal";

interface Feature {
  icon: LucideIcon;
  title: string;
  description: string;
}

const FEATURES: Feature[] = [
  {
    icon: Columns3,
    title: "Pipeline Kanban",
    description: "Arraste negócios entre etapas e acompanhe o funil de vendas visualmente, do primeiro contato ao fechamento.",
  },
  {
    icon: Users,
    title: "Gestão de Leads",
    description: "Organize contatos, empresas e responsáveis em um só lugar, com busca, filtros e status de cada lead.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard de Métricas",
    description: "Veja a saúde do seu funil em tempo real: total de leads, negócios abertos, valor do pipeline e conversão.",
  },
  {
    icon: Building2,
    title: "Multi-empresa",
    description: "Crie workspaces isolados para cada time ou cliente, com dados e permissões totalmente separados.",
  },
  {
    icon: History,
    title: "Histórico de Atividades",
    description: "Registre ligações, e-mails, reuniões e notas em uma timeline cronológica de cada lead.",
  },
  {
    icon: UserPlus,
    title: "Convites de Equipe",
    description: "Convide colegas para colaborar no workspace e divida a carteira de negócios entre o time.",
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="px-6 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <Reveal className="mx-auto max-w-2xl text-center">
          <span className="font-pf-mono text-[11px] uppercase tracking-[0.15em] text-pf-accent">
            Funcionalidades
          </span>
          <h2 className="mt-3 font-pf-display text-3xl font-bold tracking-[-1.5px] text-pf-text md:text-[42px]">
            Tudo que seu time de vendas precisa
          </h2>
          <p className="mt-4 font-pf-body text-base leading-[1.65] text-pf-text-secondary">
            Sem módulos extras pra configurar nem telas que ninguém usa — só o
            essencial para organizar leads, fechar negócios e acompanhar resultados.
          </p>
        </Reveal>

        <div className="mt-14 grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-pf-border-subtle bg-pf-border-subtle sm:grid-cols-2 lg:grid-cols-3">
          {FEATURES.map((feature, i) => (
            <Reveal key={feature.title} delayMs={(i % 3) * 100}>
              <div className="group relative h-full overflow-hidden bg-pf-surface p-6">
                <span
                  aria-hidden
                  className="pointer-events-none absolute inset-x-0 top-0 h-[2px] w-0 bg-pf-accent transition-[width] duration-[400ms] ease-out group-hover:w-full"
                />
                <span className="font-pf-mono text-[11px] text-pf-text-muted">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="mt-4 flex h-10 w-10 items-center justify-center rounded-[8px] border border-pf-border bg-pf-surface-2">
                  <feature.icon className="h-5 w-5 text-pf-accent" />
                </div>
                <h3 className="mt-4 font-pf-display text-lg font-semibold text-pf-text">
                  {feature.title}
                </h3>
                <p className="mt-2 font-pf-body text-sm leading-[1.65] text-pf-text-secondary">
                  {feature.description}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
