import { db } from "../../db/connection.js";
import { contentItems } from "../../db/schema.js";
import { normalizeContentInput } from "./normalize.js";
import { eq, and } from "drizzle-orm";
import type { YouTubeVideoData, RawContentInput } from "../../types/content.js";

const YT_API_BASE = "https://www.googleapis.com/youtube/v3";

function getYouTubeApiKey(): string {
  const key = process.env.YOUTUBE_API_KEY;
  if (!key) {
    throw new Error("YOUTUBE_API_KEY is not configured");
  }
  return key;
}

/**
 * Extract channel ID or handle from a YouTube URL.
 */
export function parseYouTubeUrl(url: string): {
  type: "channel" | "handle" | "video";
  value: string;
} {
  const u = new URL(url);
  const path = u.pathname;

  // /channel/UCxxxx
  const channelMatch = path.match(/\/channel\/(UC[\w-]+)/);
  if (channelMatch) return { type: "channel", value: channelMatch[1] };

  // /@handle or /@handle/shorts
  const handleMatch = path.match(/\/@([\w.-]+)/);
  if (handleMatch) return { type: "handle", value: handleMatch[1] };

  // /watch?v=xxx or /shorts/xxx
  const videoIdParam = u.searchParams.get("v");
  if (videoIdParam) return { type: "video", value: videoIdParam };

  const shortsMatch = path.match(/\/shorts\/([\w-]+)/);
  if (shortsMatch) return { type: "video", value: shortsMatch[1] };

  throw new Error(`Could not parse YouTube URL: ${url}`);
}

/**
 * Resolve a YouTube handle to a channel ID.
 */
async function resolveHandleToChannelId(handle: string): Promise<string> {
  const apiKey = getYouTubeApiKey();
  const res = await fetch(
    `${YT_API_BASE}/channels?forHandle=${handle}&part=id&key=${apiKey}`
  );
  const data = await res.json() as { items?: { id: string }[] };

  if (!data.items?.length) {
    throw new Error(`Could not resolve YouTube handle: @${handle}`);
  }
  return data.items[0].id;
}

/**
 * Fetch recent videos from a YouTube channel.
 */
