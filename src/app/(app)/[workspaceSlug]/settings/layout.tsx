import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Configurações — PipeFlow CRM",
  description: "Gerencie o workspace, membros da equipe e assinatura.",
};

export default function SettingsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
