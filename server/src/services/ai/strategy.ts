import OpenAI from "openai";
import { db } from "../../db/connection.js";
import { creatorProfiles } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { getAggregatedAnalytics } from "../analytics/summaries.js";
import { retrieveRelevantChunks } from "../rag/retrieve.js";
import { composeContext } from "../rag/compose.js";
import { buildStrategyPrompt } from "./prompts.js";
import type { CreatorProfile } from "../../types/creator.js";
import type { StrategyOutput } from "../../types/planner.js";

let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

/**
 * Generate a content strategy for a creator using analytics + RAG context.
 */
export async function generateStrategy(
  creatorId: string,
  userInstruction?: string
): Promise<StrategyOutput> {
  // Fetch creator profile
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.id, creatorId));

  if (!profile) throw new Error(`Creator not found: ${creatorId}`);

  // Fetch analytics
  const analytics = await getAggregatedAnalytics(creatorId);

  // Retrieve relevant knowledge
  const ragQuery = `content strategy for ${profile.niche} targeting ${profile.audience}`;
  const ragResults = await retrieveRelevantChunks(creatorId, ragQuery, {
    scope: "mixed",
    topK: 6,
  });

  // Compose context
  const context = composeContext(
    profile as CreatorProfile,
    analytics,
    ragResults,
    userInstruction ?? "Generate a comprehensive content strategy based on the analytics and knowledge provided."
  );

  // Generate with LLM
  const prompt = buildStrategyPrompt(context);
  const client = getOpenAI();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 3000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from LLM");

  return JSON.parse(content) as StrategyOutput;
}
