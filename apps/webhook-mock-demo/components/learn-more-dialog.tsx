"use client";

import { useRef, useEffect, useState } from "react";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const PERSONAS = [
  {
    role: "Engineering Manager",
    emoji: "👔",
    focus: "Adoption dashboards, onboarding friction, support burden, team activation metrics.",
  },
  {
    role: "IC Developer",
    emoji: "👨‍💻",
    focus: "Quick setup, SDKs, copy-paste examples, debugging failed deliveries, payload path hints.",
  },
  {
    role: "Architect",
    emoji: "🏗️",
    focus: "Schema validation, audit trails, idempotency, security (signing, deduplication).",
  },
  {
    role: "Product Manager",
    emoji: "📋",
    focus: "Use-case templates, activation funnel, persona-based messaging, feature discovery.",
  },
  {
    role: "Data Engineer",
    emoji: "⚙️",
    focus: "Event schema catalog, downstream sinks (Kafka, warehouse), schema versioning.",
  },
  {
    role: "Data Analyst",
    emoji: "📊",
    focus: "Execution analytics, latency distributions, sample queries, pre-built dashboards.",
  },
];

const USE_CASE_TEMPLATES = [
  {
    name: "Error → Auto-triage",
    description: "Sentry issue alert triggers Devin to analyze stack trace and suggest fix or label severity.",
    services: ["Sentry"],
  },
  {
    name: "Deploy failure → Rollback",
    description: "Vercel deployment error triggers Devin to assess and optionally rollback or notify on-call.",
    services: ["Vercel"],
  },
  {
    name: "Issue opened → Auto-label",
    description: "GitHub issue webhook triggers Devin to read the issue and add labels or assign.",
    services: ["GitHub"],
  },
  {
    name: "Compliance drift → Alert",
    description: "Vanta control failure triggers Devin to summarize and route to security team.",
    services: ["Vanta"],
  },
  {
    name: "Form response → Enrich & Route",
    description: "Typeform submission triggers Devin to parse feedback and create a ticket or notify PM.",
    services: ["Typeform"],
  },
  {
    name: "Detection → Triage",
    description: "CrowdStrike detection triggers Devin to summarize and recommend triage or escalation.",
    services: ["CrowdStrike"],
  },
];

type LearnMoreDialogProps = {
  open: boolean;
  onClose: () => void;
};

type TabId = "personas" | "templates";

export function LearnMoreDialog({ open, onClose }: LearnMoreDialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [activeTab, setActiveTab] = useState<TabId>("personas");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const handleClose = () => onClose();
    dialog.addEventListener("close", handleClose);
    return () => dialog.removeEventListener("close", handleClose);
  }, [onClose]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open) {
      dialog.showModal();
      setActiveTab("personas");
    } else {
      dialog.close();
    }
  }, [open]);

  const handleDialogClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      onClick={handleDialogClick}
      className={cn(
        "fixed inset-0 z-50 m-0 h-screen w-screen max-h-none max-w-none border-0 bg-transparent p-0",
        "[&:not([open])]:hidden [&[open]]:flex [&[open]]:items-center [&[open]]:justify-center"
      )}
    >
      <div
        className="fixed inset-0 bg-background/80 backdrop-blur-sm -z-10 cursor-default"
        aria-hidden
        onClick={onClose}
      />
      <div
        className={cn(
          "relative flex max-h-[85vh] min-h-[320px] w-[90vw] max-w-2xl flex-col overflow-hidden rounded-xl border border-border/60 bg-background text-foreground shadow-xl",
          "sm:max-w-2xl"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex flex-1 flex-col min-h-0">
          <div className="flex shrink-0 items-center justify-between border-b border-border/60 px-5 py-3">
          <h2 className="text-base font-semibold">Learn more</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
            aria-label="Close"
          >
              ✕
          </button>
          </div>

          <div className="flex shrink-0 border-b border-border/60">
          <button
            type="button"
            onClick={() => setActiveTab("personas")}
            className={cn(
              "cursor-pointer",
              "px-5 py-3 text-sm font-medium transition-colors",
              activeTab === "personas"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            Personas
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("templates")}
            className={cn(
              "cursor-pointer",
              "px-5 py-3 text-sm font-medium transition-colors",
              activeTab === "templates"
                ? "text-foreground border-b-2 border-primary"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
              Templates
          </button>
          </div>

          <div className="flex-1 min-h-0 overflow-y-auto overscroll-contain px-5 py-4">
          {activeTab === "personas" && (
            <div className="grid gap-2.5 sm:grid-cols-2">
              {PERSONAS.map((p) => (
                <div
                  key={p.role}
                  className="rounded-lg border border-border/60 bg-muted/20 p-2.5 text-sm"
                >
                  <div className="flex items-center gap-2 font-medium mb-0.5">
                    <span>{p.emoji}</span>
                    <span>{p.role}</span>
                  </div>
                  <p className="text-muted-foreground text-xs leading-relaxed">{p.focus}</p>
                </div>
              ))}
            </div>
          )}
          {activeTab === "templates" && (
            <div className="space-y-2.5">
              {USE_CASE_TEMPLATES.map((t) => (
                <div
                  key={t.name}
                  className="rounded-lg border border-border/60 bg-card/50 p-2.5"
                >
                  <div className="font-medium text-sm">{t.name}</div>
                  <p className="text-muted-foreground text-xs mt-1">{t.description}</p>
                  <div className="flex flex-wrap gap-1 mt-2">
                    {t.services.map((s) => (
                      <span
                        key={s}
                        className="rounded bg-primary/10 px-1.5 py-0.5 text-xs text-primary"
                      >
                        {s}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
          </div>
        </div>
      </div>
    </dialog>
  );
}

type LearnMoreButtonProps = {
  onClick: () => void;
  className?: string;
};

export function LearnMoreButton({ onClick, className }: LearnMoreButtonProps) {
  return (
    <Button
      variant="outline"
      size="sm"
      onClick={onClick}
      className={cn("gap-2", className)}
    >
      <Info className="h-4 w-4" />
      Learn more
    </Button>
  );
}
