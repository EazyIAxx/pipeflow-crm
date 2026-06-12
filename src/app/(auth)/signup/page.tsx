"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowRight, Loader2, Mail } from "lucide-react";

import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido"),
  password: z.string().min(8, "Senha deve ter ao menos 8 caracteres"),
});

type FormValues = z.infer<typeof schema>;

const AUTH_ERRORS: Record<string, string> = {
  "User already registered": "Já existe uma conta com este e-mail. Tente entrar.",
  "Password should be at least 6 characters": "A senha precisa ter ao menos 8 caracteres.",
  "Too many requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
  "Email rate limit exceeded": "Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente novamente.",
  "email rate limit exceeded": "Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente novamente.",
  "over_email_send_rate_limit": "Muitos cadastros em pouco tempo. Aguarde alguns minutos e tente novamente.",
};

export default function SignupPage() {
  const [serverError, setServerError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [confirmedEmail, setConfirmedEmail] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    setServerError(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setServerError("Configuração incompleta: adicione as credenciais do Supabase no .env.local.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: { full_name: data.name },
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(AUTH_ERRORS[error.message] ?? error.message);
      return;
    }

    setConfirmedEmail(data.email);
    setSent(true);
  }

  if (sent) {
    return (
      <div className="rounded-2xl border border-pf-border bg-pf-surface p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-pf-border bg-pf-surface-2">
          <Mail className="h-7 w-7 text-pf-accent" strokeWidth={1.5} />
        </div>

        <h2 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
          Verifique seu Gmail
        </h2>

        <p className="mt-3 font-pf-body text-sm leading-relaxed text-pf-text-secondary">
          Enviamos um link de ativação para{" "}
          <span className="font-semibold text-pf-accent">{confirmedEmail}</span>.
          <br />
          Ao clicar no link você será redirecionado para criar seu workspace.
        </p>

        <div className="mt-5 rounded-xl border border-pf-border-subtle bg-pf-bg px-4 py-3">
          <p className="font-pf-mono text-[11px] leading-relaxed text-pf-text-muted">
            Não encontrou? Verifique a pasta de{" "}
            <span className="text-pf-text-secondary">spam</span> ou aguarde até{" "}
            <span className="text-pf-text-secondary">2 minutos</span>.
          </p>
        </div>

        <Link
          href="/onboarding"
          className="mt-6 inline-flex items-center gap-1.5 font-pf-body text-sm font-semibold text-pf-accent transition-opacity hover:opacity-80"
        >
          Já confirmei — criar meu workspace
          <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-pf-border bg-pf-surface p-8">
      <h1 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
        Criar sua conta
      </h1>
      <p className="mt-1 font-pf-body text-sm text-pf-text-secondary">
        Comece grátis, sem cartão de crédito
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        {serverError && (
          <div className="rounded-xl border border-pf-negative/30 bg-pf-negative/10 px-3 py-2.5 text-sm text-pf-negative">
            {serverError}
          </div>
        )}

        <div className="space-y-1.5">
          <label htmlFor="name" className="block text-sm font-medium text-pf-text-secondary">
            Nome completo
          </label>
          <Input
            id="name"
            placeholder="Seu nome"
            autoComplete="name"
            aria-invalid={!!errors.name}
            className="border-pf-border bg-pf-surface-2 text-pf-text placeholder:text-pf-text-muted focus-visible:border-pf-accent focus-visible:ring-1 focus-visible:ring-pf-accent"
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-pf-negative">{errors.name.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="email" className="block text-sm font-medium text-pf-text-secondary">
            E-mail
          </label>
          <Input
            id="email"
            type="email"
            placeholder="voce@empresa.com"
            autoComplete="email"
            aria-invalid={!!errors.email}
            className="border-pf-border bg-pf-surface-2 text-pf-text placeholder:text-pf-text-muted focus-visible:border-pf-accent focus-visible:ring-1 focus-visible:ring-pf-accent"
            {...register("email")}
          />
          {errors.email && (
            <p className="text-xs text-pf-negative">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-1.5">
          <label htmlFor="password" className="block text-sm font-medium text-pf-text-secondary">
            Senha
          </label>
          <Input
            id="password"
            type="password"
            placeholder="Mínimo 8 caracteres"
            autoComplete="new-password"
            aria-invalid={!!errors.password}
            className="border-pf-border bg-pf-surface-2 text-pf-text placeholder:text-pf-text-muted focus-visible:border-pf-accent focus-visible:ring-1 focus-visible:ring-pf-accent"
            {...register("password")}
          />
          {errors.password && (
            <p className="text-xs text-pf-negative">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-pf-accent px-4 py-2.5 font-pf-body text-sm font-semibold text-pf-bg transition-shadow hover:shadow-[0_0_0_4px_rgba(202,255,51,0.15)] disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Criando conta…" : "Criar conta"}
        </button>

        <p className="text-center font-pf-mono text-[11px] text-pf-text-muted">
          Ao criar uma conta você concorda com nossos{" "}
          <span className="cursor-default text-pf-text-secondary underline">Termos de Uso</span>.
        </p>
      </form>

      <p className="mt-6 text-center font-pf-body text-sm text-pf-text-muted">
        Já tem uma conta?{" "}
        <Link href="/login" className="font-semibold text-pf-accent hover:underline">
          Entrar
        </Link>
      </p>
    </div>
  );
}
