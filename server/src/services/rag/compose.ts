import type { CreatorProfile } from "../../types/creator.js";
import type { AggregatedAnalytics } from "../../types/analytics.js";
import type { RetrievalResult, ComposedContext } from "../../types/knowledge.js";

/**
 * Compose a full context object from creator profile, analytics, RAG results,
 * and user instruction for downstream LLM prompts.
 */
export function composeContext(
  profile: CreatorProfile,
  analytics: AggregatedAnalytics | null,
  ragResults: RetrievalResult[],
  userInstruction: string
): ComposedContext {
  return {
    creatorSummary: buildCreatorSummary(profile),
    analyticsSummary: analytics ? buildAnalyticsSummary(analytics) : "No analytics data available yet.",
    knowledgeSnippets: ragResults.map((r) => r.chunkText),
    userInstruction,
  };
}

function buildCreatorSummary(profile: CreatorProfile): string {
  const lines: string[] = [
    `Creator: ${profile.name}`,
  ];

  if (profile.brandName) lines.push(`Brand: ${profile.brandName}`);
  if (profile.niche) lines.push(`Niche: ${profile.niche}`);
  if (profile.audience) lines.push(`Audience: ${profile.audience}`);
  if (profile.tone) lines.push(`Tone: ${profile.tone}`);
  if (profile.businessGoals) lines.push(`Business Goals: ${profile.businessGoals}`);
  if (profile.themesToAvoid) lines.push(`Avoid: ${profile.themesToAvoid}`);
  if (profile.notes) lines.push(`Notes: ${profile.notes}`);

  return lines.join("\n");
}

function buildAnalyticsSummary(analytics: AggregatedAnalytics): string {
  const lines: string[] = ["Content Performance Summary:"];

  // Top performing
  if (analytics.topPerforming.length > 0) {
    lines.push(`\nTop Performing Content (${analytics.topPerforming.length} items):`);
    for (const item of analytics.topPerforming.slice(0, 5)) {
      lines.push(
        `  - Score: ${item.performanceScore.toFixed(2)} | ` +
        `Hook: ${item.hookType} | Topic: ${item.topicCluster} | Format: ${item.formatType}`
      );
    }
  }

  // Topic distribution
  const topicEntries = Object.entries(analytics.topicDistribution)
    .filter(([_, data]) => data.count > 0)
    .sort(([, a], [, b]) => b.avgScore - a.avgScore);

  if (topicEntries.length > 0) {
    lines.push("\nTopic Performance:");
    for (const [topic, data] of topicEntries) {
      lines.push(`  - ${topic}: ${data.count} pieces, avg score ${data.avgScore.toFixed(2)}`);
    }
  }

  // Hook distribution
  const hookEntries = Object.entries(analytics.hookDistribution)
    .filter(([_, data]) => data.count > 0)
    .sort(([, a], [, b]) => b.avgScore - a.avgScore);

  if (hookEntries.length > 0) {
    lines.push("\nHook Performance:");
    for (const [hook, data] of hookEntries) {
      lines.push(`  - ${hook}: ${data.count} uses, avg score ${data.avgScore.toFixed(2)}`);
    }
  }

  // Content gaps
  if (analytics.contentGaps.length > 0) {
    lines.push("\nContent Gaps:");
    for (const gap of analytics.contentGaps) {
      lines.push(`  - ${gap}`);
    }
  }

  return lines.join("\n");
}

/**
 * Format the composed context into a single prompt-ready string.
 */
export function formatContextForPrompt(context: ComposedContext): string {
  const sections: string[] = [];

  sections.push(`=== CREATOR CONTEXT ===\n${context.creatorSummary}`);
  sections.push(`=== ANALYTICS SUMMARY ===\n${context.analyticsSummary}`);

  if (context.knowledgeSnippets.length > 0) {
    sections.push(
      `=== KNOWLEDGE BASE CONTEXT ===\n` +
        context.knowledgeSnippets
          .map((s, i) => `[Source ${i + 1}]\n${s}`)
          .join("\n\n")
    );
  }

  sections.push(`=== USER INSTRUCTION ===\n${context.userInstruction}`);

  return sections.join("\n\n");
}
