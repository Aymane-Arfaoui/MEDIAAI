export interface PlannedContentItem {
  day: string;
  platform: string;
  topic: string;
  title: string;
  hook: string;
  scriptOutline: string[];
  rationale: string;
}

export interface WeeklyPlanOutput {
  title: string;
  startDate: string;
  summary: string;
  days: PlannedContentItem[];
}

export interface StrategyOutput {
  whatsWorking: string[];
  underperforming: string[];
  contentPillars: ContentPillar[];
  audiencePainPoints: string[];
  messagingAngles: string[];
  toneGuidance: { do: string[]; dont: string[] };
  opportunities: string[];
  cautions: string[];
}

export interface ContentPillar {
  name: string;
  description: string;
  keyMessages: string[];
  contentOpportunities: string[];
}
