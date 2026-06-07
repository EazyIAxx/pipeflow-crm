"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";
import type { Stage } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import {
  MOCK_OWNERS,
  MOCK_PIPELINE_LEADS,
  STAGE_LABEL,
  STAGE_ORDER,
} from "./mock-data";

const schema = z.object({
  title: z.string().min(2, "Informe um título para o negócio"),
  value: z
    .string()
    .min(1, "Informe um valor")
    .refine((value) => !Number.isNaN(Number(value.replace(",", "."))), {
      message: "Valor inválido",
    }),
  leadId: z.string().min(1, "Selecione um lead"),
  ownerId: z.string().min(1, "Selecione um responsável"),
  stage: z.enum(STAGE_ORDER as [Stage, ...Stage[]]),
  dueDate: z.string().optional(),
});

export type DealFormValues = z.infer<typeof schema>;

interface DealFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Stage the form should default to (e.g. column "+ Negócio" was clicked from). */
  defaultStage: Stage;
  onSubmit: (values: DealFormValues) => void;
}

function buildDefaultValues(stage: Stage): DealFormValues {
  return {
    title: "",
    value: "",
    leadId: MOCK_PIPELINE_LEADS[0]?.id ?? "",
    ownerId: MOCK_OWNERS[0]?.id ?? "",
    stage,
    dueDate: "",
  };
}

export function DealForm({ open, onOpenChange, defaultStage, onSubmit }: DealFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<DealFormValues>({
    resolver: zodResolver(schema),
    defaultValues: buildDefaultValues(defaultStage),
  });

  useEffect(() => {
    if (open) {
      reset(buildDefaultValues(defaultStage));
    }
  }, [open, defaultStage, reset]);

  async function handleFormSubmit(values: DealFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 350));
    onSubmit(values);
    onOpenChange(false);
  }

  const leadId = watch("leadId");
  const ownerId = watch("ownerId");
  const stage = watch("stage");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className={cn(
          "border-pf-border bg-pf-surface font-pf-body text-pf-text sm:max-w-md",
          "[&_[data-slot=dialog-close]]:text-pf-text-secondary"
        )}
      >
        <DialogHeader>
          <DialogTitle className="font-pf-display text-lg font-bold tracking-tight text-pf-text">
            Novo negócio
          </DialogTitle>
          <DialogDescription className="text-pf-text-secondary">
            Cadastre um negócio e posicione-o em uma etapa do funil.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-2 flex flex-col gap-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="deal-title" className="text-pf-text-secondary">
              Título
            </Label>
            <Input
              id="deal-title"
              placeholder="Ex: Implantação de sistema ERP"
              aria-invalid={!!errors.title}
              className="border-pf-border bg-pf-surface-2 text-pf-text placeholder:text-pf-text-muted focus-visible:ring-pf-accent/40"
              {...register("title")}
            />
            {errors.title && <p className="text-xs text-pf-negative">{errors.title.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="deal-value" className="text-pf-text-secondary">
                Valor (R$)
              </Label>
              <Input
                id="deal-value"
                inputMode="decimal"
                placeholder="Ex: 15000"
                aria-invalid={!!errors.value}
                className="border-pf-border bg-pf-surface-2 font-pf-mono text-pf-text placeholder:text-pf-text-muted focus-visible:ring-pf-accent/40"
                {...register("value")}
              />
              {errors.value && <p className="text-xs text-pf-negative">{errors.value.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="deal-due-date" className="text-pf-text-secondary">
                Previsão de fechamento
              </Label>
              <Input
                id="deal-due-date"
                type="date"
                className="border-pf-border bg-pf-surface-2 text-pf-text [color-scheme:dark] focus-visible:ring-pf-accent/40"
                {...register("dueDate")}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-pf-text-secondary">Lead vinculado</Label>
            <Select
              value={leadId}
              onValueChange={(value) => setValue("leadId", value, { shouldValidate: true })}
            >
              <SelectTrigger className="border-pf-border bg-pf-surface-2 text-pf-text">
                <SelectValue placeholder="Selecione o lead" />
              </SelectTrigger>
              <SelectContent className="border-pf-border bg-pf-surface text-pf-text">
                {MOCK_PIPELINE_LEADS.map((lead) => (
                  <SelectItem key={lead.id} value={lead.id}>
                    {lead.name} — {lead.company}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.leadId && <p className="text-xs text-pf-negative">{errors.leadId.message}</p>}
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-pf-text-secondary">Responsável</Label>
              <Select
                value={ownerId}
                onValueChange={(value) => setValue("ownerId", value, { shouldValidate: true })}
              >
                <SelectTrigger className="border-pf-border bg-pf-surface-2 text-pf-text">
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent className="border-pf-border bg-pf-surface text-pf-text">
                  {MOCK_OWNERS.map((owner) => (
                    <SelectItem key={owner.id} value={owner.id}>
                      {owner.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.ownerId && <p className="text-xs text-pf-negative">{errors.ownerId.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label className="text-pf-text-secondary">Etapa</Label>
              <Select
                value={stage}
                onValueChange={(value) => setValue("stage", value as Stage, { shouldValidate: true })}
              >
                <SelectTrigger className="border-pf-border bg-pf-surface-2 text-pf-text">
                  <SelectValue placeholder="Selecione a etapa" />
                </SelectTrigger>
                <SelectContent className="border-pf-border bg-pf-surface text-pf-text">
                  {STAGE_ORDER.map((stageOption) => (
                    <SelectItem key={stageOption} value={stageOption}>
                      {STAGE_LABEL[stageOption]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter className="mt-2 gap-2 sm:gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-pf-border bg-transparent text-pf-text-secondary hover:bg-pf-surface-2 hover:text-pf-text"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="gap-1.5 rounded-[8px] bg-pf-accent font-pf-body font-medium text-pf-bg hover:bg-pf-accent/90"
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Criar negócio
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
