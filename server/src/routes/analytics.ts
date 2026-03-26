import { Router } from "express";
import { z } from "zod";
import { runAnalytics, getAggregatedAnalytics } from "../services/analytics/summaries.js";

const router = Router();

const runSchema = z.object({
  creatorId: z.string().uuid(),
});

/**
 * POST /api/analytics/run
 * Run analytics computation for a creator's content.
 */
router.post("/run", async (req, res) => {
  try {
    const body = runSchema.parse(req.body);
    const result = await runAnalytics(body.creatorId);

    res.json({
      success: true,
      processed: result.processed,
      summaries: result.summaries,
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
 * GET /api/analytics/:creatorId
 * Get aggregated analytics for a creator.
 */
router.get("/:creatorId", async (req, res) => {
  try {
    const { creatorId } = req.params;
    const analytics = await getAggregatedAnalytics(creatorId);

    res.json({ success: true, analytics });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
