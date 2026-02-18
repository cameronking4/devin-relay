"use client";

import { motion, AnimatePresence } from "framer-motion";
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
  /** When true, fill available height instead of fixed 420px */
  fillHeight?: boolean;
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
      emoji: "✅",
    };
  }
  if (status === 0) {
    return {
      icon: XCircle,
      variant: "error" as const,
      label: "Failed",
      emoji: "❌",
    };
  }
  return {
    icon: XCircle,
    variant: "error" as const,
    label: `${status} ${status < 500 ? "Error" : "Server Error"}`,
    emoji: "⚠️",
  };
}

export function ResponseLog({ entries, fillHeight = false }: ResponseLogProps) {
  return (
    <div className={cn("flex flex-col", fillHeight && "min-h-0 flex-1")}>
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-semibold text-foreground">Response log</h3>
        {entries.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {entries.length} request{entries.length !== 1 ? "s" : ""}
          </span>
        )}
      </div>

      {entries.length === 0 ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-1 flex-col items-center justify-center rounded-xl border border-dashed border-border/60 bg-muted/10 py-16 text-center"
        >
          <div className="rounded-full bg-muted/50 p-4">
            <Clock className="h-8 w-8 text-muted-foreground" />
          </div>
          <p className="mt-4 text-sm font-medium text-foreground">
            No requests yet
          </p>
          <p className="mt-1 max-w-[200px] text-sm text-muted-foreground">
            Send an event to see responses here
          </p>
          <span className="mt-3 text-2xl">📥</span>
        </motion.div>
      ) : (
        <ScrollArea className={cn(
          "pr-3",
          fillHeight ? "flex-1 min-h-0" : "h-[420px]"
        )}>
          <div className="space-y-2">
            <AnimatePresence mode="popLayout">
              {entries.map((entry, index) => (
                <motion.div
                  key={`${entry.timestamp}-${index}`}
                  initial={{ opacity: 0, y: 10, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <LogEntry entry={entry} />
                </motion.div>
              ))}
            </AnimatePresence>
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
          ? "border-emerald-500/30 dark:border-emerald-800/40"
          : "border-red-500/30 dark:border-red-800/40"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <StatusIcon
              className={cn(
                "h-4 w-4 shrink-0",
                entry.ok ? "text-emerald-500" : "text-red-500"
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
            <motion.pre
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              className="mt-2 max-h-48 overflow-auto rounded-lg bg-muted/50 p-3 font-mono text-xs"
            >
              {JSON.stringify(entry.body, null, 2)}
            </motion.pre>
          )}
        </div>
      )}
    </div>
  );
}
