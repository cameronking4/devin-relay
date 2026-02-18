import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Activity, CheckCircle2, XCircle } from "lucide-react";
import { getWebhookActivity } from "@/server/actions/relay/queries";

export async function WebhookActivity({
    triggerId,
    projectId,
}: {
    triggerId: string;
    projectId: string;
}) {
    const activity = await getWebhookActivity(triggerId, projectId);

    if (!activity) {
        return null;
    }

    const isActive =
        activity.lastReceivedAt &&
        Date.now() - new Date(activity.lastReceivedAt).getTime() <
            24 * 60 * 60 * 1000; // Active if received in last 24 hours

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5" />
                    Webhook Activity
                </CardTitle>
                <CardDescription>
                    Monitor if your webhook URL is receiving events successfully.
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                    <div>
                        <p className="text-muted-foreground mb-1 text-sm">
                            Status
                        </p>
                        <Badge
                            variant={isActive ? "default" : "secondary"}
                            className="flex items-center gap-1 w-fit"
                        >
                            {isActive ? (
                                <CheckCircle2 className="h-3 w-3" />
                            ) : (
                                <XCircle className="h-3 w-3" />
                            )}
                            {isActive ? "Active" : "Inactive"}
                        </Badge>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1 text-sm">
                            Total Events
                        </p>
                        <p className="text-2xl font-semibold">
                            {activity.totalEvents}
                        </p>
                    </div>
                    <div>
                        <p className="text-muted-foreground mb-1 text-sm">
                            Last Received
                        </p>
                        <p className="text-sm">
                            {activity.lastReceivedAt
                                ? new Date(
                                      activity.lastReceivedAt,
                                  ).toLocaleString()
                                : "Never"}
                        </p>
                    </div>
                </div>
                {!activity.lastReceivedAt && (
                    <p className="text-muted-foreground mt-4 text-sm">
                        No webhook events received yet. Copy the webhook URL above
                        and configure your external service (Sentry, Vercel, etc.)
                        to send webhooks to it.
                    </p>
                )}
            </CardContent>
        </Card>
    );
}
