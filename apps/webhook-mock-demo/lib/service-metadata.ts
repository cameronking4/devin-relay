import type { LucideIcon } from "lucide-react";
import {
  Bug,
  Zap,
  Activity,
  ShieldAlert,
  BarChart3,
  Bell,
  Github,
  Shield,
  ShieldCheck,
  ListTodo,
  LineChart,
  FileText,
  Radio,
  Cloud,
  Gauge,
  GitBranch,
  ClipboardList,
  type LucideProps,
} from "lucide-react";

export type ServiceId =
  | "sentry"
  | "vercel"
  | "prometheus"
  | "datadog"
  | "grafana"
  | "pagerduty"
  | "github"
  | "vanta"
  | "crowdstrike"
  | "linear"
  | "posthog"
  | "logflare"
  | "otel"
  | "azure_monitor"
  | "azure_devops"
  | "typeform"
  | "cloudwatch";

export type ServiceMeta = {
  id: ServiceId;
  label: string;
  description: string;
  icon: LucideIcon;
  iconProps?: LucideProps;
  gradient: string; // Tailwind gradient classes
  bgLight: string;
  borderColor: string;
};

export const SERVICE_METADATA: Record<ServiceId, ServiceMeta> = {
  sentry: {
    id: "sentry",
    label: "Sentry",
    description: "Errors, alerts & issue tracking",
    icon: Bug,
    gradient: "from-orange-500 to-rose-600",
    bgLight: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-200 dark:border-orange-800/50",
  },
  vercel: {
    id: "vercel",
    label: "Vercel",
    description: "Deployments & observability",
    icon: Zap,
    gradient: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-50 dark:bg-slate-950/40",
    borderColor: "border-slate-200 dark:border-slate-800/50",
  },
  prometheus: {
    id: "prometheus",
    label: "Prometheus",
    description: "Alertmanager webhooks",
    icon: Activity,
    gradient: "from-amber-600 to-orange-700",
    bgLight: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800/50",
  },
  datadog: {
    id: "datadog",
    label: "Datadog",
    description: "Monitors & metric alerts",
    icon: ShieldAlert,
    gradient: "from-fuchsia-600 to-pink-600",
    bgLight: "bg-fuchsia-50 dark:bg-fuchsia-950/40",
    borderColor: "border-fuchsia-200 dark:border-fuchsia-800/50",
  },
  grafana: {
    id: "grafana",
    label: "Grafana",
    description: "Dashboards & alerts",
    icon: BarChart3,
    gradient: "from-orange-500 to-red-600",
    bgLight: "bg-orange-50 dark:bg-orange-950/40",
    borderColor: "border-orange-200 dark:border-orange-800/50",
  },
  pagerduty: {
    id: "pagerduty",
    label: "PagerDuty",
    description: "Incidents & on-call",
    icon: Bell,
    gradient: "from-teal-600 to-emerald-700",
    bgLight: "bg-teal-50 dark:bg-teal-950/40",
    borderColor: "border-teal-200 dark:border-teal-800/50",
  },
  github: {
    id: "github",
    label: "GitHub",
    description: "Push, PRs, workflows, releases",
    icon: Github,
    gradient: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-50 dark:bg-slate-950/40",
    borderColor: "border-slate-200 dark:border-slate-800/50",
  },
  vanta: {
    id: "vanta",
    label: "Vanta",
    description: "Compliance & security automation",
    icon: ShieldCheck,
    gradient: "from-slate-700 to-slate-900",
    bgLight: "bg-slate-50 dark:bg-slate-950/40",
    borderColor: "border-slate-200 dark:border-slate-800/50",
  },
  crowdstrike: {
    id: "crowdstrike",
    label: "CrowdStrike Falcon",
    description: "EDR detections & incidents",
    icon: Shield,
    gradient: "from-red-600 to-orange-600",
    bgLight: "bg-red-50 dark:bg-red-950/40",
    borderColor: "border-red-200 dark:border-red-800/50",
  },
  linear: {
    id: "linear",
    label: "Linear",
    description: "Issues & comments",
    icon: ListTodo,
    gradient: "from-sky-500 to-blue-600",
    bgLight: "bg-sky-50 dark:bg-sky-950/40",
    borderColor: "border-sky-200 dark:border-sky-800/50",
  },
  posthog: {
    id: "posthog",
    label: "PostHog",
    description: "Product analytics & cohorts",
    icon: LineChart,
    gradient: "from-violet-600 to-purple-700",
    bgLight: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "border-violet-200 dark:border-violet-800/50",
  },
  logflare: {
    id: "logflare",
    label: "Logflare",
    description: "Structured logs & patterns",
    icon: FileText,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800/50",
  },
  otel: {
    id: "otel",
    label: "OpenTelemetry",
    description: "Traces, spans & telemetry",
    icon: Radio,
    gradient: "from-cyan-500 to-blue-600",
    bgLight: "bg-cyan-50 dark:bg-cyan-950/40",
    borderColor: "border-cyan-200 dark:border-cyan-800/50",
  },
  azure_monitor: {
    id: "azure_monitor",
    label: "Azure Monitor",
    description: "Alerts, metrics & Log Analytics",
    icon: Gauge,
    gradient: "from-blue-600 to-indigo-700",
    bgLight: "bg-blue-50 dark:bg-blue-950/40",
    borderColor: "border-blue-200 dark:border-blue-800/50",
  },
  azure_devops: {
    id: "azure_devops",
    label: "Azure DevOps",
    description: "Builds, Git, work items & PRs",
    icon: GitBranch,
    gradient: "from-sky-500 to-indigo-600",
    bgLight: "bg-sky-50 dark:bg-sky-950/40",
    borderColor: "border-sky-200 dark:border-sky-800/50",
  },
  typeform: {
    id: "typeform",
    label: "Typeform",
    description: "Form responses & surveys",
    icon: ClipboardList,
    gradient: "from-violet-600 to-purple-700",
    bgLight: "bg-violet-50 dark:bg-violet-950/40",
    borderColor: "border-violet-200 dark:border-violet-800/50",
  },
  cloudwatch: {
    id: "cloudwatch",
    label: "AWS CloudWatch",
    description: "Alarms, metrics & log filters",
    icon: Cloud,
    gradient: "from-amber-500 to-orange-600",
    bgLight: "bg-amber-50 dark:bg-amber-950/40",
    borderColor: "border-amber-200 dark:border-amber-800/50",
  },
};
