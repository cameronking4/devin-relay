"use client";

import { motion } from "framer-motion";
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

const listVariants = {
  hidden: { opacity: 0 },
  visible: (i = 1) => ({
    opacity: 1,
    transition: { staggerChildren: 0.03, delayChildren: 0.05 },
  }),
};

const itemVariants = {
  hidden: { opacity: 0, x: -8 },
  visible: { opacity: 1, x: 0 },
};

export function EventList({
  serviceId,
  events,
  webhookUrl,
  sending,
  onSend,
}: EventListProps) {
  const meta = SERVICE_METADATA[serviceId];

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      <div className="mb-3 flex shrink-0 items-center gap-2">
        {meta && (
          <div
            className={cn(
              "flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br text-white text-sm",
              meta.gradient
            )}
          >
            {meta.label.charAt(0)}
          </div>
        )}
        <h3 className="font-semibold text-foreground">
          {meta?.label ?? serviceId} events
        </h3>
      </div>

      <ScrollArea className="min-h-0 flex-1 pr-3">
        <motion.div
          variants={listVariants}
          initial="hidden"
          animate="visible"
          className="space-y-2"
        >
          {events.map((event) => {
            const eventKey = `${serviceId}-${event.id}`;
            const isSending = sending === eventKey;
            const canSend = webhookUrl.trim().length > 0;
            const emoji = event.emoji ?? "📌";

            return (
              <motion.div
                key={event.id}
                variants={itemVariants}
                layout
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border bg-card/60 p-4 transition-all",
                  "hover:border-border hover:bg-card hover:shadow-md"
                )}
              >
                <div className="flex gap-3 min-w-0">
                  <span className="text-lg shrink-0" aria-hidden>
                    {emoji}
                  </span>
                  <div className="min-w-0 flex-1">
                    <h4 className="font-medium text-foreground">{event.name}</h4>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {event.desc}
                    </p>
                  </div>
                </div>
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={() => onSend(event)}
                    disabled={!canSend || isSending}
                    className={cn(
                      "gap-1.5 transition-all",
                      canSend && "group-hover:scale-105 group-hover:shadow-md"
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
              </motion.div>
            );
          })}
        </motion.div>
      </ScrollArea>
    </div>
  );
}
