export default function Home() {
  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 p-8">
      <div className="flex flex-col items-center gap-2 text-center">
        <div className="w-12 h-12 rounded-xl bg-foreground flex items-center justify-center mb-2">
          <span className="text-background font-bold text-xl">P</span>
        </div>
        <h1 className="text-3xl font-bold tracking-tight text-foreground">
          PipeFlow CRM
        </h1>
        <p className="text-muted-foreground text-base max-w-sm">
          Gestão de leads e pipeline de vendas para PMEs e freelancers.
        </p>
      </div>

      <div className="flex gap-3">
        <a
          href="/login"
          className="inline-flex items-center justify-center rounded-md bg-foreground text-background px-5 h-10 text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Entrar
        </a>
        <a
          href="/signup"
          className="inline-flex items-center justify-center rounded-md border border-border px-5 h-10 text-sm font-medium hover:bg-muted transition-colors"
        >
          Criar conta
        </a>
      </div>

      <p className="text-xs text-muted-foreground">
        Landing page em construção — M1
      </p>
    </div>
  );
}
