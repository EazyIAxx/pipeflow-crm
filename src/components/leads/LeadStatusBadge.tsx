import { cn } from "@/lib/utils";
import { LEAD_STATUS_LABEL, type LeadStatus } from "@/lib/mock/leads";

const STATUS_CLASSNAME: Record<LeadStatus, string> = {
  active: "border-transparent bg-emerald-500/15 text-emerald-400",
  inactive: "border-transparent bg-muted text-muted-foreground",
  converted: "border-transparent bg-blue-500/15 text-blue-400",
};

interface LeadStatusBadgeProps {
  status: LeadStatus;
  className?: string;
}

export function LeadStatusBadge({ status, className }: LeadStatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
        STATUS_CLASSNAME[status],
        className
      )}
    >
      {LEAD_STATUS_LABEL[status]}
    </span>
  );
}
