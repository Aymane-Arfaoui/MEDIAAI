import OpenAI from "openai";
import type { ViralShortSelection, RepurposeAnalysis } from "../../types/repurpose.js";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Analyze why a viral short performed well and identify repurposing opportunities.
 */
export async function analyzeViralShort(
  video: ViralShortSelection,
  creatorName: string,
  brandName: string
): Promise<RepurposeAnalysis> {
  const openai = getOpenAI();

  const prompt = `You are MEDIAAI, an expert content strategist for ${creatorName} (${brandName}).

Analyze why this YouTube Short performed well and identify repurposing opportunities.

VIDEO DATA:
- Title: ${video.title || "N/A"}
- Caption: ${video.caption || "N/A"}
- Views: ${video.metrics.views.toLocaleString()}
- Likes: ${video.metrics.likes.toLocaleString()}
- Comments: ${video.metrics.comments}
- Engagement: ${(video.metrics.engagementProxy * 100).toFixed(2)}%
- Performance Score: ${(video.performanceScore * 100).toFixed(1)}%
- Hook Type: ${video.hookType}
- Topic Cluster: ${video.topicCluster}
- Format: ${video.formatType}
- Tone: ${video.toneType}
- Duration: ${video.durationSec ? `${video.durationSec}s` : "unknown"}

CREATOR CONTEXT:
- Niche: Startup legal education
- Audience: Startup founders, early-stage operators
- Brand tone: Credible, direct, founder-friendly

Return valid JSON:
{
  "whyItWorked": ["reason1", "reason2", "reason3"],
  "strongestHook": "the specific hook pattern that drove engagement",
  "mainTopic": "primary topic that resonated",
  "targetAudienceAngle": "why this specific angle works for founders",
  "tone": "describe the tone that made it effective",
  "repurposingOpportunities": [
    "opportunity 1 - e.g. flip to a contrarian take",
    "opportunity 2 - e.g. create a Part 2 deep dive",
    "opportunity 3 - e.g. reframe for LinkedIn"
  ]
}

Be specific and grounded in the data. Do not be generic.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.7,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");

  return {
    contentItemId: video.contentItemId,
    originalTitle: video.title || video.caption || "Untitled",
    whyItWorked: parsed.whyItWorked ?? [],
    strongestHook: parsed.strongestHook ?? "",
    mainTopic: parsed.mainTopic ?? "",
    targetAudienceAngle: parsed.targetAudienceAngle ?? "",
    tone: parsed.tone ?? "",
    repurposingOpportunities: parsed.repurposingOpportunities ?? [],
  };
}
