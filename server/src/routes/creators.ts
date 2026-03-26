import { Router } from "express";
import { db } from "../db/connection.js";
import { creatorProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";

const router = Router();

/**
 * GET /api/creators
 * List all creator profiles.
 */
router.get("/", async (_req, res) => {
  try {
    const creators = await db.select().from(creatorProfiles);
    res.json({ success: true, creators });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

/**
 * GET /api/creators/:id
 * Get a single creator profile.
 */
router.get("/:id", async (req, res) => {
  try {
    const [creator] = await db
      .select()
      .from(creatorProfiles)
      .where(eq(creatorProfiles.id, req.params.id));

    if (!creator) {
      return res.status(404).json({ success: false, error: "Creator not found" });
    }

    res.json({ success: true, creator });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    res.status(400).json({ success: false, error: message });
  }
});

export default router;
