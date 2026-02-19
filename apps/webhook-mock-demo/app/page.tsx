"use client";

import { useState, useEffect, useMemo } from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WebhookHero } from "@/components/webhook-hero";
import { ServiceGrid } from "@/components/service-grid";
import { EventList } from "@/components/event-list";
import { ResponseLog, type ResponseLogEntry } from "@/components/response-log";
import { LearnMoreDialog, LearnMoreButton } from "@/components/learn-more-dialog";
import { RelayIcon } from "@/components/relay-icon";
import { useMediaQuery } from "@/hooks/use-media-query";
import { EVENTS } from "@/lib/events";
import { SERVICE_METADATA, type ServiceId } from "@/lib/service-metadata";
import type { Event } from "@/lib/events";
import { cn } from "@/lib/utils";

const fadeIn = { initial: { opacity: 0, y: 12 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

function getEventCounts(): Record<ServiceId, number> {
  const counts = {} as Record<ServiceId, number>;
  for (const id of Object.keys(SERVICE_METADATA) as ServiceId[]) {
    counts[id] = EVENTS[id]?.length ?? 0;
  }
  return counts;
}

export default function Home() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedService, setSelectedService] = useState<ServiceId | null>(null);
  const [responseLog, setResponseLog] = useState<ResponseLogEntry[]>([]);
  const [sending, setSending] = useState<string | null>(null);
  const [eventSearch, setEventSearch] = useState("");
  const [learnMoreOpen, setLearnMoreOpen] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("webhook-url");
    if (saved) setWebhookUrl(saved);
  }, []);

  useEffect(() => {
    if (webhookUrl) localStorage.setItem("webhook-url", webhookUrl);
  }, [webhookUrl]);

  const currentEvents = useMemo(() => {
    if (!selectedService) return [];
    const events = EVENTS[selectedService] ?? [];
    const q = eventSearch.trim().toLowerCase();
    if (!q) return events;
    return events.filter(
      (e) =>
        e.name.toLowerCase().includes(q) ||
        e.desc.toLowerCase().includes(q) ||
        e.id.toLowerCase().includes(q)
    );
  }, [selectedService, eventSearch]);

  const eventCounts = useMemo(getEventCounts, []);
  const isSideBySide = useMediaQuery("(min-width: 1280px)");

  const handleSendEvent = async (event: Event) => {
    if (!webhookUrl || !selectedService) return;

    const eventKey = `${selectedService}-${event.id}`;
    setSending(eventKey);

    try {
      const response = await fetch("/api/send-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          webhookUrl,
          service: selectedService,
          eventType: event.id,
        }),
      });

      const result = await response.json();

      const logEntry: ResponseLogEntry = {
        event: event.name,
        service: selectedService,
        status: result.status ?? response.status,
        statusText: result.statusText ?? response.statusText,
        body: result.body,
        timestamp: new Date().toISOString(),
        ok: result.ok !== undefined ? result.ok : response.ok,
      };

      setResponseLog((prev) => [logEntry, ...prev]);
    } catch (error) {
      const logEntry: ResponseLogEntry = {
        event: event.name,
        service: selectedService,
        status: 0,
        statusText: error instanceof Error ? error.message : "Unknown error",
        body: null,
        timestamp: new Date().toISOString(),
        ok: false,
      };
      setResponseLog((prev) => [logEntry, ...prev]);
    } finally {
      setSending(null);
    }
  };

  return (
    <div className={cn(
      "bg-background text-foreground flex flex-col w-full min-w-0 max-w-full overflow-x-hidden",
      isSideBySide ? "h-screen overflow-hidden" : "min-h-screen"
    )}>
      {/* Header */}
      <motion.header
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="shrink-0 border-b border-border/60 bg-card/50 backdrop-blur-xl supports-[backdrop-filter]:bg-card/40"
      >
        <div className="mx-auto flex max-w-full items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 via-purple-600 to-indigo-600 text-white shadow-lg shadow-violet-500/30"
              aria-hidden
            >
              <RelayIcon className="h-6 w-6 fill-white" />
            </motion.div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Relay Production Signals Library
              </h1>
              <p className="text-sm text-muted-foreground">
                Test Relay <span className="text-xs text-foreground/50 align-baseline">(for Devin){" "}</span>{" "}with production-ready mocked webhook events · 18 services · 95+ events
              </p>
            </div>
          </div>
          <LearnMoreButton onClick={() => setLearnMoreOpen(true)} />
        </div>
      </motion.header>

      <LearnMoreDialog open={learnMoreOpen} onClose={() => setLearnMoreOpen(false)} />

      <main className={cn(
        "w-full min-w-0 max-w-full px-4 py-8 sm:px-6 lg:px-8 flex-1",
        isSideBySide && "overflow-hidden flex flex-col min-h-0"
      )}>
        {/* Responsive: Steps 1+2 left, Step 3 right on xl; stacked on smaller */}
        <div className={cn(
          "grid gap-8 xl:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)] xl:gap-10 xl:items-stretch",
          isSideBySide && "flex-1 min-h-0 xl:overflow-hidden"
        )}>
          {/* Left: Step 1 + Step 2 - fits viewport, scroll internally when side-by-side */}
          <div className={cn(
            "space-y-8",
            isSideBySide && "xl:flex xl:flex-col xl:min-h-0 xl:overflow-hidden"
          )}>
            <motion.section {...fadeIn} className={cn(isSideBySide && "xl:shrink-0")}>
              <h2 className="mb-3 flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>Step 1</span>
                <span>·</span>
                <span>Webhook URL</span>
                <span className="text-base">🔗</span>
              </h2>
              <WebhookHero
                webhookUrl={webhookUrl}
                onWebhookChange={setWebhookUrl}
                hasEvents={!!selectedService}
              />
            </motion.section>

            <motion.section
              initial="hidden"
              animate="visible"
              variants={{ visible: { transition: { staggerChildren: 0.03 } } }}
              className={cn(isSideBySide && "xl:flex-1 xl:min-h-0 xl:flex xl:flex-col xl:overflow-hidden")}
            >
              <h2 className="mb-4 flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground">
                <span>Step 2</span>
                <span>·</span>
                <span>Pick a service</span>
                <span className="text-base">📦</span>
              </h2>
              <div className={cn(
                "rounded-2xl border border-border/60 bg-card/50 p-4 shadow-sm",
                isSideBySide && "flex-1 min-h-0 overflow-y-auto scrollbar-hide"
              )}>
              <ServiceGrid
                selectedService={selectedService}
                onSelect={setSelectedService}
                eventCounts={eventCounts}
                sideBySide={isSideBySide}
              />
              </div>
            </motion.section>
          </div>

          {/* Right: Step 3 - full height when side-by-side */}
          <motion.section {...fadeIn} className={cn(
            "min-w-0 flex flex-col",
            isSideBySide && "xl:min-h-0"
          )}>
          <h2 className="mb-4 flex shrink-0 items-center gap-2 text-sm font-medium text-muted-foreground">
            <span>Step 3</span>
            <span>·</span>
            <span>Fire events</span>
            <span className="text-base">🚀</span>
          </h2>

          {!selectedService ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              layout={false}
              className={cn(
                "flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/10 py-20 text-center min-h-0",
                isSideBySide && "xl:flex-1"
              )}
            >
              <span className="mb-3 text-4xl">📋</span>
              <p className="text-sm font-medium text-foreground">
                Select a service above to browse events
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                18 services · 95+ production-ready events
              </p>
            </motion.div>
          ) : (
            <div
              className={cn(
                "grid gap-8 lg:grid-cols-2 min-w-0",
                isSideBySide && "xl:flex-1 xl:min-h-0 xl:grid-rows-1"
              )}
            >
              {/* Events */}
              <div className={cn(
                "rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm flex flex-col min-h-0",
                isSideBySide && "xl:min-h-0 xl:overflow-hidden"
              )}>
                {currentEvents.length > 0 && (
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <Input
                        placeholder="Search events..."
                        value={eventSearch}
                        onChange={(e) => setEventSearch(e.target.value)}
                        className="pl-9"
                      />
                    </div>
                  </div>
                )}
                <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", isSideBySide && "xl:min-h-0")}>
                <EventList
                  serviceId={selectedService}
                  events={currentEvents}
                  webhookUrl={webhookUrl}
                  sending={sending}
                  onSend={handleSendEvent}
                />
                {selectedService && currentEvents.length === 0 && (
                  <div className="py-12 text-center text-sm text-muted-foreground">
                    {eventSearch
                      ? "No events match your search"
                      : "No events for this service"}
                  </div>
                )}
                </div>
              </div>

              {/* Response Log */}
              <div className={cn(
                "rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm flex flex-col min-h-0",
                isSideBySide && "xl:min-h-0 xl:overflow-hidden"
              )}>
                <ResponseLog entries={responseLog} fillHeight={isSideBySide} />
              </div>
            </div>
          )}
          </motion.section>
        </div>
      </main>

      <motion.footer
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
        className={cn(
          "border-t border-border/60 py-6 shrink-0",
          !isSideBySide && "mt-16"
        )}
      >
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Mock payloads follow official docs · Webhook URL stored in localStorage
        </div>
      </motion.footer>
    </div>
  );
}
