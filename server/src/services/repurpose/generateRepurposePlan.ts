import OpenAI from "openai";
import type {
  ViralShortSelection,
  RepurposeAnalysis,
  RepurposePlan,
} from "../../types/repurpose.js";

function getOpenAI(): OpenAI {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

/**
 * Generate a full repurpose plan with alternative titles, hooks, scripts, and angles.
 */
export async function generateRepurposePlan(
  video: ViralShortSelection,
  analysis: RepurposeAnalysis,
  creatorName: string,
  brandName: string
): Promise<RepurposePlan> {
  const openai = getOpenAI();

  const prompt = `You are MEDIAAI, an expert content strategist for ${creatorName} (${brandName}).

Given this viral YouTube Short and its analysis, generate a complete repurposing plan.

ORIGINAL VIDEO:
- Title: ${video.title || "N/A"}
- Caption: ${video.caption || "N/A"}
- URL: ${video.url || "N/A"}
- Views: ${video.metrics.views.toLocaleString()}
- Engagement: ${(video.metrics.engagementProxy * 100).toFixed(2)}%
- Hook type: ${video.hookType}
- Topic: ${video.topicCluster}

ANALYSIS:
- Why it worked: ${analysis.whyItWorked.join("; ")}
- Strongest hook: ${analysis.strongestHook}
- Main topic: ${analysis.mainTopic}
- Audience angle: ${analysis.targetAudienceAngle}

CREATOR CONTEXT:
- Name: ${creatorName}
- Brand: ${brandName}
- Niche: Startup legal education
- Audience: Startup founders, early-stage operators
- Topics: fundraising readiness, diligence, contracts, founder mistakes
- Tone: Credible, direct, practical, founder-native

AVOID:
- Generic legal boilerplate
- Fearmongering or scare tactics
- Stiff corporate language
- Generic influencer language

Generate a repurpose plan. Return valid JSON:
{
  "titleOptions": ["title1", "title2"],
  "hookOptions": ["hook1", "hook2"],
  "rewrittenScript": "A short 30-60 second script for a repurposed version. Include [HOOK], [BODY], [CTA] sections.",
  "onScreenHeadline": "Bold on-screen text for the opening 2 seconds",
  "cta": "Clear call to action",
  "captionDescription": "Instagram/YouTube caption text with relevant hashtags",
  "alternateAngles": [
    {
      "angle": "contrarian",
      "title": "A contrarian take title",
      "hook": "A contrarian hook"
    },
    {
      "angle": "urgent / founder-pain-point",
      "title": "An urgency-based title",
      "hook": "An urgency-based hook"
    }
  ]
}

Make every output feel tailored to ${creatorName}'s voice and ${brandName}'s positioning. Be specific and actionable.`;

  const res = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
    response_format: { type: "json_object" },
  });

  const parsed = JSON.parse(res.choices[0].message.content ?? "{}");

  return {
    contentItemId: video.contentItemId,
    originalTitle: video.title || video.caption || "Untitled",
    originalUrl: video.url || "",
    analysis,
    titleOptions: parsed.titleOptions ?? [],
    hookOptions: parsed.hookOptions ?? [],
    rewrittenScript: parsed.rewrittenScript ?? "",
    onScreenHeadline: parsed.onScreenHeadline ?? "",
    cta: parsed.cta ?? "",
    captionDescription: parsed.captionDescription ?? "",
    alternateAngles: parsed.alternateAngles ?? [],
  };
}
