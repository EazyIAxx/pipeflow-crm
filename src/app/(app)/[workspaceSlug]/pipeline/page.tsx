import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";

/**
 * PipeFlow Brand Guide v2 — "Editorial Brutalist x Fintech"
 *
 * These fonts are loaded LOCALLY for the pipeline route segment only — the
 * Kanban board is an isolated visual island and must not affect the global
 * theme (Sidebar, Header, dashboard, leads, etc. keep using Inter / the
 * existing shadcn slate theme from src/app/layout.tsx).
 */
const pfDisplay = Syne({
  subsets: ["latin"],
  weight: ["600", "700", "800"],
  variable: "--font-pf-display",
});

const pfBody = DM_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-pf-body",
});

const pfMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500"],
  variable: "--font-pf-mono",
});

export default function PipelinePage() {
  return (
    <div className={`${pfDisplay.variable} ${pfBody.variable} ${pfMono.variable}`}>
      <KanbanBoard />
    </div>
  );
}
