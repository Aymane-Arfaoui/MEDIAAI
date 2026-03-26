export interface CreatorProfile {
  id: string;
  name: string;
  brandName: string | null;
  niche: string | null;
  audience: string | null;
  tone: string | null;
  businessGoals: string | null;
  themesToAvoid: string | null;
  platformPreferences: Record<string, string> | null;
  notes: string | null;
}

export interface CreatorContext {
  profile: CreatorProfile;
  analyticsSummary?: AnalyticsOverview;
  ragSnippets?: string[];
}

export interface AnalyticsOverview {
  topPerformingContent: ContentPerformance[];
  underperformingContent: ContentPerformance[];
  strongestTopics: string[];
  strongestHooks: string[];
  strongestFormats: string[];
  contentGaps: string[];
  painPointHypotheses: string[];
}

export interface ContentPerformance {
  id: string;
  title: string | null;
  platform: string;
  performanceScore: number;
  engagementProxy: number;
  hookType: string | null;
  topicCluster: string | null;
  formatType: string | null;
}
