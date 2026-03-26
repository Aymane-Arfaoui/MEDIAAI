import { Router } from "express";
import { z } from "zod";
import { sendChatMessage, getChatHistory, listChatSessions } from "../services/ai/chat.js";

const router = Router();

const chatSchema = z.object({
  creatorId: z.string().uuid(),
  message: z.string().min(1),
  sessionId: z.string().uuid().optional(),
});

/**
 * POST /api/chat
 * Send a message to the AI strategist.
 */
router.post("/", async (req, res) => {
  try {
    const body = chatSchema.parse(req.body);
    const result = await sendChatMessage(
      body.creatorId,
      body.message,
      body.sessionId
    );

    res.json({
      success: true,
      sessionId: result.sessionId,
      response: result.response,
      messageId: result.messageId,
    });
  } catch (error) {
    const message = error instanceof z.ZodError
      ? error.errors.map((e) => e.message).join(", ")
      : error instanceof Error
        ? error.message
        : "Unknown error";

    res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/chat/sessions/:creatorId
 * List all chat sessions for a creator.
 */
router.get("/sessions/:creatorId", async (req, res) => {
  try {
    const sessions = await listChatSessions(req.params.creatorId);
    res.json({ success: true, sessions });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/chat/history/:sessionId
 * Get all messages in a chat session.
 */
router.get("/history/:sessionId", async (req, res) => {
  try {
    const messages = await getChatHistory(req.params.sessionId);
    res.json({ success: true, messages });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
