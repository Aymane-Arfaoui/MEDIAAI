import { Router } from "express";
import type { Request, Response } from "express";
import { selectTopViralShorts } from "../services/repurpose/selectTopVideos.js";
import { downloadYouTubeVideo, isDownloaded, getDownloadPath } from "../services/repurpose/downloadVideo.js";
import { analyzeViralShort } from "../services/repurpose/analyzeVideo.js";
import { generateRepurposePlan } from "../services/repurpose/generateRepurposePlan.js";
import { renderOverlayVideo } from "../services/repurpose/renderOverlayVideo.js";
import { generateVoiceover } from "../services/repurpose/generateVoiceover.js";
import { db } from "../db/connection.js";
import { creatorProfiles } from "../db/schema.js";
import { eq } from "drizzle-orm";
import fs from "node:fs";
import path from "node:path";

const router = Router();

// Resolve creator name + brand for prompts
async function getCreatorInfo(creatorId: string) {
  const rows = await db
    .select()
    .from(creatorProfiles)
    .where(eq(creatorProfiles.id, creatorId))
    .limit(1);
  const creator = rows[0];
  return {
    name: creator?.name ?? "Creator",
    brand: creator?.brandName ?? "Brand",
  };
}

/**
 * POST /api/repurpose/select-top-videos
 * Select top N viral YouTube Shorts
 */
router.post("/select-top-videos", async (req: Request, res: Response) => {
  try {
    const { creatorId, count = 2 } = req.body;
    if (!creatorId) {
      res.status(400).json({ success: false, error: "creatorId is required" });
      return;
    }

    const videos = await selectTopViralShorts(creatorId, count);

    res.json({
      success: true,
      count: videos.length,
      videos,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/repurpose/download
 * Download a YouTube video by contentItemId + url
 */
router.post("/download", async (req: Request, res: Response) => {
  try {
    const { contentItemId, url } = req.body;
    if (!contentItemId || !url) {
      res.status(400).json({
        success: false,
        error: "contentItemId and url are required",
      });
      return;
    }

    if (isDownloaded(contentItemId)) {
      const filePath = getDownloadPath(contentItemId);
      const stat = fs.statSync(filePath);
      res.json({
        success: true,
        asset: {
          contentItemId,
          filePath,
          fileName: `${contentItemId}.mp4`,
          mimeType: "video/mp4",
          sizeBytes: stat.size,
          durationSec: null,
        },
        cached: true,
      });
      return;
    }

    const asset = await downloadYouTubeVideo(contentItemId, url);
    res.json({ success: true, asset, cached: false });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/repurpose/analyze
 * Analyze why a video performed well
 */
router.post("/analyze", async (req: Request, res: Response) => {
  try {
    const { creatorId, video } = req.body;
    if (!creatorId || !video) {
      res.status(400).json({
        success: false,
        error: "creatorId and video are required",
      });
      return;
    }

    const { name, brand } = await getCreatorInfo(creatorId);
    const analysis = await analyzeViralShort(video, name, brand);
    res.json({ success: true, analysis });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/repurpose/generate
 * Generate a full repurpose plan
 */
router.post("/generate", async (req: Request, res: Response) => {
  try {
    const { creatorId, video, analysis } = req.body;
    if (!creatorId || !video || !analysis) {
      res.status(400).json({
        success: false,
        error: "creatorId, video, and analysis are required",
      });
      return;
    }

    const { name, brand } = await getCreatorInfo(creatorId);
    const plan = await generateRepurposePlan(video, analysis, name, brand);
    res.json({ success: true, plan });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/repurpose/render
 * Render a video with title/hook/subtitle overlays
 */
router.post("/render", async (req: Request, res: Response) => {
  try {
    const { contentItemId, hookText, headlineText, subtitleText } = req.body;
    if (!contentItemId) {
      res.status(400).json({ success: false, error: "contentItemId is required" });
      return;
    }

    const sourceVideoPath = getDownloadPath(contentItemId);
    if (!fs.existsSync(sourceVideoPath)) {
      res.status(400).json({
        success: false,
        error: "Video not downloaded yet. Call /download first.",
      });
      return;
    }

    const rendered = await renderOverlayVideo({
      contentItemId,
      sourceVideoPath,
      hookText,
      headlineText,
      subtitleText,
    });

    res.json({ success: true, rendered });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/repurpose/voiceover
 * Generate TTS voiceover and optionally mix with video
 */
router.post("/voiceover", async (req: Request, res: Response) => {
  try {
    const { contentItemId, scriptText, withVideo = false, voice } = req.body;
    if (!contentItemId || !scriptText) {
      res.status(400).json({
        success: false,
        error: "contentItemId and scriptText are required",
      });
      return;
    }

    const sourceVideoPath = withVideo ? getDownloadPath(contentItemId) : undefined;

    const asset = await generateVoiceover({
      contentItemId,
      scriptText,
      sourceVideoPath,
      voice,
    });

    res.json({ success: true, asset });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/repurpose/download-file/:filename
 * Serve a rendered/downloaded file for browser download
 */
router.get("/download-file/:filename", (req: Request, res: Response) => {
  const { filename } = req.params;
  const dirs = [
    path.resolve("media"),
    path.resolve("media/rendered"),
    path.resolve("media/voiceover"),
  ];

  for (const dir of dirs) {
    const filePath = path.join(dir, filename);
    if (fs.existsSync(filePath)) {
      res.download(filePath);
      return;
    }
  }

  res.status(404).json({ success: false, error: "File not found" });
});

export default router;
