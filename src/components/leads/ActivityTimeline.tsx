"use client";

import { Phone, Mail, Users, StickyNote, History } from "lucide-react";

type ActivityType = "CALL" | "EMAIL" | "MEETING" | "NOTE";

const ACTIVITY_TYPE_LABEL: Record<ActivityType, string> = {
  CALL: "Ligação",
  EMAIL: "E-mail",
  MEETING: "Reunião",
  NOTE: "Nota",
};

const ACTIVITY_ICON: Record<ActivityType, typeof Phone> = {
  CALL: Phone,
  EMAIL: Mail,
  MEETING: Users,
  NOTE: StickyNote,
};

const ACTIVITY_ICON_CLASSNAME: Record<ActivityType, string> = {
  CALL: "bg-blue-500/15 text-blue-400",
  EMAIL: "bg-violet-500/15 text-violet-400",
  MEETING: "bg-amber-500/15 text-amber-400",
  NOTE: "bg-muted text-muted-foreground",
};

function formatDateTime(value: Date | string) {
  return new Date(value).toLocaleString("pt-BR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

interface Activity {
  id: string;
  type: ActivityType;
  description: string;
  date: Date | string;
  authorName: string;
}

interface ActivityTimelineProps {
  activities: Activity[];
}

export function ActivityTimeline({ activities }: ActivityTimelineProps) {
  if (activities.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-dashed border-border py-12 text-center">
        <History className="h-7 w-7 text-muted-foreground/40" />
        <p className="text-sm font-medium">Nenhuma atividade registrada</p>
        <p className="text-xs text-muted-foreground">Registre ligações, e-mails, reuniões e notas com este lead.</p>
      </div>
    );
  }

  return (
    <ol className="flex flex-col gap-0">
      {activities.map((activity, index) => {
        const Icon = ACTIVITY_ICON[activity.type];
        const isLast = index === activities.length - 1;
        return (
          <li key={activity.id} className="flex gap-4">
            <div className="flex flex-col items-center">
              <span className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${ACTIVITY_ICON_CLASSNAME[activity.type]}`}>
                <Icon className="h-4 w-4" />
              </span>
              {!isLast && <span className="w-px flex-1 bg-border" />}
            </div>
            <div className={`flex flex-col gap-1 ${isLast ? "pb-0" : "pb-6"}`}>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold">{ACTIVITY_TYPE_LABEL[activity.type]}</span>
                <span className="text-xs text-muted-foreground">· {activity.authorName}</span>
              </div>
              <p className="text-sm text-muted-foreground">{activity.description}</p>
              <span className="text-xs text-muted-foreground/70">{formatDateTime(activity.date)}</span>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
