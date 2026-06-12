"use client";

import { useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";

import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email: z.string().email("E-mail inválido"),
});

type FormValues = z.infer<typeof schema>;

export default function ForgotPasswordPage() {
  const [sentTo, setSentTo] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({ resolver: zodResolver(schema) });

  async function onSubmit(data: FormValues) {
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      const supabase = createClient();
      await supabase.auth.resetPasswordForEmail(data.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      });
    }
    setSentTo(data.email);
  }

  if (sentTo) {
    return (
      <div className="rounded-2xl border border-pf-border bg-pf-surface p-8 text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-pf-border bg-pf-surface-2">
          <MailCheck className="h-7 w-7 text-pf-accent" strokeWidth={1.5} />
        </div>

        <h2 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
          E-mail enviado!
        </h2>

        <p className="mt-3 font-pf-body text-sm leading-relaxed text-pf-text-secondary">
          Enviamos um link de recuperação para{" "}
          <span className="font-semibold text-pf-accent">{sentTo}</span>.
        </p>

        <div className="mt-5 rounded-xl border border-pf-border-subtle bg-pf-bg px-4 py-3">
          <p className="font-pf-mono text-[11px] leading-relaxed text-pf-text-muted">
            Verifique também a pasta de{" "}
            <span className="text-pf-text-secondary">spam</span>.
          </p>
        </div>

        <Link
          href="/login"
          className="mt-6 inline-flex items-center gap-1.5 font-pf-body text-sm font-semibold text-pf-accent transition-opacity hover:opacity-80"
        >
          <ArrowLeft className="h-4 w-4" />
          Voltar para o login
        </Link>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-pf-border bg-pf-surface p-8">
      <h1 className="font-pf-display text-2xl font-bold tracking-tight text-pf-text">
        Recuperar senha
      </h1>
      <p className="mt-1 font-pf-body text-sm text-pf-text-secondary">
        Informe seu e-mail e enviaremos um link para redefinir sua senha.
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-7 space-y-5" noValidate>
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

        <button
          type="submit"
          disabled={isSubmitting}
          className="flex w-full items-center justify-center gap-2 rounded-[8px] bg-pf-accent px-4 py-2.5 font-pf-body text-sm font-semibold text-pf-bg transition-shadow hover:shadow-[0_0_0_4px_rgba(202,255,51,0.15)] disabled:opacity-60"
        >
          {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
          {isSubmitting ? "Enviando…" : "Enviar link de recuperação"}
        </button>
      </form>

      <p className="mt-6 text-center font-pf-body text-sm text-pf-text-muted">
        Lembrou a senha?{" "}
        <Link href="/login" className="font-semibold text-pf-accent hover:underline">
          Voltar para o login
        </Link>
      </p>
    </div>
  );
}
