"use client";

import { CheckIcon } from "lucide-react";
import { cn } from "@/lib/utils";

const STEPS = [
    { id: 1, label: "Basic Info" },
    { id: 2, label: "Webhook Setup" },
    { id: 3, label: "Advanced" },
    { id: 4, label: "Prompt" },
] as const;

export function WizardStepIndicator({
    currentStep,
}: {
    currentStep: number;
}) {
    return (
        <div className="mb-8">
            <div className="flex items-center justify-between">
                {STEPS.map((step, index) => {
                    const isCompleted = step.id < currentStep;
                    const isCurrent = step.id === currentStep;
                    const isUpcoming = step.id > currentStep;

                    return (
                        <div
                            key={step.id}
                            className="flex flex-1 items-center"
                            aria-current={isCurrent ? "step" : undefined}
                        >
                            <div className="flex flex-col items-center">
                                <div
                                    className={cn(
                                        "flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors",
                                        isCompleted &&
                                            "border-primary bg-primary text-primary-foreground",
                                        isCurrent &&
                                            "border-primary bg-primary text-primary-foreground",
                                        isUpcoming &&
                                            "border-muted bg-background text-muted-foreground",
                                    )}
                                >
                                    {isCompleted ? (
                                        <CheckIcon className="h-5 w-5" />
                                    ) : (
                                        <span className="text-sm font-medium">
                                            {step.id}
                                        </span>
                                    )}
                                </div>
                                <span
                                    className={cn(
                                        "mt-2 text-xs font-medium",
                                        isCurrent && "text-foreground",
                                        !isCurrent && "text-muted-foreground",
                                    )}
                                >
                                    {step.label}
                                </span>
                            </div>
                            {index < STEPS.length - 1 && (
                                <div
                                    className={cn(
                                        "mx-2 h-0.5 flex-1 transition-colors",
                                        isCompleted
                                            ? "bg-primary"
                                            : "bg-muted",
                                    )}
                                    aria-hidden="true"
                                />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
