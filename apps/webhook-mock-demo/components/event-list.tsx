"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, Loader2, ChevronRight } from "lucide-react";
import type { Event } from "@/lib/events";
import type { ServiceId } from "@/lib/service-metadata";
import { SERVICE_METADATA } from "@/lib/service-metadata";
import { cn } from "@/lib/utils";

type EventListProps = {
  serviceId: ServiceId;
  events: Event[];
  webhookUrl: string;
  sending: string | null;
  onSend: (event: Event) => void;
};

export function EventList({
  serviceId,
  events,
  webhookUrl,
  sending,
  onSend,
}: EventListProps) {
  const meta = SERVICE_METADATA[serviceId];
  const Icon = meta?.icon;

  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center gap-2">
        {Icon && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white",
              meta.gradient
            )}
          >
            <Icon className="h-4 w-4" />
          </div>
        )}
        <h3 className="font-semibold">{meta?.label ?? serviceId} events</h3>
      </div>

      <ScrollArea className="h-[420px] pr-3">
        <div className="space-y-2">
          {events.map((event) => {
            const eventKey = `${serviceId}-${event.id}`;
            const isSending = sending === eventKey;
            const canSend = webhookUrl.trim().length > 0;

            return (
              <div
                key={event.id}
                className={cn(
                  "group flex items-center gap-3 rounded-xl border bg-card/60 p-4 transition-all",
                  "hover:border-border hover:bg-card hover:shadow-sm"
                )}
              >
                <div className="min-w-0 flex-1">
                  <h4 className="font-medium text-foreground">{event.name}</h4>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {event.desc}
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={() => onSend(event)}
                  disabled={!canSend || isSending}
                  className={cn(
                    "shrink-0 gap-1.5 transition-all",
                    canSend &&
                      "group-hover:scale-105 group-hover:shadow-md"
                  )}
                >
                  {isSending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      Send
                      <ChevronRight className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
            );
          })}
        </div>
      </ScrollArea>
    </div>
  );
}
