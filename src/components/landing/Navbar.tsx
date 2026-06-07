"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";

import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { href: "#features", label: "Funcionalidades" },
  { href: "#pricing", label: "Preços" },
];

function LogoMark() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-pf-accent font-pf-display text-lg font-extrabold text-pf-bg">
        P
      </span>
      <span className="font-pf-display text-base text-pf-text">
        PipeFlow <span className="font-pf-display font-normal text-pf-text-muted">CRM</span>
      </span>
    </Link>
  );
}

export function Navbar() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 border-b border-pf-border-subtle bg-pf-bg/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <LogoMark />

        <nav className="hidden items-center gap-8 md:flex">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="font-pf-body text-sm text-pf-text-secondary transition-colors hover:text-pf-text"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <div className="hidden items-center gap-3 md:flex">
          <Link
            href="/login"
            className="font-pf-body text-sm font-medium text-pf-text-secondary transition-colors hover:text-pf-text"
          >
            Entrar
          </Link>
          <Link
            href="/signup"
            className="inline-flex h-9 items-center justify-center rounded-[6px] bg-pf-accent px-4 font-pf-body text-sm font-semibold text-pf-bg transition-shadow hover:shadow-[0_0_0_4px_rgba(202,255,51,0.15)]"
          >
            Começar grátis
          </Link>
        </div>

        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-9 w-9 items-center justify-center rounded-[6px] border border-pf-border text-pf-text md:hidden"
          aria-label={open ? "Fechar menu" : "Abrir menu"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </button>
      </div>

      <div
        className={cn(
          "overflow-hidden border-t border-pf-border-subtle bg-pf-bg transition-[max-height] duration-300 ease-out md:hidden",
          open ? "max-h-72" : "max-h-0 border-t-0"
        )}
      >
        <nav className="flex flex-col gap-1 px-6 py-4">
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={() => setOpen(false)}
              className="rounded-[6px] px-2 py-2 font-pf-body text-sm text-pf-text-secondary transition-colors hover:bg-pf-surface hover:text-pf-text"
            >
              {link.label}
            </a>
          ))}
          <div className="mt-2 flex flex-col gap-2 border-t border-pf-border-subtle pt-3">
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="rounded-[6px] px-2 py-2 font-pf-body text-sm font-medium text-pf-text-secondary transition-colors hover:bg-pf-surface hover:text-pf-text"
            >
              Entrar
            </Link>
            <Link
              href="/signup"
              onClick={() => setOpen(false)}
              className="inline-flex h-10 items-center justify-center rounded-[6px] bg-pf-accent px-4 font-pf-body text-sm font-semibold text-pf-bg"
            >
              Começar grátis
            </Link>
          </div>
        </nav>
      </div>
    </header>
  );
}
