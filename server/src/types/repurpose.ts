import type { HookType, TopicCluster, FormatType, ToneType } from "./analytics.js";

export interface ViralShortSelection {
  contentItemId: string;
  title: string | null;
  caption: string | null;
  url: string | null;
  platform: string;
  publishedAt: string | null;
  durationSec: number | null;
  metrics: {
    views: number;
    likes: number;
    comments: number;
    engagementProxy: number;
  };
  performanceScore: number;
  hookType: HookType;
  topicCluster: TopicCluster;
  formatType: FormatType;
  toneType: ToneType;
  selectionRationale: string;
}

export interface DownloadedAsset {
  contentItemId: string;
  filePath: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  durationSec: number | null;
}

export interface RepurposeAnalysis {
  contentItemId: string;
  originalTitle: string;
  whyItWorked: string[];
  strongestHook: string;
  mainTopic: string;
  targetAudienceAngle: string;
  tone: string;
  repurposingOpportunities: string[];
}

export interface RepurposePlan {
  contentItemId: string;
  originalTitle: string;
  originalUrl: string;
  analysis: RepurposeAnalysis;
  titleOptions: string[];
  hookOptions: string[];
  rewrittenScript: string;
  onScreenHeadline: string;
  cta: string;
  captionDescription: string;
  alternateAngles: {
    angle: string;
    title: string;
    hook: string;
  }[];
}

export interface RenderOptions {
  contentItemId: string;
  sourceVideoPath: string;
  hookText?: string;
  headlineText?: string;
  subtitleText?: string;
}

export interface RenderedAsset {
  contentItemId: string;
  outputPath: string;
  fileName: string;
  sizeBytes: number;
}

export interface VoiceoverOptions {
  contentItemId: string;
  scriptText: string;
  sourceVideoPath?: string;
  voice?: string;
}

export interface VoiceoverAsset {
  contentItemId: string;
  audioPath: string;
  videoWithVoiceoverPath?: string;
  fileName: string;
}
