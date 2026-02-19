"use client";

import { cn } from "@/lib/utils";
import { SERVICE_METADATA, type ServiceId } from "@/lib/service-metadata";

type ServiceGridProps = {
  selectedService: ServiceId | null;
  onSelect: (id: ServiceId) => void;
  eventCounts: Record<ServiceId, number>;
  /** When true (side-by-side layout), use 3-column grid and compact cards */
  sideBySide?: boolean;
};

const SERVICE_EMOJIS: Record<ServiceId, string> = {
  sentry: "🐛",
  vercel: "▲",
  prometheus: "📊",
  datadog: "🐶",
  grafana: "📈",
  pagerduty: "📟",
  github: "🐙",
  vanta: "📋",
  crowdstrike: "🛡️",
  linear: "📋",
  posthog: "🦔",
  logflare: "📜",
  otel: "📡",
  azure_monitor: "📊",
  azure_devops: "🔷",
  typeform: "📝",
  cloudwatch: "☁️",
  dynatrace: "📊",
};

export function ServiceGrid({
  selectedService,
  onSelect,
  eventCounts,
  sideBySide = false,
}: ServiceGridProps) {
  const services = Object.values(SERVICE_METADATA);

  return (
    <div
      className={sideBySide
        ? "grid grid-cols-3 gap-2 xl:gap-2"
        : "grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5"
      }
    >
      {services.map((meta) => {
        const isSelected = selectedService === meta.id;
        const count = eventCounts[meta.id] ?? 0;
        const emoji = SERVICE_EMOJIS[meta.id] ?? "📦";

        return (
          <button
            key={meta.id}
            type="button"
            onClick={() => onSelect(meta.id)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-xl border text-left cursor-pointer",
              sideBySide ? "p-3 gap-1.5" : "p-4",
              "transition-[box-shadow,border-color,background-color] duration-150 ease-out",
              "hover:shadow-lg hover:shadow-primary/5 active:scale-[0.99] focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background",
              isSelected
                ? `border-2 ${meta.borderColor} ${meta.bgLight} shadow-md ring-2 ring-primary/30`
                : "border-border/70 bg-card/80 hover:border-border hover:bg-card"
            )}
          >
            <div
              className={cn(
                "flex items-center justify-center rounded-lg bg-gradient-to-br text-white shadow-sm",
                meta.gradient,
                sideBySide ? "h-8 w-8 text-base" : "h-10 w-10 text-lg"
              )}
            >
              {emoji}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{meta.label}</span>
                {count > 0 && (
                  <span className="shrink-0 rounded-full bg-primary/20 px-2 py-0.5 text-xs font-medium text-primary">
                    {count}
                  </span>
                )}
              </div>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">
                {meta.description}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
}
