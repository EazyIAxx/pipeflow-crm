import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
        },
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },

        // PipeFlow Brand Guide v2 — "Editorial Brutalist x Fintech"
        // Isolated visual-island tokens for the Kanban board only (flat hex,
        // no HSL indirection). Additive — do not remove existing tokens above.
        "pf-bg": "#0C0C0E",
        "pf-surface": "#141416",
        "pf-surface-2": "#1A1A1E",
        "pf-border": "#2A2A2E",
        "pf-border-subtle": "#1E1E22",
        "pf-text": "#E8E8E8",
        "pf-text-secondary": "#8A8A8F",
        "pf-text-muted": "#555559",
        "pf-accent": "#CAFF33",
        "pf-positive": "#2ED573",
        "pf-negative": "#FF4757",
        "pf-warm": "#FF6B35",
        "pf-cool": "#5B7FFF",
        // Stage-specific aliases mapped from the Stage enum
        "pf-stage-new-lead": "#5B7FFF",
        "pf-stage-contacted": "#00B4D8",
        "pf-stage-proposal": "#CAFF33",
        "pf-stage-negotiation": "#FF6B35",
        "pf-stage-won": "#2ED573",
        "pf-stage-lost": "#FF4757",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      fontFamily: {
        sans: ["var(--font-inter)", "system-ui", "sans-serif"],
        // PipeFlow Brand Guide v2 fonts — loaded locally on the pipeline route
        // segment only (see app/(app)/[workspaceSlug]/pipeline/page.tsx)
        "pf-display": ["var(--font-pf-display)", "system-ui", "sans-serif"],
        "pf-body": ["var(--font-pf-body)", "system-ui", "sans-serif"],
        "pf-mono": ["var(--font-pf-mono)", "ui-monospace", "monospace"],
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
