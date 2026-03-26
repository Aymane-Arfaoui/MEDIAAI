export type HookType =
  | "question"
  | "warning"
  | "how-to"
  | "contrarian"
  | "myth-busting"
  | "checklist"
  | "founder-pain-point"
  | "unknown";

export type FormatType =
  | "short-explainer"
  | "founder-warning"
  | "educational-tip"
  | "checklist"
  | "myth-busting"
  | "story-example"
  | "case-study"
  | "unknown";

export type TopicCluster =
  | "diligence"
  | "fundraising"
  | "contracts"
  | "founder-legal-mistakes"
  | "startup-readiness"
  | "hiring-developer-agreements"
  | "risk-prevention"
  | "unknown";

export type ToneType =
  | "educational"
  | "direct"
  | "urgent"
  | "practical"
  | "advisory"
  | "unknown";

export type PerformanceBucket = "top" | "strong" | "average" | "weak";

export interface AnalyticsSummaryOutput {
  contentItemId: string;
  performanceScore: number;
  engagementProxy: number;
  hookType: HookType;
  topicCluster: TopicCluster;
  formatType: FormatType;
  toneType: ToneType;
  performanceBucket: PerformanceBucket;
  derivedInsights: Record<string, unknown>;
}

export interface AggregatedAnalytics {
  topPerforming: AnalyticsSummaryOutput[];
  underperforming: AnalyticsSummaryOutput[];
  topicDistribution: Record<TopicCluster, { count: number; avgScore: number }>;
  hookDistribution: Record<HookType, { count: number; avgScore: number }>;
  formatDistribution: Record<FormatType, { count: number; avgScore: number }>;
  contentGaps: string[];
  painPointHypotheses: string[];
}
