import { notFound } from "next/navigation";
import { TRPCError } from "@trpc/server";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { createServerCaller } from "@/lib/trpc/server";

interface AppLayoutProps {
  children: React.ReactNode;
  params: { workspaceSlug: string };
}

export default async function AppLayout({ children, params }: AppLayoutProps) {
  const { workspaceSlug } = params;

  const caller = await createServerCaller();

  try {
    await caller.workspace.getBySlug({ slug: workspaceSlug });
  } catch (error) {
    if (error instanceof TRPCError && error.code === "NOT_FOUND") {
      notFound();
    }
    throw error;
  }

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
