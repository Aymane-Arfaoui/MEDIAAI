import { db } from "../../db/connection.js";
import { contentItems, analyticsSummaries } from "../../db/schema.js";
import { eq, and, desc } from "drizzle-orm";
import type { ViralShortSelection } from "../../types/repurpose.js";

/**
 * Select the top N viral YouTube Shorts for a creator.
 *
 * Priority:
 *  1. YouTube Shorts only (contentType = "short", platform = "youtube")
 *  2. Highest performanceScore from analytics_summaries
 *  3. Tiebreaker: higher engagementProxy
 *  4. Final tiebreaker: more recent publishedAt
 */
export async function selectTopViralShorts(
  creatorId: string,
  count: number = 2
): Promise<ViralShortSelection[]> {
  const rows = await db
    .select({
      contentItem: contentItems,
      analytics: analyticsSummaries,
    })
    .from(contentItems)
    .innerJoin(
      analyticsSummaries,
      eq(contentItems.id, analyticsSummaries.contentItemId)
    )
    .where(
      and(
        eq(contentItems.creatorId, creatorId),
        eq(contentItems.platform, "youtube")
      )
    )
    .orderBy(
      desc(analyticsSummaries.performanceScore),
      desc(analyticsSummaries.engagementProxy),
      desc(contentItems.publishedAt)
    )
    .limit(count * 3); // fetch extra so we can prefer shorts

  // Prefer content typed as "short", but fall back to top scoring videos
  const shorts = rows.filter(
    (r) => r.contentItem.contentType === "short"
  );
  const pool = shorts.length >= count ? shorts : rows;
  const selected = pool.slice(0, count);

  return selected.map((row) => {
    const item = row.contentItem;
    const a = row.analytics;
    const metrics = item.normalizedMetricsJson ?? {
      views: 0,
      likes: 0,
      comments: 0,
      engagementProxy: 0,
    };

    const rationale = buildRationale(a.performanceScore, metrics, a.hookType, a.topicCluster);

    return {
      contentItemId: item.id,
      title: item.title,
      caption: item.caption,
      url: item.url,
      platform: item.platform,
      publishedAt: item.publishedAt?.toISOString() ?? null,
      durationSec: item.durationSec,
      metrics: {
        views: metrics.views,
        likes: metrics.likes,
        comments: metrics.comments,
        engagementProxy: metrics.engagementProxy,
      },
      performanceScore: a.performanceScore,
      hookType: a.hookType as any,
      topicCluster: a.topicCluster as any,
      formatType: a.formatType as any,
      toneType: a.toneType as any,
      selectionRationale: rationale,
    };
  });
}

function buildRationale(
  score: number,
  metrics: { views: number; likes: number; comments: number; engagementProxy: number },
  hookType: string | null,
  topicCluster: string | null
): string {
  const parts: string[] = [];
  parts.push(
    `Performance score of ${(score * 100).toFixed(1)}% places this in the top tier`
  );
  parts.push(
    `${metrics.views.toLocaleString()} views with ${(metrics.engagementProxy * 100).toFixed(2)}% engagement`
  );
  if (hookType && hookType !== "unknown") {
    parts.push(`Uses a "${hookType.replace(/-/g, " ")}" hook style that resonates with the audience`);
  }
  if (topicCluster && topicCluster !== "unknown") {
    parts.push(`Covers "${topicCluster.replace(/-/g, " ")}" — a strong topic for this creator`);
  }
  return parts.join(". ") + ".";
}
