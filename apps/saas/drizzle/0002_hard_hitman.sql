ALTER TABLE "launchmvpfast-saas-starterkit_relayTrigger" ALTER COLUMN "source" SET DATA TYPE varchar(255);--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_relayTrigger" ALTER COLUMN "source" SET DEFAULT 'Custom';--> statement-breakpoint
DROP TYPE "public"."relay-trigger-source";