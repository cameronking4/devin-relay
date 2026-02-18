"use client";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Copy, Check, Link2 } from "lucide-react";
import { useState } from "react";

type WebhookHeroProps = {
  webhookUrl: string;
  onWebhookChange: (url: string) => void;
  hasEvents?: boolean;
};

export function WebhookHero({
  webhookUrl,
  onWebhookChange,
  hasEvents = false,
}: WebhookHeroProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!webhookUrl) return;
    await navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-2xl border border-border/60 bg-gradient-to-br from-muted/40 via-background to-muted/20 px-6 py-8 shadow-sm">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-3">
        <div className="flex flex-1 items-center gap-2 rounded-xl border bg-background/80 px-3 py-2.5 shadow-inner">
          <Link2 className="h-5 w-5 shrink-0 text-muted-foreground" />
          <Input
            type="url"
            placeholder="Paste your Relay webhook URL..."
            value={webhookUrl}
            onChange={(e) => onWebhookChange(e.target.value)}
            className="h-9 border-0 bg-transparent px-2 text-base focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          {webhookUrl && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleCopy}
              className="h-8 w-8 shrink-0 text-muted-foreground hover:text-foreground"
            >
              {copied ? (
                <Check className="h-4 w-4 text-emerald-600" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          )}
        </div>
        {webhookUrl && hasEvents && (
          <span className="text-xs text-muted-foreground sm:self-center">
            URL saved locally
          </span>
        )}
      </div>
      <p className="mt-2 text-sm text-muted-foreground">
        e.g. <code className="rounded bg-muted px-1.5 py-0.5 font-mono text-xs">http://localhost:3000/api/webhook/custom/YOUR_TRIGGER_ID</code>
      </p>
    </div>
  );
}
