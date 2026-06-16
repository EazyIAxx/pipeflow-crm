"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, UserPlus } from "lucide-react";
import { Role } from "@prisma/client";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const schema = z.object({
  email: z.string().email("Digite um e-mail válido"),
  role: z.nativeEnum(Role),
});
type FormValues = z.infer<typeof schema>;

interface InviteMemberDialogProps {
  workspaceSlug: string;
  onSuccess: () => void;
  disabled?: boolean;
}

export function InviteMemberDialog({ workspaceSlug, onSuccess, disabled }: InviteMemberDialogProps) {
  const [open, setOpen] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", role: "MEMBER" },
  });

  const role = watch("role");

  const inviteMutation = trpc.workspace.invite.useMutation({
    onSuccess: () => {
      reset();
      onSuccess();
      setOpen(false);
      toast.success("Convite enviado com sucesso!");
    },
    onError: (err) => {
      setServerError(err.message);
    },
  });

  function onSubmit(values: FormValues) {
    setServerError(null);
    inviteMutation.mutate({ workspaceSlug, email: values.email, role: values.role });
  }

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (!next) {
      reset();
      setServerError(null);
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button size="sm" variant="outline" className="gap-1.5" disabled={disabled}>
          <UserPlus className="h-3.5 w-3.5" />
          Convidar membro
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Convidar membro</DialogTitle>
          <DialogDescription>
            O convidado receberá um e-mail com o link de acesso ao workspace.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4 mt-1">
            <div className="space-y-1.5">
              <Label htmlFor="invite-email">E-mail</Label>
              <Input
                id="invite-email"
                type="email"
                placeholder="colega@empresa.com"
                {...register("email")}
              />
              {errors.email && (
                <p className="text-xs text-destructive">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label>Papel</Label>
              <Select
                value={role}
                onValueChange={(v) => setValue("role", v as Role, { shouldValidate: true })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MEMBER">Membro — acesso padrão</SelectItem>
                  <SelectItem value="ADMIN">Admin — gerencia membros e configurações</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {serverError && (
              <p className="text-xs text-destructive rounded-md bg-destructive/10 px-3 py-2">
                {serverError}
              </p>
            )}

            <DialogFooter className="gap-2 mt-1">
              <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={inviteMutation.isPending} className="gap-1.5">
                {inviteMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Enviar convite
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
