"use client";

import { cn } from "@/lib/utils";
import { SERVICE_METADATA, type ServiceId } from "@/lib/service-metadata";

type ServiceGridProps = {
  selectedService: ServiceId | null;
  onSelect: (id: ServiceId) => void;
  eventCounts: Record<ServiceId, number>;
};

export function ServiceGrid({
  selectedService,
  onSelect,
  eventCounts,
}: ServiceGridProps) {
  const services = Object.values(SERVICE_METADATA);

  return (
    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {services.map((meta) => {
        const Icon = meta.icon;
        const isSelected = selectedService === meta.id;
        const count = eventCounts[meta.id] ?? 0;

        return (
          <button
            key={meta.id}
            type="button"
            onClick={() => onSelect(meta.id)}
            className={cn(
              "group flex flex-col items-start gap-2 rounded-xl border p-4 text-left transition-all duration-200",
              "hover:scale-[1.02] hover:shadow-md focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              isSelected
                ? `border-2 ${meta.borderColor} ${meta.bgLight} shadow-md ring-2 ring-primary/20`
                : "border-border/70 bg-card/80 hover:border-border hover:bg-card"
            )}
          >
            <div
              className={cn(
                "flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br",
                meta.gradient,
                "text-white shadow-sm"
              )}
            >
              <Icon className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="font-semibold text-foreground">{meta.label}</span>
                {count > 0 && (
                  <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-xs font-medium text-muted-foreground">
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
