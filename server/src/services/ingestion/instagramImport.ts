import { db } from "../../db/connection.js";
import { contentItems } from "../../db/schema.js";
import { normalizeContentInput } from "./normalize.js";
import { eq, and } from "drizzle-orm";
import type {
  InstagramPostData,
  InstagramImportRow,
  RawContentInput,
} from "../../types/content.js";

/**
 * Column name mappings for common Instagram export formats.
 * Supports Apify, Phantombuster, manual exports, etc.
 */
const COLUMN_ALIASES: Record<keyof InstagramPostData, string[]> = {
  postUrl: ["url", "post_url", "postUrl", "link", "permalink", "shortCode"],
  caption: ["caption", "text", "description", "body"],
  publishedAt: [
    "timestamp",
    "date",
    "publishedAt",
    "published_at",
    "created_at",
    "createdAt",
    "posted_at",
  ],
  likes: ["likes", "likesCount", "likes_count", "like_count", "likeCount"],
  comments: [
    "comments",
    "commentsCount",
    "comments_count",
    "comment_count",
    "commentCount",
  ],
  views: ["views", "viewCount", "views_count", "view_count", "videoViews", "video_views"],
  plays: ["plays", "playCount", "plays_count", "play_count", "videoPlayCount"],
  contentType: ["type", "contentType", "content_type", "mediaType", "media_type"],
  mediaType: ["mediaType", "media_type", "product_type"],
};

/**
 * Resolve a column value from a row using known aliases.
 */
function resolveColumn(row: InstagramImportRow, field: keyof InstagramPostData): unknown {
  for (const alias of COLUMN_ALIASES[field]) {
    if (alias in row) return row[alias];
  }
  return undefined;
}

/**
 * Parse a single import row into a structured InstagramPostData object.
 */
function parseImportRow(row: InstagramImportRow): InstagramPostData {
  return {
    postUrl: String(resolveColumn(row, "postUrl") ?? ""),
    caption: String(resolveColumn(row, "caption") ?? ""),
    publishedAt: String(resolveColumn(row, "publishedAt") ?? ""),
    likes: toNumberSafe(resolveColumn(row, "likes")),
    comments: toNumberSafe(resolveColumn(row, "comments")),
    views: toNumberSafe(resolveColumn(row, "views")),
    plays: toNumberSafe(resolveColumn(row, "plays")),
    contentType: String(resolveColumn(row, "contentType") ?? "post"),
    mediaType: String(resolveColumn(row, "mediaType") ?? ""),
  };
}

/**
 * Validate that the import data has at minimum the expected shape.
 */
export function validateImportData(rows: InstagramImportRow[]): {
  valid: boolean;
  errors: string[];
  preview: InstagramPostData[];
} {
  const errors: string[] = [];

  if (!Array.isArray(rows) || rows.length === 0) {
    return { valid: false, errors: ["No data rows found"], preview: [] };
  }

  const firstRow = rows[0];
  const foundColumns: string[] = [];
  for (const [field, aliases] of Object.entries(COLUMN_ALIASES)) {
    for (const alias of aliases) {
      if (alias in firstRow) {
        foundColumns.push(field);
        break;
      }
    }
  }

  if (!foundColumns.includes("postUrl") && !foundColumns.includes("caption")) {
    errors.push(
      "Could not find a post URL or caption column. Expected columns like: url, post_url, caption, text"
    );
  }

  const preview = rows.slice(0, 5).map(parseImportRow);

  return { valid: errors.length === 0, errors, preview };
}

/**
 * Parse CSV string into rows.
 */
export function parseCsv(csvContent: string): InstagramImportRow[] {
  const lines = csvContent.trim().split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line);
    const row: InstagramImportRow = {};
    headers.forEach((header, i) => {
      row[header] = values[i]?.trim().replace(/^"|"$/g, "") ?? "";
    });
    return row;
  });
}

/**
 * Main ingestion entry point for Instagram CSV/JSON imports.
 */
export async function ingestInstagramImport(
  creatorId: string,
  data: InstagramImportRow[]
): Promise<{ ingested: number; skipped: number }> {
  // Get existing Instagram URLs to deduplicate
  const existingRows = await db
    .select({ url: contentItems.url })
    .from(contentItems)
    .where(
      and(
        eq(contentItems.creatorId, creatorId),
        eq(contentItems.platform, "instagram")
      )
    );
  const existingUrls = new Set(existingRows.map((r) => r.url).filter(Boolean));

  const parsed = data.map(parseImportRow);
  let skipped = 0;
  const records: Array<ReturnType<typeof normalizeContentInput> & { creatorId: string }> = [];

  for (const post of parsed) {
    if (!post.postUrl && !post.caption) {
      skipped++;
      continue;
    }

    if (post.postUrl && existingUrls.has(post.postUrl)) {
      skipped++;
      continue;
    }

    const input: RawContentInput = {
      platform: "instagram",
      url: post.postUrl || undefined,
      caption: post.caption || undefined,
      publishedAt: post.publishedAt || undefined,
      contentType: normalizeInstagramContentType(post.contentType, post.mediaType),
      rawMetrics: {
        likes: post.likes ?? 0,
        comments: post.comments ?? 0,
        views: post.views ?? post.plays ?? 0,
      },
      ingestionSource: "instagram-import",
    };

    records.push({ creatorId, ...normalizeContentInput(input) });
  }

  if (records.length > 0) {
    await db.insert(contentItems).values(records);
  }

  return { ingested: records.length, skipped };
}

function normalizeInstagramContentType(
  contentType?: string,
  mediaType?: string
): "reel" | "carousel" | "story" | "post" {
  const combined = `${contentType ?? ""} ${mediaType ?? ""}`.toLowerCase();
  if (combined.includes("reel") || combined.includes("video")) return "reel";
  if (combined.includes("carousel") || combined.includes("sidecar")) return "carousel";
  if (combined.includes("story")) return "story";
  return "post";
}

function toNumberSafe(value: unknown): number {
  if (value === null || value === undefined) return 0;
  const n = Number(String(value).replace(/[,\s]/g, ""));
  return isNaN(n) ? 0 : n;
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
