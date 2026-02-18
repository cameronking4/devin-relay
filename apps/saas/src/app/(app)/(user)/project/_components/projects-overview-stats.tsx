import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    FolderIcon,
    ZapIcon,
    LayersIcon,
    ActivityIcon,
} from "lucide-react";

type AggregateStats = {
    projectCount: number;
    triggerCount: number;
    executionsToday: number;
    totalExecutions: number;
};

const statCards = [
    {
        key: "projects" as const,
        title: "Projects",
        value: (s: AggregateStats) => s.projectCount,
        icon: FolderIcon,
        description: "Relay projects",
    },
    {
        key: "triggers" as const,
        title: "Triggers",
        value: (s: AggregateStats) => s.triggerCount,
        icon: LayersIcon,
        description: "Webhook triggers",
    },
    {
        key: "today" as const,
        title: "Executions today",
        value: (s: AggregateStats) => s.executionsToday,
        icon: ZapIcon,
        description: "AI runs in last 24h",
    },
    {
        key: "total" as const,
        title: "Total executions",
        value: (s: AggregateStats) => s.totalExecutions,
        icon: ActivityIcon,
        description: "All-time",
    },
] as const;

export function ProjectsOverviewStats({ stats }: { stats: AggregateStats }) {
    return (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map(({ key, title, value, icon: Icon, description }) => (
                <Card key={key} className="overflow-hidden">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            {title}
                        </CardTitle>
                        <Icon className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold tabular-nums">
                            {value(stats).toLocaleString()}
                        </div>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                            {description}
                        </p>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
