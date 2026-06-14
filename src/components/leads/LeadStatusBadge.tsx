import { cn } from "@/lib/utils";

type LeadStatus = "active" | "inactive" | "converted";

const LEAD_STATUS_LABEL: Record<LeadStatus, string> = {
  active: "Ativo",
  inactive: "Inativo",
  converted: "Convertido",
};

const STATUS_CLASSNAME: Record<LeadStatus, string> = {
  active: "border-transparent bg-emerald-500/15 text-emerald-400",
  inactive: "border-transparent bg-muted text-muted-foreground",
  converted: "border-transparent bg-blue-500/15 text-blue-400",
};

interface LeadStatusBadgeProps {
  status: string;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  const safeStatus = (status as LeadStatus) in STATUS_CLASSNAME ? (status as LeadStatus) : "inactive";
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        STATUS_CLASSNAME[safeStatus],
        className
      )}
    >
      {LEAD_STATUS_LABEL[safeStatus] ?? status}
    </span>
  );
}
