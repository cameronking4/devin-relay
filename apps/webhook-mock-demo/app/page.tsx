"use client";

import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Send, CheckCircle2, XCircle, Clock } from "lucide-react";
import { EVENTS, SERVICES, type Event } from "@/lib/events";

type ResponseLogEntry = {
  event: string;
  service: string;
  status: number;
  statusText: string;
  body: unknown;
  timestamp: string;
  ok: boolean;
};

export default function Home() {
  const [webhookUrl, setWebhookUrl] = useState("");
  const [selectedService, setSelectedService] = useState<string>("");
  const [responseLog, setResponseLog] = useState<ResponseLogEntry[]>([]);
  const [sending, setSending] = useState<string | null>(null);

  // Load webhook URL from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem("webhook-url");
    if (saved) {
      setWebhookUrl(saved);
    }
  }, []);

  // Save webhook URL to localStorage
  useEffect(() => {
    if (webhookUrl) {
      localStorage.setItem("webhook-url", webhookUrl);
    }
  }, [webhookUrl]);

  const handleSendEvent = async (event: Event) => {
    if (!webhookUrl || !selectedService) return;

    const eventKey = `${selectedService}-${event.id}`;
    setSending(eventKey);

    try {
      const response = await fetch("/api/send-event", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
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
        status: result.status || response.status,
        statusText: result.statusText || response.statusText,
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

  const currentEvents = selectedService ? EVENTS[selectedService as keyof typeof EVENTS] || [] : [];

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStatusIcon = (ok: boolean, status: number) => {
    if (ok && status >= 200 && status < 300) {
      return <CheckCircle2 className="h-4 w-4 text-green-500" />;
    }
    return <XCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = (ok: boolean, status: number) => {
    if (ok && status >= 200 && status < 300) {
      return "text-green-600 bg-green-50";
    }
    return "text-red-600 bg-red-50";
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="mx-auto max-w-7xl space-y-6">
        <div className="space-y-2">
          <h1 className="text-3xl font-bold">Webhook Mock Demo</h1>
          <p className="text-muted-foreground">
            Test your Relay webhook with mock events from production monitoring services
          </p>
        </div>

        {/* Webhook URL Input */}
        <Card>
          <CardHeader>
            <CardTitle>Webhook URL</CardTitle>
            <CardDescription>
              Paste your Relay webhook URL (e.g., http://localhost:3000/api/webhook/custom/YOUR_TRIGGER_ID)
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="url"
                placeholder="http://localhost:3000/api/webhook/custom/YOUR_TRIGGER_ID"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>Events</CardTitle>
              <CardDescription>
                Select a service and send events to your webhook
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="service-select">Service</Label>
                <Select value={selectedService} onValueChange={setSelectedService}>
                  <SelectTrigger id="service-select">
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {SERVICES.map((service) => (
                      <SelectItem key={service} value={service}>
                        {service.charAt(0).toUpperCase() + service.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedService && currentEvents.length > 0 && (
                <ScrollArea className="h-[500px]">
                  <div className="space-y-2">
                    {currentEvents.map((event) => {
                      const eventKey = `${selectedService}-${event.id}`;
                      const isSending = sending === eventKey;

                      return (
                        <Card key={event.id} className="p-4">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 space-y-1">
                              <h4 className="font-semibold">{event.name}</h4>
                              <p className="text-sm text-muted-foreground">
                                {event.desc}
                              </p>
                            </div>
                            <Button
                              size="sm"
                              onClick={() => handleSendEvent(event)}
                              disabled={!webhookUrl || isSending}
                              className="ml-4"
                            >
                              {isSending ? (
                                <Clock className="h-4 w-4 animate-spin" />
                              ) : (
                                <Send className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </Card>
                      );
                    })}
                  </div>
                </ScrollArea>
              )}

              {selectedService && currentEvents.length === 0 && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  No events available for this service
                </div>
              )}

              {!selectedService && (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Select a service to see available events
                </div>
              )}
            </CardContent>
          </Card>

          {/* Response Log */}
          <Card>
            <CardHeader>
              <CardTitle>Response Log</CardTitle>
              <CardDescription>
                View webhook responses and status codes
              </CardDescription>
            </CardHeader>
            <CardContent>
              {responseLog.length === 0 ? (
                <div className="py-8 text-center text-sm text-muted-foreground">
                  Send an event to see responses here
                </div>
              ) : (
                <ScrollArea className="h-[600px]">
                  <div className="space-y-3">
                    {responseLog.map((entry, index) => (
                      <Card key={index} className="p-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(entry.ok, entry.status)}
                              <span className="font-semibold">{entry.event}</span>
                              <span className="text-xs text-muted-foreground">
                                ({entry.service})
                              </span>
                            </div>
                            <span className="text-xs text-muted-foreground">
                              {formatTimestamp(entry.timestamp)}
                            </span>
                          </div>
                          <div
                            className={`inline-flex rounded px-2 py-1 text-xs font-medium ${getStatusColor(entry.ok, entry.status)}`}
                          >
                            {entry.status} {entry.statusText}
                          </div>
                          {entry.body && (
                            <details className="mt-2">
                              <summary className="cursor-pointer text-xs text-muted-foreground">
                                View response body
                              </summary>
                              <pre className="mt-2 max-h-40 overflow-auto rounded bg-muted p-2 text-xs">
                                {JSON.stringify(entry.body, null, 2)}
                              </pre>
                            </details>
                          )}
                        </div>
                      </Card>
                    ))}
                  </div>
                </ScrollArea>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
