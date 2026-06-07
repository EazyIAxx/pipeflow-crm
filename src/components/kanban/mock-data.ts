import type { Stage } from "@prisma/client";

/**
 * Mock data for the M5 Pipeline Kanban UI.
 * No backend/tRPC yet — `deals` router doesn't exist. This file simulates
 * the shape of the future `Deal` model (see prisma/schema.prisma) closely
 * enough to swap in real data later with minimal changes.
 */

export interface MockOwner {
  id: string;
  name: string;
  initials: string;
}

export interface MockPipelineLead {
  id: string;
  name: string;
  company: string;
}

export interface MockDeal {
  id: string;
  title: string;
  leadId: string;
  leadName: string;
  company: string;
  value: number;
  stage: Stage;
  ownerId: string;
  dueDate: string | null; // ISO date string
}

export const STAGE_ORDER: Stage[] = [
  "NEW_LEAD",
  "CONTACTED",
  "PROPOSAL_SENT",
  "NEGOTIATION",
  "WON",
  "LOST",
];

export const STAGE_LABEL: Record<Stage, string> = {
  NEW_LEAD: "Novo Lead",
  CONTACTED: "Contato Realizado",
  PROPOSAL_SENT: "Proposta Enviada",
  NEGOTIATION: "Negociação",
  WON: "Fechado Ganho",
  LOST: "Fechado Perdido",
};

/**
 * Functional stage colors per the Brand Guide v2 — these map 1:1 to the
 * `pf-stage-*` Tailwind tokens declared in tailwind.config.ts.
 */
export const STAGE_COLOR: Record<Stage, string> = {
  NEW_LEAD: "#5B7FFF",
  CONTACTED: "#00B4D8",
  PROPOSAL_SENT: "#CAFF33",
  NEGOTIATION: "#FF6B35",
  WON: "#2ED573",
  LOST: "#FF4757",
};

export const STAGE_DOT_CLASS: Record<Stage, string> = {
  NEW_LEAD: "bg-pf-stage-new-lead",
  CONTACTED: "bg-pf-stage-contacted",
  PROPOSAL_SENT: "bg-pf-stage-proposal",
  NEGOTIATION: "bg-pf-stage-negotiation",
  WON: "bg-pf-stage-won",
  LOST: "bg-pf-stage-lost",
};

export const STAGE_TEXT_CLASS: Record<Stage, string> = {
  NEW_LEAD: "text-pf-stage-new-lead",
  CONTACTED: "text-pf-stage-contacted",
  PROPOSAL_SENT: "text-pf-stage-proposal",
  NEGOTIATION: "text-pf-stage-negotiation",
  WON: "text-pf-stage-won",
  LOST: "text-pf-stage-lost",
};

export const STAGE_BORDER_CLASS: Record<Stage, string> = {
  NEW_LEAD: "border-pf-stage-new-lead",
  CONTACTED: "border-pf-stage-contacted",
  PROPOSAL_SENT: "border-pf-stage-proposal",
  NEGOTIATION: "border-pf-stage-negotiation",
  WON: "border-pf-stage-won",
  LOST: "border-pf-stage-lost",
};

export const MOCK_OWNERS: MockOwner[] = [
  { id: "owner-1", name: "Mariana Costa", initials: "MC" },
  { id: "owner-2", name: "Pedro Henrique", initials: "PH" },
  { id: "owner-3", name: "Juliana Alves", initials: "JA" },
];

export const MOCK_PIPELINE_LEADS: MockPipelineLead[] = [
  { id: "lead-1", name: "Ana Paula Rocha", company: "Rocha & Associados" },
  { id: "lead-2", name: "Carlos Mendes", company: "TechStart Ltda" },
  { id: "lead-3", name: "Fernanda Lima", company: "Lima Consultoria" },
  { id: "lead-4", name: "Ricardo Torres", company: "Torres Group" },
  { id: "lead-5", name: "Beatriz Salles", company: "Nexofy Soluções" },
  { id: "lead-6", name: "Gustavo Pereira", company: "Pereira Advocacia" },
  { id: "lead-7", name: "Larissa Andrade", company: "Andrade Digital" },
  { id: "lead-8", name: "Thiago Barros", company: "Grupo Barros" },
];

export const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
  maximumFractionDigits: 0,
});

export function formatCurrency(value: number): string {
  return currencyFormatter.format(value);
}

/** Returns an ISO date string offset from today by the given number of days. */
function daysFromNow(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return date.toISOString().slice(0, 10);
}

/**
 * Returns true when the due date is within the next 3 days (including
 * already-overdue dates) — used to flag a card's due-date badge as urgent.
 */
export function isDueSoon(dueDate: string | null): boolean {
  if (!dueDate) return false;
  const due = new Date(`${dueDate}T00:00:00`);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  return diffDays < 3;
}

export function formatDueDate(dueDate: string): string {
  const due = new Date(`${dueDate}T00:00:00`);
  return due.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });
}

