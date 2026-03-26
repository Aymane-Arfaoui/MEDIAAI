import { Router } from "express";
import { z } from "zod";
import { generateWeeklyPlan, getWeeklyPlan } from "../services/ai/planner.js";

const router = Router();

const generateSchema = z.object({
  creatorId: z.string().uuid(),
  startDate: z.string(),
  instruction: z.string().optional(),
});

/**
 * POST /api/planner/generate
 * Generate a 7-day content plan.
 */
router.post("/generate", async (req, res) => {
  try {
    const body = generateSchema.parse(req.body);
    const plan = await generateWeeklyPlan(
      body.creatorId,
      body.startDate,
      body.instruction
    );

    res.json({ success: true, plan });
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
 * GET /api/planner/:planId
 * Fetch a saved weekly plan.
 */
router.get("/:planId", async (req, res) => {
  try {
    const plan = await getWeeklyPlan(req.params.planId);
    if (!plan) {
      return res.status(404).json({ success: false, error: "Plan not found" });
    }

    res.json({ success: true, plan });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
