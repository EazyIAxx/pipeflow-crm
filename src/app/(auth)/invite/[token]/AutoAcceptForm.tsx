"use client";

import { useEffect, useRef, useState } from "react";
import { Loader2 } from "lucide-react";

interface AutoAcceptFormProps {
  action: (formData: FormData) => Promise<void>;
  userEmail: string;
}

export function AutoAcceptForm({ action, userEmail }: AutoAcceptFormProps) {
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      formRef.current?.requestSubmit();
    }, 300);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <p className="text-sm text-pf-text-secondary text-center">
        Logado como <span className="font-medium text-pf-text">{userEmail}</span>
      </p>
      <form
        ref={formRef}
        action={action}
        onSubmit={() => setError(null)}
      >
        <button
          type="submit"
          className="w-full rounded-xl bg-pf-accent py-3 font-pf-body font-semibold text-pf-bg text-sm transition-opacity hover:opacity-90 active:opacity-75 flex items-center justify-center gap-2"
        >
          <Loader2 className="h-4 w-4 animate-spin" />
          Entrando no workspace…
        </button>
      </form>
      {error && (
        <p className="text-xs text-pf-negative text-center">{error}</p>
      )}
    </div>
  );
}
