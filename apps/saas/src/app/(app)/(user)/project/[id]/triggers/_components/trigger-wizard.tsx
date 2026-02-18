"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { WizardStepIndicator } from "./wizard-step-indicator";
import { BasicInfoStep, type BasicInfoValues } from "./basic-info-step";
import { WebhookSetupStep } from "./webhook-setup-step";
import { AdvancedSettingsSection, type AdvancedSettingsValues } from "./advanced-settings-section";
import { PromptConfigStep } from "./prompt-config-step";
import { createRelayTrigger, updateRelayTrigger } from "@/server/actions/relay/mutations";
import { siteUrls } from "@/config/urls";

const DEFAULT_BASIC_INFO: BasicInfoValues = {
    name: "",
    source: "Custom",
    eventType: "",
};

const DEFAULT_ADVANCED: AdvancedSettingsValues = {
    conditions: [],
    thresholdConfig: null,
    concurrencyLimit: 3,
    dailyCap: 50,
};

const DEFAULT_PROMPT = "Review and fix: {{payload.message}}";

export function TriggerWizard({ projectId }: { projectId: string }) {
    const router = useRouter();
    const [currentStep, setCurrentStep] = useState(1);
    const [triggerId, setTriggerId] = useState<string | null>(null);
    const [isSaving, setIsSaving] = useState(false);
    const [webhookActive, setWebhookActive] = useState(false);

    const [basicInfo, setBasicInfo] = useState<BasicInfoValues>(DEFAULT_BASIC_INFO);
    const [advanced, setAdvanced] = useState<AdvancedSettingsValues>(DEFAULT_ADVANCED);
    const [promptTemplate, setPromptTemplate] = useState(DEFAULT_PROMPT);

    const handleStep1Continue = async () => {
        if (!basicInfo.name.trim()) {
            toast.error("Name is required");
            return;
        }

        setIsSaving(true);
        try {
            // Auto-save after Step 1 to create trigger and get webhook URL
            const trigger = await createRelayTrigger(projectId, {
                name: basicInfo.name,
                source: basicInfo.source,
                eventType: basicInfo.eventType,
                promptTemplate, // Use default prompt for now
                conditions: advanced.conditions,
                thresholdConfig: advanced.thresholdConfig,
                concurrencyLimit: advanced.concurrencyLimit,
                dailyCap: advanced.dailyCap,
            });
            setTriggerId(trigger.id);
            toast.success("Trigger created");
            setCurrentStep(2);
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to create trigger",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleStep2Continue = () => {
        // Can skip if webhook not active, but show warning
        if (!webhookActive) {
            toast.info("You can configure the webhook later. Continuing...");
        }
        setCurrentStep(3);
    };

    const handleStep3Continue = () => {
        setCurrentStep(4);
    };

    const handleStep3Skip = () => {
        setCurrentStep(4);
    };

    const handleFinish = async () => {
        if (!triggerId) {
            toast.error("Trigger not found");
            return;
        }

        if (!promptTemplate.trim()) {
            toast.error("Prompt template is required");
            return;
        }

        setIsSaving(true);
        try {
            // Update trigger with final values
            await updateRelayTrigger(projectId, triggerId, {
                name: basicInfo.name,
                source: basicInfo.source,
                eventType: basicInfo.eventType,
                promptTemplate,
                conditions: advanced.conditions,
                thresholdConfig: advanced.thresholdConfig,
                concurrencyLimit: advanced.concurrencyLimit,
                dailyCap: advanced.dailyCap,
            });
            toast.success("Trigger configured");
            router.push(siteUrls.relay.trigger(projectId, triggerId));
        } catch (e) {
            toast.error(
                e instanceof Error ? e.message : "Failed to save trigger",
            );
        } finally {
            setIsSaving(false);
        }
    };

    const handleBack = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    return (
        <div className="space-y-6">
            <WizardStepIndicator currentStep={currentStep} />

            {currentStep === 1 && (
                <div className="space-y-6">
                    <BasicInfoStep values={basicInfo} onChange={setBasicInfo} />
                    <div className="flex justify-end gap-4">
                        <Button
                            variant="outline"
                            onClick={() => router.back()}
                            disabled={isSaving}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleStep1Continue}
                            disabled={isSaving || !basicInfo.name.trim()}
                        >
                            {isSaving ? "Creating..." : "Continue"}
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 2 && triggerId && (
                <div className="space-y-6">
                    <WebhookSetupStep
                        triggerId={triggerId}
                        projectId={projectId}
                        onStatusChange={setWebhookActive}
                    />
                    <div className="flex justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isSaving}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleStep2Continue}
                            disabled={isSaving}
                        >
                            Continue
                        </Button>
                    </div>
                </div>
            )}

            {currentStep === 3 && (
                <div className="space-y-6">
                    <AdvancedSettingsSection
                        values={advanced}
                        onChange={setAdvanced}
                        collapsible={false}
                        triggerId={triggerId ?? undefined}
                        projectId={projectId}
                    />
                    <div className="flex justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isSaving}
                        >
                            Back
                        </Button>
                        <div className="flex gap-2">
                            <Button
                                variant="outline"
                                onClick={handleStep3Skip}
                                disabled={isSaving}
                            >
                                Skip
                            </Button>
                            <Button
                                onClick={handleStep3Continue}
                                disabled={isSaving}
                            >
                                Continue
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {currentStep === 4 && (
                <div className="space-y-6">
                    <PromptConfigStep
                        value={promptTemplate}
                        onChange={setPromptTemplate}
                    />
                    <div className="flex justify-between gap-4">
                        <Button
                            variant="outline"
                            onClick={handleBack}
                            disabled={isSaving}
                        >
                            Back
                        </Button>
                        <Button
                            onClick={handleFinish}
                            disabled={isSaving || !promptTemplate.trim()}
                        >
                            {isSaving ? "Saving..." : "Finish"}
                        </Button>
                    </div>
                </div>
            )}
        </div>
    );
}
