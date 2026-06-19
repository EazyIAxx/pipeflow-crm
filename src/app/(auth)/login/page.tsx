"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { resolvePostLoginRedirect } from "./actions";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
  password: z.string().min(6, "Senha deve ter ao menos 6 caracteres"),
});

type FormValues = z.infer<typeof schema>;

const AUTH_ERRORS: Record<string, string> = {
  "Invalid login credentials": "E-mail ou senha incorretos.",
  "Email not confirmed": "Confirme seu e-mail antes de entrar. Verifique sua caixa de entrada.",
  "Too many requests": "Muitas tentativas. Aguarde alguns minutos e tente novamente.",
};

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");
  const emailHint = searchParams.get("email") ?? "";
  const isInviteFlow = nextPath?.startsWith("/invite/") ?? false;
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: emailHint },
  });

  async function onSubmit(data: FormValues) {
    setServerError(null);

    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setServerError("Configuração incompleta: adicione as credenciais do Supabase no .env.local.");
      return;
    }

    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    });

    if (error) {
      setServerError(AUTH_ERRORS[error.message] ?? "Ocorreu um erro. Tente novamente.");
      return;
    }

    const redirectPath = nextPath ?? (await resolvePostLoginRedirect());
    router.push(redirectPath ?? "/onboarding");
    router.refresh();
  }

  return (
    <div className="rounded-2xl border border-pf-border bg-pf-surface p-8">
      <h1 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
        Entrar na sua conta
      </h1>
      <p className="mt-1 font-pf-body text-sm text-pf-text-secondary">
        Use seu e-mail e senha para acessar o PipeFlow
      </p>

      {isInviteFlow && emailHint && (
        <div className="mt-5 rounded-xl border border-pf-accent/30 bg-pf-accent/10 px-4 py-3">
          <p className="text-sm text-pf-text-secondary">
            Entre com{" "}
            <span className="font-semibold text-pf-text">{emailHint}</span>{" "}
            para aceitar o convite.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
        {serverError && (
          <div className="rounded-xl border border-pf-negative/30 bg-pf-negative/10 px-3 py-2.5 text-sm text-pf-negative">
            {serverError}
          </div>
        )}

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
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-medium text-pf-text-secondary">
              Senha
            </label>
            <Link
              href="/forgot-password"
              className="text-xs text-pf-text-muted transition-colors hover:text-pf-accent"
            >
              Esqueci a senha
            </Link>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
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
          {isSubmitting ? "Entrando…" : "Entrar"}
        </button>
      </form>

      <p className="mt-6 text-center font-pf-body text-sm text-pf-text-muted">
        Não tem uma conta?{" "}
        <Link href="/signup" className="font-semibold text-pf-accent hover:underline">
          Criar conta grátis
        </Link>
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}
