"use client";

import { motion } from "framer-motion";
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
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1 }}
      className="rounded-lg border border-border/50 bg-card/40 px-3 py-2.5"
    >
      <div className="flex items-center gap-2">
        <Link2 className="h-4 w-4 shrink-0 text-muted-foreground" />
        <Input
          type="url"
          placeholder="Paste your Relay webhook URL..."
          value={webhookUrl}
          onChange={(e) => onWebhookChange(e.target.value)}
          className="h-8 border-0 bg-transparent px-0 text-sm focus-visible:ring-0 focus-visible:ring-offset-0"
        />
        {webhookUrl && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleCopy}
            className="h-7 w-7 shrink-0 text-muted-foreground hover:text-foreground"
          >
            {copied ? (
              <Check className="h-3.5 w-3.5 text-emerald-500" />
            ) : (
              <Copy className="h-3.5 w-3.5" />
            )}
          </Button>
        )}
        {webhookUrl && hasEvents && (
          <Check className="ml-1 h-3.5 w-3.5 shrink-0 text-emerald-500" />
        )}
      </div>
      <p className="mt-1.5 text-[11px] text-muted-foreground/80">
        <code className="font-mono">/api/webhook/custom/YOUR_TRIGGER_ID</code>
      </p>
    </motion.div>
  );
}
