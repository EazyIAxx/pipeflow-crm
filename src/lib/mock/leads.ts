export type LeadStatus = "active" | "inactive" | "converted";

export type ActivityType = "CALL" | "EMAIL" | "MEETING" | "NOTE";

export interface MockLead {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  jobTitle: string;
  status: LeadStatus;
  owner: string;
  createdAt: string;
}

export interface MockActivity {
  id: string;
  leadId: string;
  type: ActivityType;
  description: string;
  author: string;
  date: string;
}

export const LEAD_OWNERS = ["Mariana Costa", "Pedro Henrique", "Juliana Alves"];

export const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  converted: "Convertido",
};

export const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  CALL: "Ligação",
  EMAIL: "E-mail",
  MEETING: "Reunião",
  NOTE: "Nota",
};

export const MOCK_LEADS: MockLead[] = [
  {
    id: "1",
    name: "Ana Paula Rocha",
    email: "ana@rocha.com",
    phone: "(11) 98765-4321",
    company: "Rocha & Associados",
    jobTitle: "Diretora Comercial",
    status: "active",
    owner: "Mariana Costa",
    createdAt: "2026-05-02",
  },
  {
    id: "2",
    name: "Carlos Mendes",
    email: "carlos@techstart.io",
    phone: "(21) 99887-2233",
    company: "TechStart Ltda",
    jobTitle: "CTO",
    status: "active",
    owner: "Pedro Henrique",
    createdAt: "2026-05-04",
  },
  {
    id: "3",
    name: "Fernanda Lima",
    email: "fernanda@lima.com.br",
    phone: "(31) 98123-4567",
    company: "Lima Consultoria",
    jobTitle: "Sócia-fundadora",
    status: "inactive",
    owner: "Juliana Alves",
    createdAt: "2026-04-21",
  },
  {
    id: "4",
    name: "Ricardo Torres",
    email: "ri@torres.com",
    phone: "(11) 97654-3210",
    company: "Torres Group",
    jobTitle: "Gerente de Compras",
    status: "converted",
    owner: "Mariana Costa",
    createdAt: "2026-04-15",
  },
  {
    id: "5",
    name: "Beatriz Salles",
    email: "beatriz.salles@nexofy.com",
    phone: "(41) 99221-8890",
    company: "Nexofy Soluções",
    jobTitle: "Head de Marketing",
    status: "active",
    owner: "Pedro Henrique",
    createdAt: "2026-05-10",
  },
  {
    id: "6",
    name: "Gustavo Pereira",
    email: "gustavo@pereiraadv.com.br",
    phone: "(51) 98456-1122",
    company: "Pereira Advocacia",
    jobTitle: "Sócio",
    status: "inactive",
    owner: "Juliana Alves",
    createdAt: "2026-03-30",
  },
  {
    id: "7",
    name: "Larissa Andrade",
    email: "larissa@andradedigital.com",
    phone: "(85) 99765-0099",
    company: "Andrade Digital",
    jobTitle: "CEO",
    status: "active",
    owner: "Mariana Costa",
    createdAt: "2026-05-18",
  },
  {
    id: "8",
    name: "Thiago Barros",
    email: "thiago.barros@grupobarros.com",
    phone: "(19) 98112-3344",
    company: "Grupo Barros",
    jobTitle: "Diretor Financeiro",
    status: "converted",
    owner: "Pedro Henrique",
    createdAt: "2026-04-02",
  },
  {
    id: "9",
    name: "Camila Nogueira",
    email: "camila@nogueiraeng.com.br",
    phone: "(48) 99334-5566",
    company: "Nogueira Engenharia",
    jobTitle: "Engenheira-chefe",
    status: "active",
    owner: "Juliana Alves",
    createdAt: "2026-05-22",
  },
  {
    id: "10",
    name: "Rodrigo Almeida",
    email: "rodrigo@almeidacorretora.com",
    phone: "(11) 96677-8899",
    company: "Almeida Corretora",
    jobTitle: "Corretor Sênior",
    status: "active",
    owner: "Mariana Costa",
    createdAt: "2026-05-26",
  },
  {
    id: "11",
    name: "Patrícia Souza",
    email: "patricia.souza@vivamais.com",
    phone: "(62) 99887-1100",
    company: "Viva Mais Saúde",
    jobTitle: "Gerente de Operações",
    status: "inactive",
    owner: "Pedro Henrique",
    createdAt: "2026-03-12",
  },
  {
    id: "12",
    name: "Eduardo Martins",
    email: "eduardo@martinsimportados.com",
    phone: "(27) 98223-4455",
    company: "Martins Importados",
    jobTitle: "Proprietário",
    status: "converted",
    owner: "Juliana Alves",
    createdAt: "2026-02-25",
  },
  {
    id: "13",
    name: "Juliana Tavares",
    email: "juliana@tavaresarquitetura.com",
    phone: "(31) 99001-2233",
    company: "Tavares Arquitetura",
    jobTitle: "Arquiteta-chefe",
    status: "active",
    owner: "Mariana Costa",
    createdAt: "2026-06-01",
  },
  {
    id: "14",
    name: "Marcos Vinícius Dias",
    email: "marcos@diascontabilidade.com.br",
    phone: "(11) 97334-2211",
    company: "Dias Contabilidade",
    jobTitle: "Contador Responsável",
    status: "active",
    owner: "Pedro Henrique",
    createdAt: "2026-06-03",
  },
];

