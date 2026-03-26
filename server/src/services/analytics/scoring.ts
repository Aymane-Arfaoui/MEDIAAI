import type { NormalizedMetrics } from "../../types/content.js";
import type { PerformanceBucket } from "../../types/analytics.js";

/**
 * Compute performance score from normalized metrics.
 *
 * Formula: normalizedViews * 0.6 + normalizedEngagement * 0.4
 *
 * Both views and engagement are normalized to 0-1 range relative to the
 * dataset min/max before computing the composite score.
 */
export function computePerformanceScore(
  metrics: NormalizedMetrics,
  datasetStats: DatasetStats
): number {
  const normalizedViews = normalizeValue(
    metrics.views,
    datasetStats.minViews,
    datasetStats.maxViews
  );
  const normalizedEngagement = normalizeValue(
    metrics.engagementProxy,
    datasetStats.minEngagement,
    datasetStats.maxEngagement
  );

  return normalizedViews * 0.6 + normalizedEngagement * 0.4;
}

/**
 * Assign a performance bucket based on score percentile.
 */
export function assignPerformanceBucket(
  score: number,
  allScores: number[]
): PerformanceBucket {
  const sorted = [...allScores].sort((a, b) => a - b);
  const rank = sorted.findIndex((s) => s >= score);
  const percentile = rank / sorted.length;

  if (percentile >= 0.75) return "top";
  if (percentile >= 0.5) return "strong";
  if (percentile >= 0.25) return "average";
  return "weak";
}

/**
 * Compute dataset-wide stats for normalization.
 */
export function computeDatasetStats(
  items: NormalizedMetrics[]
): DatasetStats {
  if (items.length === 0) {
    return {
      minViews: 0,
      maxViews: 1,
      minEngagement: 0,
      maxEngagement: 1,
    };
  }

  const views = items.map((m) => m.views);
  const engagements = items.map((m) => m.engagementProxy);

  return {
    minViews: Math.min(...views),
    maxViews: Math.max(...views) || 1,
    minEngagement: Math.min(...engagements),
    maxEngagement: Math.max(...engagements) || 1,
  };
}

function normalizeValue(value: number, min: number, max: number): number {
  if (max === min) return 0.5;
  return (value - min) / (max - min);
}

export interface DatasetStats {
  minViews: number;
  maxViews: number;
  minEngagement: number;
  maxEngagement: number;
}
