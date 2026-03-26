import type {
  NormalizedMetrics,
  RawContentInput,
  Platform,
  ContentType,
} from "../../types/content.js";

/**
 * Compute engagement proxy: (likes + comments) / max(views, 1)
 */
export function computeEngagementProxy(
  likes: number,
  comments: number,
  views: number
): number {
  return (likes + comments) / Math.max(views, 1);
}

/**
 * Normalize raw metrics from any platform into a common schema.
 */
export function normalizeMetrics(raw: Record<string, unknown>): NormalizedMetrics {
  const views = toNumber(raw.views ?? raw.viewCount ?? raw.plays ?? raw.impressions ?? 0);
  const likes = toNumber(raw.likes ?? raw.likeCount ?? raw.digg ?? 0);
  const comments = toNumber(raw.comments ?? raw.commentCount ?? 0);
  const shares = toNumber(raw.shares ?? raw.shareCount ?? 0);

  return {
    views,
    likes,
    comments,
    shares: shares || undefined,
    engagementProxy: computeEngagementProxy(likes, comments, views),
  };
}

/**
 * Normalize a content type string into the standard enum.
 */
export function normalizeContentType(
  raw: string | undefined,
  platform: Platform,
  durationSec?: number
): ContentType {
  if (!raw) {
    if (platform === "youtube") {
      return durationSec && durationSec <= 60 ? "short" : "video";
    }
    if (platform === "instagram") return "post";
    return "post";
  }

  const lower = raw.toLowerCase();

  if (lower.includes("short") || lower.includes("reel")) {
    return platform === "youtube" ? "short" : "reel";
  }
  if (lower.includes("carousel") || lower.includes("sidecar")) return "carousel";
  if (lower.includes("story")) return "story";
  if (lower.includes("video")) return "video";
  if (lower.includes("episode") || lower.includes("podcast")) return "episode";
  if (lower.includes("article") || lower.includes("post")) return "article";

  return "post";
}

/**
 * Normalize a date string into a Date object, handling various formats.
 */
export function normalizeDate(raw: string | Date | undefined): Date | null {
  if (!raw) return null;
  if (raw instanceof Date) return raw;

  const parsed = new Date(raw);
  return isNaN(parsed.getTime()) ? null : parsed;
}

/**
 * Normalize platform name to standard enum.
 */
export function normalizePlatform(raw: string): Platform {
  const lower = raw.toLowerCase().trim();

  if (lower.includes("youtube") || lower === "yt") return "youtube";
  if (lower.includes("instagram") || lower === "ig") return "instagram";
  if (lower.includes("tiktok") || lower === "tt") return "tiktok";
  if (lower.includes("linkedin") || lower === "li") return "linkedin";
  if (lower.includes("podcast")) return "podcast";

  return raw as Platform;
}

/**
 * Build a normalized content record from raw ingested data.
 */
export function normalizeContentInput(input: RawContentInput) {
  const normalizedMetrics = normalizeMetrics(input.rawMetrics);
  const contentType = normalizeContentType(
    input.contentType,
    input.platform,
    input.durationSec
  );
  const publishedAt = normalizeDate(input.publishedAt);

  return {
    platform: input.platform,
    externalId: input.externalId ?? null,
    url: input.url ?? null,
    title: input.title ?? null,
    caption: input.caption ?? null,
    transcript: input.transcript ?? null,
    publishedAt,
    contentType,
    durationSec: input.durationSec ?? null,
    rawMetricsJson: input.rawMetrics,
    normalizedMetricsJson: normalizedMetrics,
    ingestionSource: input.ingestionSource,
  };
}

function toNumber(value: unknown): number {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const cleaned = value.replace(/[,\s]/g, "");
    const parsed = Number(cleaned);
    return isNaN(parsed) ? 0 : parsed;
  }
  return 0;
}
