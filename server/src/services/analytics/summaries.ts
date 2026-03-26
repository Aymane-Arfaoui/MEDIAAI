import { db } from "../../db/connection.js";
import { contentItems, analyticsSummaries } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import {
  computePerformanceScore,
  computeDatasetStats,
  assignPerformanceBucket,
} from "./scoring.js";
import {
  classifyHookType,
  classifyFormatType,
  classifyTopicCluster,
  classifyToneType,
} from "./classification.js";
import type { NormalizedMetrics } from "../../types/content.js";
import type {
  AnalyticsSummaryOutput,
  AggregatedAnalytics,
  HookType,
  TopicCluster,
  FormatType,
} from "../../types/analytics.js";

/**
 * Run analytics computation for all content items belonging to a creator.
 * Computes scores, classifies content, and stores analytics summaries.
 */
export async function runAnalytics(
  creatorId: string
): Promise<{ processed: number; summaries: AnalyticsSummaryOutput[] }> {
  // Fetch all content items for this creator
  const items = await db
    .select()
    .from(contentItems)
    .where(eq(contentItems.creatorId, creatorId));

  if (items.length === 0) {
    return { processed: 0, summaries: [] };
  }

  // Extract normalized metrics for dataset stats
  const metricsArray: NormalizedMetrics[] = items
    .map((item) => item.normalizedMetricsJson as NormalizedMetrics | null)
    .filter((m): m is NormalizedMetrics => m !== null);

  const datasetStats = computeDatasetStats(metricsArray);

  // Compute analytics for each item
  const summaries: AnalyticsSummaryOutput[] = [];

  for (const item of items) {
    const metrics = item.normalizedMetricsJson as NormalizedMetrics | null;
    if (!metrics) continue;

    const performanceScore = computePerformanceScore(metrics, datasetStats);
    const hookType = classifyHookType(item.title, item.caption);
    const formatType = classifyFormatType(item.title, item.contentType, item.durationSec);
    const topicCluster = classifyTopicCluster(item.title, item.caption);
    const toneType = classifyToneType(item.title, item.caption);

    summaries.push({
      contentItemId: item.id,
      performanceScore,
      engagementProxy: metrics.engagementProxy,
      hookType,
      topicCluster,
      formatType,
      toneType,
      performanceBucket: "average", // placeholder, computed below
      derivedInsights: {
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        platform: item.platform,
        title: item.title,
        caption: item.caption,
      },
    });
  }

  // Assign performance buckets
  const allScores = summaries.map((s) => s.performanceScore);
  for (const summary of summaries) {
    summary.performanceBucket = assignPerformanceBucket(summary.performanceScore, allScores);
  }

  // Store in database (upsert: delete existing + re-insert)
  await db.delete(analyticsSummaries).where(eq(analyticsSummaries.creatorId, creatorId));

  if (summaries.length > 0) {
    await db.insert(analyticsSummaries).values(
      summaries.map((s) => ({
        creatorId,
        contentItemId: s.contentItemId,
        performanceScore: s.performanceScore,
        engagementProxy: s.engagementProxy,
        hookType: s.hookType,
        topicCluster: s.topicCluster,
        formatType: s.formatType,
        toneType: s.toneType,
        performanceBucket: s.performanceBucket,
        derivedInsightsJson: s.derivedInsights,
      }))
    );
  }

  return { processed: summaries.length, summaries };
}

/**
 * Aggregate analytics into a high-level summary for downstream use.
 */
