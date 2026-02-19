import { relations, sql } from "drizzle-orm";
import {
    boolean,
    index,
    integer,
    jsonb,
    pgEnum,
    pgTableCreator,
    primaryKey,
    text,
    timestamp,
    varchar,
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { type AdapterAccount } from "next-auth/adapters";
import { z } from "zod";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator(
    (name) => `launchmvpfast-saas-starterkit_${name}`,
);

export const usersRoleEnum = pgEnum("role", ["User", "Admin", "Super Admin"]);

export const users = createTable(
    "user",
    {
        id: varchar("id", { length: 255 }).notNull().primaryKey(),
        name: varchar("name", { length: 255 }),
        email: varchar("email", { length: 255 }).notNull(),
        emailVerified: timestamp("emailVerified", {
            mode: "date",
        }).default(sql`CURRENT_TIMESTAMP`),
        image: varchar("image", { length: 255 }),
        role: usersRoleEnum("role").default("User").notNull(),
        isNewUser: boolean("isNewUser").default(true).notNull(),
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (user) => ({
        emailIdx: index("user_email_idx").on(user.email),
    }),
);

export const usersRelations = relations(users, ({ many }) => ({
    accounts: many(accounts),
    membersToOrganizations: many(membersToOrganizations),
    feedback: many(feedback),
}));

export const userInsertSchema = createInsertSchema(users, {
    name: z
        .string()
        .trim()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
    email: z.string().email(),
    image: z.string().url(),
});

export const accounts = createTable(
    "account",
    {
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        type: varchar("type", { length: 255 })
            .$type<AdapterAccount["type"]>()
            .notNull(),
        provider: varchar("provider", { length: 255 }).notNull(),
        providerAccountId: varchar("providerAccountId", {
            length: 255,
        }).notNull(),
        refresh_token: text("refresh_token"),
        access_token: text("access_token"),
        expires_at: integer("expires_at"),
        token_type: varchar("token_type", { length: 255 }),
        scope: varchar("scope", { length: 255 }),
        id_token: text("id_token"),
        session_state: varchar("session_state", { length: 255 }),
    },
    (account) => ({
        compoundKey: primaryKey({
            columns: [account.provider, account.providerAccountId],
        }),
        userIdIdx: index("account_userId_idx").on(account.userId),
    }),
);

export const accountsRelations = relations(accounts, ({ one }) => ({
    user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
    "session",
    {
        sessionToken: varchar("sessionToken", { length: 255 })
            .notNull()
            .primaryKey(),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (session) => ({
        userIdIdx: index("session_userId_idx").on(session.userId),
    }),
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
    user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
    "verificationToken",
    {
        identifier: varchar("identifier", { length: 255 }).notNull(),
        token: varchar("token", { length: 255 }).notNull(),
        expires: timestamp("expires", { mode: "date" }).notNull(),
    },
    (vt) => ({
        compoundKey: primaryKey({ columns: [vt.identifier, vt.token] }),
    }),
);

export const organizations = createTable("organization", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    name: varchar("name", { length: 255 }).notNull(),
    email: varchar("email", { length: 255 }).notNull(),
    image: varchar("image", { length: 255 }),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    ownerId: varchar("ownerId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
});

export const createOrgInsertSchema = createInsertSchema(organizations, {
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(50, "Name must be at most 50 characters long"),
    image: z.string().url({ message: "Invalid image URL" }),
});

export const organizationsRelations = relations(
    organizations,
    ({ one, many }) => ({
        owner: one(users, {
            fields: [organizations.ownerId],
            references: [users.id],
        }),
        membersToOrganizations: many(membersToOrganizations),
        subscriptions: one(subscriptions, {
            fields: [organizations.id],
            references: [subscriptions.orgId],
        }),
    }),
);

export const membersToOrganizationsRoleEnum = pgEnum("org-member-role", [
    "Viewer",
    "Developer",
    "Billing",
    "Admin",
]);

export const membersToOrganizations = createTable(
    "membersToOrganizations",
    {
        id: varchar("id", { length: 255 }).default(sql`gen_random_uuid()`),
        memberId: varchar("memberId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),
        memberEmail: varchar("memberEmail", { length: 255 }).notNull(),
        organizationId: varchar("organizationId", { length: 255 })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        role: membersToOrganizationsRoleEnum("role")
            .default("Viewer")
            .notNull(),
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (mto) => ({
        compoundKey: primaryKey({
            columns: [mto.id, mto.memberId, mto.organizationId],
        }),
    }),
);

export const membersToOrganizationsRelations = relations(
    membersToOrganizations,
    ({ one }) => ({
        member: one(users, {
            fields: [membersToOrganizations.memberId],
            references: [users.id],
        }),
        organization: one(organizations, {
            fields: [membersToOrganizations.organizationId],
            references: [organizations.id],
        }),
    }),
);

export const membersToOrganizationsInsertSchema = createInsertSchema(
    membersToOrganizations,
);

export const orgRequests = createTable(
    "orgRequest",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        userId: varchar("userId", { length: 255 })
            .notNull()
            .references(() => users.id, { onDelete: "cascade" }),

        organizationId: varchar("organizationId", {
            length: 255,
        })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        createdAt: timestamp("createdAt", { mode: "date" })
            .notNull()
            .defaultNow(),
    },
    (or) => ({
        orgIdIdx: index("orgRequest_organizationId_idx").on(or.organizationId),
    }),
);

export const orgRequestsRelations = relations(orgRequests, ({ one }) => ({
    user: one(users, { fields: [orgRequests.userId], references: [users.id] }),
    organization: one(organizations, {
        fields: [orgRequests.organizationId],
        references: [organizations.id],
    }),
}));

export const orgRequestInsertSchema = createInsertSchema(orgRequests);

// Feedback schema

export const feedbackLabelEnum = pgEnum("feedback-label", [
    "Issue",
    "Idea",
    "Question",
    "Complaint",
    "Feature Request",
    "Other",
]);

export const feedbackStatusEnum = pgEnum("feedback-status", [
    "Open",
    "In Progress",
    "Closed",
]);

export const feedback = createTable("feedback", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    userId: varchar("userId", { length: 255 })
        .notNull()
        .references(() => users.id, { onDelete: "cascade" }),
    title: varchar("title", { length: 255 }),
    message: text("message").notNull(),
    label: feedbackLabelEnum("label").notNull(),
    status: feedbackStatusEnum("status").default("Open").notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const feedbackRelations = relations(feedback, ({ one }) => ({
    user: one(users, { fields: [feedback.userId], references: [users.id] }),
}));

export const feedbackInsertSchema = createInsertSchema(feedback, {
    title: z
        .string()
        .min(3, "Title is too short")
        .max(255, "Title is too long"),
    message: z
        .string()
        .min(10, "Message is too short")
        .max(1000, "Message is too long"),
});

export const feedbackSelectSchema = createSelectSchema(feedback, {
    title: z
        .string()
        .min(3, "Title is too short")
        .max(255, "Title is too long"),
    message: z
        .string()
        .min(10, "Message is too short")
        .max(1000, "Message is too long"),
});

export const webhookEvents = createTable("webhookEvent", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    eventName: text("eventName").notNull(),
    processed: boolean("processed").default(false),
    body: jsonb("body").notNull(),
    processingError: text("processingError"),
});

export const subscriptions = createTable("subscription", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    lemonSqueezyId: text("lemonSqueezyId").unique().notNull(),
    orderId: integer("orderId").notNull(),
    orgId: text("orgId")
        .notNull()
        .references(() => organizations.id, { onDelete: "cascade" }),
    variantId: integer("variantId").notNull(),
});

export const subscriptionsRelations = relations(subscriptions, ({ one }) => ({
    organization: one(organizations, {
        fields: [subscriptions.orgId],
        references: [organizations.id],
    }),
}));

export const waitlistUsers = createTable("waitlistUser", {
    id: varchar("id", { length: 255 })
        .notNull()
        .primaryKey()
        .default(sql`gen_random_uuid()`),
    email: varchar("email", { length: 255 }).notNull().unique(),
    name: varchar("name", { length: 255 }).notNull(),
    createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
});

export const waitlistUsersSchema = createInsertSchema(waitlistUsers, {
    email: z.string().email("Email must be a valid email address"),
    name: z.string().min(3, "Name must be at least 3 characters long"),
});

// Relay: event-driven AI orchestration
export const relayProjects = createTable(
    "relayProject",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        orgId: varchar("orgId", { length: 255 })
            .notNull()
            .references(() => organizations.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        devinApiKeyEncrypted: text("devinApiKeyEncrypted"),
        contextInstructions: text("contextInstructions"),
        createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    },
    (t) => ({
        orgIdIdx: index("relayProject_orgId_idx").on(t.orgId),
    }),
);

export const relayProjectsRelations = relations(relayProjects, ({ one, many }) => ({
    organization: one(organizations, {
        fields: [relayProjects.orgId],
        references: [organizations.id],
    }),
    triggers: many(relayTriggers),
    workflows: many(relayWorkflows),
    relayEvents: many(relayEvents),
    executions: many(relayExecutions),
}));

export const relayTriggers = createTable(
    "relayTrigger",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        projectId: varchar("projectId", { length: 255 })
            .notNull()
            .references(() => relayProjects.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        source: varchar("source", { length: 255 }).notNull().default("Custom"),
        eventType: varchar("eventType", { length: 255 }).notNull(),
        githubRepo: varchar("githubRepo", { length: 255 }).notNull().default(""),
        promptTemplate: text("promptTemplate").notNull(),
        conditions: jsonb("conditions").$type<{ path: string; operator: string; value: unknown }[]>().default([]),
        thresholdConfig: jsonb("thresholdConfig").$type<{ count: number; windowMinutes: number } | null>().default(null),
        includePaths: jsonb("includePaths").$type<string[]>().default([]),
        excludePaths: jsonb("excludePaths").$type<string[]>().default([]),
        enabled: boolean("enabled").default(true).notNull(),
        concurrencyLimit: integer("concurrencyLimit").default(3).notNull(),
        dailyCap: integer("dailyCap").default(50).notNull(),
        lowNoiseMode: boolean("lowNoiseMode").default(false).notNull(),
        setupComplete: boolean("setupComplete").default(true).notNull(),
        createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    },
    (t) => ({
        projectIdIdx: index("relayTrigger_projectId_idx").on(t.projectId),
    }),
);

export const relayTriggersRelations = relations(relayTriggers, ({ one, many }) => ({
    project: one(relayProjects, {
        fields: [relayTriggers.projectId],
        references: [relayProjects.id],
    }),
    relayEvents: many(relayEvents),
    executions: many(relayExecutions),
}));

/** Workflow source: which trigger to watch (trigger has source/eventType labels) */
export type WorkflowSource = { triggerId: string };

/** Source-scoped condition for workflows */
export type WorkflowCondition = {
    triggerId?: string;
    path: string;
    operator: string;
    value: unknown;
};

export const relayWorkflowMatchModeEnum = pgEnum("relay-workflow-match-mode", [
    "any",
    "all",
]);

export const relayWorkflows = createTable(
    "relayWorkflow",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        projectId: varchar("projectId", { length: 255 })
            .notNull()
            .references(() => relayProjects.id, { onDelete: "cascade" }),
        name: varchar("name", { length: 255 }).notNull(),
        triggerIds: jsonb("triggerIds").$type<string[]>().notNull().default([]),
        matchMode: relayWorkflowMatchModeEnum("matchMode").notNull().default("all"),
        timeWindowMinutes: integer("timeWindowMinutes").notNull().default(5),
        conditions: jsonb("conditions").$type<WorkflowCondition[]>().default([]),
        promptTemplate: text("promptTemplate").notNull(),
        githubRepo: varchar("githubRepo", { length: 255 }).notNull().default(""),
        includePaths: jsonb("includePaths").$type<string[]>().default([]),
        excludePaths: jsonb("excludePaths").$type<string[]>().default([]),
        enabled: boolean("enabled").default(true).notNull(),
        createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    },
    (t) => ({
        projectIdIdx: index("relayWorkflow_projectId_idx").on(t.projectId),
    }),
);

export const relayWorkflowsRelations = relations(relayWorkflows, ({ one, many }) => ({
    project: one(relayProjects, {
        fields: [relayWorkflows.projectId],
        references: [relayProjects.id],
    }),
    executions: many(relayExecutions),
}));

export const relayEvents = createTable(
    "relayEvent",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        projectId: varchar("projectId", { length: 255 })
            .notNull()
            .references(() => relayProjects.id, { onDelete: "cascade" }),
        triggerId: varchar("triggerId", { length: 255 })
            .notNull()
            .references(() => relayTriggers.id, { onDelete: "cascade" }),
        deliveryId: varchar("deliveryId", { length: 512 }).notNull(),
        rawPayload: jsonb("rawPayload").notNull(),
        receivedAt: timestamp("receivedAt", { mode: "date" }).notNull().defaultNow(),
        executionId: varchar("executionId", { length: 255 }),
    },
    (t) => ({
        triggerIdIdx: index("relayEvent_triggerId_idx").on(t.triggerId),
        projectIdIdx: index("relayEvent_projectId_idx").on(t.projectId),
        deliveryIdTriggerIdx: index("relayEvent_deliveryId_triggerId_idx").on(
            t.deliveryId,
            t.triggerId,
        ),
        executionIdIdx: index("relayEvent_executionId_idx").on(t.executionId),
    }),
);

export const relayEventsRelations = relations(relayEvents, ({ one }) => ({
    project: one(relayProjects, {
        fields: [relayEvents.projectId],
        references: [relayProjects.id],
    }),
    trigger: one(relayTriggers, {
        fields: [relayEvents.triggerId],
        references: [relayTriggers.id],
    }),
    execution: one(relayExecutions, {
        fields: [relayEvents.executionId],
        references: [relayExecutions.id],
    }),
}));

export const relayExecutionStatusEnum = pgEnum("relay-execution-status", [
    "pending",
    "running",
    "completed",
    "failed",
]);

export const relayExecutions = createTable(
    "relayExecution",
    {
        id: varchar("id", { length: 255 })
            .notNull()
            .primaryKey()
            .default(sql`gen_random_uuid()`),
        eventId: varchar("eventId", { length: 255 })
            .notNull()
            .references(() => relayEvents.id, { onDelete: "cascade" }),
        projectId: varchar("projectId", { length: 255 })
            .notNull()
            .references(() => relayProjects.id, { onDelete: "cascade" }),
        triggerId: varchar("triggerId", { length: 255 })
            .notNull()
            .references(() => relayTriggers.id, { onDelete: "cascade" }),
        workflowId: varchar("workflowId", { length: 255 }).references(
            () => relayWorkflows.id,
            { onDelete: "set null" },
        ),
        eventIds: jsonb("eventIds").$type<string[] | null>(),
        renderedPrompt: text("renderedPrompt"),
        aiSessionId: varchar("aiSessionId", { length: 255 }),
        status: relayExecutionStatusEnum("status").notNull().default("pending"),
        output: text("output"),
        error: text("error"),
        startedAt: timestamp("startedAt", { mode: "date" }),
        completedAt: timestamp("completedAt", { mode: "date" }),
        latencyMs: integer("latencyMs"),
        createdAt: timestamp("createdAt", { mode: "date" }).notNull().defaultNow(),
    },
    (t) => ({
        eventIdIdx: index("relayExecution_eventId_idx").on(t.eventId),
        projectIdIdx: index("relayExecution_projectId_idx").on(t.projectId),
        workflowIdIdx: index("relayExecution_workflowId_idx").on(t.workflowId),
        projectCreatedIdx: index("relayExecution_projectId_createdAt_idx").on(
            t.projectId,
            t.createdAt,
        ),
    }),
);

export const relayExecutionsRelations = relations(relayExecutions, ({ one }) => ({
    event: one(relayEvents, {
        fields: [relayExecutions.eventId],
        references: [relayEvents.id],
    }),
    project: one(relayProjects, {
        fields: [relayExecutions.projectId],
        references: [relayProjects.id],
    }),
    trigger: one(relayTriggers, {
        fields: [relayExecutions.triggerId],
        references: [relayTriggers.id],
    }),
    workflow: one(relayWorkflows, {
        fields: [relayExecutions.workflowId],
        references: [relayWorkflows.id],
    }),
}));
