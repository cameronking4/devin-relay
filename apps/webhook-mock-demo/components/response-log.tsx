"use client";

import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CheckCircle2, XCircle, Clock, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { SERVICE_METADATA, type ServiceId } from "@/lib/service-metadata";
import { cn } from "@/lib/utils";

export type ResponseLogEntry = {
  event: string;
  service: string;
  status: number;
  statusText: string;
  body: unknown;
  timestamp: string;
  ok: boolean;
};

type ResponseLogProps = {
  entries: ResponseLogEntry[];
};

function formatTimestamp(ts: string) {
  const d = new Date(ts);
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  if (diff < 60000) return "Just now";
  if (diff < 3600000) return `${Math.floor(diff / 60000)}m ago`;
  return d.toLocaleTimeString();
}

function getStatusDisplay(ok: boolean, status: number) {
  if (ok && status >= 200 && status < 300) {
    return {
      icon: CheckCircle2,
      variant: "success" as const,
      label: `${status} OK`,
    };
  }
  if (status === 0) {
    return {
      icon: XCircle,
      variant: "error" as const,
      label: "Failed",
    };
  }
  return {
    icon: XCircle,
    variant: "error" as const,
    label: `${status} ${status < 500 ? "Error" : "Server Error"}`,
  };
}

export function ResponseLog({ entries }: ResponseLogProps) {
  return (
    <div className="flex flex-col">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold">Response log</h3>
        {entries.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {entries.length} request{entries.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <div className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/20 py-16 text-center">
          <div className="rounded-full bg-muted p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No requests yet
          </p>
          <p className="mt-1 max-w-[200px] text-sm text-muted-foreground">
            Send an event to see responses here
          </p>
        </div>
      ) : (
        <ScrollArea className="h-[420px] pr-3">
          <div className="space-y-2">
            {entries.map((entry, index) => (
              <LogEntry key={`${entry.timestamp}-${index}`} entry={entry} />
            ))}
          </div>
        </ScrollArea>
      )}
    </div>
  );
}

function LogEntry({ entry }: { entry: ResponseLogEntry }) {
  const [expanded, setExpanded] = useState(false);
  const meta = SERVICE_METADATA[entry.service as ServiceId];
  const statusDisplay = getStatusDisplay(entry.ok, entry.status);
  const StatusIcon = statusDisplay.icon;
  const hasBody = entry.body != null;

  return (
    <div
      className={cn(
        "rounded-xl border bg-card/80 p-4 transition-colors",
        entry.ok
          ? "border-emerald-200/50 dark:border-emerald-800/30"
          : "border-red-200/50 dark:border-red-800/30"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusIcon
              className={cn(
                "h-4 w-4 shrink-0",
                entry.ok ? "text-emerald-600" : "text-red-600"
              )}
            />
            <span className="font-medium text-foreground">{entry.event}</span>
            {meta && (
              <span
                className={cn(
                  "rounded-md px-1.5 py-0.5 text-xs font-medium",
                  meta.bgLight,
                  meta.borderColor,
                  "border"
                )}
              >
                {meta.label}
              </span>
            )}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <Badge variant={statusDisplay.variant}>{statusDisplay.label}</Badge>
            <span className="text-xs text-muted-foreground">
              {formatTimestamp(entry.timestamp)}
            </span>
          </div>
        </div>
      </div>

      {hasBody && (
        <div className="mt-3">
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="flex w-full items-center gap-1.5 rounded-lg py-1.5 text-left text-xs font-medium text-muted-foreground transition-colors hover:bg-muted/50 hover:text-foreground"
          >
            {expanded ? (
              <ChevronUp className="h-3.5 w-3.5" />
            ) : (
              <ChevronDown className="h-3.5 w-3.5" />
            )}
            {expanded ? "Hide" : "View"} response body
          </button>
          {expanded && (
            <pre className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs">
              {JSON.stringify(entry.body, null, 2)}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}
