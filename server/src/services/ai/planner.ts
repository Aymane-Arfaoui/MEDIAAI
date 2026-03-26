import OpenAI from "openai";
import { db } from "../../db/connection.js";
import { creatorProfiles, weeklyPlans, plannedContents } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { getAggregatedAnalytics } from "../analytics/summaries.js";
import { retrieveRelevantChunks } from "../rag/retrieve.js";
import { composeContext } from "../rag/compose.js";
import { buildPlannerPrompt } from "./prompts.js";
import type { CreatorProfile } from "../../types/creator.js";
import type { WeeklyPlanOutput } from "../../types/planner.js";

let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

/**
 * Generate a 7-day content plan and persist it to the database.
 */
export async function generateWeeklyPlan(
  creatorId: string,
  startDate: string,
  userInstruction?: string
): Promise<WeeklyPlanOutput & { planId: string }> {
  // Fetch creator profile
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.id, creatorId));

  if (!profile) throw new Error(`Creator not found: ${creatorId}`);

  // Fetch analytics
  const analytics = await getAggregatedAnalytics(creatorId);

  // Retrieve relevant knowledge
  const ragQuery = `weekly content plan for ${profile.niche} creator targeting ${profile.audience}`;
  const ragResults = await retrieveRelevantChunks(creatorId, ragQuery, {
    scope: "mixed",
    topK: 6,
  });

  // Compose context
  const context = composeContext(
    profile as CreatorProfile,
    analytics,
    ragResults,
    userInstruction ?? "Generate a 7-day content plan optimized for performance based on the analytics data."
  );

  // Generate with LLM
  const prompt = buildPlannerPrompt(context, startDate);
  const client = getOpenAI();

  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages: [
      { role: "system", content: prompt.system },
      { role: "user", content: prompt.user },
    ],
    response_format: { type: "json_object" },
    temperature: 0.7,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from LLM");

  const plan = JSON.parse(content) as WeeklyPlanOutput;

  // Persist to database
  const [savedPlan] = await db
    .insert(weeklyPlans)
    .values({
      creatorId,
      title: plan.title,
      startDate: new Date(startDate),
      summary: plan.summary,
    })
    .returning();

  if (plan.days?.length > 0) {
    await db.insert(plannedContents).values(
      plan.days.map((day) => ({
        weeklyPlanId: savedPlan.id,
        day: day.day,
        platform: day.platform,
        topic: day.topic,
        title: day.title,
        hook: day.hook,
        scriptOutline: day.scriptOutline,
        rationale: day.rationale,
        status: "planned",
      }))
    );
  }

  return { ...plan, planId: savedPlan.id };
}

/**
 * Fetch a saved weekly plan with its content items.
 */
export async function getWeeklyPlan(planId: string) {
  const [plan] = await db
    .select()
    .from(weeklyPlans)
    .where(eq(weeklyPlans.id, planId));

  if (!plan) return null;

  const items = await db
    .select()
    .from(plannedContents)
    .where(eq(plannedContents.weeklyPlanId, planId));

  return { ...plan, days: items };
}
