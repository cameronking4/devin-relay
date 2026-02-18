"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import type { TriggerConditions } from "@/server/actions/relay/mutations";
import { PlusIcon, Trash2Icon } from "lucide-react";

const OPERATORS = [
    { value: "eq", label: "equals" },
    { value: "neq", label: "not equals" },
    { value: "gt", label: "greater than" },
    { value: "gte", label: "greater or equal" },
    { value: "lt", label: "less than" },
    { value: "lte", label: "less or equal" },
    { value: "contains", label: "contains" },
    { value: "exists", label: "exists" },
] as const;

export function ConditionBuilder({
    conditions,
    onChange,
    suggestedPaths = [],
}: {
    conditions: TriggerConditions;
    onChange: (conditions: TriggerConditions) => void;
    suggestedPaths?: string[];
}) {
    function addRow() {
        onChange([...conditions, { path: "payload.", operator: "eq", value: "" }]);
    }

    function removeRow(i: number) {
        onChange(conditions.filter((_, idx) => idx !== i));
    }

    function updateRow(
        i: number,
        field: "path" | "operator" | "value",
        val: string | number | boolean,
    ) {
        const next = [...conditions];
        const row = { ...next[i] };
        if (field === "path") row.path = String(val);
        else if (field === "operator") row.operator = String(val);
        else row.value = val;
        next[i] = row;
        onChange(next);
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <Label>Conditions</Label>
                <Button type="button" variant="outline" size="sm" onClick={addRow}>
                    <PlusIcon className="h-4 w-4" />
                    Add condition
                </Button>
            </div>
            <p className="text-muted-foreground text-xs">
                Path uses dot notation. Example: payload.repository.name
            </p>
            {suggestedPaths.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    <span className="text-muted-foreground text-xs">
                        From recent events:
                    </span>
                    {suggestedPaths.map((path) => (
                        <button
                            key={path}
                            type="button"
                            onClick={() =>
                                onChange([
                                    ...conditions,
                                    {
                                        path,
                                        operator: "eq",
                                        value: "",
                                    },
                                ])
                            }
                            className="rounded-md border border-border bg-muted px-2 py-0.5 text-xs transition-colors hover:bg-muted/80"
                        >
                            {path}
                        </button>
                    ))}
                </div>
            )}
            {conditions.length === 0 ? (
                <p className="text-muted-foreground text-sm">
                    No conditions — all events match.
                </p>
            ) : (
                <div className="space-y-2">
                    {conditions.map((c, i) => (
                        <div
                            key={i}
                            className="flex flex-wrap items-end gap-2 rounded border border-border p-2"
                        >
                            <div className="min-w-[140px] flex-1">
                                <Label className="sr-only">Path</Label>
                                <Input
                                    placeholder="payload.field"
                                    value={c.path}
                                    onChange={(e) =>
                                        updateRow(i, "path", e.target.value)
                                    }
                                />
                            </div>
                            <Select
                                value={c.operator}
                                onValueChange={(v) => updateRow(i, "operator", v)}
                            >
                                <SelectTrigger className="w-[130px]">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {OPERATORS.map((op) => (
                                        <SelectItem
                                            key={op.value}
                                            value={op.value}
                                        >
                                            {op.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            {c.operator !== "exists" && (
                                <div className="min-w-[100px] flex-1">
                                    <Label className="sr-only">Value</Label>
                                    <Input
                                        placeholder="Value"
                                        value={String(c.value ?? "")}
                                        onChange={(e) =>
                                            updateRow(i, "value", e.target.value)
                                        }
                                    />
                                </div>
                            )}
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={() => removeRow(i)}
                                aria-label="Remove condition"
                            >
                                <Trash2Icon className="h-4 w-4" />
                            </Button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
