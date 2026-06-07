"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { ACTIVITY_TYPE_LABEL, type ActivityType } from "@/lib/mock/leads";

const schema = z.object({
  type: z.enum(["CALL", "EMAIL", "MEETING", "NOTE"]),
  description: z.string().min(3, "Descreva a atividade com mais detalhes"),
  date: z.string().min(1, "Informe a data"),
});

export type ActivityFormValues = z.infer<typeof schema>;

function nowForInput() {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 16);
}

interface ActivityFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: ActivityFormValues) => void;
}

export function ActivityForm({ open, onOpenChange, onSubmit }: ActivityFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ActivityFormValues>({
    resolver: zodResolver(schema),
    defaultValues: { type: "NOTE", description: "", date: nowForInput() },
  });

  useEffect(() => {
    if (open) {
      reset({ type: "NOTE", description: "", date: nowForInput() });
    }
  }, [open, reset]);

  async function handleFormSubmit(values: ActivityFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    onSubmit(values);
    onOpenChange(false);
  }

  const type = watch("type");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova atividade</DialogTitle>
          <DialogDescription>Registre uma interação com este lead na timeline.</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4" noValidate>
          <div className="space-y-1.5">
            <Label>Tipo</Label>
            <Select value={type} onValueChange={(value) => setValue("type", value as ActivityType, { shouldValidate: true })}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(ACTIVITY_TYPE_LABEL).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              placeholder="O que aconteceu nessa interação?"
              rows={4}
              aria-invalid={!!errors.description}
              {...register("description")}
            />
            {errors.description && <p className="text-xs text-destructive">{errors.description.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="date">Data e hora</Label>
            <input
              id="date"
              type="datetime-local"
              aria-invalid={!!errors.date}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              {...register("date")}
            />
            {errors.date && <p className="text-xs text-destructive">{errors.date.message}</p>}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Registrar atividade
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
