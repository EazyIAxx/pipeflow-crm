import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const MOCK_LEADS = [
  { id: "1", name: "Ana Paula Rocha", company: "Rocha & Associados", email: "ana@rocha.com", status: "active" },
  { id: "2", name: "Carlos Mendes", company: "TechStart Ltda", email: "carlos@techstart.io", status: "active" },
  { id: "3", name: "Fernanda Lima", company: "Lima Consultoria", email: "fernanda@lima.com.br", status: "inactive" },
  { id: "4", name: "Ricardo Torres", company: "Torres Group", email: "ri@torres.com", status: "converted" },
];

const STATUS_LABEL: Record<string, string> = {
  active: "Ativo",
  inactive: "Inativo",
  converted: "Convertido",
};

const STATUS_VARIANT: Record<string, "default" | "secondary" | "outline"> = {
  active: "default",
  inactive: "secondary",
  converted: "outline",
};

export default function LeadsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Leads</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Gerencie seus contatos e clientes em potencial.
          </p>
        </div>
        <Button size="sm" className="gap-1.5">
          <Plus className="h-4 w-4" />
          Novo Lead
        </Button>
      </div>

      {/* Table */}
      <div className="rounded-lg border border-border bg-card overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/30">
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Nome</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden md:table-cell">Empresa</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground hidden lg:table-cell">E-mail</th>
              <th className="px-4 py-3 text-left font-medium text-muted-foreground">Status</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_LEADS.map((lead, i) => (
              <tr
                key={lead.id}
                className={`border-b border-border last:border-0 hover:bg-muted/20 cursor-pointer transition-colors ${i % 2 === 0 ? "" : "bg-muted/5"}`}
              >
                <td className="px-4 py-3 font-medium">{lead.name}</td>
                <td className="px-4 py-3 text-muted-foreground hidden md:table-cell">{lead.company}</td>
                <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">{lead.email}</td>
                <td className="px-4 py-3">
                  <Badge variant={STATUS_VARIANT[lead.status]}>
                    {STATUS_LABEL[lead.status]}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-muted-foreground">
        Busca, filtros e paginação — implementados em M4
      </p>
    </div>
  );
}
