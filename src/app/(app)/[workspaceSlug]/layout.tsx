import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

interface AppLayoutProps {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}

export default function AppLayout({ children, params }: AppLayoutProps) {
  const { workspaceSlug } = params;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Sidebar — desktop only */}
      <Sidebar workspaceSlug={workspaceSlug} className="hidden md:flex" />

      {/* Main column */}
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header workspaceSlug={workspaceSlug} />
        <main className="flex-1 overflow-auto p-6">{children}</main>
      </div>
    </div>
  );
}
