import type { ComposedContext } from "../../types/knowledge.js";
import { formatContextForPrompt } from "../rag/compose.js";

const SYSTEM_IDENTITY = `You are MEDIAAI, an expert AI content strategist for creator businesses. You provide data-driven, practical, and specific recommendations grounded in actual content performance data and creator context.

Your tone is:
- Credible and authoritative
- Founder-friendly and direct
- Practical with actionable takeaways
- Sharp and modern — never generic or corporate

You never:
- Use generic influencer-style language
- Provide vague, non-specific advice
- Use fear-mongering tactics
- Sound like boilerplate legal copy`;

export function buildStrategyPrompt(context: ComposedContext): {
  system: string;
  user: string;
} {
  return {
    system: `${SYSTEM_IDENTITY}

You are generating a comprehensive content strategy for a creator. Return your response as valid JSON matching the specified schema.`,
    user: `${formatContextForPrompt(context)}

Generate a comprehensive content strategy. Return valid JSON with this structure:
{
  "whatsWorking": ["string"],
  "underperforming": ["string"],
  "contentPillars": [
    {
      "name": "string",
      "description": "string",
      "keyMessages": ["string"],
      "contentOpportunities": ["string"]
    }
  ],
  "audiencePainPoints": ["string"],
  "messagingAngles": ["string"],
  "toneGuidance": {
    "do": ["string"],
    "dont": ["string"]
  },
  "opportunities": ["string"],
  "cautions": ["string"]
}

Ground every recommendation in the analytics data provided. Be specific to this creator's niche and audience. Do not be generic.`,
  };
}

export function buildPlannerPrompt(
  context: ComposedContext,
  startDate: string
): {
  system: string;
  user: string;
} {
  return {
    system: `${SYSTEM_IDENTITY}

You are generating a 7-day content plan for a creator. Each day should have a specific piece of content with platform, topic, title, hook, script outline, and strategic rationale. Return your response as valid JSON.`,
    user: `${formatContextForPrompt(context)}

Generate a 7-day content plan starting from ${startDate}. Return valid JSON with this structure:
{
  "title": "string",
  "summary": "string",
  "days": [
    {
      "day": "Monday",
      "platform": "youtube" or "instagram",
      "topic": "string",
      "title": "string",
      "hook": "string",
      "scriptOutline": ["string"],
      "rationale": "string"
    }
  ]
}

Requirements:
- Mix platforms (YouTube and Instagram)
- Use the strongest performing hook styles from analytics
- Cover high-performing topics
- Include specific, compelling hooks — not generic
- Script outlines should be 4-7 bullet points
- Rationale should reference analytics data
- Make every title specific to the creator's niche, not generic content advice`,
  };
}

export function buildChatPrompt(
  context: ComposedContext,
  conversationHistory: { role: string; content: string }[]
): {
  system: string;
  messages: { role: "system" | "user" | "assistant"; content: string }[];
} {
  const system = `${SYSTEM_IDENTITY}

You have access to the creator's performance data, knowledge base, and strategic context. Use this information to answer questions accurately and provide grounded recommendations.

${formatContextForPrompt({
  ...context,
  userInstruction: "",
})}`;

  const messages: { role: "system" | "user" | "assistant"; content: string }[] = [
    { role: "system", content: system },
  ];

  for (const msg of conversationHistory) {
    messages.push({
      role: msg.role as "user" | "assistant",
      content: msg.content,
    });
  }

  if (context.userInstruction) {
    messages.push({ role: "user", content: context.userInstruction });
  }

  return { system, messages };
}
