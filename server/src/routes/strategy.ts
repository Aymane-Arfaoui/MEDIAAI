import { Router } from "express";
import { z } from "zod";
import { generateStrategy } from "../services/ai/strategy.js";

const router = Router();

const generateSchema = z.object({
  creatorId: z.string().uuid(),
  instruction: z.string().optional(),
});

/**
 * POST /api/strategy/generate
 * Generate a content strategy for a creator.
 */
router.post("/generate", async (req, res) => {
  try {
    const body = generateSchema.parse(req.body);
    const strategy = await generateStrategy(body.creatorId, body.instruction);

    res.json({ success: true, strategy });
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
