import OpenAI from "openai";
import { db } from "../../db/connection.js";
import { creatorProfiles, chatSessions, chatMessages } from "../../db/schema.js";
import { eq, asc } from "drizzle-orm";
import { getAggregatedAnalytics } from "../analytics/summaries.js";
import { retrieveRelevantChunks } from "../rag/retrieve.js";
import { composeContext } from "../rag/compose.js";
import { buildChatPrompt } from "./prompts.js";
import type { CreatorProfile } from "../../types/creator.js";

let openai: OpenAI | null = null;
function getOpenAI(): OpenAI {
  if (!openai) openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  return openai;
}

/**
 * Send a message in a chat session and get an AI response.
 * Creates a new session if sessionId is not provided.
 */
export async function sendChatMessage(
  creatorId: string,
  message: string,
  sessionId?: string
): Promise<{
  sessionId: string;
  response: string;
  messageId: string;
}> {
  // Fetch creator profile
  const [profile] = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.id, creatorId));

  if (!profile) throw new Error(`Creator not found: ${creatorId}`);

  // Create or fetch session
  let activeSessionId = sessionId;
  if (!activeSessionId) {
    const [session] = await db
      .insert(chatSessions)
      .values({
        creatorId,
        title: message.slice(0, 100),
      })
      .returning();
    activeSessionId = session.id;
  }

  // Store user message
  await db.insert(chatMessages).values({
    sessionId: activeSessionId,
    role: "user",
    content: message,
  });

  // Fetch conversation history
  const history = await db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, activeSessionId))
    .orderBy(asc(chatMessages.createdAt));

  // Fetch analytics and RAG context based on the user's message
  const analytics = await getAggregatedAnalytics(creatorId);
  const ragResults = await retrieveRelevantChunks(creatorId, message, {
    scope: "mixed",
    topK: 5,
  });

  // Compose context
  const context = composeContext(
    profile as CreatorProfile,
    analytics,
    ragResults,
    message
  );

  // Build chat prompt with full history
  const conversationHistory = history.map((msg) => ({
    role: msg.role,
    content: msg.content,
  }));

  const { messages } = buildChatPrompt(context, conversationHistory.slice(0, -1));

  // Generate response
  const client = getOpenAI();
  const response = await client.chat.completions.create({
    model: "gpt-4o",
    messages,
    temperature: 0.7,
    max_tokens: 2000,
  });

  const assistantContent =
    response.choices[0]?.message?.content ?? "I apologize, I wasn't able to generate a response.";

  // Store assistant message
  const [savedMessage] = await db
    .insert(chatMessages)
    .values({
      sessionId: activeSessionId,
      role: "assistant",
      content: assistantContent,
    })
    .returning();

  return {
    sessionId: activeSessionId,
    response: assistantContent,
    messageId: savedMessage.id,
  };
}

/**
 * Fetch all messages in a chat session.
 */
export async function getChatHistory(sessionId: string) {
  return db
    .select()
    .from(chatMessages)
    .where(eq(chatMessages.sessionId, sessionId))
    .orderBy(asc(chatMessages.createdAt));
}

/**
 * List all chat sessions for a creator.
 */
export async function listChatSessions(creatorId: string) {
  return db
    .select()
    .from(chatSessions)
    .where(eq(chatSessions.creatorId, creatorId));
}
