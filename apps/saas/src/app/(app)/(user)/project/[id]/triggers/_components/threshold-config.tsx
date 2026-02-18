"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { TriggerThresholdConfig } from "@/server/actions/relay/mutations";

export function ThresholdConfig({
    config,
    onChange,
}: {
    config: TriggerThresholdConfig;
    onChange: (config: TriggerThresholdConfig) => void;
}) {
    const enabled = config !== null;
    const count = config?.count ?? 3;
    const windowMinutes = config?.windowMinutes ?? 5;

    return (
        <div className="space-y-3">
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="use-threshold"
                    checked={enabled}
                    onChange={(e) =>
                        onChange(
                            e.target.checked
                                ? { count: 3, windowMinutes: 5 }
                                : null,
                        )
                    }
                    className="h-4 w-4 rounded border-input"
                />
                <Label htmlFor="use-threshold">Use threshold</Label>
            </div>
            {enabled && (
                <>
                    <p className="text-muted-foreground text-xs">
                        Trigger only when N matching events in the last M
                        minutes.
                    </p>
                    <div className="flex flex-wrap gap-4">
                        <div className="grid gap-2">
                            <Label htmlFor="threshold-count">Count</Label>
                            <Input
                                id="threshold-count"
                                type="number"
                                min={1}
                                value={count}
                                onChange={(e) =>
                                    onChange({
                                        count: Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1,
                                        ),
                                        windowMinutes,
                                    })
                                }
                            />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="threshold-window">Window (minutes)</Label>
                            <Input
                                id="threshold-window"
                                type="number"
                                min={1}
                                value={windowMinutes}
                                onChange={(e) =>
                                    onChange({
                                        count,
                                        windowMinutes: Math.max(
                                            1,
                                            parseInt(e.target.value, 10) || 1,
                                        ),
                                    })
                                }
                            />
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
