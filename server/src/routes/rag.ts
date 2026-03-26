import { Router } from "express";
import { z } from "zod";
import { retrieveRelevantChunks } from "../services/rag/retrieve.js";

const router = Router();

const querySchema = z.object({
  creatorId: z.string().uuid(),
  query: z.string().min(1),
  scope: z.enum(["brand", "transcripts", "notes", "strategy", "mixed"]).optional().default("mixed"),
  topK: z.number().int().min(1).max(20).optional().default(8),
});

/**
 * POST /api/rag/query
 * Semantic search over the creator's knowledge base.
 */
router.post("/query", async (req, res) => {
  try {
    const body = querySchema.parse(req.body);
    const results = await retrieveRelevantChunks(body.creatorId, body.query, {
      scope: body.scope,
      topK: body.topK,
    });

    res.json({
      success: true,
      results: results.map((r) => ({
        text: r.chunkText,
        score: r.score,
        metadata: r.metadata,
      })),
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

export default router;
