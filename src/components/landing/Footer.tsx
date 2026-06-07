import Link from "next/link";

const FOOTER_COLUMNS = [
  {
    title: "Produto",
    links: [
      { label: "Funcionalidades", href: "#features" },
      { label: "Preços", href: "#pricing" },
      { label: "Entrar", href: "/login" },
    ],
  },
  {
    title: "Empresa",
    links: [
      { label: "Sobre", href: "#" },
      { label: "Contato", href: "#" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Termos de uso", href: "#" },
      { label: "Privacidade", href: "#" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-pf-border-subtle px-6 py-14">
      <div className="mx-auto flex max-w-6xl flex-col gap-12 md:flex-row md:justify-between">
        <div className="flex flex-col gap-3">
          <Link href="/" className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-[6px] bg-pf-accent font-pf-display text-lg font-extrabold text-pf-bg">
              P
            </span>
            <span className="font-pf-display text-base text-pf-text">
              PipeFlow <span className="font-pf-display font-normal text-pf-text-muted">CRM</span>
            </span>
          </Link>
          <p className="max-w-xs font-pf-body text-sm leading-[1.65] text-pf-text-secondary">
            Gestão de leads e pipeline de vendas para PMEs e freelancers.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
          {FOOTER_COLUMNS.map((column) => (
            <div key={column.title} className="flex flex-col gap-3">
              <span className="font-pf-mono text-[11px] uppercase tracking-[0.15em] text-pf-text-muted">
                {column.title}
              </span>
              <ul className="flex flex-col gap-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="font-pf-body text-sm text-pf-text-secondary transition-colors hover:text-pf-text"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>

      <div className="mx-auto mt-12 flex max-w-6xl flex-col items-center justify-between gap-3 border-t border-pf-border-subtle pt-6 sm:flex-row">
        <p className="font-pf-mono text-[11px] text-pf-text-muted">
          © {new Date().getFullYear()} PipeFlow CRM. Todos os direitos reservados.
        </p>
      </div>
    </footer>
  );
}
