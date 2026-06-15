"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2, Settings } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const schema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
});
type FormValues = z.infer<typeof schema>;

interface WorkspaceSettingsProps {
  workspaceSlug: string;
  initialName: string;
  isAdmin: boolean;
}

export function WorkspaceSettings({ workspaceSlug, initialName, isAdmin }: WorkspaceSettingsProps) {
  const utils = trpc.useUtils();
  const [saved, setSaved] = useState(false);

  const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { name: initialName },
  });

  useEffect(() => {
    reset({ name: initialName });
  }, [initialName, reset]);

  const updateMutation = trpc.workspace.update.useMutation({
    onSuccess: () => {
      utils.workspace.list.invalidate();
      utils.workspace.getBySlug.invalidate({ slug: workspaceSlug });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    },
  });

  function onSubmit(values: FormValues) {
    updateMutation.mutate({ workspaceSlug, name: values.name });
  }

  return (
    <div className="rounded-lg border border-border bg-card p-5 flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <Settings className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-semibold">Workspace</span>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="ws-name" className="text-xs text-muted-foreground">
            Nome do workspace
          </Label>
          <Input
            id="ws-name"
            placeholder="Meu workspace"
            disabled={!isAdmin}
            {...register("name")}
          />
          {errors.name && (
            <p className="text-xs text-destructive">{errors.name.message}</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <Label className="text-xs text-muted-foreground">Slug (URL)</Label>
          <p className="text-sm font-mono text-muted-foreground">{workspaceSlug}</p>
        </div>

        {isAdmin && (
          <div className="flex items-center gap-3 pt-1">
            <Button
              type="submit"
              size="sm"
              disabled={!isDirty || updateMutation.isPending}
              className="w-fit"
            >
              {updateMutation.isPending && <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />}
              Salvar
            </Button>
            {saved && (
              <span className="text-xs text-green-600 dark:text-green-400">Salvo!</span>
            )}
            {updateMutation.isError && (
              <span className="text-xs text-destructive">
                {updateMutation.error.message}
              </span>
            )}
          </div>
        )}
      </form>
    </div>
  );
}