export const MOCK_ACTIVITIES: MockActivity[] = [
  {
    id: "a1",
    leadId: "1",
    type: "NOTE",
    description: "Lead chegou via formulário do site, interessada em plano Pro.",
    author: "Mariana Costa",
    date: "2026-05-02T09:15:00",
  },
  {
    id: "a2",
    leadId: "1",
    type: "EMAIL",
    description: "Enviado e-mail de boas-vindas com material institucional.",
    author: "Mariana Costa",
    date: "2026-05-03T11:40:00",
  },
  {
    id: "a3",
    leadId: "1",
    type: "CALL",
    description: "Ligação de qualificação — 15 min, demonstrou bastante interesse no módulo de pipeline.",
    author: "Mariana Costa",
    date: "2026-05-06T14:20:00",
  },
  {
    id: "a4",
    leadId: "1",
    type: "MEETING",
    description: "Reunião de apresentação agendada para a próxima semana.",
    author: "Mariana Costa",
    date: "2026-05-09T16:00:00",
  },
  {
    id: "a5",
    leadId: "2",
    type: "NOTE",
    description: "Indicado por cliente atual (Torres Group). Já conhece a categoria de produto.",
    author: "Pedro Henrique",
    date: "2026-05-04T10:05:00",
  },
  {
    id: "a6",
    leadId: "2",
    type: "CALL",
    description: "Primeira conversa — quer entender integrações com ferramentas que já usa.",
    author: "Pedro Henrique",
    date: "2026-05-05T15:30:00",
  },
  {
    id: "a7",
    leadId: "3",
    type: "EMAIL",
    description: "Follow-up enviado após silêncio de duas semanas — sem resposta até o momento.",
    author: "Juliana Alves",
    date: "2026-05-01T09:00:00",
  },
  {
    id: "a8",
    leadId: "4",
    type: "MEETING",
    description: "Reunião de fechamento — proposta aceita, contrato assinado.",
    author: "Mariana Costa",
    date: "2026-04-28T13:00:00",
  },
  {
    id: "a9",
    leadId: "4",
    type: "NOTE",
    description: "Convertido para cliente. Negócio criado no pipeline em estágio Ganhos.",
    author: "Mariana Costa",
    date: "2026-04-28T13:30:00",
  },
  {
    id: "a10",
    leadId: "5",
    type: "EMAIL",
    description: "Solicitou material comparativo entre planos Free e Pro.",
    author: "Pedro Henrique",
    date: "2026-05-11T08:45:00",
  },
  {
    id: "a11",
    leadId: "5",
    type: "CALL",
    description: "Conversa de 20 min sobre necessidades de relatórios e dashboards.",
    author: "Pedro Henrique",
    date: "2026-05-14T17:10:00",
  },
  {
    id: "a12",
    leadId: "7",
    type: "NOTE",
    description: "Já testou concorrentes (Pipedrive). Principal dor: falta de visão multi-empresa.",
    author: "Mariana Costa",
    date: "2026-05-18T10:00:00",
  },
  {
    id: "a13",
    leadId: "7",
    type: "MEETING",
    description: "Demo realizada com toda a equipe comercial — feedback muito positivo.",
    author: "Mariana Costa",
    date: "2026-05-21T11:00:00",
  },
  {
    id: "a14",
    leadId: "9",
    type: "CALL",
    description: "Retornou contato pedindo proposta formal por escrito.",
    author: "Juliana Alves",
    date: "2026-05-23T09:30:00",
  },
  {
    id: "a15",
    leadId: "10",
    type: "EMAIL",
    description: "Primeiro contato — respondeu interessado em agendar uma demonstração.",
    author: "Mariana Costa",
    date: "2026-05-27T14:00:00",
  },
];

export function getLeadById(id: string): MockLead | undefined {
  return MOCK_LEADS.find((lead) => lead.id === id);
}

export function getActivitiesByLeadId(leadId: string): MockActivity[] {
  return MOCK_ACTIVITIES.filter((activity) => activity.leadId === leadId).sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}
