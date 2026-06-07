"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

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
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { LEAD_OWNERS, LEAD_STATUS_LABEL, type MockLead } from "@/lib/mock/leads";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter ao menos 2 caracteres"),
  email: z.string().email("E-mail inválido").or(z.literal("")),
  phone: z.string().optional(),
  company: z.string().min(1, "Informe a empresa"),
  jobTitle: z.string().optional(),
  status: z.enum(["active", "inactive", "converted"]),
  owner: z.string().min(1, "Selecione um responsável"),
});

export type LeadFormValues = z.infer<typeof schema>;

const EMPTY_VALUES: LeadFormValues = {
  name: "",
  email: "",
  phone: "",
  company: "",
  jobTitle: "",
  status: "active",
  owner: LEAD_OWNERS[0],
};

interface LeadFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead?: MockLead | null;
  onSubmit: (values: LeadFormValues) => void;
}

export function LeadForm({ open, onOpenChange, lead, onSubmit }: LeadFormProps) {
  const isEditing = !!lead;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<LeadFormValues>({
    resolver: zodResolver(schema),
    defaultValues: EMPTY_VALUES,
  });

  useEffect(() => {
    if (open) {
      reset(
        lead
          ? {
              name: lead.name,
              email: lead.email,
              phone: lead.phone,
              company: lead.company,
              jobTitle: lead.jobTitle,
              status: lead.status,
              owner: lead.owner,
            }
          : EMPTY_VALUES
      );
    }
  }, [open, lead, reset]);

  async function handleFormSubmit(values: LeadFormValues) {
    await new Promise((resolve) => setTimeout(resolve, 400));
    onSubmit(values);
    onOpenChange(false);
  }

  const status = watch("status");
  const owner = watch("owner");

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle>{isEditing ? "Editar lead" : "Novo lead"}</SheetTitle>
          <SheetDescription>
            {isEditing
              ? "Atualize as informações de contato deste lead."
              : "Cadastre um novo contato no seu pipeline."}
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="mt-6 flex flex-col gap-4" noValidate>
          <div className="space-y-1.5">
            <Label htmlFor="name">Nome</Label>
            <Input id="name" placeholder="Nome completo" aria-invalid={!!errors.name} {...register("name")} />
            {errors.name && <p className="text-xs text-destructive">{errors.name.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="company">Empresa</Label>
            <Input id="company" placeholder="Nome da empresa" aria-invalid={!!errors.company} {...register("company")} />
            {errors.company && <p className="text-xs text-destructive">{errors.company.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="jobTitle">Cargo</Label>
            <Input id="jobTitle" placeholder="Ex: Diretora Comercial" {...register("jobTitle")} />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" placeholder="contato@empresa.com" aria-invalid={!!errors.email} {...register("email")} />
              {errors.email && <p className="text-xs text-destructive">{errors.email.message}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone">Telefone</Label>
              <Input id="phone" placeholder="(11) 90000-0000" {...register("phone")} />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-1.5">
              <Label>Status</Label>
              <Select value={status} onValueChange={(value) => setValue("status", value as LeadFormValues["status"], { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(LEAD_STATUS_LABEL).map(([value, label]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label>Responsável</Label>
              <Select value={owner} onValueChange={(value) => setValue("owner", value, { shouldValidate: true })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o responsável" />
                </SelectTrigger>
                <SelectContent>
                  {LEAD_OWNERS.map((name) => (
                    <SelectItem key={name} value={name}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <SheetFooter className="mt-2 gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting} className="gap-1.5">
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {isEditing ? "Salvar alterações" : "Criar lead"}
            </Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