export const MOCK_DEALS: MockDeal[] = [
  // NEW_LEAD
  {
    id: "deal-1",
    title: "Website institucional",
    leadId: "lead-1",
    leadName: "Ana Paula Rocha",
    company: "Rocha & Associados",
    value: 8000,
    stage: "NEW_LEAD",
    ownerId: "owner-1",
    dueDate: daysFromNow(12),
  },
  {
    id: "deal-2",
    title: "Consultoria de marketing mensal",
    leadId: "lead-2",
    leadName: "Carlos Mendes",
    company: "TechStart Ltda",
    value: 3500,
    stage: "NEW_LEAD",
    ownerId: "owner-2",
    dueDate: daysFromNow(2),
  },
  {
    id: "deal-3",
    title: "Diagnóstico comercial inicial",
    leadId: "lead-7",
    leadName: "Larissa Andrade",
    company: "Andrade Digital",
    value: 1800,
    stage: "NEW_LEAD",
    ownerId: "owner-3",
    dueDate: null,
  },
  // CONTACTED
  {
    id: "deal-4",
    title: "Implantação de sistema ERP",
    leadId: "lead-4",
    leadName: "Ricardo Torres",
    company: "Torres Group",
    value: 45000,
    stage: "CONTACTED",
    ownerId: "owner-1",
    dueDate: daysFromNow(7),
  },
  {
    id: "deal-5",
    title: "Plano de mídia trimestral",
    leadId: "lead-5",
    leadName: "Beatriz Salles",
    company: "Nexofy Soluções",
    value: 9200,
    stage: "CONTACTED",
    ownerId: "owner-2",
    dueDate: daysFromNow(-1),
  },
  {
    id: "deal-6",
    title: "Auditoria de processos jurídicos",
    leadId: "lead-6",
    leadName: "Gustavo Pereira",
    company: "Pereira Advocacia",
    value: 6400,
    stage: "CONTACTED",
    ownerId: "owner-3",
    dueDate: daysFromNow(9),
  },
  // PROPOSAL_SENT
  {
    id: "deal-7",
    title: "Desenvolvimento de app mobile",
    leadId: "lead-3",
    leadName: "Fernanda Lima",
    company: "Lima Consultoria",
    value: 28000,
    stage: "PROPOSAL_SENT",
    ownerId: "owner-1",
    dueDate: daysFromNow(1),
  },
  {
    id: "deal-8",
    title: "Reformulação de identidade visual",
    leadId: "lead-8",
    leadName: "Thiago Barros",
    company: "Grupo Barros",
    value: 14500,
    stage: "PROPOSAL_SENT",
    ownerId: "owner-2",
    dueDate: daysFromNow(5),
  },
  // NEGOTIATION
  {
    id: "deal-9",
    title: "Contrato de manutenção anual",
    leadId: "lead-2",
    leadName: "Carlos Mendes",
    company: "TechStart Ltda",
    value: 21000,
    stage: "NEGOTIATION",
    ownerId: "owner-3",
    dueDate: daysFromNow(0),
  },
  {
    id: "deal-10",
    title: "Licenciamento de software (50 postos)",
    leadId: "lead-1",
    leadName: "Ana Paula Rocha",
    company: "Rocha & Associados",
    value: 36000,
    stage: "NEGOTIATION",
    ownerId: "owner-1",
    dueDate: daysFromNow(4),
  },
  {
    id: "deal-11",
    title: "Pacote de treinamento corporativo",
    leadId: "lead-5",
    leadName: "Beatriz Salles",
    company: "Nexofy Soluções",
    value: 7800,
    stage: "NEGOTIATION",
    ownerId: "owner-2",
    dueDate: daysFromNow(-2),
  },
  // WON
  {
    id: "deal-12",
    title: "Dashboard de analytics sob medida",
    leadId: "lead-2",
    leadName: "Carlos Mendes",
    company: "TechStart Ltda",
    value: 12000,
    stage: "WON",
    ownerId: "owner-3",
    dueDate: daysFromNow(-10),
  },
  {
    id: "deal-13",
    title: "Renovação de contrato de suporte",
    leadId: "lead-4",
    leadName: "Ricardo Torres",
    company: "Torres Group",
    value: 18500,
    stage: "WON",
    ownerId: "owner-1",
    dueDate: daysFromNow(-22),
  },
  // LOST
  {
    id: "deal-14",
    title: "Migração de infraestrutura cloud",
    leadId: "lead-6",
    leadName: "Gustavo Pereira",
    company: "Pereira Advocacia",
    value: 32000,
    stage: "LOST",
    ownerId: "owner-2",
    dueDate: daysFromNow(-30),
  },
  {
    id: "deal-15",
    title: "Campanha de lançamento de produto",
    leadId: "lead-8",
    leadName: "Thiago Barros",
    company: "Grupo Barros",
    value: 9900,
    stage: "LOST",
    ownerId: "owner-3",
    dueDate: daysFromNow(-15),
  },
];
