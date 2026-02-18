CREATE TYPE "public"."relay-execution-status" AS ENUM('pending', 'running', 'completed', 'failed');--> statement-breakpoint
CREATE TYPE "public"."relay-trigger-source" AS ENUM('custom', 'github');--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_relayEvent" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" varchar(255) NOT NULL,
	"triggerId" varchar(255) NOT NULL,
	"deliveryId" varchar(512) NOT NULL,
	"rawPayload" jsonb NOT NULL,
	"receivedAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_relayExecution" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"eventId" varchar(255) NOT NULL,
	"projectId" varchar(255) NOT NULL,
	"triggerId" varchar(255) NOT NULL,
	"renderedPrompt" text,
	"aiSessionId" varchar(255),
	"status" "relay-execution-status" DEFAULT 'pending' NOT NULL,
	"output" text,
	"error" text,
	"startedAt" timestamp,
	"completedAt" timestamp,
	"latencyMs" integer,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_relayProject" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"orgId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"devinApiKeyEncrypted" text,
	"contextInstructions" text,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_relayTrigger" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"projectId" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"source" "relay-trigger-source" DEFAULT 'custom' NOT NULL,
	"eventType" varchar(255) NOT NULL,
	"promptTemplate" text NOT NULL,
	"conditions" jsonb DEFAULT '[]'::jsonb,
	"thresholdConfig" jsonb DEFAULT 'null'::jsonb,
	"enabled" boolean DEFAULT true NOT NULL,
	"concurrencyLimit" integer DEFAULT 3 NOT NULL,
	"dailyCap" integer DEFAULT 50 NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "account_userId_idx";--> statement-breakpoint
DROP INDEX "orgRequest_organizationId_idx";--> statement-breakpoint
DROP INDEX "session_userId_idx";--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_account" DROP CONSTRAINT "launchmvpfast-saas-starterkit_account___pk";--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_membersToOrganizations" DROP CONSTRAINT "launchmvpfast-saas-starterkit_membersToOrganizations____pk";--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_verificationToken" DROP CONSTRAINT "launchmvpfast-saas-starterkit_verificationToken___pk";--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_membersToOrganizations" ALTER COLUMN "id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_account" ADD CONSTRAINT "launchmvpfast-saas-starterkit_account_provider_providerAccountId_pk" PRIMARY KEY("provider","providerAccountId");--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_membersToOrganizations" ADD CONSTRAINT "launchmvpfast-saas-starterkit_membersToOrganizations_id_memberId_organizationId_pk" PRIMARY KEY("id","memberId","organizationId");--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_verificationToken" ADD CONSTRAINT "launchmvpfast-saas-starterkit_verificationToken_identifier_token_pk" PRIMARY KEY("identifier","token");--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayEvent" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayEvent_projectId_launchmvpfast-saas-starterkit_relayProject_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayProject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayEvent" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayEvent_triggerId_launchmvpfast-saas-starterkit_relayTrigger_id_fk" FOREIGN KEY ("triggerId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayTrigger"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayExecution" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayExecution_eventId_launchmvpfast-saas-starterkit_relayEvent_id_fk" FOREIGN KEY ("eventId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayEvent"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayExecution" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayExecution_projectId_launchmvpfast-saas-starterkit_relayProject_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayProject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayExecution" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayExecution_triggerId_launchmvpfast-saas-starterkit_relayTrigger_id_fk" FOREIGN KEY ("triggerId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayTrigger"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayProject" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayProject_orgId_launchmvpfast-saas-starterkit_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."launchmvpfast-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayTrigger" ADD CONSTRAINT "launchmvpfast-saas-starterkit_relayTrigger_projectId_launchmvpfast-saas-starterkit_relayProject_id_fk" FOREIGN KEY ("projectId") REFERENCES "public"."launchmvpfast-saas-starterkit_relayProject"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "relayEvent_triggerId_idx" ON "launchmvpfast-saas-starterkit_relayEvent" USING btree ("triggerId");--> statement-breakpoint
CREATE INDEX "relayEvent_projectId_idx" ON "launchmvpfast-saas-starterkit_relayEvent" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "relayEvent_deliveryId_triggerId_idx" ON "launchmvpfast-saas-starterkit_relayEvent" USING btree ("deliveryId","triggerId");--> statement-breakpoint
CREATE INDEX "relayExecution_eventId_idx" ON "launchmvpfast-saas-starterkit_relayExecution" USING btree ("eventId");--> statement-breakpoint
CREATE INDEX "relayExecution_projectId_idx" ON "launchmvpfast-saas-starterkit_relayExecution" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "relayExecution_projectId_createdAt_idx" ON "launchmvpfast-saas-starterkit_relayExecution" USING btree ("projectId","createdAt");--> statement-breakpoint
CREATE INDEX "relayProject_orgId_idx" ON "launchmvpfast-saas-starterkit_relayProject" USING btree ("orgId");--> statement-breakpoint
CREATE INDEX "relayTrigger_projectId_idx" ON "launchmvpfast-saas-starterkit_relayTrigger" USING btree ("projectId");--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "launchmvpfast-saas-starterkit_account" USING btree ("userId");--> statement-breakpoint
CREATE INDEX "orgRequest_organizationId_idx" ON "launchmvpfast-saas-starterkit_orgRequest" USING btree ("organizationId");--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "launchmvpfast-saas-starterkit_session" USING btree ("userId");