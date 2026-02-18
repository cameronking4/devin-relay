CREATE TYPE "public"."relay-workflow-match-mode" AS ENUM('any', 'all');--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_relayWorkflow" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"triggerIds" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"matchMode" "relay-workflow-match-mode" DEFAULT 'all' NOT NULL,
	"timeWindowMinutes" integer DEFAULT 5 NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb,
	"promptTemplate" text NOT NULL,
	"githubRepo" varchar(255) DEFAULT '' NOT NULL,
	"includePaths" jsonb DEFAULT '[]'::jsonb,
	"excludePaths" jsonb DEFAULT '[]'::jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayExecution" ALTER COLUMN "eventIds" DROP DEFAULT;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayExecution" ADD COLUMN "workflowId" varchar(255);--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayWorkflow" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayWorkflow_projectId_launchmvpfast-saas-starterkit_relayProject_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayProject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "relayWorkflow_projectId_idx" ON "launchmvpfast-saas-starterkit_relayWorkflow" USING btree ("projectId");--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayExecution" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayExecution_workflowId_launchmvpfast-saas-starterkit_relayWorkflow_id_fk" FOREIGN KEY ("workflowId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayWorkflow"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "relayExecution_workflowId_idx" ON "launchmvpfast-saas-starterkit_relayExecution" USING btree ("workflowId");