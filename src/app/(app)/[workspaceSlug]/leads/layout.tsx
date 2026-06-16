import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Leads — PipeFlow CRM",
  description: "Gerencie seus contatos e clientes em potencial.",
};

export default function LeadsLayout({ children }: { children: React.ReactNode }) {
  return children;
}