async function fetchChannelVideos(
  channelId: string,
  maxResults: number = 50
): Promise<YouTubeVideoData[]> {
  const apiKey = getYouTubeApiKey();
  // Get upload playlist
  const channelRes = await fetch(
    `${YT_API_BASE}/channels?id=${channelId}&part=contentDetails&key=${apiKey}`
  );
  const channelData = await channelRes.json() as {
    items?: { contentDetails: { relatedPlaylists: { uploads: string } } }[];
  };

  const uploadsPlaylistId =
    channelData.items?.[0]?.contentDetails?.relatedPlaylists?.uploads;
  if (!uploadsPlaylistId) {
    throw new Error(`Could not find uploads playlist for channel: ${channelId}`);
  }

  // Fetch playlist items
  const playlistRes = await fetch(
    `${YT_API_BASE}/playlistItems?playlistId=${uploadsPlaylistId}&part=snippet&maxResults=${maxResults}&key=${apiKey}`
  );
  const playlistData = await playlistRes.json() as {
    items?: {
      snippet: {
        resourceId: { videoId: string };
        title: string;
        description: string;
        publishedAt: string;
        thumbnails?: { high?: { url: string } };
      };
    }[];
  };

  if (!playlistData.items?.length) return [];

  const videoIds = playlistData.items.map(
    (item) => item.snippet.resourceId.videoId
  );

  // Fetch video statistics
  const statsRes = await fetch(
    `${YT_API_BASE}/videos?id=${videoIds.join(",")}&part=statistics,contentDetails&key=${apiKey}`
  );
  const statsData = await statsRes.json() as {
    items?: {
      id: string;
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
      contentDetails: { duration: string };
    }[];
  };

  const statsMap = new Map(
    (statsData.items ?? []).map((item) => [item.id, item])
  );

  return playlistData.items.map((item) => {
    const videoId = item.snippet.resourceId.videoId;
    const stats = statsMap.get(videoId);
    const durationStr = stats?.contentDetails?.duration ?? "PT0S";
    const durationSec = parseDuration(durationStr);

    return {
      videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${videoId}`,
      thumbnailUrl: item.snippet.thumbnails?.high?.url,
      viewCount: parseInt(stats?.statistics?.viewCount ?? "0", 10),
      likeCount: parseInt(stats?.statistics?.likeCount ?? "0", 10),
      commentCount: parseInt(stats?.statistics?.commentCount ?? "0", 10),
      duration: durationStr,
      contentType: durationSec <= 60 ? "short" as const : "video" as const,
    };
  });
}

/**
 * Fetch a single video's data.
 */
async function fetchSingleVideo(videoId: string): Promise<YouTubeVideoData> {
  const apiKey = getYouTubeApiKey();
  const res = await fetch(
    `${YT_API_BASE}/videos?id=${videoId}&part=snippet,statistics,contentDetails&key=${apiKey}`
  );
  const data = await res.json() as {
    items?: {
      id: string;
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails?: { high?: { url: string } };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
      contentDetails: { duration: string };
    }[];
  };

  const item = data.items?.[0];
  if (!item) throw new Error(`Video not found: ${videoId}`);

  const durationSec = parseDuration(item.contentDetails.duration);

  return {
    videoId: item.id,
    title: item.snippet.title,
    description: item.snippet.description,
    publishedAt: item.snippet.publishedAt,
    url: `https://www.youtube.com/watch?v=${item.id}`,
    thumbnailUrl: item.snippet.thumbnails?.high?.url,
    viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
    likeCount: parseInt(item.statistics.likeCount ?? "0", 10),
    commentCount: parseInt(item.statistics.commentCount ?? "0", 10),
    duration: item.contentDetails.duration,
    contentType: durationSec <= 60 ? "short" : "video",
  };
}

/**
 * Fetch the most viewed videos from a channel using YouTube search API,
 * sorted by viewCount. This catches popular older videos that the
 * chronological uploads playlist misses.
 */
async function fetchPopularVideos(
  channelId: string,
  maxResults: number = 50
): Promise<YouTubeVideoData[]> {
  const apiKey = getYouTubeApiKey();

  const searchRes = await fetch(
    `${YT_API_BASE}/search?channelId=${channelId}&part=id&order=viewCount&type=video&maxResults=${Math.min(maxResults, 50)}&key=${apiKey}`
  );
  const searchData = await searchRes.json() as {
    items?: { id: { videoId: string } }[];
  };

  if (!searchData.items?.length) return [];

  const videoIds = searchData.items.map((item) => item.id.videoId);

  const statsRes = await fetch(
    `${YT_API_BASE}/videos?id=${videoIds.join(",")}&part=snippet,statistics,contentDetails&key=${apiKey}`
  );
  const statsData = await statsRes.json() as {
    items?: {
      id: string;
      snippet: {
        title: string;
        description: string;
        publishedAt: string;
        thumbnails?: { high?: { url: string } };
      };
      statistics: {
        viewCount?: string;
        likeCount?: string;
        commentCount?: string;
      };
      contentDetails: { duration: string };
    }[];
  };

  return (statsData.items ?? []).map((item) => {
    const durationSec = parseDuration(item.contentDetails.duration);
    return {
      videoId: item.id,
      title: item.snippet.title,
      description: item.snippet.description,
      publishedAt: item.snippet.publishedAt,
      url: `https://www.youtube.com/watch?v=${item.id}`,
      thumbnailUrl: item.snippet.thumbnails?.high?.url,
      viewCount: parseInt(item.statistics.viewCount ?? "0", 10),
      likeCount: parseInt(item.statistics.likeCount ?? "0", 10),
      commentCount: parseInt(item.statistics.commentCount ?? "0", 10),
      duration: item.contentDetails.duration,
      contentType: durationSec <= 60 ? "short" as const : "video" as const,
    };
  });
}

/**
 * Main ingestion entry point.
 * Fetches both recent uploads AND most popular videos, deduplicates,
 * and skips videos already in the database.
 */
export async function ingestYouTube(
  creatorId: string,
  url: string,
  maxResults: number = 50
): Promise<{ ingested: number; videos: YouTubeVideoData[] }> {
  getYouTubeApiKey();

  const parsed = parseYouTubeUrl(url);
  let videos: YouTubeVideoData[];

  if (parsed.type === "video") {
    videos = [await fetchSingleVideo(parsed.value)];
  } else {
    const channelId =
      parsed.type === "handle"
        ? await resolveHandleToChannelId(parsed.value)
        : parsed.value;

    // Fetch both recent and popular, then merge
    const [recent, popular] = await Promise.all([
      fetchChannelVideos(channelId, maxResults),
      fetchPopularVideos(channelId, maxResults),
    ]);

    const seen = new Set<string>();
    videos = [];
    for (const v of [...popular, ...recent]) {
      if (!seen.has(v.videoId)) {
        seen.add(v.videoId);
        videos.push(v);
      }
    }
  }

  // Skip videos already in the DB for this creator
  const existingRows = await db
    .select({ externalId: contentItems.externalId })
    .from(contentItems)
    .where(
      and(
        eq(contentItems.creatorId, creatorId),
        eq(contentItems.platform, "youtube")
      )
    );
  const existingIds = new Set(existingRows.map((r) => r.externalId));

  const newVideos = videos.filter((v) => !existingIds.has(v.videoId));

  const records = newVideos.map((video) => {
    const input: RawContentInput = {
      platform: "youtube",
      externalId: video.videoId,
      url: video.url,
      title: video.title,
      caption: video.description,
      publishedAt: video.publishedAt,
      contentType: video.contentType,
      durationSec: parseDuration(video.duration),
      rawMetrics: {
        viewCount: video.viewCount,
        likeCount: video.likeCount,
        commentCount: video.commentCount,
      },
      ingestionSource: "youtube-api",
    };

    return { creatorId, ...normalizeContentInput(input) };
  });

  // Insert in batches of 15 to avoid parameter limits
  const BATCH_SIZE = 15;
  for (let i = 0; i < records.length; i += BATCH_SIZE) {
    const batch = records.slice(i, i + BATCH_SIZE);
    await db.insert(contentItems).values(batch);
  }

  return { ingested: records.length, videos: newVideos };
}

/**
 * Parse ISO 8601 duration string (PT1H2M3S) into seconds.
 */
function parseDuration(iso: string): number {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;
  const hours = parseInt(match[1] ?? "0", 10);
  const minutes = parseInt(match[2] ?? "0", 10);
  const seconds = parseInt(match[3] ?? "0", 10);
  return hours * 3600 + minutes * 60 + seconds;
}
