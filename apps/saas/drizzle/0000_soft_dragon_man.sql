CREATE TYPE "public"."feedback-label" AS ENUM('Issue', 'Idea', 'Question', 'Complaint', 'Feature Request', 'Other');--> statement-breakpoint
CREATE TYPE "public"."feedback-status" AS ENUM('Open', 'In Progress', 'Closed');--> statement-breakpoint
CREATE TYPE "public"."org-member-role" AS ENUM('Viewer', 'Developer', 'Billing', 'Admin');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('User', 'Admin', 'Super Admin');--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_account" (
	"userId" varchar(255) NOT NULL,
	"type" varchar(255) NOT NULL,
	"provider" varchar(255) NOT NULL,
	"providerAccountId" varchar(255) NOT NULL,
	"refresh_token" text,
	"access_token" text,
	"expires_at" integer,
	"token_type" varchar(255),
	"scope" varchar(255),
	"id_token" text,
	"session_state" varchar(255),
	CONSTRAINT "launchmvpfast-saas-starterkit_account___pk" PRIMARY KEY("provider","providerAccountId")
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_feedback" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"title" varchar(255),
	"message" text NOT NULL,
	"label" "feedback-label" NOT NULL,
	"status" "feedback-status" DEFAULT 'Open' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_membersToOrganizations" (
	"id" varchar(255) DEFAULT gen_random_uuid() NOT NULL,
	"memberId" varchar(255) NOT NULL,
	"memberEmail" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"role" "org-member-role" DEFAULT 'Viewer' NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "launchmvpfast-saas-starterkit_membersToOrganizations____pk" PRIMARY KEY("id","memberId","organizationId")
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_orgRequest" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"userId" varchar(255) NOT NULL,
	"organizationId" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_organization" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"image" varchar(255),
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"ownerId" varchar(255) NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_session" (
	"sessionToken" varchar(255) PRIMARY KEY NOT NULL,
	"userId" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_subscription" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lemonSqueezyId" text NOT NULL,
	"orderId" integer NOT NULL,
	"orgId" text NOT NULL,
	"variantId" integer NOT NULL,
	CONSTRAINT "launchmvpfast-saas-starterkit_subscription_lemonSqueezyId_unique" UNIQUE("lemonSqueezyId")
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_user" (
	"id" varchar(255) PRIMARY KEY NOT NULL,
	"name" varchar(255),
	"email" varchar(255) NOT NULL,
	"emailVerified" timestamp DEFAULT CURRENT_TIMESTAMP,
	"image" varchar(255),
	"role" "role" DEFAULT 'User' NOT NULL,
	"isNewUser" boolean DEFAULT true NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_verificationToken" (
	"identifier" varchar(255) NOT NULL,
	"token" varchar(255) NOT NULL,
	"expires" timestamp NOT NULL,
	CONSTRAINT "launchmvpfast-saas-starterkit_verificationToken___pk" PRIMARY KEY("","")
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_waitlistUser" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "launchmvpfast-saas-starterkit_waitlistUser_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "launchmvpfast-saas-starterkit_webhookEvent" (
	"id" varchar(255) PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"createdAt" timestamp DEFAULT now() NOT NULL,
	"eventName" text NOT NULL,
	"processed" boolean DEFAULT false,
	"body" jsonb NOT NULL,
	"processingError" text
);
--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_account" ADD CONSTRAINT "launchmvpfast-saas-starterkit_account_userId_launchmvpfast-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."launchmvpfast-saas-starterkit_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_feedback" ADD CONSTRAINT "launchmvpfast-saas-starterkit_feedback_userId_launchmvpfast-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."launchmvpfast-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_membersToOrganizations" ADD CONSTRAINT "launchmvpfast-saas-starterkit_membersToOrganizations_memberId_launchmvpfast-saas-starterkit_user_id_fk" FOREIGN KEY ("memberId") REFERENCES "public"."launchmvpfast-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_membersToOrganizations" ADD CONSTRAINT "launchmvpfast-saas-starterkit_membersToOrganizations_organizationId_launchmvpfast-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."launchmvpfast-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_orgRequest" ADD CONSTRAINT "launchmvpfast-saas-starterkit_orgRequest_userId_launchmvpfast-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."launchmvpfast-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_orgRequest" ADD CONSTRAINT "launchmvpfast-saas-starterkit_orgRequest_organizationId_launchmvpfast-saas-starterkit_organization_id_fk" FOREIGN KEY ("organizationId") REFERENCES "public"."launchmvpfast-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_organization" ADD CONSTRAINT "launchmvpfast-saas-starterkit_organization_ownerId_launchmvpfast-saas-starterkit_user_id_fk" FOREIGN KEY ("ownerId") REFERENCES "public"."launchmvpfast-saas-starterkit_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_session" ADD CONSTRAINT "launchmvpfast-saas-starterkit_session_userId_launchmvpfast-saas-starterkit_user_id_fk" FOREIGN KEY ("userId") REFERENCES "public"."launchmvpfast-saas-starterkit_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "launchmvpfast-saas-starterkit_subscription" ADD CONSTRAINT "launchmvpfast-saas-starterkit_subscription_orgId_launchmvpfast-saas-starterkit_organization_id_fk" FOREIGN KEY ("orgId") REFERENCES "public"."launchmvpfast-saas-starterkit_organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_userId_idx" ON "launchmvpfast-saas-starterkit_account" USING btree ("" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "orgRequest_organizationId_idx" ON "launchmvpfast-saas-starterkit_orgRequest" USING btree ("" DESC NULLS LAST);--> statement-breakpoint
CREATE INDEX "session_userId_idx" ON "launchmvpfast-saas-starterkit_session" USING btree ("" DESC NULLS LAST);