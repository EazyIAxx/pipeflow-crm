import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2 group">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm leading-none">P</span>
            </div>
            <span className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              PipeFlow
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
