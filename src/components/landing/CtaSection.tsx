import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Reveal } from "./Reveal";

export function CtaSection() {
  return (
    <section className="px-6 py-20 md:py-28">
      <Reveal className="mx-auto max-w-4xl">
        <div className="flex flex-col items-center gap-6 rounded-[12px] bg-pf-accent px-8 py-14 text-center md:px-16">
          <h2 className="font-pf-display text-3xl font-extrabold tracking-[-1.5px] text-pf-bg md:text-[42px]">
            Comece a organizar seu funil hoje
          </h2>
          <p className="max-w-xl font-pf-body text-base leading-[1.65] text-pf-bg/70">
            Crie sua conta gratuita em menos de dois minutos — sem cartão de crédito,
            sem complicação.
          </p>
          <Link
            href="/signup"
            className="group inline-flex h-11 items-center justify-center gap-2 rounded-[8px] bg-pf-bg px-7 font-pf-body text-sm font-semibold text-pf-accent transition-transform hover:-translate-y-0.5"
          >
            Começar grátis
            <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </Reveal>
    </section>
  );
}
