"use client";

import { useEffect, useRef, useState } from "react";

import { cn } from "@/lib/utils";

interface RevealProps {
  children: React.ReactNode;
  /** Stagger delay in milliseconds, applied via transition-delay (brand guide: 0.1s, 0.2s, 0.3s increments). */
  delayMs?: number;
  className?: string;
}

/** Translate-Y(16px) + opacity-0 -> translate-Y(0) + opacity-100 on scroll into view, per brand guide v2 "Reveal on Scroll". */
export function Reveal({ children, delayMs = 0, className }: RevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.disconnect();
        }
      },
      { threshold: 0.15 }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delayMs}ms` }}
      className={cn(
        "transition-[opacity,transform] duration-[600ms] ease-out",
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4",
        className
      )}
    >
      {children}
    </div>
  );
}
