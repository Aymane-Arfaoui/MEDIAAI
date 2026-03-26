import {
  pgTable,
  uuid,
  text,
  varchar,
  integer,
  real,
  timestamp,
  jsonb,
  index,
  customType,
} from "drizzle-orm/pg-core";

// pgvector type for embedding storage
const vector = customType<{ data: number[]; driverParam: string }>({
  dataType() {
    return "vector(1536)";
  },
  toDriver(value: number[]): string {
    return `[${value.join(",")}]`;
  },
  fromDriver(value: unknown): number[] {
    const str = value as string;
    return str
      .slice(1, -1)
      .split(",")
      .map(Number);
  },
});

// ─── Creator Profile ───────────────────────────────────────────────────────────

export const creatorProfiles = pgTable("creator_profiles", {
  id: uuid("id").primaryKey().defaultRandom(),
  name: varchar("name", { length: 255 }).notNull(),
  brandName: varchar("brand_name", { length: 255 }),
  niche: varchar("niche", { length: 255 }),
  audience: text("audience"),
  tone: text("tone"),
  businessGoals: text("business_goals"),
  themesToAvoid: text("themes_to_avoid"),
  platformPreferences: jsonb("platform_preferences").$type<Record<string, string>>(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ─── Content Item ──────────────────────────────────────────────────────────────

export const contentItems = pgTable(
  "content_items",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creatorProfiles.id)
      .notNull(),
    platform: varchar("platform", { length: 50 }).notNull(),
    externalId: varchar("external_id", { length: 255 }),
    url: text("url"),
    title: text("title"),
    caption: text("caption"),
    transcript: text("transcript"),
    publishedAt: timestamp("published_at"),
    contentType: varchar("content_type", { length: 50 }),
    durationSec: integer("duration_sec"),
    rawMetricsJson: jsonb("raw_metrics_json").$type<Record<string, unknown>>(),
    normalizedMetricsJson: jsonb("normalized_metrics_json").$type<{
      views: number;
      likes: number;
      comments: number;
      shares?: number;
      engagementProxy: number;
    }>(),
    ingestionSource: varchar("ingestion_source", { length: 50 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_content_creator").on(table.creatorId),
    index("idx_content_platform").on(table.platform),
    index("idx_content_published").on(table.publishedAt),
  ]
);

// ─── Analytics Summary ─────────────────────────────────────────────────────────

export const analyticsSummaries = pgTable(
  "analytics_summaries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creatorProfiles.id)
      .notNull(),
    contentItemId: uuid("content_item_id").references(() => contentItems.id),
    performanceScore: real("performance_score"),
    engagementProxy: real("engagement_proxy"),
    hookType: varchar("hook_type", { length: 100 }),
    topicCluster: varchar("topic_cluster", { length: 100 }),
    formatType: varchar("format_type", { length: 100 }),
    toneType: varchar("tone_type", { length: 100 }),
    performanceBucket: varchar("performance_bucket", { length: 50 }),
    derivedInsightsJson: jsonb("derived_insights_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_analytics_creator").on(table.creatorId),
    index("idx_analytics_content").on(table.contentItemId),
  ]
);

// ─── Knowledge Document ────────────────────────────────────────────────────────

export const knowledgeDocuments = pgTable(
  "knowledge_documents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creatorProfiles.id)
      .notNull(),
    name: varchar("name", { length: 500 }).notNull(),
    type: varchar("type", { length: 50 }).notNull(),
    source: varchar("source", { length: 100 }),
    rawText: text("raw_text"),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    status: varchar("status", { length: 50 }).default("pending").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_knowledge_doc_creator").on(table.creatorId)]
);

// ─── Knowledge Chunk ───────────────────────────────────────────────────────────

export const knowledgeChunks = pgTable(
  "knowledge_chunks",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creatorProfiles.id)
      .notNull(),
    documentId: uuid("document_id")
      .references(() => knowledgeDocuments.id)
      .notNull(),
    chunkText: text("chunk_text").notNull(),
    embedding: vector("embedding"),
    chunkIndex: integer("chunk_index"),
    metadataJson: jsonb("metadata_json").$type<{
      documentName?: string;
      documentType?: string;
      chunkIndex?: number;
    }>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("idx_chunk_creator").on(table.creatorId),
    index("idx_chunk_document").on(table.documentId),
  ]
);

// ─── Weekly Plan ───────────────────────────────────────────────────────────────

export const weeklyPlans = pgTable(
  "weekly_plans",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creatorProfiles.id)
      .notNull(),
    title: varchar("title", { length: 500 }),
    startDate: timestamp("start_date").notNull(),
    summary: text("summary"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_plan_creator").on(table.creatorId)]
);

// ─── Planned Content ───────────────────────────────────────────────────────────

export const plannedContents = pgTable(
  "planned_contents",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    weeklyPlanId: uuid("weekly_plan_id")
      .references(() => weeklyPlans.id)
      .notNull(),
    day: varchar("day", { length: 20 }).notNull(),
    platform: varchar("platform", { length: 50 }).notNull(),
    topic: varchar("topic", { length: 255 }),
    title: text("title"),
    hook: text("hook"),
    scriptOutline: jsonb("script_outline").$type<string[]>(),
    rationale: text("rationale"),
    status: varchar("status", { length: 50 }).default("planned").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_planned_plan").on(table.weeklyPlanId)]
);

// ─── Chat Session ──────────────────────────────────────────────────────────────

export const chatSessions = pgTable(
  "chat_sessions",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    creatorId: uuid("creator_id")
      .references(() => creatorProfiles.id)
      .notNull(),
    title: varchar("title", { length: 500 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_chat_creator").on(table.creatorId)]
);

// ─── Chat Message ──────────────────────────────────────────────────────────────

export const chatMessages = pgTable(
  "chat_messages",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    sessionId: uuid("session_id")
      .references(() => chatSessions.id)
      .notNull(),
    role: varchar("role", { length: 50 }).notNull(),
    content: text("content").notNull(),
    metadataJson: jsonb("metadata_json").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("idx_message_session").on(table.sessionId)]
);
