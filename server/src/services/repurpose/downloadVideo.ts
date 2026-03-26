import { execFile } from "node:child_process";
import { promisify } from "node:util";
import fs from "node:fs";
import path from "node:path";
import type { DownloadedAsset } from "../../types/repurpose.js";

const execFileAsync = promisify(execFile);

const MEDIA_DIR = path.resolve("media");

function ensureMediaDir(): void {
  if (!fs.existsSync(MEDIA_DIR)) {
    fs.mkdirSync(MEDIA_DIR, { recursive: true });
  }
}

/**
 * Download a YouTube video using yt-dlp.
 * Returns metadata about the downloaded file.
 */
export async function downloadYouTubeVideo(
  contentItemId: string,
  videoUrl: string
): Promise<DownloadedAsset> {
  ensureMediaDir();

  const outputTemplate = path.join(MEDIA_DIR, `${contentItemId}.%(ext)s`);

  try {
    // Download best quality mp4 ≤ 1080p
    await execFileAsync("yt-dlp", [
      "--no-playlist",
      "-f",
      "bestvideo[height<=1080][ext=mp4]+bestaudio[ext=m4a]/best[height<=1080][ext=mp4]/best",
      "--merge-output-format",
      "mp4",
      "-o",
      outputTemplate,
      videoUrl,
    ], { timeout: 120_000 });
  } catch (err: any) {
    // Fallback: try simpler format selection
    await execFileAsync("yt-dlp", [
      "--no-playlist",
      "-f",
      "best[ext=mp4]/best",
      "-o",
      outputTemplate,
      videoUrl,
    ], { timeout: 120_000 });
  }

  const filePath = path.join(MEDIA_DIR, `${contentItemId}.mp4`);

  if (!fs.existsSync(filePath)) {
    // yt-dlp may have saved with a different extension—find the actual file
    const files = fs.readdirSync(MEDIA_DIR).filter((f) => f.startsWith(contentItemId));
    if (files.length === 0) {
      throw new Error(`Download produced no output for ${contentItemId}`);
    }
    const actual = path.join(MEDIA_DIR, files[0]);
    if (actual !== filePath) {
      fs.renameSync(actual, filePath);
    }
  }

  const stat = fs.statSync(filePath);

  let durationSec: number | null = null;
  try {
    const { stdout } = await execFileAsync("ffprobe", [
      "-v", "error",
      "-show_entries", "format=duration",
      "-of", "default=noprint_wrappers=1:nokey=1",
      filePath,
    ]);
    durationSec = parseFloat(stdout.trim()) || null;
  } catch {
    // duration unavailable
  }

  return {
    contentItemId,
    filePath,
    fileName: `${contentItemId}.mp4`,
    mimeType: "video/mp4",
    sizeBytes: stat.size,
    durationSec,
  };
}

/**
 * Clean up downloaded media files for a content item.
 */
export function cleanupDownload(contentItemId: string): void {
  const filePath = path.join(MEDIA_DIR, `${contentItemId}.mp4`);
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

/**
 * Get the local file path for a downloaded video.
 */
export function getDownloadPath(contentItemId: string): string {
  return path.join(MEDIA_DIR, `${contentItemId}.mp4`);
}

/**
 * Check if a video has already been downloaded.
 */
export function isDownloaded(contentItemId: string): boolean {
  return fs.existsSync(getDownloadPath(contentItemId));
}
