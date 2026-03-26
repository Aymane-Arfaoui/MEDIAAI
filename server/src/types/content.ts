export type Platform = "youtube" | "instagram" | "tiktok" | "linkedin" | "podcast";

export type ContentType =
  | "short"
  | "video"
  | "reel"
  | "carousel"
  | "story"
  | "post"
  | "episode"
  | "article";

export type IngestionSource = "youtube-api" | "instagram-import" | "manual";

export interface NormalizedMetrics {
  views: number;
  likes: number;
  comments: number;
  shares?: number;
  engagementProxy: number;
}

export interface RawContentInput {
  platform: Platform;
  externalId?: string;
  url?: string;
  title?: string;
  caption?: string;
  transcript?: string;
  publishedAt?: string | Date;
  contentType?: ContentType;
  durationSec?: number;
  rawMetrics: Record<string, unknown>;
  ingestionSource: IngestionSource;
}

export interface YouTubeVideoData {
  videoId: string;
  title: string;
  description: string;
  publishedAt: string;
  url: string;
  thumbnailUrl?: string;
  viewCount: number;
  likeCount: number;
  commentCount: number;
  duration: string;
  contentType: "short" | "video";
}

export interface InstagramPostData {
  postUrl?: string;
  caption?: string;
  publishedAt?: string;
  likes?: number;
  comments?: number;
  views?: number;
  plays?: number;
  contentType?: string;
  mediaType?: string;
}

export interface InstagramImportRow {
  [key: string]: unknown;
}
