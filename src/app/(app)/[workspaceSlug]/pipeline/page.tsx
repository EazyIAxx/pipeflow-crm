import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";

import { KanbanBoard } from "@/components/kanban/KanbanBoard";

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

interface PipelinePageProps {
  params: Promise<{ workspaceSlug: string }>;
}

export default async function PipelinePage({ params }: PipelinePageProps) {
  const { workspaceSlug } = await params;

  return (
    <div className={`${pfDisplay.variable} ${pfBody.variable} ${pfMono.variable}`}>
      <KanbanBoard workspaceSlug={workspaceSlug} />
    </div>
  );
}
