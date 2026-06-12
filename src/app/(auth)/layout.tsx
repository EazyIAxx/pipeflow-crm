import Link from "next/link";
import { Syne, DM_Sans, IBM_Plex_Mono } from "next/font/google";

const pfDisplay = Syne({
  subsets: ["latin"],
  weight: ["700", "800"],
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

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      className={`${pfDisplay.variable} ${pfBody.variable} ${pfMono.variable} min-h-screen bg-pf-bg font-pf-body flex items-center justify-center p-4`}
    >
      <div className="w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2.5 group">
            <div className="size-9 rounded-xl bg-pf-accent flex items-center justify-center">
              <span className="text-pf-bg font-extrabold text-sm leading-none font-pf-display">P</span>
            </div>
            <span className="text-xl font-bold text-pf-text font-pf-display group-hover:text-pf-accent transition-colors">
              PipeFlow
            </span>
          </Link>
        </div>
        {children}
      </div>
    </div>
  );
}
