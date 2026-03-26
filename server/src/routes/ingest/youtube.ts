import { Router } from "express";
import { z } from "zod";
import { ingestYouTube } from "../../services/ingestion/youtube.js";

const router = Router();

const schema = z.object({
  creatorId: z.string().uuid(),
  url: z.string().url(),
  maxResults: z.number().int().min(1).max(200).optional().default(50),
});

router.post("/", async (req, res) => {
  try {
    const body = schema.parse(req.body);
    const result = await ingestYouTube(body.creatorId, body.url, body.maxResults);

    res.json({
      success: true,
      ingested: result.ingested,
      videos: result.videos.map((v) => ({
        videoId: v.videoId,
        title: v.title,
        url: v.url,
        viewCount: v.viewCount,
        likeCount: v.likeCount,
        contentType: v.contentType,
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
