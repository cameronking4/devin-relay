"use client";

import { useState, useEffect, useMemo } from "react";
import { Search, Sparkles } from "lucide-react";
import { Input } from "@/components/ui/input";
import { WebhookHero } from "@/components/webhook-hero";
import { ServiceGrid } from "@/components/service-grid";
import { EventList } from "@/components/event-list";
import { ResponseLog, type ResponseLogEntry } from "@/components/response-log";
import { EVENTS } from "@/lib/events";
import { SERVICE_METADATA, type ServiceId } from "@/lib/service-metadata";
import type { Event } from "@/lib/events";

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
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground sm:text-2xl">
                Webhook Mock
              </h1>
              <p className="text-sm text-muted-foreground">
                Test Relay with production-ready events
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Hero: Webhook URL */}
        <section className="mb-10">
          <h2 className="mb-3 text-sm font-medium text-muted-foreground">
            Step 1 · Webhook URL
          </h2>
          <WebhookHero
            webhookUrl={webhookUrl}
            onWebhookChange={setWebhookUrl}
            hasEvents={!!selectedService}
          />
        </section>

        {/* Services */}
        <section className="mb-10">
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Step 2 · Pick a service
          </h2>
          <ServiceGrid
            selectedService={selectedService}
            onSelect={setSelectedService}
            eventCounts={eventCounts}
          />
        </section>

        {/* Events + Response Log */}
        <section>
          <h2 className="mb-4 text-sm font-medium text-muted-foreground">
            Step 3 · Fire events
          </h2>

          {!selectedService ? (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-border/60 bg-muted/20 py-20 text-center">
              <p className="text-sm font-medium text-foreground">
                Select a service above to browse events
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                10 services · 50+ mock events ready to send
              </p>
            </div>
          ) : (
            <div className="grid gap-8 lg:grid-cols-2">
              {/* Events */}
              <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
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

              {/* Response Log */}
              <div className="rounded-2xl border border-border/60 bg-card/50 p-6 shadow-sm">
                <ResponseLog entries={responseLog} />
              </div>
            </div>
          )}
        </section>
      </main>

      <footer className="mt-16 border-t border-border/60 py-6">
        <div className="mx-auto max-w-7xl px-4 text-center text-xs text-muted-foreground sm:px-6 lg:px-8">
          Mock payloads follow official docs · Webhook URL stored in localStorage
        </div>
      </footer>
    </div>
  );
}
