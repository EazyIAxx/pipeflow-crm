"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { createWorkspace } from "./actions";

function toSlug(value: string) {
  return value
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 48);
}

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  slug: z
    .string()
    .min(2, "Slug deve ter ao menos 2 caracteres")
    .max(48, "Slug muito longo")
    .regex(/^[a-z0-9-]+$/, "Use apenas letras minúsculas, números e hífens"),
});

type FormValues = z.infer<typeof schema>;

export function OnboardingForm() {
  const [slugEdited, setSlugEdited] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: "", slug: "" },
  });

  const name = watch("name");

  useEffect(() => {
    if (!slugEdited) {
      setValue("slug", toSlug(name), { shouldValidate: !!name });
    }
  }, [name, slugEdited, setValue]);

  async function onSubmit(data: FormValues) {
    setServerError(null);
    const result = await createWorkspace(data.name, data.slug);
    if (result?.error) {
      setServerError(result.error);
    }
    // On success, createWorkspace redirects server-side
  }

  const slugValue = watch("slug");

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex justify-center">
          <Link href="/" className="inline-flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary flex items-center justify-center shadow-sm">
              <span className="text-primary-foreground font-bold text-sm leading-none">P</span>
            </div>
            <span className="text-xl font-bold text-foreground">PipeFlow</span>
          </Link>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-xl">Criar seu workspace</CardTitle>
            <CardDescription>
              Um workspace reúne sua equipe, leads e pipeline num só lugar.
            </CardDescription>
          </CardHeader>

          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
              {serverError && (
                <div className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                  {serverError}
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="name">Nome da empresa</Label>
                <Input
                  id="name"
                  placeholder="Acme Ltda"
                  autoFocus
                  aria-invalid={!!errors.name}
                  {...register("name")}
                />
                {errors.name && (
                  <p className="text-xs text-destructive">{errors.name.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="slug">Endereço do workspace</Label>
                <div className="flex items-center rounded-md border border-input bg-muted/40 focus-within:ring-2 focus-within:ring-ring focus-within:ring-offset-2 focus-within:ring-offset-background overflow-hidden">
                  <span className="pl-3 pr-1 text-sm text-muted-foreground select-none whitespace-nowrap">
                    pipeflow.app/
                  </span>
                  <input
                    id="slug"
                    className="flex-1 bg-transparent py-2 pr-3 text-sm outline-none placeholder:text-muted-foreground"
                    placeholder="acme-ltda"
                    aria-invalid={!!errors.slug}
                    {...register("slug", {
                      onChange: () => setSlugEdited(true),
                    })}
                  />
                </div>
                {errors.slug ? (
                  <p className="text-xs text-destructive">{errors.slug.message}</p>
                ) : slugValue ? (
                  <p className="text-xs text-muted-foreground">
                    Seu workspace ficará em{" "}
                    <span className="font-medium text-foreground">
                      pipeflow.app/{slugValue}
                    </span>
                  </p>
                ) : null}
              </div>

              <Button type="submit" className="w-full" disabled={isSubmitting}>
                {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isSubmitting ? "Criando workspace…" : "Criar workspace"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          Plano gratuito: 50 leads e 2 colaboradores.{" "}
          <span className="text-primary">Upgrade disponível a qualquer momento.</span>
        </p>
      </div>
    </div>
  );
}