export async function getAggregatedAnalytics(
  creatorId: string
): Promise<AggregatedAnalytics> {
  const summaries = await db
    .select()
    .from(analyticsSummaries)
    .where(eq(analyticsSummaries.creatorId, creatorId));

  const topPerforming = summaries
    .filter((s) => s.performanceBucket === "top" || s.performanceBucket === "strong")
    .sort((a, b) => (b.performanceScore ?? 0) - (a.performanceScore ?? 0))
    .slice(0, 10)
    .map(toSummaryOutput);

  const underperforming = summaries
    .filter((s) => s.performanceBucket === "weak")
    .sort((a, b) => (a.performanceScore ?? 0) - (b.performanceScore ?? 0))
    .slice(0, 5)
    .map(toSummaryOutput);

  const topicDistribution = buildDistribution<TopicCluster>(
    summaries,
    (s) => (s.topicCluster ?? "unknown") as TopicCluster
  );
  const hookDistribution = buildDistribution<HookType>(
    summaries,
    (s) => (s.hookType ?? "unknown") as HookType
  );
  const formatDistribution = buildDistribution<FormatType>(
    summaries,
    (s) => (s.formatType ?? "unknown") as FormatType
  );

  const allTopics = new Set(summaries.map((s) => s.topicCluster).filter(Boolean));
  const expectedTopics = [
    "diligence",
    "fundraising",
    "contracts",
    "founder-legal-mistakes",
    "startup-readiness",
    "hiring-developer-agreements",
    "risk-prevention",
  ];
  const contentGaps = expectedTopics.filter((t) => !allTopics.has(t));

  const painPointHypotheses = derivePainPoints(topPerforming);

  return {
    topPerforming,
    underperforming,
    topicDistribution,
    hookDistribution,
    formatDistribution,
    contentGaps,
    painPointHypotheses,
  };
}

function toSummaryOutput(row: typeof analyticsSummaries.$inferSelect): AnalyticsSummaryOutput {
  return {
    contentItemId: row.contentItemId ?? "",
    performanceScore: row.performanceScore ?? 0,
    engagementProxy: row.engagementProxy ?? 0,
    hookType: (row.hookType ?? "unknown") as any,
    topicCluster: (row.topicCluster ?? "unknown") as any,
    formatType: (row.formatType ?? "unknown") as any,
    toneType: (row.toneType ?? "unknown") as any,
    performanceBucket: (row.performanceBucket ?? "average") as any,
    derivedInsights: (row.derivedInsightsJson as Record<string, unknown>) ?? {},
  };
}

function buildDistribution<T extends string>(
  summaries: typeof analyticsSummaries.$inferSelect[],
  keyFn: (s: typeof analyticsSummaries.$inferSelect) => T
): Record<T, { count: number; avgScore: number }> {
  const map: Record<string, { count: number; totalScore: number }> = {};

  for (const s of summaries) {
    const key = keyFn(s);
    if (!map[key]) map[key] = { count: 0, totalScore: 0 };
    map[key].count++;
    map[key].totalScore += s.performanceScore ?? 0;
  }

  const result: Record<string, { count: number; avgScore: number }> = {};
  for (const [key, data] of Object.entries(map)) {
    result[key] = { count: data.count, avgScore: data.totalScore / data.count };
  }

  return result as Record<T, { count: number; avgScore: number }>;
}

function derivePainPoints(topPerforming: AnalyticsSummaryOutput[]): string[] {
  const points: string[] = [];
  const topics = topPerforming.map((t) => t.topicCluster);

  if (topics.includes("founder-legal-mistakes"))
    points.push("Founders fear making expensive legal mistakes early on");
  if (topics.includes("fundraising"))
    points.push("Uncertainty about fundraising readiness and investor expectations");
  if (topics.includes("contracts"))
    points.push("Confusion about contract terms and negotiation norms");
  if (topics.includes("diligence"))
    points.push("Anxiety about due diligence preparation and data room readiness");
  if (topics.includes("hiring-developer-agreements"))
    points.push("Unclear on IP assignment and developer contractor agreements");
  if (topics.includes("risk-prevention"))
    points.push("Need to understand legal risk exposure and how to mitigate it");

  if (points.length === 0) {
    points.push("Founders need practical, actionable legal guidance for startups");
  }

  return points;
}
